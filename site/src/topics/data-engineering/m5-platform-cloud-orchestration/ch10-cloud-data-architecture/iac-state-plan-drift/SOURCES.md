## HashiCorp Terraform: State

URL: https://developer.hashicorp.com/terraform/language/state
Version: fetched 2026-10-31

> Terraform uses state to determine which changes to make to your infrastructure.

> The primary purpose of Terraform state is to store bindings between objects in a
remote system and resource instances declared in your configuration. When
Terraform creates a remote object in response to a change of configuration, it
records the identity of that remote object against a particular resource
instance, and potentially updates or deletes that object in response to future
configuration changes.

## HashiCorp Terraform: State: Locking

URL: https://developer.hashicorp.com/terraform/language/state/locking
Version: fetched 2026-10-31

> If supported by your backend, Terraform will lock your

> others from acquiring the lock and potentially corrupting your state.

> State locking happens automatically on all operations that could write
state. You do not see any message that it happens. If state locking fails,
Terraform does not continue.

## HashiCorp Terraform: terraform plan command reference

URL: https://developer.hashicorp.com/terraform/cli/commands/plan
Version: fetched 2026-10-31

> The plan command alone does not actually carry out the proposed changes

> If you run terraform plan without the -out=FILE option then it will create

> without any intent to actually apply it.

## HashiCorp Terraform: Import existing infrastructure resources

URL: https://developer.hashicorp.com/terraform/cli/import
Version: fetched 2026-10-31, re-fetched 2026-11-08

> Use the terraform import command to import a single existing resource into Terraform state. Before running the command, you must manually write a resource configuration block that describes where Terraform should map the imported object.

> The import block generates configuration and lets you review imports as part of your normal plan and apply workflow.

Note: re-checked 2026-11-08 after the page was rewritten. The command imports into state against a hand-written block (first quote); generating configuration belongs to the import block, not the command (second quote).

## OpenTofu: Manifesto

URL: https://opentofu.org/manifesto/
Version: fetched 2026-10-31

> Terraform was open-sourced in 2014 under the Mozilla Public License (v2.0) (the "MPL").

> Then, on August 10th, 2023, with little or no advance notice or chance for much, if not all, of the community to have any input, HashiCorp switched the license for Terraform from the MPL to the Business Source License (v1.1) (the "BUSL"), a non-open source license.

> With no response from Hashicorp by August 25, we created a fork of Terraform, which is now public.

> Forking the legacy MPL-licensed Terraform and maintaining the fork in the Linux Foundation under the name OpenTofu is similar to the way Linux is managed by the Linux Foundation under the stewardship of multiple companies.

## Pulumi: How Pulumi IaC Works

URL: https://www.pulumi.com/docs/iac/concepts/how-pulumi-works/
Version: fetched 2026-10-31

> IaC for any cloud, in any language — Node.js, Python, Go, .NET, Java, and YAML

## AWS: What is the AWS CDK?

URL: https://docs.aws.amazon.com/cdk/v2/guide/home.html
Version: fetched 2026-10-31

> The AWS Cloud Development Kit (AWS CDK) is an open-source software development framework for defining cloud infrastructure in code and provisioning it through AWS CloudFormation.

> With the AWS CDK, you can use any of the following programming languages to define your cloud infrastructure: TypeScript, JavaScript, Python, Java, C#/.Net, and Go. Choose your preferred language and use programming elements like parameters, conditionals, loops, composition, and inheritance to define the desired outcome of your infrastructure.

## HashiCorp Sentinel: Documentation

URL: https://developer.hashicorp.com/sentinel/docs
Version: fetched 2026-10-31

> Sentinel is a policy as code tool that lets you control what users of HashiCorp products are allowed to do. It enforces policies proactively, preventing end users from deploying changes that are not allowed.

## Open Policy Agent: Philosophy

URL: https://www.openpolicyagent.org/docs/latest/philosophy/
Version: fetched 2026-10-31

> Today policy is often a hard-coded feature of the software service it actually
governs. Open Policy Agent lets you decouple policy
from that software service so that the people responsible for policy can read,
write, analyze, version, distribute, and in general manage policy separate from
the service itself.

> OPA is a full-featured policy engine that offloads policy decisions from your
software. You can think of it as a concierge for your software who can answer
detailed questions on behalf of your users to meet their specific needs.
