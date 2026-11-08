"""GitOps reconciliation mechanics, run for real.

No local Kubernetes cluster is reachable on this build machine (confirmed across every topic in
this chapter: no Docker daemon socket, no kubectl/kind/k3s), and no Argo CD or Flink Kubernetes
Operator instance is reachable either, so this chapter's lab (promoting a Flink job through Argo CD
with a savepoint-preserving upgrade, injecting drift, rolling back) cannot be run live. What IS run
for real: Argo CD's documented sync, self-heal, prune, and ignoreDifferences decision logic, and
the three-way merge `kubectl apply` performs when Argo CD syncs (SOURCES.md), modeled directly from
the Argo CD and Kubernetes docs rather than a plain-Deployment stand-in, since no live cluster of
any kind exists here to run even that against.
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


# --- Self-heal: whether a manual live edit, on its own, triggers a sync ---
def live_edit_triggers_sync(self_heal_enabled: bool, already_synced_this_commit: bool) -> bool:
    """SOURCES.md: by default, changes made to the live cluster do not trigger automated sync, and
    automated sync attempts one sync per unique commit SHA and parameters unless selfHeal is set.
    So without self-heal, a live edit alone never starts a sync; with it, Argo CD syncs again."""
    if self_heal_enabled:
        return True
    return not already_synced_this_commit


def test_self_heal_off_never_corrects_a_manual_edit():
    assert live_edit_triggers_sync(self_heal_enabled=False, already_synced_this_commit=True) is False


def test_self_heal_on_corrects_a_manual_edit():
    assert live_edit_triggers_sync(self_heal_enabled=True, already_synced_this_commit=True) is True


# --- What a sync does: kubectl apply's three-way merge, run on every object in the application ---
def three_way_apply(last_applied: dict, desired: dict, live: dict) -> tuple[dict, dict]:
    """SOURCES.md (Kubernetes, declarative config; Argo CD sync options): Argo CD syncs with
    `kubectl apply`, by default on every object in the application, and applies the desired state
    as-is through a three-way merge of live, desired and last-applied-configuration. Fields to
    delete: in last-applied, missing from the file. Fields to set: in the file, with a value that
    doesn't match live. Any other live field is left alone. Returns (new live, new last-applied)."""
    new_live = {k: v for k, v in live.items() if not (k in last_applied and k not in desired)}
    for k, v in desired.items():
        if new_live.get(k) != v:
            new_live[k] = v
    return new_live, dict(desired)


def test_apply_resets_a_field_git_declares_even_if_this_change_never_touched_it():
    last_applied = {"timeout": 10, "image": "v1"}
    live = {"timeout": 30, "image": "v1"}  # timeout hand-edited
    new_live, _ = three_way_apply(last_applied, {"timeout": 10, "image": "v2"}, live)
    assert new_live == {"timeout": 10, "image": "v2"}


def test_apply_leaves_a_field_git_never_declares():
    # Kubernetes' own example: replicas set live by `kubectl scale`, omitted from the file, is
    # retained by the next apply; only fields the file declares are set.
    last_applied = {"image": "v1"}
    live = {"image": "v1", "replicas": 7}
    new_live, _ = three_way_apply(last_applied, {"image": "v2"}, live)
    assert new_live == {"image": "v2", "replicas": 7}


def test_ignoredifferences_alone_still_lets_a_sync_reset_the_field():
    # SOURCES.md: ignoreDifferences only feeds the diff; during sync the desired state is applied
    # as-is (unless RespectIgnoreDifferences=true). Synced while ignored, yet a sync resets it.
    desired, live = {"replicas": 3, "image": "v2"}, {"replicas": 7, "image": "v1"}
    assert sync_status({"replicas": 3, "image": "v1"}, {"replicas": 7, "image": "v1"}, ignored={"replicas"}) == "Synced"
    new_live, _ = three_way_apply({"replicas": 3, "image": "v1"}, desired, live)
    assert new_live["replicas"] == 3


# --- The hook, resolved: the 3 a.m. kubectl edit, after an unrelated Git change, self-heal off ---
def test_hook_an_unrelated_git_change_still_reverts_the_hand_edited_field():
    # The manual edit changed "timeout", a field Git declares; the later Git change only touches
    # "image".
    last_applied = {"timeout": 10, "image": "v1"}
    live_after_edit = {"timeout": 30, "image": "v1"}
    desired_before_git_change = {"timeout": 10, "image": "v1"}
    desired_after_git_change = {"timeout": 10, "image": "v2"}
    # Before the Git change: OutOfSync on "timeout" (the manual edit, visible as drift), but with
    # self-heal off and this commit already synced, nothing starts a sync: the edit stays for now.
    assert sync_status(desired_before_git_change, live_after_edit) == "OutOfSync"
    assert live_edit_triggers_sync(self_heal_enabled=False, already_synced_this_commit=True) is False
    # The new commit is a new SHA, so automated sync runs, and applies the whole object: "timeout"
    # is in the file and differs from live, so it is set back to Git's 10 along with the new image.
    assert live_edit_triggers_sync(self_heal_enabled=False, already_synced_this_commit=False) is True
    live_after_the_sync, _ = three_way_apply(last_applied, desired_after_git_change, live_after_edit)
    assert live_after_the_sync == {"timeout": 10, "image": "v2"}
    assert sync_status(desired_after_git_change, live_after_the_sync) == "Synced"
    # The edit did not survive the unrelated deploy. It wasn't a targeted self-heal correction
    # either: it was overwritten because a sync applies every field Git declares.


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
