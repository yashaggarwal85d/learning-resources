"""Generate Breeze TTS 2 takes for the lines listed in a jobs file (made by assemble.py plan): the GPU voice via
Breeze-TTS-2.cpp (ggml + Vulkan, runs on the Radeon without ROCm; pc/README.md). Same contract as gen_takes.py: one float
WAV per take at take_path(line, take); takes are cached by line + model + settings + seed.

voice.json → model: {"engine": "breeze-tts-2", "cli": <path to breeze-cli>, "gguf": <path to the .gguf>,
                     "voice": <saved voice name, made once with `breeze-cli --save-voice` from the frozen reference>,
                     "reference": <wav path, relative to site/>, "reference_text": <its transcript>,
                     "cfg_scale": 1.0}
A take's seed is passed as --seed when the CLI accepts it (probed once); temperature likewise as --temp. Runs in the
evaluation environment (soundfile, numpy)."""
import json, os, subprocess, sys, time
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import VOICE, take_path

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = VOICE["model"]
assert M.get("engine") == "breeze-tts-2", "voice.json model.engine is not breeze-tts-2"

jobs = json.load(open(sys.argv[1]))
todo = [(j["line"], t) for j in jobs if j.get("lang", "en") == "en" for t in j["takes"] if not os.path.exists(take_path(j["line"], t))]
print(f"{len(todo)} take(s) to generate", flush=True)
if not todo:
    sys.exit(0)

cli, gguf = os.path.expandvars(M["cli"]), os.path.expandvars(M["gguf"])  # "$BREEZE_CLI" in voice.json: no machine path in git
helptext = subprocess.run([cli, "--help"], capture_output=True, text=True).stdout + subprocess.run([cli, "--help"], capture_output=True, text=True).stderr
has = lambda flag: flag in helptext
if not has("--seed"):
    print("note: this breeze-cli has no --seed; takes differ by sampling only (still cached per seed id)", flush=True)
voice_args = ["--voice", M["voice"]] if M.get("voice") else ["--ref-audio", os.path.join(SITE, M["reference"]), "--ref-text", M["reference_text"]]

for n, (line, take) in enumerate(todo, 1):
    t0 = time.time()
    path = take_path(line, take)
    tmp = path + ".tmp.wav"
    cmd = [cli, gguf, "--text", line, "--output", tmp, "--cfg-scale", str(M.get("cfg_scale", 1.0)), *voice_args]
    if has("--seed"):
        cmd += ["--seed", str(take["seed"])]
    if has("--temp") and "temperature" in take:
        cmd += ["--temp", str(take["temperature"])]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode or not os.path.exists(tmp):
        sys.exit(f"breeze-cli failed on {line[:60]!r}: {(r.stderr or r.stdout)[-800:]}")
    a, sr = sf.read(tmp, dtype="float32")
    a = a.reshape(-1) if a.ndim == 1 else a.mean(axis=1)
    if sr != 24000:  # the pipeline assembles at 24 kHz (assemble.py asserts it)
        import librosa
        a = librosa.resample(a, orig_sr=sr, target_sr=24000); sr = 24000
    sf.write(tmp, a.astype(np.float32), sr)
    os.replace(tmp, path)
    print(f"[{n}/{len(todo)}] {len(a)/sr:.1f}s audio in {time.time()-t0:.1f}s: {line[:60]}", flush=True)
