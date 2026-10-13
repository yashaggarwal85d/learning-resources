"""Audition the GPU voice candidates on real script lines, for the owner to pick by ear (pc/README.md section 2).

Two engines, both rendering the same six lines into narration/pc/audition/<candidate>/<n>.wav:

- Breeze TTS 2 via Breeze-TTS-2.cpp (set BREEZE_CLI and BREEZE_GGUF): each description in DESIGNS is designed once
  (--instruction) on the reference line, saved as a voice, then the six lines are rendered with that saved voice, so a
  candidate is one consistent speaker and nobody real is cloned.
- Qwen3-TTS 1.7B (needs the GPU PyTorch environment, qwen-tts): the CustomVoice presets in PRESETS, and the same
  DESIGNS designed once with the VoiceDesign model and then cloned from that designed clip with the Base model.

Run from site/: "$TTS_PY" narration/audition.py            (BREEZE_CLI=... BREEZE_GGUF=... for the Breeze candidates)"""
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "pc", "audition")
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


def breeze():
    cli, gguf = os.environ.get("BREEZE_CLI"), os.environ.get("BREEZE_GGUF")
    if not (cli and gguf):
        print("Breeze candidates skipped: set BREEZE_CLI and BREEZE_GGUF (pc/README.md section 1)"); return
    run = lambda *args: subprocess.run([cli, gguf, *args], check=True)
    for name, instruct in DESIGNS.items():
        d = os.path.join(OUT, f"breeze-{name}"); os.makedirs(d, exist_ok=True)
        ref = os.path.join(d, "reference.wav")
        run("--text", REFERENCE_LINE, "--instruction", instruct, "--cfg-scale", "4", "--output", ref)
        run("--text", REFERENCE_LINE, "--ref-audio", ref, "--ref-text", REFERENCE_LINE, "--save-voice", f"audition-{name}", "--output", os.path.join(d, "0.wav"))
        for i, line in enumerate(LINES, 1):
            run("--text", line, "--voice", f"audition-{name}", "--output", os.path.join(d, f"{i}.wav"))
        print("rendered breeze", name, flush=True)


def qwen():
    try:
        import numpy as np, soundfile as sf, torch
        from qwen_tts import Qwen3TTSModel
    except ImportError as e:
        print(f"Qwen candidates skipped: {e}"); return
    device = os.environ.get("TTS_DEVICE", "cuda:0")
    load = lambda repo: Qwen3TTSModel.from_pretrained(repo, device_map=device, dtype=torch.bfloat16, attn_implementation="sdpa")
    def write(path, wavs, sr):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        sf.write(path, np.asarray(wavs[0], dtype=np.float32).reshape(-1), sr)
    custom = load("Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice")
    for sp in PRESETS:
        for i, line in enumerate(LINES, 1):
            torch.manual_seed(11)
            wavs, sr = custom.generate_custom_voice(text=line, language="English", speaker=sp, top_p=0.9, max_new_tokens=2048)
            write(os.path.join(OUT, f"qwen-preset-{sp}", f"{i}.wav"), wavs, sr)
        print("rendered qwen preset", sp, flush=True)
    del custom
    design = load("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign")
    refs = {}
    for name, instruct in DESIGNS.items():
        torch.manual_seed(11)
        wavs, sr = design.generate_voice_design(text=REFERENCE_LINE, language="English", instruct=instruct, top_p=0.9, max_new_tokens=2048)
        refs[name] = os.path.join(OUT, f"qwen-{name}", "reference.wav")
        write(refs[name], wavs, sr)
    del design
    base = load("Qwen/Qwen3-TTS-12Hz-1.7B-Base")
    for name, ref in refs.items():
        prompt = base.create_voice_clone_prompt(ref_audio=ref, ref_text=REFERENCE_LINE, x_vector_only_mode=False)
        for i, line in enumerate(LINES, 1):
            torch.manual_seed(11)
            wavs, sr = base.generate_voice_clone(text=line, language="English", voice_clone_prompt=prompt, top_p=0.9, max_new_tokens=2048)
            write(os.path.join(OUT, f"qwen-{name}", f"{i}.wav"), wavs, sr)
        print("rendered qwen", name, flush=True)


if __name__ == "__main__":
    which = sys.argv[1:] or ["breeze", "qwen"]
    if "breeze" in which: breeze()
    if "qwen" in which: qwen()
    print(f"Listen in {OUT}. The chosen candidate's reference.wav becomes narration/pc/reference.wav (pc/README.md section 3).")
