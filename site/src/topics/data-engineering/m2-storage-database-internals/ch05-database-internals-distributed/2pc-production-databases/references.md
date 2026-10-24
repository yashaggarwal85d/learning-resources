Last verified: 24 October 2026. Two real measured experiments run in this sandbox (`examples.py`,
against this sandbox's own Postgres cluster), using `PREPARE TRANSACTION`: a prepared transaction
stays invisible to every other session until committed from a separate session, and keeps holding
its own locks, measurably blocking a concurrent writer, until it's resolved.

- PostgreSQL documentation, "PREPARE TRANSACTION": [postgresql.org](https://www.postgresql.org/docs/current/sql-prepare-transaction.html). The real `PREPARE TRANSACTION`/`COMMIT PREPARED`/`ROLLBACK PREPARED` mechanics this topic measures directly.
- X/Open Company Ltd., "Distributed Transaction Processing: The XA Specification", December 1991: [pubs.opengroup.org](https://pubs.opengroup.org/onlinepubs/009680699/toc.pdf). The vendor-neutral two-phase-commit standard those commands implement.
- Corbett, J. C. et al., "Spanner: Google's Globally-Distributed Database", Proceedings of OSDI 2012: [static.googleusercontent.com](https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf). How a real distributed SQL system hides two-phase commit behind consensus-replicated participants.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=2pc-production-databases:%20).
