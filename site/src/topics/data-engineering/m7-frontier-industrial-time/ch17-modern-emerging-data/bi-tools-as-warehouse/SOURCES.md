## Google Cloud Looker documentation — Introduction to LookML

URL: https://docs.cloud.google.com/looker/docs/what-is-lookml

> LookML, short for Looker Modeling Language, is the language that is used in Looker to create semantic data models. You can use LookML to describe dimensions, aggregates, calculations, and data relationships in your SQL database. Looker uses a model that is written in LookML to construct SQL queries against a particular database.

> LookML is a dependency language like make, as opposed to an imperative language like C or Ruby. LookML provides predefined data types and syntax for data modeling. You don't need prior experience with programming languages to understand LookML. LookML is independent of particular SQL dialects, and it encapsulates SQL expressions to support any SQL implementation.

## Microsoft Fabric documentation — Direct Lake overview

URL: https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview

> Direct Lake is a Power BI semantic model table storage mode option available in Microsoft Fabric. It's optimized for large volumes of data to be quickly loaded into memory from Delta tables available in the OneLake—the single store for all analytics data. Once loaded into memory, the semantic model enables high-performance interactive analysis.

> However, Direct Lake differs from Import mode in an important way: a refresh operation for a Direct Lake semantic model is conceptually different from a refresh operation for an Import semantic model. Import mode replicates the data and creates an entire cached copy of the data for the semantic model, whereas a Direct Lake refresh copies only metadata (known as framing, described later in this article), which can take a few seconds to complete.

> Direct Lake on SQL analytics endpoints fall back to DirectQuery table storage mode when they can't load the data directly from a Delta table, such as when the data source is a SQL view or when the warehouse uses SQL-based granular access control.

> For details on how Direct Lake works, including column loading (transcoding), framing, automatic updates, and DirectQuery fallback, see How Direct Lake works.

> Direct Lake semantic models require a Fabric capacity license. Also, there are capacity guardrails and limitations that apply to your Fabric capacity subscription (SKU), as presented in the following table.

## Apache Superset documentation — Welcome

URL: https://superset.apache.org/

> Apache Superset™ is an open-source modern data exploration and visualization platform.

> Superset can connect to any SQL-based databases including modern cloud-native databases and engines at petabyte scale.

## Tableau Help — Tutorial: Get Started with Tableau Desktop

URL: https://help.tableau.com/current/guides/get-started-tutorial/en-us/get-started-tutorial-home.htm

(www.tableau.com returned HTTP 403 domain-wide to this sandbox's fetcher on every marketing-site URL tried; help.tableau.com, Tableau's own documentation subdomain, fetched cleanly.)

> You'll use Tableau Desktop to build a simple view of your product data, map product sales and profitability by region, build a dashboard of your findings, and then create a story to present.

> Share your findings with your organization on Tableau Server or Tableau Cloud, or share them with the world on Tableau Public.

## Metabase Learn — A tour of Metabase

URL: https://www.metabase.com/learn/metabase-basics/overview/tour-of-metabase

> Metabase is an open-source business intelligence tool that you can connect to many popular databases. Metabase lets you ask questions about your data, and displays answers in formats that make sense, whether that's a bar chart or a detailed table.

> Metabase is open source, so if Metabase lacks a feature you need, you can always build it yourself. Check out our releases to see the features we've added recently, and the roadmap for what we're working on next.
