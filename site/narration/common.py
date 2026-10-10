"""Shared by gen_takes.py and assemble.py: the voice config, clip texts and cache keys."""
import hashlib, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = json.load(open(os.path.join(HERE, "voice.json")))
CACHE = os.environ.get("NARRATION_CACHE", os.path.expanduser("~/.cache/learning-narration"))


def clips(topic_dir):
    """Every clip of a topic: (clip id, items), where items are lines (str) or {"beat": s}."""
    spec = json.load(open(os.path.join(topic_dir, "narration.json")))
    out = []
    for i, s in enumerate(spec["steps"], 1):
        out.append((f"{i:02d}", s["lines"]))
        if s.get("answer"):
            out.append((f"{i:02d}a", s["answer"]))
    return spec["topic"], out


def clip_hash(items):
    """Must match tests/narration.mjs: lines joined by newlines, beats as [beat s], plus the voice version."""
    canon = "\n".join(x if isinstance(x, str) else f"[beat {x['beat']}]" for x in items) + "\n#voice:" + VOICE["version"]
    return hashlib.sha256(canon.encode("utf-8")).hexdigest()[:16]


def take_key(line, take):
    blob = json.dumps({"line": line, "voice": VOICE["voice"], "model": VOICE["model"]["repo"], "sampling": VOICE["sampling"], "take": take}, sort_keys=True)
    return hashlib.sha256(blob.encode()).hexdigest()[:20]


def take_path(line, take):
    os.makedirs(os.path.join(CACHE, "takes"), exist_ok=True)
    return os.path.join(CACHE, "takes", take_key(line, take) + ".wav")
