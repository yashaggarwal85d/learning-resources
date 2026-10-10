"""Shared by gen_takes.py, gen_takes_de.py and assemble.py: the voice config, clip texts and cache keys.

Script items (narration.json): "an English line" (the narrator), {"de": "ein deutscher Satz"} (the German voice,
for German words and sentences in German lessons), or {"beat": s} (a deliberate pause)."""
import hashlib, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = json.load(open(os.path.join(HERE, "voice.json")))
CACHE = os.environ.get("NARRATION_CACHE", os.path.expanduser("~/.cache/learning-narration"))


GERMAN = VOICE.get("german")


def is_de(x):
    return isinstance(x, dict) and "de" in x


def spoken(x):
    """(language, text) for a spoken item, None for a beat."""
    return ("en", x) if isinstance(x, str) else ("de", x["de"]) if is_de(x) else None


def clips(topic_dir):
    """Every clip of a topic: (clip id, items), where items are lines (str), {"de": str} or {"beat": s}."""
    spec = json.load(open(os.path.join(topic_dir, "narration.json")))
    out = []
    for i, s in enumerate(spec["steps"], 1):
        out.append((f"{i:02d}", s["lines"]))
        if s.get("answer"):
            out.append((f"{i:02d}a", s["answer"]))
    return spec["topic"], out


def clip_hash(items):
    """Must match tests/narration.mjs: lines joined by newlines, beats as [beat s], German lines as [de] text,
    plus the voice version (and the German voice version when the clip has German in it)."""
    canon = "\n".join(x if isinstance(x, str) else f"[de] {x['de']}" if is_de(x) else f"[beat {x['beat']}]" for x in items) + "\n#voice:" + VOICE["version"]
    if any(is_de(x) for x in items):
        canon += "\n#voice-de:" + GERMAN["version"]
    return hashlib.sha256(canon.encode("utf-8")).hexdigest()[:16]


def take_key(line, take, lang="en"):
    if lang == "de":
        g = GERMAN
        blob = json.dumps({"line": line, "lang": "de", "engine": g["engine"]["commit"], "model": g["model"]["repo"], "reference": g["reference"]["sha256"],
                           "clone": g["clone"], "take": take}, sort_keys=True)
    else:
        blob = json.dumps({"line": line, "voice": VOICE["voice"], "model": VOICE["model"]["repo"], "sampling": VOICE["sampling"], "take": take}, sort_keys=True)
    return hashlib.sha256(blob.encode()).hexdigest()[:20]


def take_path(line, take, lang="en"):
    os.makedirs(os.path.join(CACHE, "takes"), exist_ok=True)
    return os.path.join(CACHE, "takes", take_key(line, take, lang) + ".wav")


def voice_takes(lang):
    v = GERMAN if lang == "de" else VOICE
    return v["takes"], v["extra_takes"]
