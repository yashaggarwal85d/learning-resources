"""Generate Qwen3-TTS takes for the lines listed in a jobs file (made by assemble.py plan): the GPU voice (pc/README.md).
Same contract as gen_takes.py: one float WAV per take at take_path(line, take); takes are cached by line + model + settings + seed.

voice.json → model: {"engine": "qwen3-tts", "repo": <HF id>, "mode": "clone" | "custom",
                     clone:  "reference": <wav path, relative to site/>, "reference_text": <its transcript>
                     custom: "speaker": <preset>, "instruct": <optional>}
voice.json → sampling: top_p, max_new_tokens (passed to generate); each take's temperature and seed apply."""
import json, os, sys, time
import numpy as np, soundfile as sf, torch
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import VOICE, take_path

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M, S = VOICE["model"], VOICE["sampling"]
assert M.get("engine") == "qwen3-tts", "voice.json model.engine is not qwen3-tts"

jobs = json.load(open(sys.argv[1]))
todo = [(j["line"], t) for j in jobs if j.get("lang", "en") == "en" for t in j["takes"] if not os.path.exists(take_path(j["line"], t))]
print(f"{len(todo)} take(s) to generate", flush=True)
if not todo:
    sys.exit(0)

from qwen_tts import Qwen3TTSModel
device = os.environ.get("TTS_DEVICE", "cuda:0")  # ROCm shows the Radeon through the cuda API
model = Qwen3TTSModel.from_pretrained(M["repo"], device_map=device, dtype=torch.bfloat16, attn_implementation="sdpa")
gen = {k: S[k] for k in ("top_p", "max_new_tokens") if k in S}
prompt = None
if M["mode"] == "clone":
    ref = os.path.join(SITE, M["reference"])
    prompt = model.create_voice_clone_prompt(ref_audio=ref, ref_text=M["reference_text"], x_vector_only_mode=False)

for n, (line, take) in enumerate(todo, 1):
    t0 = time.time()
    torch.manual_seed(take["seed"])
    kw = {**gen, "temperature": take["temperature"], "do_sample": True}
    if M["mode"] == "clone":
        wavs, sr = model.generate_voice_clone(text=line, language="English", voice_clone_prompt=prompt, **kw)
    else:
        wavs, sr = model.generate_custom_voice(text=line, language="English", speaker=M["speaker"], instruct=M.get("instruct") or None, **kw)
    a = np.asarray(wavs[0], dtype=np.float32).reshape(-1)
    if sr != 24000:  # the pipeline assembles at 24 kHz (assemble.py asserts it)
        import librosa
        a = librosa.resample(a, orig_sr=sr, target_sr=24000); sr = 24000
    path = take_path(line, take)
    sf.write(path + ".tmp.wav", a, sr)
    os.replace(path + ".tmp.wav", path)
    print(f"[{n}/{len(todo)}] {len(a)/sr:.1f}s audio in {time.time()-t0:.1f}s: {line[:60]}", flush=True)
