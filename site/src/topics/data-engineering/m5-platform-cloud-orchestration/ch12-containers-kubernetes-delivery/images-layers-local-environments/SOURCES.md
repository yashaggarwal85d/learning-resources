## Docker build cache

URL: https://docs.docker.com/build/guide/layers/
Version: page fetched 2026-10-30, current Docker Docs build-guide section "Docker build cache"

> Each instruction in this Dockerfile translates to a layer in your final image.
> You can think of image layers as a stack, with each layer adding more content
> on top of the layers that came before it:

> Whenever a layer changes, that layer will need to be re-built. For example,
> suppose you make a change to your program in the main.c file. After this
> change, the COPY command will have to run again in order for those changes to
> appear in the image. In other words, Docker will invalidate the cache for this
> layer.

> If a layer changes, all other layers that come after it are also affected. When
> the layer with the COPY command gets invalidated, all layers that follow will
> need to run again, too:

> And that's the Docker build cache in a nutshell. Once a layer changes, then all
> downstream layers need to be rebuilt as well. Even if they wouldn't build
> anything differently, they still need to re-run.

Contents:
- how the build cache works (layers as a stack)
- cache invalidation (a changed layer forces every layer after it to rebuild)
- cache storage backends (registry, local, GitHub Actions, S3, Azure Blob, inline)
- optimizing cache usage in builds

## OCI image spec — Layer

URL: https://raw.githubusercontent.com/opencontainers/image-spec/main/layer.md
Version: `main` branch, fetched 2026-10-30

> A whiteout file is an empty file with a special filename that signifies a path should be deleted.

> A whiteout filename consists of the prefix `.wh.` plus the basename of the path to be deleted.

> Once a whiteout is applied, the whiteout itself MUST also be hidden.

> Whiteout files MUST only apply to resources in lower/parent layers.

> In addition to expressing that a single entry should be removed from a lower layer, layers may remove all of the children using an opaque whiteout entry.

> An opaque whiteout entry is a file with the name `.wh..wh..opq` indicating that all siblings are hidden in the lower layer.

Contents:
- changesets as tar archives (additions, modifications, removals)
- whiteout file naming and semantics
- opaque whiteouts (removing a whole directory's lower-layer children)
- applying changesets on extraction

## Linux kernel — Overlay Filesystem documentation

URL: https://docs.kernel.org/filesystems/overlayfs.html
Version: current kernel.org Documentation page, fetched 2026-10-30

> the file is first copied from the lower filesystem to the upper filesystem (copy_up)

> The copy_up may turn out to be unnecessary, for example if the file is opened for read-write but the data is not modified.

> When the "metacopy" feature is enabled, overlayfs will only copy up metadata (as opposed to whole file), when a metadata specific operation like chown/chmod is performed.

Contents:
- the upper/lower directory model and the merged view
- copy_up: a write to a lower-layer file copies the whole file up first (default), metadata-only copy-up only under the optional `metacopy` feature
- directory vs non-directory rename restrictions after copy_up

## Docker Compose — Control startup and shutdown order

URL: https://docs.docker.com/compose/how-tos/startup-order/
Version: page fetched 2026-10-30, current Docker Docs Compose how-to

> You can control the order of service startup and shutdown with the depends_on attribute. Compose always starts and stops containers in dependency order, where dependencies are determined by depends_on, links, volumes_from, and network_mode: "service:...".

> service_healthy. This specifies that a dependency is expected to be "healthy", which is defined with healthcheck, before starting a dependent service.

> Compose waits for healthchecks to pass on dependencies marked with service_healthy. db is expected to be "healthy" (as indicated by healthcheck) before web is created.

Contents:
- plain `depends_on` only orders container start, it does not wait for readiness
- `condition: service_healthy` waits for the dependency's own healthcheck to pass
- `service_completed_successfully` for one-off init/migration containers
- `depends_on` only resolves dependencies declared in the same compose file

## GoogleContainerTools/distroless — README

URL: https://raw.githubusercontent.com/GoogleContainerTools/distroless/main/README.md
Version: `main` branch, fetched 2026-10-30

> "Distroless" images contain only your application and its runtime dependencies. They do not contain package managers, shells or any other programs you would expect to find in a standard Linux distribution.

> Distroless images are _very small_. The smallest distroless image, `gcr.io/distroless/static-debian13`, is around 2 MiB. That's about 50% of the size of `alpine` (~5 MiB), and less than 2% of the size of `debian` (124 MiB).

> Note that distroless images by default do not contain a shell.
> That means the Dockerfile `ENTRYPOINT` command, when defined, must be specified in `vector` form, to avoid the container runtime prefixing with a shell.

Contents:
- what "distroless" removes (package manager, shell, other OS tooling)
- published size comparison (`static-debian13` ≈ 2 MiB vs `alpine` ≈ 5 MiB vs `debian` 124 MiB)
- no default shell; `ENTRYPOINT` must be vector form; `:debug` variants add a busybox shell
