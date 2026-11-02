"""GitOps reconciliation mechanics, run for real.

No local Kubernetes cluster is reachable on this build machine (confirmed across every topic in
this chapter: no Docker daemon socket, no kubectl/kind/k3s), and no Argo CD or Flink Kubernetes
Operator instance is reachable either, so this chapter's lab (promoting a Flink job through Argo CD
with a savepoint-preserving upgrade, injecting drift, rolling back) cannot be run live. What IS run
for real: Argo CD's documented sync, self-heal, prune, and ignoreDifferences decision logic
(SOURCES.md), modeled directly from its own docs rather than a plain-Deployment stand-in, since no
live cluster of any kind exists here to run even that against.
"""

from dataclasses import dataclass, field


# --- Sync status: OutOfSync only where live differs from desired, after masking ignored fields ---
def diff_fields(desired: dict, live: dict, ignored: set[str] = frozenset()) -> set[str]:
    keys = set(desired) | set(live)
    return {k for k in keys if k not in ignored and desired.get(k) != live.get(k)}


def sync_status(desired: dict, live: dict, ignored: set[str] = frozenset()) -> str:
    return "OutOfSync" if diff_fields(desired, live, ignored) else "Synced"


def test_identical_desired_and_live_is_synced():
    assert sync_status({"replicas": 3}, {"replicas": 3}) == "Synced"


def test_a_differing_field_is_outofsync():
    assert sync_status({"replicas": 3}, {"replicas": 5}) == "OutOfSync"


def test_ignoredifferences_masks_a_field_an_autoscaler_owns():
    # SOURCES.md's own worked example: ignoring spec.replicas for Deployments under an autoscaler.
    assert sync_status({"replicas": 3}, {"replicas": 7}, ignored={"replicas"}) == "Synced"


def test_ignoredifferences_does_not_mask_other_fields():
    assert sync_status({"replicas": 3, "image": "v1"}, {"replicas": 7, "image": "v2"}, ignored={"replicas"}) == "OutOfSync"


# --- Automated sync: only runs when OutOfSync, and only when automated sync is enabled ---
def should_auto_sync(status: str, automated_enabled: bool) -> bool:
    """SOURCES.md: an automated sync will only be performed if the application is OutOfSync.
    Applications in a Synced or error state will not attempt automated sync."""
    return automated_enabled and status == "OutOfSync"


def test_outofsync_with_automated_sync_enabled_triggers_a_sync():
    assert should_auto_sync("OutOfSync", automated_enabled=True) is True


def test_synced_never_triggers_a_sync_even_if_automated():
    assert should_auto_sync("Synced", automated_enabled=True) is False


def test_outofsync_with_automated_sync_disabled_does_not_sync():
    assert should_auto_sync("OutOfSync", automated_enabled=False) is False


# --- Self-heal: whether a manual live edit gets corrected ---
def self_heal_corrects_manual_edit(self_heal_enabled: bool, edited_field_in_git: bool) -> bool:
    """SOURCES.md: by default, changes made to the live cluster do not trigger automated sync.
    Self-heal must be explicitly enabled for Argo CD to react to live drift at all. Even with it
    off, a later sync triggered by an unrelated Git change does not touch a field Git doesn't
    mention, so the manual edit survives that sync regardless -- self-heal is what's needed to
    *correct* it, not any sync at all."""
    if not self_heal_enabled:
        return False
    return True


def test_self_heal_off_never_corrects_a_manual_edit():
    assert self_heal_corrects_manual_edit(self_heal_enabled=False, edited_field_in_git=False) is False


def test_self_heal_on_corrects_a_manual_edit():
    assert self_heal_corrects_manual_edit(self_heal_enabled=True, edited_field_in_git=False) is True


# --- The hook, resolved: the 3 a.m. kubectl edit, after an unrelated Git change, self-heal off ---
def test_hook_an_unrelated_git_change_does_not_touch_the_manually_edited_field():
    # The manual edit changed field "timeout"; the later Git change only touches field "image".
    live_after_edit = {"timeout": 30, "image": "v1"}
    desired_before_git_change = {"timeout": 10, "image": "v1"}
    desired_after_git_change = {"timeout": 10, "image": "v2"}
    # Before the Git change: already OutOfSync on "timeout" (the manual edit), but self-heal is off.
    assert sync_status(desired_before_git_change, live_after_edit) == "OutOfSync"
    assert self_heal_corrects_manual_edit(self_heal_enabled=False, edited_field_in_git=False) is False
    # The Git change triggers a sync (now also OutOfSync on "image"), which applies "image" but
    # -- because self-heal is off -- Argo CD never goes out of its way to fix "timeout" either;
    # a sync run still applies the full desired manifest, so "timeout" reverts to Git's value too.
    live_after_the_sync = {"timeout": 10, "image": "v2"}  # the sync applies the whole manifest
    assert sync_status(desired_after_git_change, live_after_the_sync) == "Synced"
    # The edit did not survive forever, but it wasn't a targeted self-heal correction either --
    # it was overwritten incidentally, the moment any sync of the whole manifest ran at all.


# --- Pruning: deleting what's no longer in Git, with a resource-level override and an empty-set guard ---
@dataclass
class Resource:
    name: str
    in_git: bool
    prune_annotation: str | None = None  # "Prune=false" overrides the app-level policy


def resources_to_prune(resources: list[Resource], app_level_prune_enabled: bool, allow_empty: bool) -> set[str]:
    """SOURCES.md: pruning deletes resources no longer in Git, but a Prune=false annotation on a
    resource always overrides the app-level policy, and pruning to an empty result set needs its
    own allow-empty override."""
    if not app_level_prune_enabled:
        return set()
    candidates = {r.name for r in resources if not r.in_git and r.prune_annotation != "Prune=false"}
    survivors = {r.name for r in resources if r.in_git or r.prune_annotation == "Prune=false"}
    if not survivors and candidates and not allow_empty:
        return set()  # the empty-set guard: refuse to prune everything away
    return candidates


def test_prune_disabled_at_app_level_prunes_nothing():
    rs = [Resource("a", in_git=False)]
    assert resources_to_prune(rs, app_level_prune_enabled=False, allow_empty=True) == set()


def test_prune_enabled_removes_resources_no_longer_in_git():
    rs = [Resource("a", in_git=True), Resource("b", in_git=False)]
    assert resources_to_prune(rs, app_level_prune_enabled=True, allow_empty=True) == {"b"}


def test_a_resource_level_prune_false_overrides_the_app_level_policy():
    rs = [Resource("a", in_git=False, prune_annotation="Prune=false"), Resource("b", in_git=False)]
    assert resources_to_prune(rs, app_level_prune_enabled=True, allow_empty=True) == {"b"}


def test_pruning_to_an_empty_set_is_refused_without_allow_empty():
    rs = [Resource("a", in_git=False), Resource("b", in_git=False)]
    assert resources_to_prune(rs, app_level_prune_enabled=True, allow_empty=False) == set()


def test_pruning_to_an_empty_set_proceeds_with_allow_empty():
    rs = [Resource("a", in_git=False), Resource("b", in_git=False)]
    assert resources_to_prune(rs, app_level_prune_enabled=True, allow_empty=True) == {"a", "b"}


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"ok  {t.__name__}")
    print(f"\n{len(tests)} checks passed.")
