"""Does a take say its line? The transcript check behind assemble.py (QUALITY.md #51).

The checker is a speech-to-text model, and it mishears: homophones ("reel" as "real", "cache" as "cash"), spelled
acronyms ("CI" as "C.I."), split or merged words ("pipe fail" for "pipefail"), numbers written as digits. None of
those is the voice's fault, and a listener hears the line intact. So a take passes when every difference between
its transcript and the line is one of those: the words sound alike. A skipped word, an added word, or a word that
sounds different ("functools" heard as "folk cells", "endpoints" as "engineers") still fails: that is the voice
garbling the line, and no tolerance covers it. Limits (voice.json → asr): at most `max_tolerated_blocks` differing
places per line, each at most `max_tolerated_words` of the line's words; a line that needs more is not intact.

    compare(line, transcript) -> {"exact": bool, "ok": bool, "tolerated": [{"said": ..., "heard": ...}], "wer": float}

Both sides are normalised the same way first (norm): lower case, numbers and ordinals spelled out the way
num2words spells them with the "and" dropped (so "two hundred fifty six", "two hundred and fifty-six" and "256"
agree), symbols and punctuation gone, aliases from voice.json applied.

Self-test (needs num2words and jellyfish, as in the eval environment): python narration/match.py
"""
import json, os, re, sys

import jellyfish
from num2words import num2words

HERE = os.path.dirname(os.path.abspath(__file__))
ASR = json.load(open(os.path.join(HERE, "voice.json")))["asr"]
ALIASES = ASR.get("aliases", {})
HOMOPHONES = {}
for group in ASR.get("homophones", []):
    for w in group:
        HOMOPHONES[w] = set(group)
NUMBER_WORDS = {"hundred", "thousand", "million", "billion", "trillion"}


def norm(s, lang="en"):
    """Lowercase words, numbers spelled out, aliases applied: what was said, independent of how it was written."""
    s = s.lower().replace("%", " percent")
    s = re.sub(r"(\d),(\d)", r"\1\2", s)
    s = re.sub(r"\b(\d+)(st|nd|rd|th)\b", lambda m: " " + num2words(int(m.group(1)), to="ordinal") + " ", s)
    s = re.sub(r"\d+(\.\d+)?", lambda m: " " + num2words(float(m.group()) if "." in m.group() else int(m.group())) + " ", s)
    s = s.replace("-", " ")
    s = re.sub(r"[^a-z' ]", " ", s).replace("'", "")
    words = " ".join(s.split())
    words = re.sub(r"\ba (hundred|thousand|million|billion|trillion)\b", r"one \1", words)
    for k, v in ALIASES.items():
        words = re.sub(rf"\b{re.escape(k)}\b", v, words)
    out = []
    for w in words.split():
        if w == "and" and out and out[-1] in NUMBER_WORDS:
            continue  # "two hundred and six": num2words writes the "and", speakers may not
        out.append(w)
    return out


def align(r, h):
    """Levenshtein alignment of two word lists: a list of (ref word or None, hyp word or None)."""
    n, m = len(r), len(h)
    d = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        d[i][0] = i
    for j in range(m + 1):
        d[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (r[i - 1] != h[j - 1]))
    ops, i, j = [], n, m
    while i or j:
        if i and j and d[i][j] == d[i - 1][j - 1] + (r[i - 1] != h[j - 1]):
            ops.append((r[i - 1], h[j - 1])); i -= 1; j -= 1
        elif i and d[i][j] == d[i - 1][j] + 1:
            ops.append((r[i - 1], None)); i -= 1
        else:
            ops.append((None, h[j - 1])); j -= 1
    return ops[::-1], d[n][m]


def sounds_alike(a, b):
    """Two words a listener would take for the same: equal, listed homophones, the same metaphone code, or a
    one-letter slip inside a word of four or more letters that keeps its first letter ("halve" / "have")."""
    if a == b:
        return True
    if b in HOMOPHONES.get(a, ()):
        return True
    ma, mb = jellyfish.metaphone(a), jellyfish.metaphone(b)
    if ma and ma == mb:
        return True
    return len(a) >= 4 and len(b) >= 4 and a[0] == b[0] and jellyfish.levenshtein_distance(a, b) <= 1


def blocks(ops):
    """Maximal runs of differing alignment pairs, as (ref words, hyp words)."""
    out, cur = [], None
    for rw, hw in ops:
        if rw is not None and rw == hw:
            if cur:
                out.append(cur); cur = None
            continue
        cur = cur or ([], [])
        if rw is not None:
            cur[0].append(rw)
        if hw is not None:
            cur[1].append(hw)
    if cur:
        out.append(cur)
    return out


def block_ok(ref, hyp):
    """A differing place is tolerable when it is the same words split or merged differently, or the same number of
    words each sounding like its counterpart. Nothing on one side (a skipped or added word) never is."""
    if not ref or not hyp:
        return False
    if "".join(ref) == "".join(hyp) or sounds_alike("".join(ref), "".join(hyp)):
        return True
    return len(ref) == len(hyp) and all(sounds_alike(a, b) for a, b in zip(ref, hyp))


def compare(line, transcript, lang="en"):
    r, h = norm(line, lang), norm(transcript, lang)
    ops, dist = align(r, h)
    wer = dist / max(1, len(r))
    diffs = blocks(ops)
    tolerated = [{"said": " ".join(a), "heard": " ".join(b)} for a, b in diffs]
    ok = (
        len(diffs) <= ASR.get("max_tolerated_blocks", 2)
        and all(len(a) <= ASR.get("max_tolerated_words", 2) and block_ok(a, b) for a, b in diffs)
    )
    return {"exact": dist == 0, "ok": ok, "tolerated": tolerated if ok else [], "wer": wer, "hyp": transcript}


CASES = [
    # (line, transcript, passes?)
    ("Run it twenty times, and half the runs fail.", "Run it 20 times, and half the runs fail.", True),
    ("memory holds two hundred fifty six blocks", "memory holds 256 blocks", True),
    ("memory holds two hundred and fifty six blocks", "memory holds 256 blocks", True),
    ("the fortieth row", "the 40th row", True),
    ("about one point five seconds", "about 1.5 seconds", True),
    ("a hundred lines", "100 lines", True),
    ("ten percent of the rows", "10% of the rows", True),
    ("The reel shows the cache.", "The real shows the cash.", True),
    ("Explicit bash adds the pipe fail option.", "Explicit bash adds the pipefail option.", True),
    ("the reference log, or reflog", "the reference log, or ref log", True),
    ("CI runs every test", "C.I. runs every test", True),
    ("Then halve the window.", "Then have the window.", True),
    ("Data classes hold plain values.", "Dataclasses hold plane values.", True),
    ("The neighbouring block is read too.", "The neighboring block is read two.", True),
    ("The query runs in one pass.", "The queery runs in one pass.", True),
    # the voice garbled the line, or dropped or added a word: still rejected
    ("functools caches the result", "folk cells caches the result", False),
    ("Then the endpoints answer.", "Then the engineers answer.", False),
    ("retries make it safe", "ratties make it safe", False),
    ("Run it twenty times, and half the runs fail.", "Run it twenty times, half the runs fail.", False),
    ("Run it twenty times, and half the runs fail.", "Run it twenty times, and half of the runs fail.", False),
    ("with always cleans up", "with all means up", False),
    ("The reel shows the cache, the real cash.", "The real shows the cash, the reel cache.", False),  # too many places
    ("one pass makes sixty four sorted runs", "one pass makes 64 sorted runs", True),
    ("sixteen thousand, three hundred and eighty four blocks", "16,384 blocks", True),
]

if __name__ == "__main__":
    bad = 0
    for line, hyp, want in CASES:
        got = compare(line, hyp)
        if got["ok"] != want:
            bad += 1
            print(f"FAIL want {'pass' if want else 'reject'}: {line!r} heard {hyp!r} -> {got}")
    print(f"{len(CASES) - bad}/{len(CASES)} match cases as expected")
    sys.exit(1 if bad else 0)
