"""Keep the narration take cache across sessions, on the `narration-cache` branch of this repo.

  cache_sync.py pull   restore takes and scores from the branch into the local cache (nothing there yet: no-op)
  cache_sync.py push   save the local cache to the branch (lossless FLAC; a single commit, so history never grows)

Many runs narrate at once, each with only its own topic's branch checked out, so a save keeps every take already
on the branch and adds this run's. It drops only takes that no narration.json script on main, on any topic/* or
release/* branch, or in this checkout can still use (an edited or removed line's), and drops nothing when it can't
read those branches. narrate.sh saves every hour while it runs and again when it stops, so a run that dies (a usage
limit) loses at most an hour of takes. The branch holds nothing the site deploys. Runs in the evaluation environment
(soundfile). Failures here only cost time, never correctness: narrate.sh carries on without the cache.
"""
import glob, json, os, shutil, subprocess, sys, tempfile
import soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import CACHE, HERE, spoken, take_key, voice_takes

BRANCH = "narration-cache"
REPO = os.path.dirname(os.path.dirname(HERE))
TOPICS = os.path.join(REPO, "site", "src", "topics")


def git(*args, cwd, check=True):
    return subprocess.run(["git", *args], cwd=cwd, check=check, capture_output=True, text=True)


def keys_of(spec):
    """Cache keys of every take one narration.json script can use (its lines and answers, as common.clips reads them)."""
    keys = set()
    for step in spec["steps"]:
        for x in step["lines"] + (step.get("answer") or []):
            s = spoken(x)
            if s:
                lang, line = s
                keys.update(take_key(line, t, lang) for t in sum(voice_takes(lang), []))
    return keys


def wanted_keys():
    """Cache keys of every take a script can use: in this checkout, and on main and every topic/* and release/*
    branch (other runs' topics, not merged yet). None when those branches can't be read: then nothing is dropped."""
    keys = set()
    for path in glob.glob(os.path.join(TOPICS, "**", "narration.json"), recursive=True):
        keys |= keys_of(json.load(open(path)))
    try:
        git("fetch", "-q", "origin", "+refs/heads/main:refs/remotes/origin/main", "+refs/heads/topic/*:refs/remotes/origin/topic/*",
            "+refs/heads/release/*:refs/remotes/origin/release/*", cwd=REPO)
        refs = git("for-each-ref", "--format=%(refname)", "refs/remotes/origin/main", "refs/remotes/origin/topic", "refs/remotes/origin/release", cwd=REPO).stdout.split()
        for ref in refs:
            for p in git("ls-tree", "-r", "--name-only", ref, "--", "site/src/topics", cwd=REPO).stdout.split():
                if p.endswith("/narration.json"):
                    keys |= keys_of(json.loads(git("show", f"{ref}:{p}", cwd=REPO).stdout))
    except (subprocess.CalledProcessError, ValueError, KeyError) as e:
        print(f"narration cache: can't read the other branches' scripts ({e}), so nothing is dropped this time")
        return None
    return keys


def load(path):
    """A scores file, or {} if it is missing or being written right now (the hourly save runs alongside assemble.py)."""
    try:
        return json.load(open(path))
    except (OSError, ValueError):
        return {}


def origin():
    return git("remote", "get-url", "origin", cwd=REPO).stdout.strip()


def fetch(into):
    """Clone the cache branch into `into`; return its commit, or None when the branch doesn't exist yet."""
    url = origin()
    if git("clone", "-q", "--depth", "1", "--branch", BRANCH, "--single-branch", url, into, cwd=REPO, check=False).returncode:
        return None
    return git("rev-parse", "HEAD", cwd=into).stdout.strip()


def pull():
    with tempfile.TemporaryDirectory() as tmp:
        if not fetch(tmp):
            print("narration cache: none saved yet")
            return
        os.makedirs(os.path.join(CACHE, "takes"), exist_ok=True)
        n = 0
        for f in glob.glob(os.path.join(tmp, "takes", "*.flac")):
            dst = os.path.join(CACHE, "takes", os.path.basename(f)[:-5] + ".wav")
            if not os.path.exists(dst):
                a, sr = sf.read(f, dtype="float32")
                sf.write(dst + ".tmp.wav", a, sr)  # float WAV, as the generators write it
                os.replace(dst + ".tmp.wav", dst)
                n += 1
        scores = os.path.join(CACHE, "scores.json")
        mine, theirs = load(scores), load(os.path.join(tmp, "scores.json"))
        json.dump({**theirs, **mine}, open(scores, "w"))
        print(f"narration cache: restored {n} take(s), {len(theirs)} score(s)")


def push():
    keep = wanted_keys()
    for attempt in range(3):
        with tempfile.TemporaryDirectory() as tmp:
            sha = fetch(tmp)
            if not sha:
                shutil.rmtree(tmp); os.makedirs(tmp); git("init", "-q", "-b", BRANCH, cwd=tmp)
            os.makedirs(os.path.join(tmp, "takes"), exist_ok=True)
            have = {os.path.basename(f)[:-5] for f in glob.glob(os.path.join(tmp, "takes", "*.flac"))}
            for f in glob.glob(os.path.join(CACHE, "takes", "*.wav")):
                key = os.path.basename(f)[:-4]
                if (keep is None or key in keep) and key not in have and not f.endswith(".tmp.wav"):
                    a, sr = sf.read(f, dtype="float32")
                    sf.write(os.path.join(tmp, "takes", key + ".flac"), a, sr, subtype="PCM_24")
            if keep is not None:
                for f in glob.glob(os.path.join(tmp, "takes", "*.flac")):  # drop what no script on any branch can use any more
                    if os.path.basename(f)[:-5] not in keep:
                        os.remove(f)
            merged = {**load(os.path.join(tmp, "scores.json")), **load(os.path.join(CACHE, "scores.json"))}
            json.dump({k: v for k, v in merged.items() if keep is None or k in keep}, open(os.path.join(tmp, "scores.json"), "w"), sort_keys=True)
            git("add", "-A", cwd=tmp)
            if not git("status", "--porcelain", cwd=tmp).stdout.strip():
                print("narration cache: already up to date")
                return
            git("checkout", "-q", "--orphan", "new", cwd=tmp, check=False)
            git("-c", "user.name=narration-cache", "-c", "user.email=narration-cache@users.noreply.github.com", "commit", "-q", "-m", "Narration take cache (generated; replaced on every save)", cwd=tmp)
            lease = f"--force-with-lease={BRANCH}:{sha}" if sha else f"--force-with-lease={BRANCH}:"
            r = git("push", "-q", lease, origin(), f"HEAD:refs/heads/{BRANCH}", cwd=tmp, check=False)
            if not r.returncode:
                print(f"narration cache: saved {len(glob.glob(os.path.join(tmp, 'takes', '*.flac')))} take(s)")
                return
            print(f"narration cache: push failed (attempt {attempt + 1}): {r.stderr.strip()[:200]}")
    sys.exit(1)


if __name__ == "__main__":
    {"pull": pull, "push": push}[sys.argv[1]]()
