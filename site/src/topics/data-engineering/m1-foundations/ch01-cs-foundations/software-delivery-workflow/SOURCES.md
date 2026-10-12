# Sources — Software delivery workflow

## Workflow syntax for GitHub Actions - GitHub Docs
URL: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
Version: GitHub Docs (en, current); no edition shown, fetched 2026-10-12
> A workflow run is made up of one or more jobs, which run in parallel by default. To run jobs sequentially, you can define dependencies on other jobs using the jobs.<job_id>.needs keyword.

> Use jobs.<job_id>.needs to identify any jobs that must complete successfully before this job will run.

> If a job fails or is skipped, all jobs that need it are skipped unless the jobs use a conditional expression that causes the job to continue.

> If you would like a job to run even if a job it is dependent on did not succeed, use the always() conditional expression in jobs.<job_id>.if.

> Each run keyword represents a new process and shell in the runner environment. When you provide multi-line commands, each line runs in the same shell.

> By default, fail-fast behavior is enforced using set -e for both sh and bash. When shell: bash is specified, -o pipefail is also applied to enforce early exit from pipelines that generate a non-zero exit status.

> bash -e {0}

> bash --noprofile --norc -eo pipefail {0}

> The default shell on non-Windows platforms. Note that this runs a different command to when bash is specified explicitly.

> Prevents a job from failing when a step fails. Set to true to allow a job to pass when this step fails.

> The maximum number of minutes to let a job run before GitHub automatically cancels it. Default: 360

> If jobs.<job_id>.strategy.fail-fast is set to true or its expression evaluates to true, GitHub will cancel all in-progress and queued jobs in the matrix if any job in the matrix fails. This property defaults to true.

> Prevents a workflow run from failing when a job fails. Set to true to allow a workflow run to pass when this job fails.

Added by the content plan (2026-10-12), same page:

> A job contains a sequence of tasks called steps.

> Because steps run in their own process, changes to environment variables are not preserved between steps.

> sh-like shells exit with the exit code of the last command executed in a script, which is also the default behavior for actions. The runner will report the status of the step as fail/succeed based on this exit code.

> If bash is not found in the path, this is treated as sh.

> Using the commit SHA of a released action version is the safest for stability and security.

> If the action publishes major version tags, you should expect to receive critical fixes and security patches while still retaining compatibility.

> Using the default branch of an action may be convenient, but if someone releases a new major version with a breaking change, your workflow could break.

> uses: actions/checkout@v6

> Runs a step asynchronously so the job continues to the next step without waiting for it to finish.

> If a background step fails, the job fails at the next wait or wait-all that includes it (unless continue-on-error is set on that step).

Contents:
- Jobs run in parallel by default; `needs` makes them sequential and a failed or skipped dependency skips everything downstream (override with `if: always()`).
- Each `run` step is a new shell process; lines of a multi-line `run` share one shell.
- Default shell (unspecified) runs `bash -e {0}`; explicit `shell: bash` adds `--noprofile --norc -eo pipefail`, so a failing pipeline stage fails the step.
- `continue-on-error` exists at step level (job still passes) and job level (workflow run still passes).
- `timeout-minutes` at step level (max 360) and job level (default 360).
- `strategy.fail-fast` (default true) cancels the remaining matrix jobs when one fails.

## About protected branches - GitHub Docs
URL: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
Version: GitHub Docs (en, current); no edition shown, fetched 2026-10-12
> You can protect important branches by setting branch protection rules, which define whether collaborators can delete or force push to the branch and set requirements for any pushes to the branch, such as passing status checks or a linear commit history.

> Required status checks must have a successful, skipped, or neutral status before collaborators can make changes to a protected branch.

> After enabling required status checks, all required status checks must pass before collaborators can merge changes into the protected branch.

> If you use branch protection rules that require specific status checks, make sure that job names are unique across all workflows.

> The Require branches to be up to date before merging checkbox is checked.

> This is the default behavior for required status checks.

> Status checks may fail after you merge your branch if there are incompatible changes with the base branch.

> If required status checks aren't enabled, collaborators can merge the branch at any time, regardless of whether it is up to date with the base branch. This increases the possibility of incompatible changes.

Contents:
- Branch protection rules gate pushes: passing status checks, reviews, linear history, signed commits, merge queue.
- A required check must be successful, skipped or neutral; all required checks must pass before merge.
- "Strict" mode (branch must be up to date, the default) needs more builds; "loose" mode risks post-merge failures from incompatible changes.
- Without required checks, anything can be merged at any time.
- Job names must be unique across workflows, or check results become ambiguous.

## Dependency caching reference - GitHub Docs
URL: https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching
Version: GitHub Docs (en, current); no edition shown, fetched 2026-10-12
> Using expressions to create a key allows you to automatically create a new cache when dependencies change.

> npm-${{ hashFiles('package-lock.json') }}

> If there is an exact match to the provided key, this is considered a cache hit. If no cache exactly matches the provided key, this is considered a cache miss. On a cache miss, the action automatically creates a new cache if the job completes successfully.

> You can create multiple restore keys ordered from the most specific to least specific.

> pip, pipenv, Poetry

> Workflow runs cannot restore caches created for child branches or sibling branches.

> GitHub will remove any cache entries that have not been accessed in over 7 days.

> By default, the limit is 10 GB per repository

Contents:
- The cache key should embed a hash of the lockfile (`hashFiles(...)`), so changed dependencies produce a new cache.
- Restore order: exact key, then prefix matches, then `restore-keys` in sequence; exact match is a hit, otherwise a miss.
- A cache is only saved on a miss if the job succeeds.
- `setup-python` handles caching for pip, pipenv and Poetry with minimal configuration.
- Scope: current branch, default branch, PR base branch; not sibling or child branches.
- Eviction: unused for 7 days, or oldest-first when over the 10 GB per-repository default.
- Low-trust triggers (fork PRs, issue comments) are restricted to limit cache poisoning.

## Repeatable Installs - pip documentation v26.2.1
URL: https://pip.pypa.io/en/stable/topics/repeatable-installs/
Version: pip documentation v26.2.1
> Pinning package versions of your dependencies in the requirements file protects you from bugs or incompatibilities in newly released versions

> Pinning refers to using the == operator to require the package to be a specific version.

> A requirements file, containing pinned package versions can be generated using pip freeze. This would pin not only the top-level packages, but also all of their transitive dependencies.

> Performing the installation using --no-deps would provide an extra dose of insurance against installing anything not explicitly listed.

> This protects against a compromise of PyPI or the HTTPS certificate chain.

> This approach is a good fit for automated server deployments.

> Note that such a wheelhouse contains compiled packages, which are typically OS and architecture-specific, so these archives are not necessarily portable across machines.

Contents:
- Level 1, pinning with `==`: easy, cross-platform; `pip freeze` captures transitive dependencies; `--no-deps` adds insurance; still trusts PyPI and the certificate chain.
- Level 2, hash-checking (`--hash=sha256:...`): defends against PyPI or TLS compromise and changed-without-version-bump packages; suited to automated deploys.
- Level 3, wheelhouse (`pip wheel`): installs offline without recompiling, but is OS and architecture specific.
- pip-tools is mentioned for generating requirements files.

## Secure installs - pip documentation v26.2.1
URL: https://pip.pypa.io/en/stable/topics/secure-installs/
Version: pip documentation v26.2.1
> By default, pip does not perform any checks to protect against remote tampering and involves running arbitrary code from distributions.

> Enable Hash-checking Mode, by passing --require-hashes

> Disallow source distributions, by passing --only-binary :all:

> Note that hash-checking is an all-or-nothing proposition. Specifying --hash against any requirement will activate this mode globally.

> Hashes are required for all dependencies.

> Requirements must be pinned (either to a URL, filesystem path or using ==).

> The recommended hash algorithm at the moment is sha256

> weaker ones such as md5, sha1, and sha224 are excluded to avoid giving a false sense of security.

Added by the content plan (2026-10-12), same page:

> Added in version 26.2.

> To help with such use cases, a --no-require-hashes flag is available to disable this mechanism. Hashes are then verified only for requirements where they are provided.

> It is possible to use multiple hashes for each package. This is important when a package offers binary distributions for a variety of platforms or when it is important to allow both binary and source distributions.

> Since this hash originates remotely, it is not a useful guard against tampering and thus does not satisfy the --require-hashes demand that every package have a local hash.

> It is also a convenient way to bootstrap your list of hashes, since it shows the hashes of the packages it fetched.

Contents:
- Default pip does no tamper checks and may run arbitrary build code from source distributions.
- Secure recipe: `--require-hashes` plus `--only-binary :all:`.
- Hash mode is global once any `--hash` appears; every requirement and every transitive dependency must be hashed and pinned.
- `--require-hashes` in deploy scripts forces authors to supply hashes and shows hashes to bootstrap with.
- `--no-require-hashes` (added in 26.2) verifies only the requirements that carry hashes.
- Multiple hashes per package cover several platform wheels; sha256 recommended.
- Index-supplied hashes guard only against corruption, not tampering.
- Do not call `setup.py install` directly; use `pip install --no-deps .`.

## Requirements File Format - pip documentation v26.2.1
URL: https://pip.pypa.io/en/stable/reference/requirements-file-format/
Version: pip documentation v26.2.1
> Requirements files serve as a list of items to be installed by pip, when using pip install.

> The default encoding for requirement files is UTF-8

> A line ending in an unescaped \ is treated as a line continuation and the newline following it is effectively ignored.

> A line that begins with # is treated as a comment and ignored.

> -r more_requirements.txt

> You can also refer to constraints files, like this:

> --hash (for Hash-checking Mode)

> You have to use the POSIX format for variable names including brackets around the uppercase name as shown in this example: ${API_TOKEN}.

Contents:
- A requirements file lists what `pip install -r` installs; one requirement, URL/path or option per line.
- UTF-8 by default; `\` continues a line (used for multi-line `--hash` entries); `#` starts a comment.
- `-r` includes other requirement files and `-c` includes constraints files.
- Global options (`--index-url`, `--require-hashes`, `--only-binary`, `--no-index`, ...) go on their own lines; `--hash` is per-requirement.
- `${VAR}` environment variables are expanded, so tokens stay out of the file.

## The Standard of Code Review | eng-practices
URL: https://google.github.io/eng-practices/review/reviewer/standard.html
Version: Google Engineering Practices documentation (no edition date shown; "This site is open source"); fetched 2026-10-12

> The primary purpose of code review is to make sure that the overall code health of Google’s code base is improving over time.

> In general, reviewers should favor approving a CL once it is in a state where it definitely improves the overall code health of the system being worked on, even if the CL isn’t perfect.

> A key point here is that there is no such thing as “perfect” code—there is only better code.

> Instead of seeking perfection, what a reviewer should seek is continuous improvement.

> if it’s not very important, prefix it with something like “Nit: “ to let the author know that it’s just a point of polish that they could choose to ignore.

> Technical facts and data overrule opinions and personal preferences.

> Don’t let a CL sit around because the author and the reviewer can’t come to an agreement.

Contents:
- Purpose of review: improve overall code health over time.
- Trade-offs: developers must make progress, reviewers own code quality.
- The standard: approve once the change definitely improves code health, even if imperfect; emergencies are the only exception to worsening health.
- "Nit:" prefix for optional polish; mentoring comments also marked non-mandatory.
- Principles: facts over opinion, style guide is authority, design judged on principles, consistency.
- Resolving conflicts: consensus first, then call/meeting, then escalate.

## What to look for in a code review | eng-practices
URL: https://google.github.io/eng-practices/review/reviewer/looking-for.html
Version: Google Engineering Practices documentation (no edition date shown); fetched 2026-10-12

> The most important thing to cover in a review is the overall design of the CL.

> Is the CL more complex than it should be?

> Encourage developers to solve the problem they know needs to be solved now, not the problem that the developer speculates might need to be solved in the future.

> Ask for unit, integration, or end-to-end tests as appropriate for the change. In general, tests should be added in the same CL as the production code unless the CL is handling an emergency.

> Tests do not test themselves, and we rarely write tests for our tests—a human must ensure that tests are valid.

> Will the tests actually fail when the code is broken?

> Remember that tests are also code that has to be maintained.

> Usually comments are useful when they explain why some code exists, and should not be explaining what some code is doing.

> Don’t block CLs from being submitted based only on personal style preferences.

> If a CL changes how users build, test, interact with, or release code, check to see that it also updates associated documentation, including READMEs, g3doc pages, and any generated reference docs.

> Don’t accept CLs that degrade the code health of the system.

> If you see something nice in the CL, tell the developer, especially when they addressed one of your comments in a great way.

Added by the content plan (2026-10-12), same page:

> as the reviewer you should still be

> thinking about edge cases, looking for concurrency problems, trying to think

> like a user, and making sure that there are no bugs that you see just by reading

> the code.

> The code is well-designed.

> Code has appropriate unit tests.

> The developer used clear names for everything.

Contents:
- Design, Functionality, Complexity (over-engineering), Tests, Naming, Comments, Style, Consistency, Documentation.
- Review every line; look at context; know when to bring in qualified reviewers.
- Exceptions for partial reviews; praise good things.
- Summary checklist of what a reviewer verifies.

## Speed of Code Reviews | eng-practices
URL: https://google.github.io/eng-practices/review/reviewer/speed.html
Version: Google Engineering Practices documentation (no edition date shown); fetched 2026-10-12

> At Google, we optimize for the speed at which a team of developers can produce a product together, as opposed to optimizing for the speed at which an individual developer can write code.

> One business day is the maximum time it should take to respond to a code review request (i.e., first thing the next morning).

> If you are in the middle of a focused task, such as writing code, don’t interrupt yourself to do a code review.

> it is the response time that we are concerned with, as opposed to how long it takes a CL to get through the whole review and be submitted.

> In order to speed up code reviews, there are certain situations in which a reviewer should give LGTM/Approval even though they are also leaving unresolved comments on the CL.

> The suggestions are minor, e.g. sort imports, fix a nearby typo, apply a suggested fix, remove an unused dep, etc.

> your typical response should be to ask the developer to split the CL into several smaller CLs that build on each other, instead of one huge CL that has to be reviewed all at once.

Contents:
- Why fast reviews matter: team velocity, developer morale, code health.
- Target: respond within one business day; do not interrupt focused work.
- Response time matters more than total review time.
- Cross-time-zone reviews and "LGTM with comments".
- Large CLs: ask to split; reviews speed up over time without lowering standards; emergencies.

## Small CLs | eng-practices
URL: https://google.github.io/eng-practices/review/developer/small-cls.html
Version: Google Engineering Practices documentation (no edition date shown); fetched 2026-10-12

> Reviewed more quickly. It’s easier for a reviewer to find five minutes several times to review small CLs than to set aside a 30 minute block to review one large CL.

> Less likely to introduce bugs. Since you’re making fewer changes, it’s easier for you and your reviewer to reason effectively about the impact of the CL and see if a bug has been introduced.

> Simpler to roll back.

> In general, the right size for a CL is one self-contained change.

> The CL should include related test code.

> 100 lines is usually a reasonable size for a CL, and 1000 lines is usually too large, but it’s up to the judgment of your reviewer.

> When in doubt, write CLs that are smaller than you think you need to write. Reviewers rarely complain about getting CLs that are too small.

> It’s usually best to do refactorings in a separate CL from feature changes or bug fixes.

> A CL that adds or changes logic should be accompanied by new or updated tests for the new behavior.

> If you have several CLs that depend on each other, you need to find a way to make sure the whole system keeps working after each CL is submitted.

Contents:
- Why small: faster, more thorough, fewer bugs, less wasted work, easier merge/design/rollback.
- What is small: one self-contained change with its tests; ~100 lines fine, ~1000 too large; file count matters.
- When large is OK: whole-file deletion, trusted automated refactoring.
- Splitting strategies: stacking, by files, horizontally, vertically, both.
- Separate refactorings; keep tests with the change; do not break the build; when it cannot be small, get reviewer consent first.

## How to write and report assertions in tests - pytest documentation
URL: https://docs.pytest.org/en/stable/how-to/assert.html
Version: pytest stable docs (example output shows pytest-9.x.y); fetched 2026-10-12
> pytest allows you to use the standard Python assert for verifying

> expectations and values in Python tests.

> pytest has support for showing the values of the most common subexpressions

> including calls, attributes, comparisons, and binary and unary

> operators.

> When comparing floating point values (or arrays of floats), small rounding

> errors are common.

> pytest.approx works with scalars, lists, dictionaries, and NumPy arrays.

> It also supports comparisons involving NaNs.

> In order to write assertions about raised exceptions, you can use

> pytest.raises() as a context manager

Contents:
- Plain `assert` statement; failure output shows the values involved (introspection), optional message.
- `pytest.approx()` for floats, lists, dicts, NumPy arrays, NaNs.
- `pytest.raises()` for expected exceptions, `excinfo`, subclass matching, `match=` regex on the message.
- Further sections on exception groups, warnings and custom assertion comparisons.

## How to use fixtures - pytest documentation
URL: https://docs.pytest.org/en/stable/how-to/fixtures.html
Version: pytest stable docs (example output shows pytest-9.x.y); fetched 2026-10-12
> At a basic level, test functions request fixtures they require by declaring

> them as arguments.

> Two different tests can request

> the same fixture and have pytest give each test their own result from that

> fixture.

> We

> can use this system to make sure each test gets its own fresh batch of data and

> is starting from a clean state so it can provide consistent, repeatable results.

> function: the default scope, the fixture is destroyed at the end of the test.

> session: the fixture is destroyed at the end of the test session.

> “Yield” fixtures yield instead of return.

> Any teardown code for that fixture is placed after the yield.

Contents:
- Requesting fixtures by argument name; fixtures can request other fixtures; reusable, one fresh result per test.
- Return values cached within one test; autouse fixtures.
- Scopes (function, class, module, package, session), dynamic scope, conftest.py sharing.
- Teardown via yield fixtures (recommended) and finalizers; safe teardown; fixture errors.
- Parametrized fixtures, marks, overriding fixtures, usefixtures.

## How to parametrize fixtures and test functions - pytest documentation
URL: https://docs.pytest.org/en/stable/how-to/parametrize.html
Version: pytest stable docs (example output shows pytest-9.x.y); fetched 2026-10-12
> The builtin pytest.mark.parametrize decorator enables

> parametrization of arguments for a test function.

> the @parametrize decorator defines three different (test_input,expected)

> tuples so that the test_eval function will run three times using

> them in turn

> Parameter values are passed as-is to tests (no copy whatsoever).

> It is also possible to mark individual test instances within parametrize,

> for example with the builtin mark.xfail

> To get all combinations of multiple parametrized arguments you can stack

> parametrize decorators

Contents:
- Three levels: parametrized fixtures, `@pytest.mark.parametrize`, `pytest_generate_tests`.
- Input/expected tuples; each set runs as its own test and fails separately (`test_eval[6*9-42]`).
- Parametrizing classes and modules (`pytestmark`); `pytest.param(..., marks=xfail)`.
- Stacked decorators give all combinations; mutable values are shared, not copied.
- `pytest_generate_tests` with `metafunc.parametrize` and a command-line option.

## Exit codes - pytest documentation
URL: https://docs.pytest.org/en/stable/reference/exit-codes.html
Version: pytest stable docs (page shows no number; sibling pages show pytest-9.x.y); fetched 2026-10-12
> Running pytest can result in seven different exit codes:

> Exit code 0:

> All tests were collected and passed successfully

> Exit code 1:

> Tests were collected and run but some of the tests failed

> Exit code 5:

> No tests were collected

> They are represented by the pytest.ExitCode enum.

Contents:
- 0 all passed; 1 some failed; 2 interrupted by user; 3 internal error; 4 command-line usage error; 5 no tests collected; 6 max warnings exceeded (`--max-warnings`).
- Codes are the public `pytest.ExitCode` enum; note pointing to pytest-custom_exit_code to customise the no-tests code.

## Semantic Versioning 2.0.0
URL: https://semver.org/
Version: Semantic Versioning 2.0.0 (as shown on the page); fetched 2026-10-12

> Given a version number MAJOR.MINOR.PATCH, increment the:

> MAJOR version when you make incompatible API changes

> MINOR version when you add functionality in a backward compatible

> manner

> PATCH version when you make backward compatible bug fixes

> Additional labels for pre-release and build metadata are available as extensions

> to the MAJOR.MINOR.PATCH format.

> If the dependency specifications are too tight, you are in

> danger of version lock (the inability to upgrade a package without having to

> release new versions of every dependent package). If dependencies are

> specified too loosely, you will inevitably be bitten by version promiscuity

> (assuming compatibility with more future versions than is reasonable).

> Software using Semantic Versioning MUST declare a public API.

> A normal version number MUST take the form X.Y.Z where X, Y, and Z are

> non-negative integers, and MUST NOT contain leading zeroes.

> Each element MUST increase numerically. For instance: 1.9.0 -> 1.10.0 -> 1.11.0.

> Once a versioned package has been released, the contents of that version

> MUST NOT be modified. Any modifications MUST be released as a new version.

> Major version zero (0.y.z) is for initial development. Anything MAY change

> at any time. The public API SHOULD NOT be considered stable.

> Version 1.0.0 defines the public API.

> Patch version Z (x.y.Z | x > 0) MUST be incremented if only backward

> compatible bug fixes are introduced. A bug fix is defined as an internal

> change that fixes incorrect behavior.

> Minor version Y (x.Y.z | x > 0) MUST be incremented if new, backward

> compatible functionality is introduced to the public API.

> Patch version

> MUST be reset to 0 when minor version is incremented.

> Major version X (X.y.z | X > 0) MUST be incremented if any backward

> incompatible changes are introduced to the public API.

> Patch and minor versions MUST be reset to 0 when major

> version is incremented.

> Pre-release versions have a lower

> precedence than the associated normal version.

> Build metadata MUST be ignored when determining

> version precedence.

> Example: 1.0.0 < 2.0.0 < 2.1.0 < 2.1.1.

> Example: 1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-alpha.beta < 1.0.0-beta <

> 1.0.0-beta.2 < 1.0.0-beta.11 < 1.0.0-rc.1 < 1.0.0.

> Without

> compliance to some sort of formal specification, version numbers are

> essentially useless for dependency management.

> you can safely specify the Ladder

> dependency as greater than or equal to 3.1.0 but less than 4.0.0.

> The simplest thing to do is start your initial development release at 0.1.0

> and then increment the minor version for each subsequent release.

> If your software is being used in production, it should probably already be

> 1.0.0.

> No, “v1.2.3” is not a semantic version.

> Before you completely remove the functionality in a new major release

> there should be at least one minor release that contains the deprecation so

> that users can smoothly transition to the new API.

Added by the content plan (2026-10-12), same page (FAQ):

> As soon as you realize that you’ve broken the Semantic Versioning spec, fix

> the problem and release a new minor version that corrects the problem and

> restores backward compatibility. Even under this circumstance, it is

> unacceptable to modify versioned releases.

Contents:
- Summary: MAJOR.MINOR.PATCH increment rules; pre-release and build metadata labels
- Introduction: dependency hell, version lock, version promiscuity; declare a public API
- Semantic Versioning Specification (SemVer): numbered rules 1-11 (public API; X.Y.Z form; released versions immutable; 0.y.z initial development; 1.0.0; patch; minor; major; pre-release; build metadata; precedence with examples)
- Backus-Naur Form Grammar for Valid SemVer Versions
- Why Use Semantic Versioning? (Firetruck/Ladder example)
- FAQ: 0.y.z revisions; when to release 1.0.0; rapid development; version 42.0.0; documenting the API; accidental incompatible minor release; updating own dependencies; inadvertent API change; deprecating functionality; size limit; is "v1.2.3" semver; suggested regular expressions
- About; License (CC BY 3.0)

## PEP 440 – Version Identification and Dependency Specification
URL: https://peps.python.org/pep-0440/
Version: PEP 440, Status: Final, Created 18-Mar-2013, Replaces PEP 386; fetched 2026-10-12

> This PEP describes a scheme for identifying versions of Python software

> distributions, and declaring dependencies on particular versions.

> The canonical public version identifiers MUST comply with the following

> scheme:

> [N!]N(.N)*[{a|b|rc}N][.postN][.devN]

> All numeric components MUST be interpreted and ordered according to their

> numeric value, not as text strings.

> X.YaN # Alpha release

> X.YbN # Beta release

> X.YrcN # Release Candidate

> X.Y # Final release

> Pre-releases for

> a given release are ordered first by phase (alpha, beta, release candidate)

> and then by the numerical component within that phase.

> Some projects use post-releases to address minor errors in a final release

> that do not affect the distributed software (for example, correcting an error

> in the release notes).

> The use of post-releases to publish maintenance releases containing

> actual bug fixes is strongly discouraged.

> X.Y.devN # Developmental release

> .devN, aN, bN, rcN, <no suffix>, .postN

> A version specifier consists of a series of version clauses, separated by

> commas.

> ~= 0.9, >= 1.0, != 1.3.4.*, < 2.0

> The comma (“,”) is equivalent to a logical and operator: a candidate

> version must match all given version clauses in order to match the

> specifier as a whole.

> A compatible release clause consists of the compatible release operator ~=

> and a version identifier. It matches any candidate version that is expected

> to be compatible with the specified version.

> For a given release identifier V.N, the compatible release clause is

> approximately equivalent to the pair of comparison clauses:

> >= V.N, == V.*

> This operator MUST NOT be used with a single segment version number such as

> ~=1.

> ~= 2.2

> >= 2.2, == 2.*

> ~= 1.4.5

> >= 1.4.5, == 1.4.*

> The padding rules for release segment comparisons means that the assumed

> degree of forward compatibility in a compatible release clause can be

> controlled by appending additional zeros to the version specifier

> By default, the version matching operator is based on a strict equality

> comparison: the specified version must be exactly the same as the requested

> version.

> Prefix matching may be requested instead of strict comparison, by appending

> a trailing .* to the version identifier in the version matching clause.

> == 1.1.post1 # Equal, so 1.1.post1 matches clause

> == 1.1.* # Same prefix, so 1.1.post1 matches clause

> The use of == (without at least the wildcard suffix) when defining

> dependencies for published distributions is strongly discouraged as it

> greatly complicates the deployment of security fixes. The strict version

> comparison operator is intended primarily for use when defining

> dependencies for repeatable deployments of applications while using

> a shared distribution index.

> Pre-releases of any kind, including developmental releases, are implicitly

> excluded from all version specifiers, unless they are already present

> on the system, explicitly requested by the user, or if the only available

> version that satisfies the version specifier is a pre-release.

> ~=3.1: version 3.1 or later, but not version 4.0 or later.

> ~=3.1.2: version 3.1.2 or later, but not version 3.2.0 or later.

> Semantic versions containing a hyphen (pre-releases - clause 10) or a

> plus sign (builds - clause 11) are not compatible with this PEP

> and are not permitted in the public version field.

> The “Major.Minor.Patch” (described in this PEP as “major.minor.micro”)

> aspects of semantic versioning (clauses 1-8 in the 2.0.0 specification)

> are fully compatible with the version scheme defined in this PEP

Contents:
- Abstract; Definitions (projects, releases, distributions, tools)
- Version scheme: public version identifiers (epoch, release, pre-release, post-release, development segments); local version identifiers
- Final releases; Pre-releases (a, b, rc); Post-releases (.postN); Developmental releases (.devN); Version epochs (N!)
- Normalization: case sensitivity, integer normalization, pre-release spelling and implicit numbers, post/dev separators and spelling, local version segments, preceding v, whitespace
- Examples of compliant version schemes; Summary of permitted suffixes and relative ordering; Version ordering across different metadata versions
- Compatibility with other version schemes: Semantic versioning; DVCS based version labels; Olson database versioning
- Version specifiers: compatible release (~=); version matching (==, .* prefix); version exclusion (!=); inclusive ordered comparison (<=, >=); exclusive ordered comparison (<, >); arbitrary equality (===); handling of pre-releases; examples
- Direct references; File URLs
- Updating the versioning specification; differences from pkg_resources.parse_version and PEP 386; rationale sections; appendices (regular expressions)


## Evaluate expressions in workflows and actions - GitHub Docs
URL: https://docs.github.com/en/actions/reference/workflows-and-actions/expressions
Version: GitHub Docs (en, current); no edition shown, fetched 2026-10-12
> A default status check of success() is applied unless you include one of these functions.

> Returns true when all previous steps have succeeded.

> Returns true when any previous step of a job fails.

> If you want to run a job or step regardless of its success or failure, use the recommended alternative: if: ${{ !cancelled() }}

Contents:
- Status check functions `success()`, `always()`, `cancelled()`, `failure()`; `success()` is the default condition of every step and job, so a failed step skips the steps after it unless they say otherwise.

## Flaky tests - pytest documentation
URL: https://docs.pytest.org/en/stable/explanation/flaky.html
Version: pytest stable docs (sibling pages show pytest-9.x.y); fetched 2026-10-12
> A “flaky” test is one that exhibits intermittent or sporadic failure, that seems to have non-deterministic behaviour.

> Flaky tests are particularly troublesome when a continuous integration (CI) server is being used, so that all tests must pass before a new code change can be merged.

> If the test result is not a reliable signal – that a test failure means the code change broke the test – developers can become mistrustful of the test results, which can lead to overlooking genuine failures.

> Broadly speaking, a flaky test indicates that the test relies on some system state that is not being appropriately controlled - the test environment is not sufficiently isolated.

> Tests that modify global state typically cannot be run in parallel.

> Rerunning any failed tests can mitigate the negative effects of flaky tests by giving them additional chances to pass, so that the overall build does not fail.

> This could be considered like a manual quarantine, and is rather dangerous to use permanently.

> It can be common to split a single test suite into two, such as unit vs integration, and only use the unit test suite as a CI gate.

> If the functionality is covered by other tests, perhaps the test can be removed. If not, perhaps it can be rewritten at a lower level which will remove the flakiness or make its source more apparent.

Contents:
- Definition; why flaky tests hurt a CI gate (mistrust, wasted re-runs).
- Root causes: uncontrolled system state, test order and parallel runs, overly strict assertions, threads.
- Tools: `xfail(strict=False)` as a manual quarantine, `PYTEST_CURRENT_TEST`, rerun and randomising plugins.
- Strategies: split unit vs integration suites (unit suite as the gate), screenshots, delete or rewrite at a lower level, quarantine, CI tools that rerun.

## How to use temporary directories and files in tests - pytest documentation
URL: https://docs.pytest.org/en/stable/how-to/tmp_path.html
Version: pytest stable docs; fetched 2026-10-12
> You can use the tmp_path fixture which will provide a temporary directory

> unique to each test function.

Contents:
- `tmp_path` (a `pathlib.Path`, unique per test), `tmp_path_factory` for session scope, retention policy, the legacy `tmpdir`.

## How to capture stdout/stderr output - pytest documentation
URL: https://docs.pytest.org/en/stable/how-to/capture-stdout-stderr.html
Version: pytest stable docs; fetched 2026-10-12
> fixtures allow access to stdout/stderr output created during test execution.

Contents:
- Default capture of fds 1 and 2; `-s`; `capsys`/`capfd` and `readouterr()`.

## pip hash - pip documentation v26.2.1
URL: https://pip.pypa.io/en/stable/cli/pip_hash/
Version: pip documentation v26.2.1
> Compute a hash of a local package archive.

> These can be used with --hash in a requirements file to do repeatable

> installs.

Contents:
- `pip hash <file>` prints `--hash=sha256:...` for a local archive; sha256, sha384 or sha512.

## pip install - pip documentation v26.2.1
URL: https://pip.pypa.io/en/stable/cli/pip_install/
Version: pip documentation v26.2.1
> In combination with the --dry-run and --ignore-installed it

> can be used to resolve a set of requirements without actually installing them.

> Require a hash to check each requirement against, for repeatable installs. This option is implied when any package in a requirements file has a --hash option.

> Ignore package index (only looking at --find-links URLs instead).

> it chooses which version of

> each requirement to install using the simple rule that the latest version that

> satisfies the given constraints will be installed

> Generate a JSON file describing what pip did to install the provided requirements.

Contents:
- Options used here: `--dry-run`, `--ignore-installed`, `--report`, `--require-hashes`, `--only-binary`, `--no-index`, `--find-links`, `--target`.

## Installation Report - pip documentation v26.2.1
URL: https://pip.pypa.io/en/stable/reference/installation-report/
Version: pip documentation v26.2.1
> For source archives, download_info.archive_info.hashes may

> be absent when the requirement was installed from the wheel cache

Contents:
- The JSON report: `install` entries with `metadata`, `download_info` (URL, `archive_info.hashes`), `requested`; the environment markers it was resolved for.

## actions/setup-python README
URL: https://raw.githubusercontent.com/actions/setup-python/main/README.md
Version: `main` branch README, fetched 2026-10-12 (examples show `actions/setup-python@v7`)
> uses: actions/setup-python@v7

> uses: actions/checkout@v7

> cache: 'pip' # caching pip dependencies

> uses its hash as a part of the cache key

> The action defaults to searching for a dependency file

> Input `cache-dependency-path` is used for cases when multiple dependency files are used

> In this case the pip install -r requirements.txt command will always try to install the latest available package version.

Contents:
- Basic usage, Python versions, caching for pip/pipenv/poetry keyed on a dependency file's hash, `cache-dependency-path`.

## Command line and environment - Python documentation
URL: https://docs.python.org/3/using/cmdline.html
Version: Python 3.15.0 documentation (as titled), fetched 2026-10-12
> If this variable is not set or set to random, a random value is used

> to seed the hashes of str and bytes objects.

> If PYTHONHASHSEED is set to an integer value, it is used as a fixed

> the current directory will be added to the start of sys.path.

Contents:
- `-m` puts the current directory first on `sys.path`; `PYTHONHASHSEED` and hash randomisation.

## Navigating a CL in review | eng-practices
URL: https://google.github.io/eng-practices/review/reviewer/navigate.html
Version: Google Engineering Practices documentation (no edition date shown); fetched 2026-10-12
> Look at the most important part of the change first. Is it well-designed

> overall?

> Step One: Take a broad view of the change

> Step Two: Examine the main parts of the CL

> Sometimes it’s also helpful to read the tests

> first before you read the main code, because then you have an idea of what the

> change is supposed to be doing.

> If you see some major design problems with this part of the CL, you should send

> those comments immediately, even if you don’t have time to review the rest of

> the CL right now.

Contents:
- Three steps: broad view (does the change make sense, good description), the main parts first (send design problems at once), the rest in a sensible sequence (tests first can help).

## GitHub-hosted runners - GitHub Docs
URL: https://docs.github.com/en/actions/concepts/runners/github-hosted-runners
Version: GitHub Docs (en, current); no edition shown, fetched 2026-10-12
> With the exception of single-CPU runners, each GitHub-hosted runner is a new virtual machine (VM) hosted by GitHub.

> Each runner comes with the runner application and other tools preinstalled.

> The software tools included in our GitHub-owned images are updated weekly.

Contents:
- What a GitHub-hosted runner is (a new VM, except single-CPU runners in a container), the OS images, preinstalled software updated weekly and listed in each run's log, IP addresses, permissions.
