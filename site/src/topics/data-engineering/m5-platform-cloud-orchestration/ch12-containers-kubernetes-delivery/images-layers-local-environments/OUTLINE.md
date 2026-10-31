# OUTLINE: Images, layers and local environments (`de.images-layers-local-environments`)

Refresher, §12.1, ~5 min. Folder: `images-layers-local-environments`.

## Progress

Research, expert list and SOURCES.md done and checked (`node scripts/sources.mjs check`). Build machine has Docker's CLI only (no daemon reachable — `docker info` fails with "no such file or directory" on the socket); the lab's three-way image build and size/cold-start/CVE comparison is therefore disclosed as sourced-only (Docker's and Distroless's own published numbers), never fabricated as a measured run. `examples.py` instead runs a real, assertable simulation of build-cache invalidation and whiteout semantics in pure Python, which needs no daemon and is exactly the mechanism the reel draws.

## Outcomes

1. Draw an image as a layer stack and predict which layers a one-line source change invalidates.
2. Explain why deleting a file in a later layer does not shrink the image (a whiteout, not a removal).
3. Restructure a naive single-stage PySpark build into a cache-friendly multi-stage build and state the size difference the project's own numbers show for distroless bases.
4. Bring up a Kafka + Postgres + object-store Compose stack that starts in a safe order (`service_healthy`, not ordering by luck).
5. Choose environment variables or a mounted file for a given setting and say what each exposes.

## Reel steps (storyboard)

1. **Opening/hook** — "Images, layers and local environments" title card; the shop's PySpark image, one changed line of `orders_rollup.py`, CI re-pushing almost the whole image. `fig`: the chapter's layer-stack convention, full stack drawn, nothing moving yet but a label pointing at the one changed instruction.
2. **Predict step** (step 2, within the first four) — "A six-layer image; a change touches only the instruction that `COPY`s application code, which is layer 4 of 6. How many layers does the rebuild actually touch?" Options: "just layer 4", "layers 4–6", "all 6", "none, cache survives". Correct: layers 4–6 (the changed layer and everything stacked above it). `fig`: the layer stack from step 1, static (the predict step doesn't move; the next step answers it by moving).
3. **Layers & copy-on-write** (mechanism, answers the predict) — the dark wave plays down from layer 4 through 6, layers 1–3 staying lit (cache hit). Takeaway: "One changed layer rebuilds itself and every layer stacked above it, never below." `fig`: layer stack with the invalidation wave.
4. **Build-cache ordering on a real Dockerfile** — the shop's naive Dockerfile (`COPY . .` before `pip install`) vs the reordered one (manifest copied and installed first, source copied last); same wave animation, now only the last layer relights on a source change instead of the whole dependency layer. Takeaway: "Put what changes least at the top of the Dockerfile, what changes most at the bottom."
5. **Whiteouts don't shrink the image** — a `rm` in a later instruction drawn as a whiteout: a thin slab *added* on top that marks the file hidden, not a slab removed below. Takeaway: "Deleting a file in a later layer adds a layer; it never removes one underneath."
6. **Multi-stage builds** — two stacks side by side: the naive build's compiler/cache layers vs the multi-stage build's slim runtime stage (`COPY --from=build`), with the build stage's slabs falling away at the stage boundary. Real sourced numbers from the distroless README (static-debian13 ≈ 2 MiB vs alpine ≈ 5 MiB vs debian 124 MiB) stand in for the size the build stage sheds. Takeaway: "A multi-stage build keeps only the runtime stage's layers; the compiler and its cache never ship."
7. **Volumes and networks** — a container's writable layer disappears with the container; a named volume and a bind mount are drawn outliving it; a bridge network lets `kafka`, `postgres` and `minio` find each other by name instead of an IP.
8. **Compose for a local multi-service stack** — three service blocks (Kafka, Postgres, an S3-compatible store) starting in sequence only once each one's healthcheck passes (`depends_on: condition: service_healthy`), contrasted with a bare `depends_on` that only orders container start and a stack that comes up before Postgres is ready to accept connections.
9. **Configuration: environment vs mounted file** — a setting shown leaking through `docker inspect`/`ps` when passed as an environment variable, versus the same setting as a mounted file only readable inside the container. Takeaway (if a 4th is wanted) optional; 3 is the floor and steps 3, 4/5, 6 already carry one each.
10. **Recap** — five things to keep; pointer to the Prerequisites panel; handoff to topic 2 (cgroups/OOM).

Engagement arc: hook step 1 (real incident), predict step 2 (within first four), ≥3 takeaways (steps 3, 4, 6), recap last step. Refresher: no separate "Prove it" step; `examples.py`'s asserts are the proof, referenced in the Lab section of post-notes.

## Narrator's line of thought (beyond the description)

- Step 1: why a senior engineer should care about a thing this boring — CI minutes and a slow rollout are the real cost of an unordered Dockerfile.
- Step 2/3: the wrong intuition to correct is "only the line I changed rebuilds" — a layer is a snapshot of everything up to that instruction, not a diff of just that instruction.
- Step 5: the wrong intuition is "deleting makes the image smaller" — union filesystems only ever add layers; a deleted file's bytes are still in a layer underneath, just hidden.
- Step 6: the question to ask before the reveal — "what's actually running in production: your code, or your code plus every compiler you used to build it?"
- Step 8: the question — "what breaks if Postgres hasn't finished initializing when the consumer service's first connection attempt lands?"

## Claims list (verified against SOURCES.md)

| Claim | Source |
|---|---|
| A changed layer forces every layer stacked above it to rebuild, never below | Docker build cache docs |
| Deletion is recorded as a whiteout (`.wh.<name>`), an added marker entry, not a removal | OCI image-spec layer.md |
| An opaque whiteout (`.wh..wh..opq`) hides all of a lower layer's children at once | OCI image-spec layer.md |
| A write to an existing lower-layer file triggers `copy_up` of the whole file by default; `metacopy` is an opt-in feature that copies only metadata first | Linux kernel OverlayFS docs |
| Plain `depends_on` only orders container start, not readiness; `condition: service_healthy` waits for the dependency's own healthcheck | Docker Compose startup-order docs |
| `static-debian13` ≈ 2 MiB vs `alpine` ≈ 5 MiB vs `debian` 124 MiB; distroless images ship no shell by default | Distroless README |

## Post-notes headings

`outcomes` ("After this refresher you can"), `internals` ("A little deeper": Layers and the build cache; Whiteouts and copy-on-write; Multi-stage builds), `lab` ("Try it": the three-build comparison, disclosed sourced-only for size/CVE where no daemon, examples.py's cache-invalidation simulation run for real), `production` ("In code review": ordering Dockerfiles, Compose health-gated startup, env vs mounted config), `next` ("Where this goes next": pinned digests/SBOMs/SLSA/Sigstore/CI scanning — the *(skipped)* "Reproducible, minimal, signed images" syllabus topic, named and sourced, not taught).

## Bridge / handoff

Bridge: per CHAPTER.md topic 1 entry (written to hold under any Chapter 11 ending).
Handoff: per CHAPTER.md topic 1 entry, into topic 2's cgroup limit.

## Concept ledger

Introduces: `image-layers-build-cache`, `compose-local-stack`, `container-config-injection`.
Uses: `ci-pipelines`, `dependency-pinning`, `process-model`.
Declared: basic Docker use.
