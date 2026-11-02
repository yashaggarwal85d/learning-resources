# Fact-check, currency and red team — `de.images-layers-local-environments`

Self-review; no independent reviewer.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A changed layer forces every layer stacked above it to rebuild | Confirmed | Docker build-cache docs, "If a layer changes, all other layers that come after it are also affected." |
| 2 | Layers below the first changed instruction are reused from cache | Confirmed | Same page: "Whenever a layer changes, that layer will need to be re-built" — stated only of the changed layer and what follows; nothing says earlier layers rebuild. |
| 3 | Deletion is a whiteout marker added on top, not a removal below | Confirmed | OCI image-spec layer.md, whiteout section, verbatim. |
| 4 | An opaque whiteout can hide a whole lower-layer directory at once | Confirmed | OCI image-spec layer.md, "Opaque Whiteout" section, verbatim. |
| 5 | A write to an unmodified lower-layer file copies the *whole* file up by default | Confirmed, with a correction | Kernel OverlayFS docs confirm `copy_up` of the file; the plan draft had assumed this was unconditional. The docs also describe an optional `metacopy` feature that copies up only metadata first — stated in OUTLINE.md and the reel's caption so the claim doesn't overclaim the default-off feature as if it always applied. |
| 6 | Plain `depends_on` does not wait for readiness, only for start | Confirmed | Compose startup-order docs, verbatim: "Compose only ensures that the services listed under the depends_on property are started before the dependent service" is the documented default behaviour this topic's non-`service_healthy` example draws. |
| 7 | `condition: service_healthy` waits on the dependency's own healthcheck | Confirmed | Compose startup-order docs, verbatim. |
| 8 | `static-debian13` ≈ 2 MiB, `alpine` ≈ 5 MiB, `debian` 124 MiB | Confirmed, version-checked | Distroless README states `static-debian13` (not `-debian12`; the project has moved its "latest" tag to Debian 13 since this plan's earlier research pass) is the current smallest tag. Reel and post-notes use `-debian13` throughout. |
| 9 | Distroless images contain no shell by default | Confirmed | Distroless README, verbatim; `:debug` variants add a busybox shell, noted in post-notes "Where this goes next" rather than claimed as the default. |

## Red team

- Edge case tried on step 2's predict: "does an unchanged layer *between* two changed ones survive?" — no, because a cache lookup is keyed on everything up to and including that layer; once anything above a point changes, cache below is reused only up to the first change, and the question in the reel asks about one change, not two, to avoid this ambiguity in a 5-minute refresher.
- Counter-example checked for step 6/8 (Compose health gating): a `service_completed_successfully` condition exists for one-off init containers (migrations) but is out of this refresher's scope (not in the syllabus clause) and is left for a "where this goes next" mention only, not a claim.
- Checked that nothing in this topic claims a measured `docker build` time or image size from this machine: `docker info` fails here (no daemon socket), so every number in the reel and post-notes is either a pure-Python simulation (`examples.py`, run for real) or a verbatim, sourced, dated number from Docker's or the Distroless project's own documentation — never invented.
