## AWS: Rotate AWS Secrets Manager secrets

URL: https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html
Version: fetched 2026-10-30

> Rotation is the process of periodically updating a secret. When you rotate a secret, you update the credentials in both the secret and the database or service. In Secrets Manager, you can set up automatic rotation for your secrets.

> Managed rotation – For most managed secrets, you use managed rotation, where the service configures and manages rotation for you. Managed rotation doesn't use a Lambda function.

> Rotation by Lambda function – For other types of secrets, Secrets Manager rotation uses a Lambda function to update the secret and the database or service.

Contents: the two rotation mechanisms Secrets Manager offers (managed rotation with no Lambda function, and Lambda-function rotation for other secret types); rotation always updates the credential in both the secret store and the target database or service.

## AWS: Lambda rotation functions

URL: https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda-functions.html
Version: fetched 2026-10-30

> The method createSecret first checks if a secret exists by calling get_secret_value with the passed-in ClientRequestToken. If there's no secret, it creates a new secret with create_secret and the token as the VersionId. Then it generates a new secret value with get_random_password. Next it calls put_secret_value to store it with the staging label AWSPENDING.

> The method setSecret changes the credential in the database or service to match the new secret value in the AWSPENDING version of the secret.

> Next, the Lambda rotation function tests the AWSPENDING version of the secret by using it to access the database or service.

> Finally, the Lambda rotation function moves the label AWSCURRENT from the previous secret version to this version. Secrets Manager adds the AWSPREVIOUS staging label to the previous version, so that you retain the last known good version of the secret.

> For Amazon RDS MySQL, in alternating users rotation, Secrets Manager creates a cloned user with a name no longer than 16 characters.

Contents: the four-step rotation function (createSecret, setSecret, testSecret, finishSecret) and the AWSPENDING/AWSCURRENT/AWSPREVIOUS staging-label mechanism that tracks which credential version is live during rotation; "alternating users rotation" for RDS, which creates a second, cloned database user rather than overwriting the first in place — the dual-credential mechanism this topic reproduces.

## HashiCorp Vault: Database secrets engine

URL: https://developer.hashicorp.com/vault/docs/secrets/databases
Version: fetched 2026-10-30

> The database secrets engine generates database credentials dynamically based on configured roles.

> Vault makes use of its own internal revocation system to ensure that users become invalid within a reasonable time of the lease expiring.

> Vault also supports static roles for all database secrets engines. Static roles are a 1-to-1 mapping of Vault roles to usernames in a database

> With static roles, Vault stores and automatically rotates passwords for the associated database user based on a configurable period of time or rotation schedule.

> When a client requests credentials for the static role, Vault returns the current password for whichever database user is mapped to the requested role.

> by default Vault immediately and automatically rotates the database user's password.

Contents: dynamic roles generating a brand-new, time-limited database credential per lease (invalid once the lease expires); static roles as a separate mechanism (Vault owns and rotates an existing user's password on a schedule, never handing out a client-chosen password); the default-rotate-immediately behavior and the configuration to defer it.

## HashiCorp Vault: Database secrets engine (lease example)

URL: https://developer.hashicorp.com/vault/docs/secrets/databases
Version: fetched 2026-10-30

> lease_id database/creds/my-role/2f6a614c-4aa2-7b19-24b9-ad944a8d4de6 lease_duration 1h lease_renewable true

> For dynamic roles:Set the TTL and max TTL expiry times. By default, TTL is 1 hour and max TTL is 24 hours.

Contents: a worked dynamic-role credential issuance, showing the lease ID, lease duration and renewable flag actually returned by Vault; the default TTL/max-TTL values for a dynamic role.

## Microsoft Learn: About Azure Key Vault

URL: https://learn.microsoft.com/en-us/azure/key-vault/general/overview
Version: fetched 2026-10-30

> Access to a key vault requires proper authentication and authorization before a caller (user or application) can get access. Authentication establishes the identity of the caller, while authorization determines the operations that they're allowed to perform.

> Your applications can securely access the information they need by using URIs. These URIs allow the applications to retrieve specific versions of a secret.

> Once you've created a couple of Key Vaults, you'll want to monitor how and when your keys and secrets are being accessed. You can monitor activity by enabling logging for your vaults.

Contents: Azure Key Vault's authentication/authorization split (Entra ID for authentication, RBAC or vault access policy for authorization); secrets addressed and versioned by URI; activity logging as an explicit, separate feature a vault owner enables.

## Google Cloud: Secret Manager overview

URL: https://cloud.google.com/secret-manager/docs/overview
Version: fetched 2026-10-30

> A secret is a global resource that contains a collection of metadata and secret versions. The metadata can include labels, annotations, and permissions.

> A secret version stores the actual secret data, such as API keys, passwords, or certificates. Each version is identified by a unique ID or timestamp.

> Manage rollback, recovery, and auditing using versions: Versions help you manage gradual rollouts and emergency rollback, If a secret is accidentally changed or compromised, you can revert to a previous, known-good version.

> Manage access to secrets using fine-grained Identity and Access Management (IAM) roles and conditions: With IAM roles and permissions, you can provide granular access to specific Secret Manager resources. You can segregate responsibilities for accessing, managing, auditing, and rotating secrets.

Contents: the secret/secret-version model (one secret resource holds many immutable, individually-addressable versions); access control and audit as IAM-role-scoped, separable responsibilities (who can access vs. who can rotate vs. who can audit).

## Apache Airflow: Secrets Backend

URL: https://airflow.apache.org/docs/apache-airflow/stable/security/secrets/secrets-backend/index.html
Version: fetched 2026-10-30

> In addition to retrieving connections & variables from environment variables or the metastore database, you can also enable alternative secrets backend to retrieve Airflow connections or Airflow variables via Apache Airflow Community provided backends in Secret backends.

> When looking up a connection/variable, by default Airflow will search environment variables first and metastore database second. If you enable an alternative secrets backend, it will be searched first, followed by environment variables, then metastore. This search ordering is not configurable.

> A secrets backend is a subclass of airflow.secrets.base_secrets.BaseSecretsBackend and must implement either get_connection() or get_conn_value() for retrieving connections, get_variable() for retrieving variables and get_config() for retrieving Airflow configurations.

Contents: Airflow's own secrets-backend abstraction (a fixed search order: secrets backend, then environment variables, then the metastore database); the backend is a pluggable class looked up at task-run time, not a value frozen into the metastore at DAG-parse time.
