# Sources

## Defining assets

URL: https://docs.dagster.io/guides/build/assets/defining-assets
Version: Dagster Docs (1.13.28)

> The most common way to create a data asset in Dagster is by annotating a Python function with an @dg.asset decorator. The function computes the contents of the asset, such as a database table or file.

> An asset definition includes the following:

> An AssetKey, which is a handle for referring to the asset.

> A set of upstream asset keys, which refer to assets that the contents of the asset definition are derived from.

> A Python function, which is responsible for computing the contents of the asset from its upstream dependencies and storing the results.

> Dagster has four types of asset decorators:

> @asset
> Defines a single asset. See an example.

> @multi_asset
> Outputs multiple assets from a single operation. See an example.

## Testing assets with asset checks

URL: https://docs.dagster.io/guides/test/asset-checks
Version: Dagster Docs (1.13.28)

> Asset checks are tests that verify specific properties of your data assets, allowing you to execute data quality checks on your data.

> Each asset check should test only a single asset property to keep tests uncomplicated, reusable, and easy to track over time.

> Define an asset check: Asset checks are typically defined using the @asset_check or @multi_asset_check decorator and run either within an asset or separate from the asset.

> Pass the asset checks to the Definitions object: Asset checks must be added to Definitions for Dagster to recognize them.

> Choose how to execute asset checks: By default, all jobs targeting an asset will also run associated checks, although you can run asset checks through the Dagster UI.

> The following example defines an asset check on an asset that fails if the order_id column of the asset contains a null value. The asset check will run after the asset has been materialized.

## Changelog

URL: https://docs.dagster.io/about/changelog
Version: Dagster Docs (1.13.28)

> Components GA: The Components framework and the dg CLI are now marked as GA (previously Release Candidate). The APIs are fully supported throughout all parts of the product and remain the recommended defaults for new Dagster projects.

> FreshnessPolicies GA: The new FreshnessPolicy API introduced in 1.10.0 has stabilized and is now marked as GA (previously Preview). These supersede the LegacyFreshnessPolicy API (formerly FreshnessPolicy, deprecated in 1.10.0), as well as freshness checks.
