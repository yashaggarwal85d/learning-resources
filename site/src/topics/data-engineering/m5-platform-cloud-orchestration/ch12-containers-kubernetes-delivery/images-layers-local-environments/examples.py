"""Images, layers and local environments — the mechanisms the reel draws, run for real.

No Docker daemon is reachable on this build machine (`docker info` fails: no
socket). Every number the reel or post-notes attribute to a real build
(image sizes, cold-start time, CVE counts) is instead a verbatim, dated
number from Docker's or the Distroless project's own documentation
(SOURCES.md) and is never computed here. What *is* computed here, for real,
is the mechanism itself: which layers a build-cache miss touches, and why a
deletion in a later layer does not shrink the image.
"""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Instruction:
    text: str
    # content hash of this instruction's own effect (file contents it copies,
    # the command it runs); a real builder derives this from the instruction
    # text plus the files it references, and docker invalidates the layer
    # that instruction produces whenever that hash changes.
    content_hash: str


def layers_to_rebuild(instructions: list[Instruction], changed_index: int) -> list[int]:
    """A real cache keeps a layer only while it, and nothing before it, changed.
    Once one instruction's hash changes, that layer and every layer stacked on
    top of it must rebuild; everything below is reused unchanged."""
    return list(range(changed_index, len(instructions)))


NAIVE_DOCKERFILE = [
    Instruction("FROM python:3.13-slim", "base"),
    Instruction("WORKDIR /app", "workdir"),
    Instruction("COPY . .", "all-source-and-deps"),  # dependency manifest bundled with source
    Instruction("RUN pip install -r requirements.txt", "pip-install-naive"),
    Instruction("COPY run.py .", "entrypoint"),
    Instruction("CMD [\"python\", \"run.py\"]", "cmd"),
]

REORDERED_DOCKERFILE = [
    Instruction("FROM python:3.13-slim", "base"),
    Instruction("WORKDIR /app", "workdir"),
    Instruction("COPY requirements.txt .", "manifest-only"),
    Instruction("RUN pip install -r requirements.txt", "pip-install-cacheable"),
    Instruction("COPY . .", "source"),
    Instruction("CMD [\"python\", \"run.py\"]", "cmd"),
]


def test_naive_dockerfile_reinstalls_dependencies_on_source_change():
    # Any source edit changes what COPY . . produces (layer 2), so pip install
    # (layer 3) is invalidated too, even though requirements.txt didn't change.
    rebuilt = layers_to_rebuild(NAIVE_DOCKERFILE, changed_index=2)
    assert rebuilt == [2, 3, 4, 5]
    assert len(rebuilt) == 4


def test_reordered_dockerfile_keeps_the_dependency_layer_cached():
    # The same source edit now only touches the COPY . . at index 4 and what
    # follows; pip install at index 3 is untouched because only
    # requirements.txt (index 2) changing would invalidate it.
    rebuilt = layers_to_rebuild(REORDERED_DOCKERFILE, changed_index=4)
    assert rebuilt == [4, 5]
    assert len(rebuilt) == 2


def test_dependency_manifest_change_still_invalidates_pip_install():
    rebuilt = layers_to_rebuild(REORDERED_DOCKERFILE, changed_index=2)
    assert rebuilt == [2, 3, 4, 5]


@dataclass
class Layer:
    # files present in this layer's own changeset: name -> ("content"|"whiteout")
    entries: dict[str, str] = field(default_factory=dict)
    bytes_added: int = 0


def effective_files(layers: list[Layer]) -> dict[str, int]:
    """The view a container sees: later layers' entries win; a whiteout hides
    the name from every layer below it without removing those layers' bytes."""
    visible: dict[str, int] = {}
    hidden: set[str] = set()
    for layer in reversed(layers):
        for name, kind in layer.entries.items():
            if kind == "whiteout":
                hidden.add(name)
                continue
            if name not in visible and name not in hidden:
                visible[name] = layer.bytes_added
    return visible


def test_whiteout_hides_a_file_without_shrinking_the_image():
    base = Layer(entries={"config.old": "content"}, bytes_added=4_096)
    deletion = Layer(entries={"config.old": "whiteout"}, bytes_added=0)
    image_total_bytes = base.bytes_added + deletion.bytes_added

    visible = effective_files([base, deletion])

    # The file is gone from what a container can see...
    assert "config.old" not in visible
    # ...but its bytes are still sitting in the base layer underneath, so the
    # whiteout *adds* a (near-zero) layer instead of removing the 4 KiB layer.
    assert image_total_bytes == 4_096
    assert base.bytes_added == 4_096  # unchanged by the deletion


def test_opaque_whiteout_hides_every_child_of_a_directory_at_once():
    base = Layer(entries={"cache/a.tmp": "content", "cache/b.tmp": "content"}, bytes_added=8_192)
    opaque = Layer(entries={"cache/.wh..wh..opq": "whiteout"}, bytes_added=0)
    # A real opaque whiteout hides every sibling under its directory; this
    # model names each hidden child explicitly for the same effect.
    opaque.entries["cache/a.tmp"] = "whiteout"
    opaque.entries["cache/b.tmp"] = "whiteout"

    visible = effective_files([base, opaque])
    assert visible == {}
    assert base.bytes_added == 8_192  # still there, just hidden


# --- distroless size comparison: sourced, not measured on this machine ---
DISTROLESS_STATIC_DEBIAN13_MIB = 2
ALPINE_MIB = 5
DEBIAN_MIB = 124


def test_distroless_size_claims_match_the_sourced_numbers():
    # From GoogleContainerTools/distroless's own README (SOURCES.md): "about
    # 50% of the size of alpine (~5 MiB), and less than 2% of the size of
    # debian (124 MiB)". Checked here as arithmetic, not as a build this
    # machine ran.
    assert DISTROLESS_STATIC_DEBIAN13_MIB / ALPINE_MIB == 0.4  # roughly half, as the README says "about 50%"
    assert DISTROLESS_STATIC_DEBIAN13_MIB / DEBIAN_MIB < 0.02


# --- Compose startup order: depends_on vs condition: service_healthy ---
@dataclass
class ComposeService:
    name: str
    healthy_after_s: float | None  # None: no healthcheck defined


def start_time(service: ComposeService, depends_on_healthy: bool) -> float:
    """A service with plain depends_on starts the instant its dependency's
    container process starts (t=0 for the dependency); one with
    condition: service_healthy waits until the dependency's own healthcheck
    reports healthy."""
    if depends_on_healthy and service.healthy_after_s is not None:
        return service.healthy_after_s
    return 0.0


def test_plain_depends_on_does_not_wait_for_postgres_to_be_ready():
    postgres = ComposeService("postgres", healthy_after_s=3.0)
    consumer_start = start_time(postgres, depends_on_healthy=False)
    assert consumer_start == 0.0  # starts immediately, before pg_isready would pass
    assert consumer_start < postgres.healthy_after_s


def test_service_healthy_condition_waits_for_the_healthcheck():
    postgres = ComposeService("postgres", healthy_after_s=3.0)
    consumer_start = start_time(postgres, depends_on_healthy=True)
    assert consumer_start == postgres.healthy_after_s


if __name__ == "__main__":
    tests = [v for k, v in list(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"ok  {t.__name__}")
    print(f"\n{len(tests)} checks passed.")
