"""Shared by gen_takes.py and assemble.py: the voice config, clip texts and cache keys.

Script items (narration.json): "a line" (the narrator) or {"beat": s} (a deliberate pause)."""
import contextlib, hashlib, json, os, time

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = json.load(open(os.path.join(HERE, "voice.json"), encoding="utf-8"))
CACHE = os.environ.get("NARRATION_CACHE", os.path.expanduser("~/.cache/learning-narration"))

GPU_SLOTS = int(os.environ.get("NARRATION_GPU_SLOTS", 3))
GPU_LOCK_DIR = os.path.join(CACHE, "gpu-slots")


def _pid_alive(pid):
    """Windows-only liveness check (no extra dependency): a lock is only ever reclaimed once its owning process is
    verifiably gone, never by guessing from a time limit — under real contention a legitimate take can take longer
    than any fixed timeout, and reclaiming a still-live holder's slot just lets more processes pile onto the GPU at
    once, which is the exact overload this lock exists to prevent."""
    try:
        import ctypes
        handle = ctypes.windll.kernel32.OpenProcess(0x1000, False, pid)  # PROCESS_QUERY_LIMITED_INFORMATION
        if not handle:
            return False
        ctypes.windll.kernel32.CloseHandle(handle)
        return True
    except Exception:
        return True  # can't tell: assume alive, never steal


@contextlib.contextmanager
def gpu_slot():
    """Block until one of GPU_SLOTS is free, then hold it: several narrate.sh workers each generate takes on their
    own schedule (generate, then score on CPU, repeat), so this lets whichever one is ready claim a free GPU slot
    the instant another worker's generation call finishes, instead of capping concurrency at the worker count."""
    os.makedirs(GPU_LOCK_DIR, exist_ok=True)
    path = None
    while path is None:
        for i in range(GPU_SLOTS):
            p = os.path.join(GPU_LOCK_DIR, f"slot-{i}")
            try:
                fd = os.open(p, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
                os.write(fd, str(os.getpid()).encode())
                os.close(fd)
                path = p
                break
            except FileExistsError:
                try:
                    holder = int(open(p).read().strip())
                except (OSError, ValueError):
                    holder = None
                if holder is None or not _pid_alive(holder):
                    try:
                        os.remove(p)
                    except OSError:
                        pass
        if path is None:
            time.sleep(0.2)
    try:
        yield
    finally:
        try:
            os.remove(path)
        except OSError:
            pass


def spoken(x):
    """(language, text) for a spoken item, None for a beat."""
    return ("en", x) if isinstance(x, str) else None


def clips(topic_dir):
    """Every clip of a topic: (clip id, items), where items are lines (str) or {"beat": s}."""
    spec = json.load(open(os.path.join(topic_dir, "narration.json"), encoding="utf-8"))
    out = []
    for i, s in enumerate(spec["steps"], 1):
        out.append((f"{i:02d}", s["lines"]))
        if s.get("answer"):
            out.append((f"{i:02d}a", s["answer"]))
    return spec["topic"], out


def clip_hash(items):
    """Must match tests/narration.mjs: lines joined by newlines, beats as [beat s], plus the voice version."""
    # Beats are written the way JavaScript prints a number (1.0 -> "1"), so tests/narration.mjs computes the same hash.
    num = lambda b: str(int(b)) if float(b).is_integer() else repr(float(b))
    canon = "\n".join(x if isinstance(x, str) else f"[beat {num(x['beat'])}]" for x in items) + "\n#voice:" + VOICE["version"]
    return hashlib.sha256(canon.encode("utf-8")).hexdigest()[:16]


def take_key(line, take, lang="en"):
    # The whole model block (engine, weights, reference clip and its text, cfg scale) and the sampling are part of the key, so a
    # change to either never reuses an old take (pc/README.md section 3); the Orpheus-only fields may be absent.
    blob = json.dumps({"line": line, "voice": VOICE.get("voice"), "model": VOICE["model"], "sampling": VOICE.get("sampling"), "take": take}, sort_keys=True)
    return hashlib.sha256(blob.encode()).hexdigest()[:20]


def take_path(line, take, lang="en"):
    os.makedirs(os.path.join(CACHE, "takes"), exist_ok=True)
    return os.path.join(CACHE, "takes", take_key(line, take, lang) + ".wav")


def voice_takes(lang):
    return VOICE["takes"], VOICE["extra_takes"]
