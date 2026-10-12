"""Check takes, pick the best per line, assemble clips, master and encode them.
  assemble.py plan  <topic_dir> <jobs.json>   lint the script, then list the takes still to generate (first round: the standard takes)
  assemble.py build <topic_dir> <jobs.json>   score every take; if some lines need more takes, write them to jobs.json and exit 3;
                                              if some lines can never pass, list every one of them and exit 1; else assemble
Runs in the evaluation environment (see README.md). Scores are cached per take and per checker model."""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf, librosa
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import VOICE, CACHE, clips, clip_hash, take_path, take_key, spoken, voice_takes
from match import compare, norm

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASR, PACE = VOICE["asr"], VOICE["pace"]
SCORES = os.path.join(CACHE, f"scores-{ASR['model']}.json")


def trim(a, sr, thr=0.004):
    idx = np.where(np.abs(a) > thr)[0]
    return a if not len(idx) else a[max(0, idx[0] - int(0.01 * sr)): idx[-1] + int(0.04 * sr)]


_asr = {}
def transcribe(a, sr, lang="en"):
    if lang not in _asr:
        from faster_whisper import WhisperModel
        _asr[lang] = WhisperModel(ASR["model"], device="cpu", compute_type=ASR.get("compute_type", "int8"), cpu_threads=os.cpu_count())
    segs, _ = _asr[lang].transcribe(librosa.resample(a, orig_sr=sr, target_sr=16000), language=lang, beam_size=5)
    return " ".join(s.text for s in segs).strip()


def pitch_sd(a, sr):
    f0, voiced, _ = librosa.pyin(librosa.resample(a, orig_sr=sr, target_sr=16000), fmin=90, fmax=420, sr=16000, frame_length=1024)
    f = f0[voiced & ~np.isnan(f0)]
    return float(np.std(12 * np.log2(f / np.median(f)))) if len(f) > 10 else 0.0


def score(line, take, cache, lang="en"):
    key = take_key(line, take, lang)
    if key in cache and "ok" in cache[key]:
        return cache[key]
    a, sr = sf.read(take_path(line, take, lang))
    a = trim(a.astype(np.float32), sr)
    hyp = transcribe(a, sr, lang)
    words = len(norm(line, lang))
    s = {**compare(line, hyp, lang), "pitch_sd": pitch_sd(a, sr), "wps": words / (len(a) / sr), "dur": len(a) / sr}
    cache[key] = s
    return s


def passes(s, words):
    # Pace is only meaningful on longer lines: a deliberate pause dominates a short one.
    lo, hi = PACE["wps"]
    return s["ok"] and (words < PACE["min_words"] or lo <= s["wps"] <= hi)


def rank(s):
    """Best take first: an exact transcript beats a tolerated one, then the most pitch movement."""
    return (s["exact"], s["pitch_sd"])


def lines_of(topic_dir):
    """Every distinct spoken line as (language, text)."""
    topic, cs = clips(topic_dir)
    lines = sorted({spoken(x) for _, items in cs for x in items if spoken(x)})
    return topic, cs, lines


def lint(lines):
    """What no take can fix, found before two hours of generation (QUALITY.md #51)."""
    problems = []
    for lang, line in lines:
        n = len(norm(line, lang))
        if n > PACE["max_words_per_line"]:
            problems.append(f"{n} words (the voice truncates lines over {PACE['max_words_per_line']}; split it): {line[:80]}")
        if re.search(r"\b[A-Za-z](-[A-Za-z])+\b", line):
            problems.append(f"letters joined by hyphens are read as a word; write the acronym plainly (CI, not C-I): {line[:80]}")
    return problems


def plan(topic_dir, jobs_path):
    _, _, lines = lines_of(topic_dir)
    problems = lint(lines)
    if problems:
        sys.exit("The script has lines no take can pass. Rewrite them first:\n- " + "\n- ".join(problems))
    json.dump([{"lang": lang, "line": l, "takes": voice_takes(lang)[0]} for lang, l in lines], open(jobs_path, "w"), indent=1)
    print(f"{len(lines)} line(s), {sum(len(voice_takes(lang)[0]) for lang, _ in lines)} take(s) planned")


def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def clip_wpm(items, choice, P):
    """Words per minute of a clip as it will be delivered: chosen takes plus the designed pauses."""
    t = P["lead_in"] + P["tail"]; words = 0
    for k, x in enumerate(items):
        if not spoken(x):
            t += x["beat"]; continue
        s = choice[spoken(x)][1]
        t += s["dur"]; words += len(norm(spoken(x)[1], spoken(x)[0]))
        if k < len(items) - 1:
            t += P["after_question"] if spoken(x)[1].rstrip().endswith("?") else P["between_lines"]
    return words / t * 60, t


def choose_for_clip(items, ok_takes, P):
    """Takes for one clip: the best per line; if the clip then falls outside pace.clip_wpm, swap lines to their slowest
    (or fastest) passing takes, biggest change first, until it fits. Returns (choice, wpm, lines still too fast or slow)."""
    lo, hi = PACE["clip_wpm"]
    keys = [spoken(x) for x in items if spoken(x)]
    choice = {k: max(ok_takes[k], key=lambda ts: rank(ts[1])) for k in keys}
    wpm, _ = clip_wpm(items, choice, P)
    slower, todo = wpm > hi, set(keys)  # one direction, each line swapped at most once: no ping-pong
    while (wpm > hi if slower else wpm < lo) and todo:
        swaps = []
        for k in todo:
            alt = max(ok_takes[k], key=lambda ts: ts[1]["dur"]) if slower else min(ok_takes[k], key=lambda ts: ts[1]["dur"])
            gain = (alt[1]["dur"] - choice[k][1]["dur"]) * (1 if slower else -1)
            if gain > 0.01:
                swaps.append((gain, k, alt))
        if not swaps:
            break
        _, k, alt = max(swaps)
        choice[k] = alt; todo.discard(k)
        wpm, _ = clip_wpm(items, choice, P)
    stuck = []
    if wpm > hi or wpm < lo:
        stuck = sorted(keys, key=lambda k: choice[k][1]["wps"], reverse=wpm > hi)[:2]
    return choice, wpm, stuck


def build(topic_dir, jobs_path):
    topic, cs, lines = lines_of(topic_dir)
    cache = json.load(open(SCORES)) if os.path.exists(SCORES) else {}
    ok_takes, more, dead = {}, [], []
    for lang, line in lines:
        all_takes = sum(voice_takes(lang), [])
        made = [t for t in all_takes if os.path.exists(take_path(line, t, lang))]
        scored = [(t, score(line, t, cache, lang)) for t in made]
        ok = [(t, s) for t, s in scored if passes(s, len(norm(line, lang)))]
        if ok:
            ok_takes[(lang, line)] = ok
            continue
        nxt = [t for t in all_takes if t not in made][:2]
        closest = min(scored, key=lambda ts: ts[1]["wer"])[1] if scored else {"hyp": "(no take generated yet)"}
        if nxt:
            more.append({"lang": lang, "line": line, "takes": nxt})
            print(f"needs more takes ({len(made)} failed): {line[:70]}  e.g. heard {closest['hyp']!r}")
        else:
            dead.append((line, closest))
    json.dump(cache, open(SCORES, "w"))

    # Pick takes per clip, and ask for more takes of the fastest lines of a clip that no swap brings into pace.
    P = VOICE["pauses"]; A = VOICE["audio"]
    choices, out_of_pace = {}, []
    if not more and not dead:
        wanted = {j["line"] for j in more}
        for cid, items in cs:
            choices[cid], wpm, stuck = choose_for_clip(items, ok_takes, P)
            for k in stuck:
                lang, line = k
                nxt = [t for t in sum(voice_takes(lang), []) if not os.path.exists(take_path(line, t, lang))][:2]
                if nxt and line not in wanted:
                    more.append({"lang": lang, "line": line, "takes": nxt}); wanted.add(line)
                    print(f"clip {cid} is {wpm:.0f} wpm (limit {PACE['clip_wpm']}): more takes of: {line[:70]}")
                elif not nxt:
                    out_of_pace.append(f"clip {cid} is {wpm:.0f} wpm with every take tried; add a beat entry or split: {line[:70]}")
    if more:
        json.dump(more, open(jobs_path, "w"), indent=1)
        if dead:
            print(f"{len(dead)} line(s) no take can pass (listed when the rounds end)")
        sys.exit(3)
    if dead or out_of_pace:
        msg = ["No take passes for these lines. Rewrite every one of them (plainer words, names and numbers as they are said), then run narrate.sh again:"]
        msg += [f"- {line!r}\n    closest take heard: {s['hyp']!r}" for line, s in dead]
        msg += [f"- {m}" for m in out_of_pace]
        sys.exit("\n".join(msg))

    out_dir = os.path.join(SITE, "public", "audio", topic)
    os.makedirs(out_dir, exist_ok=True)
    old_path = os.path.join(out_dir, "manifest.json")
    old = json.load(open(old_path)) if os.path.exists(old_path) else {"clips": {}}
    manifest = {"topic": topic, "voice": VOICE["version"], "asr": ASR["model"], "clips": {}}
    tp = A["true_peak_dbtp"] - A.get("encode_headroom_db", 0)
    tolerated_total, reused = 0, 0
    for cid, items in cs:
        choice = choices[cid]
        keys = [take_key(spoken(x)[1], choice[spoken(x)][0], spoken(x)[0]) for x in items if spoken(x)]
        prev = old["clips"].get(cid)
        if (prev and prev.get("takes") == keys and prev.get("hash") == clip_hash(items) and old.get("asr") == ASR["model"]
                and all(os.path.exists(os.path.join(out_dir, f"{cid}.{ext}")) for ext in ("mp3", "webm"))):
            manifest["clips"][cid] = prev; reused += 1; tolerated_total += len(prev.get("tolerated", []))
            continue
        parts, timing, t, sr = [], [], 0.0, 24000
        lead = np.zeros(int(P["lead_in"] * sr), np.float32); parts.append(lead); t += len(lead) / sr
        segs = {}
        for x in items:
            if spoken(x):
                lang, text = spoken(x)
                a, s = sf.read(take_path(text, choice[(lang, text)][0], lang)); assert s == sr
                segs[spoken(x)] = trim(a.astype(np.float32), sr)
        for k, x in enumerate(items):
            if not spoken(x):
                z = np.zeros(int(x["beat"] * sr), np.float32); parts.append(z); t += len(z) / sr; continue
            lang, text = spoken(x)
            a = segs[(lang, text)]
            timing.append({"text": text, "start": round(t, 3), "end": round(t + len(a) / sr, 3)})
            parts.append(a); t += len(a) / sr
            if k < len(items) - 1:
                gap = P["after_question"] if text.rstrip().endswith("?") else P["between_lines"]
                parts.append(np.zeros(int(gap * sr), np.float32)); t += gap
        parts.append(np.zeros(int(P["tail"] * sr), np.float32))
        wav = np.concatenate(parts)
        raw = os.path.join(CACHE, f"{topic}-{cid}.wav"); sf.write(raw, wav, sr)
        meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", f"loudnorm=I={A['loudness_lufs']}:TP={tp}:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
        m = json.loads(meas[meas.rindex("{"):])
        ln = (f"loudnorm=I={A['loudness_lufs']}:TP={tp}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
              f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
        mp3, opus = os.path.join(out_dir, f"{cid}.mp3"), os.path.join(out_dir, f"{cid}.webm")
        run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", ln, "-ar", str(A["sample_rate"]), "-ac", "1", "-b:a", f"{A['mp3_kbps']}k", mp3])
        run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", ln, "-ar", str(A["sample_rate"]), "-ac", "1", "-c:a", "libopus", "-b:a", f"{A['opus_kbps']}k", opus])
        check = subprocess.run(["ffmpeg", "-hide_banner", "-i", mp3, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
        lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", check)[-1]); peak = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", check)[-1])
        words = sum(len(norm(spoken(x)[1], spoken(x)[0])) for x in items if spoken(x))
        chosen = [choice[spoken(x)][1] for x in items if spoken(x)]
        tolerated = [{"line": spoken(x)[1], **d} for x in items if spoken(x) for d in choice[spoken(x)][1]["tolerated"]]
        tolerated_total += len(tolerated)
        manifest["clips"][cid] = {
            "hash": clip_hash(items), "takes": keys, "duration": round(len(wav) / sr, 3), "lines": timing,
            "lufs": lufs, "true_peak": peak, "wpm": round(words / (len(wav) / sr) * 60),
            "wer": max(s["wer"] for s in chosen), "exact": all(s["exact"] for s in chosen), "tolerated": tolerated,
        }
        flag = "" if not tolerated else "  (listen: " + "; ".join(f"'{d['said']}' heard '{d['heard']}'" for d in tolerated) + ")"
        print(f"{cid}: {len(wav)/sr:5.1f}s  {manifest['clips'][cid]['wpm']} wpm  {lufs} LUFS  peak {peak} dBTP{flag}")
    json.dump(manifest, open(old_path, "w"), indent=1)
    print(f"wrote {len(cs)} clip(s) to {out_dir} ({reused} unchanged, {tolerated_total} tolerated mishearing(s) to listen to)")


if __name__ == "__main__":
    {"plan": plan, "build": build}[sys.argv[1]](sys.argv[2], sys.argv[3])
