"""Plan, check and assemble a topic's narration (runs in the evaluation environment, see README.md).

  assemble.py plan  <topic_dir> <jobs.json>   list the takes still to generate (first round: the standard takes)
  assemble.py build <topic_dir> <jobs.json>   score every take, keep the best per line, assemble each clip;
                                              exit 3 with more jobs if some line has no take that passes
"""
import json, os, re, subprocess, sys, warnings
warnings.filterwarnings("ignore")
import numpy as np, soundfile as sf, librosa
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import VOICE, CACHE, clips, clip_hash, take_path, take_key, spoken, voice_takes

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALIASES = VOICE["asr"]["aliases"]
SCORES = os.path.join(CACHE, "scores.json")


def norm(s, lang="en"):
    """Lowercase words, numbers spelled out, aliases applied: what was said, independent of how it was written."""
    from num2words import num2words
    s = s.lower().replace("%", " percent").replace("-", " ")
    s = re.sub(r"(\d),(\d)", r"\1\2", s)
    s = re.sub(r"\d+(\.\d+)?", lambda m: " " + num2words(float(m.group()) if "." in m.group() else int(m.group())) + " ", s)
    s = re.sub(r"[^a-z' ]", " ", s).replace("'", "")
    words = " ".join(s.split())
    words = re.sub(r"\ba (hundred|thousand|million|billion)\b", r"one \1", words)
    for k, v in ALIASES.items():
        words = re.sub(rf"\b{k}\b", v, words)
    return words.split()


def wer(ref, hyp, lang="en"):
    r, h = norm(ref, lang), norm(hyp, lang)
    d = np.zeros((len(r) + 1, len(h) + 1), int)
    d[:, 0] = range(len(r) + 1); d[0, :] = range(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
    return d[-1, -1] / max(1, len(r))


def trim(a, sr, thr=0.004):
    idx = np.where(np.abs(a) > thr)[0]
    return a if not len(idx) else a[max(0, idx[0] - int(0.01 * sr)): idx[-1] + int(0.04 * sr)]


_asr = {}
def transcribe(a, sr, lang="en"):
    if lang not in _asr:
        from faster_whisper import WhisperModel
        _asr[lang] = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=os.cpu_count())
    segs, _ = _asr[lang].transcribe(librosa.resample(a, orig_sr=sr, target_sr=16000), language=lang, beam_size=5)
    return " ".join(s.text for s in segs).strip()


def pitch_sd(a, sr):
    f0, voiced, _ = librosa.pyin(librosa.resample(a, orig_sr=sr, target_sr=16000), fmin=90, fmax=420, sr=16000, frame_length=1024)
    f = f0[voiced & ~np.isnan(f0)]
    return float(np.std(12 * np.log2(f / np.median(f)))) if len(f) > 10 else 0.0


def score(line, take, cache, lang="en"):
    key = take_key(line, take, lang)
    if key in cache:
        return cache[key]
    a, sr = sf.read(take_path(line, take, lang))
    a = trim(a.astype(np.float32), sr)
    hyp = transcribe(a, sr, lang)
    words = len(norm(line, lang))
    s = {"wer": wer(line, hyp, lang), "hyp": hyp, "pitch_sd": pitch_sd(a, sr), "wps": words / (len(a) / sr), "dur": len(a) / sr}
    cache[key] = s
    return s


def passes(s, words):
    # Pace is only meaningful on longer lines: a deliberate pause dominates a short one.
    return s["wer"] == 0 and (words < 6 or 1.5 <= s["wps"] <= 3.6)


def lines_of(topic_dir):
    """Every distinct spoken line as (language, text)."""
    topic, cs = clips(topic_dir)
    lines = sorted({spoken(x) for _, items in cs for x in items if spoken(x)})
    return topic, cs, lines


def plan(topic_dir, jobs_path):
    _, _, lines = lines_of(topic_dir)
    json.dump([{"lang": lang, "line": l, "takes": voice_takes(lang)[0]} for lang, l in lines], open(jobs_path, "w"), indent=1)
    print(f"{len(lines)} line(s), {sum(len(voice_takes(lang)[0]) for lang, _ in lines)} take(s) planned")


def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def build(topic_dir, jobs_path):
    topic, cs, lines = lines_of(topic_dir)
    cache = json.load(open(SCORES)) if os.path.exists(SCORES) else {}
    best, more = {}, []
    for lang, line in lines:
        all_takes = sum(voice_takes(lang), [])
        made = [t for t in all_takes if os.path.exists(take_path(line, t, lang))]
        scored = [(t, score(line, t, cache, lang)) for t in made]
        ok = [(t, s) for t, s in scored if passes(s, len(norm(line, lang)))]
        if ok:
            best[(lang, line)] = max(ok, key=lambda ts: ts[1]["pitch_sd"])
        else:
            nxt = [t for t in all_takes if t not in made][:2]
            if not nxt:
                sys.exit(f"No take passes for: {line!r}. Rewrite the line (closest: {min(scored, key=lambda ts: ts[1]['wer'])[1]['hyp']!r}).")
            more.append({"lang": lang, "line": line, "takes": nxt})
            print(f"needs more takes ({len(made)} failed): {line[:70]}  e.g. heard {scored[0][1]['hyp']!r}")
    json.dump(cache, open(SCORES, "w"))
    if more:
        json.dump(more, open(jobs_path, "w"), indent=1)
        sys.exit(3)

    out_dir = os.path.join(SITE, "public", "audio", topic)
    os.makedirs(out_dir, exist_ok=True)
    P = VOICE["pauses"]; A = VOICE["audio"]
    manifest = {"topic": topic, "voice": VOICE["version"], "clips": {}}
    for cid, items in cs:
        parts, timing, t, sr = [], [], 0.0, 24000
        lead = np.zeros(int(P["lead_in"] * sr), np.float32); parts.append(lead); t += len(lead) / sr
        segs = {}
        for x in items:
            if spoken(x):
                lang, text = spoken(x)
                a, s = sf.read(take_path(text, best[(lang, text)][0], lang)); assert s == sr
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
        meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", f"loudnorm=I={A['loudness_lufs']}:TP={A['true_peak_dbtp']}:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
        m = json.loads(meas[meas.rindex("{"):])
        ln = (f"loudnorm=I={A['loudness_lufs']}:TP={A['true_peak_dbtp']}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
              f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
        mp3, opus = os.path.join(out_dir, f"{cid}.mp3"), os.path.join(out_dir, f"{cid}.webm")
        run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", ln, "-ar", str(A["sample_rate"]), "-ac", "1", "-b:a", f"{A['mp3_kbps']}k", mp3])
        run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", ln, "-ar", str(A["sample_rate"]), "-ac", "1", "-c:a", "libopus", "-b:a", f"{A['opus_kbps']}k", opus])
        check = subprocess.run(["ffmpeg", "-hide_banner", "-i", mp3, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
        lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", check)[-1]); peak = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", check)[-1])
        words = sum(len(norm(spoken(x)[1], spoken(x)[0])) for x in items if spoken(x))
        manifest["clips"][cid] = {
            "hash": clip_hash(items), "duration": round(len(wav) / sr, 3), "lines": timing,
            "lufs": lufs, "true_peak": peak, "wpm": round(words / (len(wav) / sr) * 60),
            "wer": max(best[spoken(x)][1]["wer"] for x in items if spoken(x)),
        }
        print(f"{cid}: {len(wav)/sr:5.1f}s  {manifest['clips'][cid]['wpm']} wpm  {lufs} LUFS  peak {peak} dBTP")
    json.dump(manifest, open(os.path.join(out_dir, "manifest.json"), "w"), indent=1)
    print(f"wrote {len(cs)} clip(s) to {out_dir}")


if __name__ == "__main__":
    {"plan": plan, "build": build}[sys.argv[1]](sys.argv[2], sys.argv[3])
