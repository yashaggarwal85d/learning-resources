<section data-section="outcomes">

## After this topic you can

- Describe the reconciliation loop with Git as the spec and say which credentials live where.
- Promote a change by pull request and roll it back by revert.
- Explain exactly what Argo CD does and does not correct without self-heal, with prune, and under `ignoreDifferences`.
- Choose secret handling for a given threat.
- State why a naive redeploy of a stateful stream job loses state and what a GitOps flow must therefore preserve.
- Place any resource on the IaC side or the GitOps side of the seam.

</section>

<section data-section="internals">

## A little deeper

### Self-heal off doesn't mean the edit is permanent

It's easy to read "self-heal is off" as "my manual edit is safe." It isn't, not really — self-heal is what *specifically targets* live drift and corrects it. But any sync at all, triggered by any unrelated Git change, applies the *whole* desired manifest. If the field you hand-edited happens to also be touched by that unrelated change, it reverts anyway — not because anything noticed your edit, but because the sync never knew it was supposed to preserve it. The honest takeaway for operating a cluster this way: there's no safe manual edit, self-heal setting or not. There's only an edit that hasn't been overwritten yet.

### Two guards solving two different mistakes

`Prune=false` and the allow-empty guard against pruning everything look similar but catch different accidents. `Prune=false` protects one specific resource from this deletion mechanism permanently, regardless of what else happens in Git. The allow-empty guard protects against a different, rarer mistake: Git suddenly looking empty for an application (a bad merge, a misconfigured path), which would otherwise read as "delete everything this application manages." A team relying on only one of the two is still exposed to the other.

### Two different halves of the secrets problem

External Secrets Operator and SOPS aren't competing solutions — they solve different halves of the same problem. ESO keeps the actual secret value out of Git permanently, fetching it live from somewhere else. SOPS instead commits the secret, encrypted, which keeps Git itself safe but still needs a decryption key available wherever the secret gets decrypted — which is itself a credential that has to come from outside the GitOps flow, the same identity-and-secret-store seam this topic ends on.

</section>

<section data-section="lab">

## Try it

This topic hosts the chapter's §12.3 lab: promote a Flink job from staging to production through Argo CD with a savepoint-preserving upgrade, introduce manual drift with a direct edit, observe reconciliation, then roll back and verify no state was lost.

**This build machine has no local Kubernetes cluster, and no reachable Argo CD or Flink Kubernetes Operator either** — the same sandbox limitation confirmed across every topic in this chapter, one layer further up. The lab's live promotion-and-rollback can't be run here. What *is* run for real: Argo CD's own documented sync, self-heal, prune, and `ignoreDifferences` decision logic, modeled directly from its own documentation rather than against a live instance.

```
$ python3 examples.py
ok  test_a_differing_field_is_outofsync
ok  test_a_resource_level_prune_false_overrides_the_app_level_policy
ok  test_hook_an_unrelated_git_change_does_not_touch_the_manually_edited_field
ok  test_identical_desired_and_live_is_synced
ok  test_ignoredifferences_does_not_mask_other_fields
ok  test_ignoredifferences_masks_a_field_an_autoscaler_owns
ok  test_outofsync_with_automated_sync_disabled_does_not_sync
ok  test_outofsync_with_automated_sync_enabled_triggers_a_sync
ok  test_prune_disabled_at_app_level_prunes_nothing
ok  test_prune_enabled_removes_resources_no_longer_in_git
ok  test_pruning_to_an_empty_set_is_refused_without_allow_empty
ok  test_pruning_to_an_empty_set_proceeds_with_allow_empty
ok  test_self_heal_off_never_corrects_a_manual_edit
ok  test_self_heal_on_corrects_a_manual_edit
ok  test_synced_never_triggers_a_sync_even_if_automated

15 checks passed.
```

The Flink half of the lab (the savepoint-preserving upgrade itself) is disclosed as sourced-only, reusing the previous topic's already-verified upgrade-mode facts rather than re-deriving them here.

</section>

<section data-section="production">

## In code review

- **An application with automated sync and prune both on, no `Prune=false` anywhere, and a config path that can plausibly go empty.** One bad merge or misconfigured path away from deleting everything that application manages — unless the allow-empty guard is relied on correctly, not disabled.
- **`ignoreDifferences` added for a field, with no comment saying which other controller owns it or why.** The next person to touch that application has no way to tell "this is a deliberate seam" from "someone silenced a real drift alert."
- **A secret committed to Git "temporarily," meant to be replaced with a proper store later.** It's already a leak the moment it's committed — Git history doesn't forget, even after the file is removed in a later commit.

</section>

<section data-section="next">

## Where this goes next

The platform is now delivered and kept converged. That says nothing about whether it is healthy. The next chapter opens with exactly that question, how you would know: logs, metrics and traces for a pipeline, and the telemetry that turns a stale table into an alert.

</section>
