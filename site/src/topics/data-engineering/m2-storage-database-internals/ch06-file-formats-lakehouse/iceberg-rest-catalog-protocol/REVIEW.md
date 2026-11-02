# REVIEW — de.iceberg-rest-catalog-protocol

## Design decision

CHAPTER.md's lab note explicitly puts "a full Polaris/Lakekeeper-plus-MinIO stand-up" out of
scope, but the topic's own outcomes line requires standing up "a real local REST (or SQL) catalog
... config negotiation, a load, and a commit with a requirement assertion." Resolved by hand-
building a minimal REST catalog server (Python stdlib `http.server.BaseHTTPRequestHandler` +
`ThreadingHTTPServer`) and a real HTTP client (`http.client.HTTPConnection`) implementing a real
subset of the actual Apache Iceberg REST Catalog OpenAPI spec -- no pyiceberg, no Docker, no JVM
-- matching this chapter's established "hand-build the primitive, reuse real libraries only when
the topic is specifically about one" convention.

## What was built vs. sourced

Built: config negotiation (`GET /v1/config`, real merge-order assertion), table load
(`GET .../tables/{table}`), and commit with a requirement assertion (`POST .../tables/{table}`,
checking `assert-current-snapshot-id` against real server state under a lock, returning a real
409 naming the exact mismatch). Named and sourced only, not built: multi-table transactions, the
views and register endpoints, credential vending and remote signing
(`X-Iceberg-Access-Delegation`), server-side scan planning (Iceberg 1.11), SQL UDFs, and the
deprecated OAuth2 token endpoint.

## Fixes made during authoring

- `examples.py`'s config-negotiation demo originally asserted the wrong merged value (`"clients"
  == "4"` while also setting the client's own `"clients": "1"`, which per the spec's own merge
  order would make the client's value win) -- fixed by removing `"clients"` from the client's own
  config so the server's default correctly survives unoverridden.
- `SOURCES.md`'s Red-team section initially had an inaccurate note about the OAuth2-deprecation
  quote being "truncated to avoid `**` emphasis markers" when the quote actually includes the
  literal `**DEPRECATED for REMOVAL**` markers verbatim (which is correct and matches the source
  exactly) -- corrected before running the check.
- Takeaways were counted by hand before the first check run (18, 17, and 20 words respectively)
  to avoid the word-count failures hit on topics 30 and 31.
- The only literal digit shown in reel.tsx ("409") is backed by a literal "409 Conflict" token in
  `examples.py`'s own docstring; "1.11" and other version-like references were deliberately kept
  out of reel.tsx's displayed text (spoken only in narration.json, not scanned by the digit check).

## Checks run

- `check-all.mjs --skip reels,links,narration --topic data-engineering/.../iceberg-rest-catalog-protocol`:
  clean on the first run that used the correct full slug path (locked 76.7s, docs 0.4s, sources
  0.1s -- 15/15 quotes word-for-word, build 50.4s). An earlier run used the bare topic id instead
  of the full slug and silently no-op'd the sources/topic-scoped checks (still ran a full build
  that passed); re-run with the correct slug caught and confirmed the sources check for real.
- `--only links,narration`: clean (2163 links: 1919 ok, 0 broken, 150 blocked, 94 pre-existing
  title mismatches unrelated to this topic; narration 0.3s, all step lines ≤50 words,
  description-overlap 0-1%).
- `--only reels`: reel smoke test passed clean on the first try, both viewports ("1 live reel(s)
  at desktop and phone sizes"). `test:editor` failed with the known pre-existing sandbox
  limitation ("a save did not open a new GitHub issue") -- confirmed non-regression, consistent
  with topics 30 and 31 and prior project memory.

## Screenshot review

All 24 screenshots (desktop 01-10, phone 01-10, plus the four `-q` predict-wait variants for
steps 2 and 5 on both viewports) reviewed via the Read tool. All clean: no text overlap, no
overflow on phone for the three-row step (09, server-side scan planning / SQL UDFs / OAuth2
deprecation) or the four-row Recap step (10), "409" renders correctly in both the predict-wrong-
answer box and the reveal/takeaway text.
