"""Generate Orpheus takes for the lines listed in a jobs file (made by assemble.py plan).
Runs in the Orpheus environment (see README.md). Takes are cached by line + settings + seed."""
import json, os, sys, time
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import VOICE, take_path

import llama_cpp
_L = llama_cpp.Llama
def _Llama(*a, **k):
    k["n_ctx"] = VOICE["sampling"]["n_ctx"]; k["n_batch"] = 512  # orpheus-cpp otherwise asks for the full 131k context
    return _L(*a, **k)
llama_cpp.Llama = _Llama
from orpheus_cpp import OrpheusCpp
import orpheus_cpp.model as M
S = VOICE["sampling"]
def _token_gen(self, text, options=None):
    prompt = f"<|audio|>{VOICE['voice']}: {text}<|eot_id|><custom_token_4>"
    for tok in self._llm(prompt, max_tokens=S["max_tokens"], stream=True, temperature=options["temperature"], top_p=S["top_p"],
                         top_k=S["top_k"], min_p=S["min_p"], repeat_penalty=S["repeat_penalty"], seed=options["seed"]):
        yield tok["choices"][0]["text"]
M.OrpheusCpp._token_gen = _token_gen

jobs = json.load(open(sys.argv[1]))
todo = [(j["line"], t) for j in jobs if j.get("lang", "en") == "en" for t in j["takes"] if not os.path.exists(take_path(j["line"], t))]
print(f"{len(todo)} English take(s) to generate", flush=True)
if not todo:
    sys.exit(0)
o = OrpheusCpp(verbose=False, lang="en", n_threads=os.cpu_count())
for n, (line, take) in enumerate(todo, 1):
    t0 = time.time()
    sr, a = o.tts(line, options={"temperature": take["temperature"], "seed": take["seed"]})
    path = take_path(line, take)
    sf.write(path + ".tmp.wav", a.reshape(-1).astype(np.float32) / 32768, sr)
    os.replace(path + ".tmp.wav", path)
    print(f"[{n}/{len(todo)}] {len(a.reshape(-1))/sr:.1f}s audio in {time.time()-t0:.0f}s: {line[:60]}", flush=True)
