# Pre-notes: Lakehouse platform choice: storage, format, pricing

- **Zero-copy.** Giving another engine or account access to data without duplicating the underlying bytes — achieved by a pointer, a protocol, or a metadata-only reference, depending on the platform.
- **OneLake shortcut vs mirroring.** A shortcut is a pointer into another storage location, behaving like a symbolic link and moving no data; mirroring is the opposite — an actual, continuously-synced copy of a source database landing in OneLake.
- **Capacity unit (CU) smoothing.** Microsoft Fabric's mechanic for spreading a usage spike across a time window (24 hours for background work, shorter for interactive queries), so a capacity reservation is billed on the average load rather than the instantaneous peak.
- **Exit cost.** What it actually takes to leave a platform: exporting the data in a usable format, rewriting the governance policy built on top of it, and retraining the team — concretely different depending on whether the storage was open-format and customer-owned or proprietary and vendor-managed.
