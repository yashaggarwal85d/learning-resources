---
id: de.secrets-management-pipelines
title: 'Secrets management for pipelines'
---

Last verified: 2026-10-31
Expert sign-off: pending

- AWS, "Rotate AWS Secrets Manager secrets" — https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html
- AWS, "Lambda rotation functions" — https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda-functions.html
- HashiCorp, "Database secrets engine" (Vault) — https://developer.hashicorp.com/vault/docs/secrets/databases
- Microsoft Learn, "About Azure Key Vault" — https://learn.microsoft.com/en-us/azure/key-vault/general/overview
- Google Cloud, "Secret Manager overview" — https://cloud.google.com/secret-manager/docs/overview
- Apache Airflow, "Secrets Backend" — https://airflow.apache.org/docs/apache-airflow/stable/security/secrets/secrets-backend/index.html
- PostgreSQL documentation (the local engine of record for every live demonstration in `examples.py`, used in place of Vault for the dynamic-credential reproduction — see OUTLINE.md's "Changes from the chapter plan") — https://www.postgresql.org/docs/current/sql-createrole.html
