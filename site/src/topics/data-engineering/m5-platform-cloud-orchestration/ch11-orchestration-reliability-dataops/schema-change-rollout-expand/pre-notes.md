# Before you watch

- **Expand/contract (parallel change)** — a breaking-looking change split into three phases: expand, migrate, contract.
- **Schema registry** — the service that stores a subject's schema versions and enforces a compatibility mode before accepting a new one.
- **Backward compatibility** — a reader on the new schema can still process data written under the old one.
- **Forward compatibility** — a reader on the old schema can still process data written under the new one.
- **Full compatibility** — both backward and forward compatibility hold at once.
- **Dual-write** — a producer writing the same change to both the old and new shape at once, during migrate.
- **Dual-read** — a consumer reading and reconciling both the old and new shape at once, during migrate.
