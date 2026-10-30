## lakeFS documentation — Internals

URL: https://docs.lakefs.io/concepts/internals/

> Branches in lakeFS let users create their own isolated view of the repository. Changes on one branch do not appear on other branches, and users can take changes from one branch and apply them to another by merging them.

> Under the hood, a branch is simply a pointer to a commit along with a set of uncommitted changes. Creating a branch is a zero-copy operation: instead of duplicating data, lakeFS creates a pointer to the source commit for the branch.

> Tags give a meaningful name to a specific commit, letting users reference specific releases, experiments, or versions with a human-friendly name.

> lakeFS first finds the merge base, the nearest common ancestor of the two commits, and then performs a three-way merge by examining the presence and identity of files in each commit.

> Using commits, you can view a repository at a certain point in its history with a guarantee that the data you see is exactly as it was at the moment of committing. Commits are immutable "checkpoints" containing all the contents of a repository at a given point in its history.

## DVC documentation — Internal Files

URL: https://dvc.org/doc/user-guide/project-structure/internal-files

> The DVC cache is a content-addressable storage (by default in .dvc/cache),
> which adds a layer of indirection between code and data.

> DVC calculates the file hash, a 32 characters long string (usually MD5).

> Note that file hashes are calculated from file contents only. 2 or more files
> with different names but the same contents can exist in the workspace and be
> tracked by DVC, but only one copy is stored in the cache.

## MLflow documentation — MLflow 3.0 (Preview)

URL: https://mlflow.org/docs/3.0.1/mlflow-3

> We are introducing a new first-class object, the LoggedModel entity, into MLflow Tracking to streamline these processes.

> Similarly, every deep learning checkpoint is stored as a LoggedModel with its own metrics and parameters, simplifying the process of identifying the best checkpoint for deployment or continued training.

> Navigate to the Models tab of the experiment to view the newly created LoggedModel. Evaluation metrics, model ID, source run, parameters, and other details are displayed on the models detail page, providing a comprehensive overview of the model's performance and lineage.

> Pass name when logging a model. This allows you to later search for LoggedModels using this name, artifact_path parameter is deprecated.

## Apache Iceberg documentation — Branching and Tagging

URL: https://iceberg.apache.org/docs/latest/branching/

> Iceberg table metadata maintains a snapshot log, which represents the changes applied to a table.

> Iceberg supports branches and tags which are named references to snapshots with their own independent lifecycles.

> Branches are independent lineages of snapshots and point to the head of the lineage.

> Tags can be used for retaining important historical snapshots for auditing purposes.
