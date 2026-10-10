"""Generate German takes (voice.json -> german) for the lines listed in a jobs file (made by assemble.py plan).
Needs only the standard library and the qwen3-tts engine built by setup.sh:
  QWEN_TTS    the engine binary   (default: $NARRATION_TOOLS/qwen3-tts/qwen_tts)
  QWEN_MODEL  the Base model dir  (default: $NARRATION_TOOLS/qwen3-tts-1.7b-base)
The voice is a clone of narration/voices/german-reference.wav (itself designed from a text description, not a real
person), so every line is the same speaker. Takes are cached by line + voice settings + seed, like the English ones."""
import hashlib, json, os, subprocess, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import GERMAN, HERE, take_path

TOOLS = os.environ.get("NARRATION_TOOLS", os.path.expanduser("~/.cache/learning-narration/tools"))
QWEN = os.environ.get("QWEN_TTS", os.path.join(TOOLS, "qwen3-tts", "qwen_tts"))
MODEL = os.environ.get("QWEN_MODEL", os.path.join(TOOLS, "qwen3-tts-1.7b-base"))

jobs = json.load(open(sys.argv[1]))
todo = [(j["line"], t) for j in jobs if j.get("lang") == "de" for t in j["takes"] if not os.path.exists(take_path(j["line"], t, "de"))]
print(f"{len(todo)} German take(s) to generate", flush=True)
if not todo:
    sys.exit(0)
for path, what in ((QWEN, "engine"), (MODEL, "model")):
    if not os.path.exists(path):
        sys.exit(f"German voice {what} not found at {path}: run narration/setup.sh (or set QWEN_TTS / QWEN_MODEL).")

ref = os.path.join(HERE, GERMAN["reference"]["file"])
digest = hashlib.sha256(open(ref, "rb").read()).hexdigest()
if not digest.startswith(GERMAN["reference"]["sha256"]):
    sys.exit(f"{ref} does not match voice.json (sha256 {GERMAN['reference']['sha256']}…): the German voice must not change silently.")

for n, (line, take) in enumerate(todo, 1):
    t0 = time.time()
    path = take_path(line, take, "de")
    cmd = [QWEN, "-d", MODEL, "-l", GERMAN["language"], "--ref-audio", ref, "--xvector-only", "--seed", str(take["seed"]),
           "-T", str(take["temperature"]), "-j", str(os.cpu_count()), "-S", "--text", line, "-o", path + ".tmp.wav"]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
    os.replace(path + ".tmp.wav", path)
    print(f"[{n}/{len(todo)}] German take in {time.time()-t0:.0f}s: {line[:60]}", flush=True)
