"""Audition the GPU voice candidates on real script lines, for the owner to pick by ear (pc/README.md section 2).

Renders six lines with: the CustomVoice presets in PRESETS, and each description in DESIGNS designed once with the
VoiceDesign model and then cloned from that designed clip with the Base model (so a candidate is one consistent speaker,
and nobody real is cloned). Output: narration/pc/audition/<candidate>/<n>.wav plus the designed reference clips.
Run from site/ with the GPU environment: "$TTS_PY" narration/audition.py"""
import os, sys
import numpy as np, soundfile as sf, torch
from qwen_tts import Qwen3TTSModel

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pc", "audition")
LINES = [
    "A pipeline runs the same commands on every change. It stops at the first failure.",
    "So... does the step pass, or fail?",
    "The nightly job sorts about a trillion bytes, and memory holds sixteen thousand, three hundred and eighty four blocks.",
    "The runner stops at the first non-zero exit. Explicit bash adds the pipe fail option. Flaky tests need their state fixed.",
    "All familiar? Swipe on.",
    "Next up... the last of the five refreshers: the notation for that, and the logarithms the chapter counts with.",
]
REFERENCE_LINE = "A lock file freezes the tree. An application pins every package with an exact version, the same on every machine."
PRESETS = ["Vivian", "Serena"]
DESIGNS = {
    "designed-warm": "A woman in her thirties, calm and confident, warm without being sweet, slightly low pitch, soft and faintly husky, relaxed conversational delivery, unhurried, neutral internationally clear English accent, no upward lilt at the end of statements.",
    "designed-bright": "A woman around thirty, friendly and precise, mid-low pitch, smooth and clear, a light smile in the voice, measured pace, neutral accent, serious about the subject.",
    "designed-mellow": "A woman in her forties, mellow and steady, low and smooth, soothing, like a trusted expert explaining something over coffee, slow deliberate pace, neutral accent.",
}
device = os.environ.get("TTS_DEVICE", "cuda:0")
load = lambda repo: Qwen3TTSModel.from_pretrained(repo, device_map=device, dtype=torch.bfloat16, attn_implementation="sdpa")
write = lambda path, wavs, sr: (os.makedirs(os.path.dirname(path), exist_ok=True), sf.write(path, np.asarray(wavs[0], dtype=np.float32).reshape(-1), sr))

custom = load("Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice")
for sp in PRESETS:
    for i, line in enumerate(LINES, 1):
        torch.manual_seed(11)
        wavs, sr = custom.generate_custom_voice(text=line, language="English", speaker=sp, top_p=0.9, max_new_tokens=2048)
        write(os.path.join(OUT, f"preset-{sp}", f"{i}.wav"), wavs, sr)
    print("rendered preset", sp, flush=True)
del custom

design = load("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign")
refs = {}
for name, instruct in DESIGNS.items():
    torch.manual_seed(11)
    wavs, sr = design.generate_voice_design(text=REFERENCE_LINE, language="English", instruct=instruct, top_p=0.9, max_new_tokens=2048)
    refs[name] = os.path.join(OUT, f"{name}-reference.wav")
    write(refs[name], wavs, sr)
    print("designed", name, flush=True)
del design

base = load("Qwen/Qwen3-TTS-12Hz-1.7B-Base")
for name, ref in refs.items():
    prompt = base.create_voice_clone_prompt(ref_audio=ref, ref_text=REFERENCE_LINE, x_vector_only_mode=False)
    for i, line in enumerate(LINES, 1):
        torch.manual_seed(11)
        wavs, sr = base.generate_voice_clone(text=line, language="English", voice_clone_prompt=prompt, top_p=0.9, max_new_tokens=2048)
        write(os.path.join(OUT, name, f"{i}.wav"), wavs, sr)
    print("rendered", name, flush=True)
print(f"Listen in {OUT}. The chosen designed voice's *-reference.wav becomes narration/pc/reference.wav (pc/README.md section 3).")
