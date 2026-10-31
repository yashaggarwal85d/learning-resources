<section data-section="outcomes">

## After this refresher you can

- Draw an image as a layer stack and predict which layers a one-line source change invalidates.
- Explain why deleting a file in a later layer does not shrink the image.
- Restructure a naive single-stage build into a cache-friendly multi-stage build.
- Bring up a Kafka, Postgres and object-store Compose stack that starts in a safe order.
- Choose an environment variable or a mounted file for a given setting, and say what each exposes.

</section>

<section data-section="internals">

## A little deeper

### Layers and the build cache

Each Dockerfile instruction produces one layer; Docker's own build-cache guide puts it plainly: "Whenever a layer changes, that layer will need to be re-built," and "If a layer changes, all other layers that come after it are also affected." A cache lookup is keyed on the instruction and everything stacked below it being unchanged — not on a diff of the instruction's own effect. That is why the practical rule is ordering by volatility: a dependency manifest, which changes rarely, goes before the application source, which changes on every commit. The naive Dockerfile in this refresher's `examples.py` (`COPY . .` before `pip install`) rebuilds four of its six layers on any source edit; reordering it to copy the manifest first and the source last cuts that to two.

### Whiteouts and copy-on-write

A union filesystem never shrinks an image by deleting bytes from a lower layer — it can't, because lower layers are read-only. The OCI image spec's answer is the whiteout: "A whiteout file is an empty file with a special filename that signifies a path should be deleted," named `.wh.<basename>`, and "Whiteout files MUST only apply to resources in lower/parent layers." An *opaque* whiteout (`.wh..wh..opq`) hides every child of a directory at once. At runtime, OverlayFS enforces the same read-only-lower rule: writing to a file that exists only in a lower layer first `copy_up`s it — by default the whole file, not just the changed bytes (an optional `metacopy` feature can copy up metadata alone first, deferring the data copy).

### Multi-stage builds

A build stage can carry a full compiler toolchain and its package cache; `COPY --from=build` into a second, `FROM`-fresh stage copies only the finished artefact, and the build stage's layers never ship. Distroless's own README states its smallest image, `gcr.io/distroless/static-debian13`, at "around 2 MiB," which it describes as "about 50% of the size of alpine (~5 MiB), and less than 2% of the size of debian (124 MiB)" — and that distroless images "by default do not contain a shell," so an `ENTRYPOINT` must be given in vector form.

</section>

<section data-section="lab">

## Try it

This build machine has Docker's CLI but no reachable daemon (`docker info` fails: no socket), so the §12.1 lab's three-way build comparison (naive, multi-stage, distroless) and its size, cold-start and CVE-count numbers are disclosed here as sourced, not measured on this machine: Distroless's own README gives the size comparison above; a CVE count needs a scanner and a vulnerability database, which is exactly what the *(skipped)* syllabus topic "Reproducible, minimal, signed images" (pinned digests, SBOMs, SLSA, signing, CI scanning) covers — see "Where this goes next" below.

What *is* run for real, with asserts on every number this reel shows: `examples.py`'s `layers_to_rebuild` simulation (the naive Dockerfile rebuilds layers 2–5 of its 6 on a source edit; the reordered one rebuilds only 4–5), its whiteout model (a deleted file's bytes stay in the base layer's byte count while the file itself becomes invisible), and a Compose start-order model (`service_healthy` waits for the dependency's own healthcheck; plain `depends_on` does not).

```
$ python3 examples.py
ok  test_naive_dockerfile_reinstalls_dependencies_on_source_change
ok  test_reordered_dockerfile_keeps_the_dependency_layer_cached
ok  test_dependency_manifest_change_still_invalidates_pip_install
ok  test_whiteout_hides_a_file_without_shrinking_the_image
ok  test_opaque_whiteout_hides_every_child_of_a_directory_at_once
ok  test_distroless_size_claims_match_the_sourced_numbers
ok  test_plain_depends_on_does_not_wait_for_postgres_to_be_ready
ok  test_service_healthy_condition_waits_for_the_healthcheck

8 checks passed.
```

</section>

<section data-section="production">

## In code review

- **Dockerfile ordering.** A `COPY . .` before the dependency install is the single most common cache-busting mistake in review; ask where the dependency manifest is copied relative to the source.
- **Compose health gating.** A bare `depends_on` in a Compose file that starts a database and an app together is a race, not a guarantee; look for `condition: service_healthy` (or, for one-off migration containers, `service_completed_successfully`) wherever one service's startup depends on another being *ready*, not merely *started*.
- **Config in env vs files.** A secret passed as an environment variable is visible to anyone who can run `docker inspect` or read `/proc/<pid>/environ` on the container; a mounted file (and, at the Kubernetes layer, a Secret — the next refresher's subject) narrows that exposure, though neither is encryption.

</section>

<section data-section="next">

## Where this goes next

This refresher never built a signed, scanned, reproducible image — that's the *(skipped)* syllabus topic "Reproducible, minimal, signed images": pinned base-image digests and lockfile-driven dependency pinning for determinism, SBOMs and provenance attestations (SLSA), image signing (Sigstore's `cosign`), and vulnerability scanning wired into CI so a build fails on a known-bad package before it ships. It stays in the curriculum (`syllabus/review-notes/de-cuts.md`) and gets no reel of its own; a team adopting this chapter's ideas in production should read Sigstore's and SLSA's own documentation next. What Kubernetes does with an image and its configuration (ConfigMaps, Secrets) is the next refresher; what a running container may actually use of a node's memory and CPU is the topic right after that.

</section>
