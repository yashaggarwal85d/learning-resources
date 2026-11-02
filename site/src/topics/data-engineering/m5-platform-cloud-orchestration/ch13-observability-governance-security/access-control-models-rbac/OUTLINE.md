# Outline: de.access-control-models-rbac

1. **Hook.** The shop has 14 teams, 60 datasets and 3 environments, and security asks for "a
   role per team per dataset per environment, for least privilege." Count the roles. Then: when
   data science gets a new restricted dataset, which approach needs one change and which needs
   fourteen?
2. **Reveal: RBAC's own shape -- a role holds many privileges, a user holds one or more roles.**
   [from] NIST's own description: security managed at the level of roles, not individual users.
3. **Predict: count the roles for 14 teams, 60 datasets, 3 environments, one role per triple.**
   [idx2]
4. **Reveal: 2,520 roles, measured directly.** The arithmetic that makes RBAC unreviewable at
   this scale.
5. **Elaborate: ABAC replaces the grid with one rule over attributes.** [takeaway1] NIST SP
   800-162's own definition: subject, object and environment attributes evaluated against
   policy, not a role per combination.
6. **Predict: data science gets a new restricted dataset. How many new RBAC roles, versus how
   many new ABAC rule edits?** [idx5]
7. **Reveal: 3 new roles under RBAC; 0 edits under ABAC, measured directly.** The tag-based rule
   already covers it by attribute.
8. **Elaborate: the decision point and the enforcement point are two different jobs.** [takeaway2]
   OPA's own description: policy decision-making decoupled from policy enforcement, so one
   engine can serve many enforcement points (Trino's OPA integration returning row filters and
   column masks as part of one decision).
9. **Reveal: identity comes from outside the policy engine entirely.** Single sign-on (OIDC/SAML)
   authenticates a person once; SCIM provisions and removes their accounts everywhere, so
   offboarding in one place removes access everywhere.
10. **Reveal: entitlements drift, so a periodic access review is the catch policy alone misses.**
    A scheduled review, with an owner who attests, catches what no rule or role checks by
    itself.
11. **Recap.** [takeaway3]
