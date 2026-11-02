# Pre-notes: IaC state, plan and drift

- **Declarative state.** Infrastructure-as-code describes the end state you want, not the sequence of steps to get there — the tool figures out what to do.
- **State file.** The tool's own record of what it last created, binding each declared resource to the real object it corresponds to in the cloud.
- **Lock.** A hold on the state file that blocks a second operation from starting while the first is still writing it.
- **Plan.** A dry-run diff between the desired configuration and the state file's last-known record, with nothing actually changed yet.
- **Apply.** The step that actually acts: writes to the real infrastructure and updates the state file to match.
- **Drift.** A gap between the state file's record and the real infrastructure, caused by a change the tool never made.
- **Import.** Bringing an existing, unmanaged resource under the tool's management by recording it in state, without recreating it.
- **Policy as code.** A plan checked by an automated rule before apply is allowed to run, turning "someone should review this" into an enforced gate.
