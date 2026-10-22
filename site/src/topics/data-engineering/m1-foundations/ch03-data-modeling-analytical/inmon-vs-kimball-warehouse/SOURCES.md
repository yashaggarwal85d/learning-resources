# Sources — Inmon vs Kimball warehouse philosophies

Fetched: 2026-10-22.

## Wikipedia, "Bill Inmon"
URL: https://en.wikipedia.org/wiki/Bill_Inmon

> Inmon created the accepted definition of what a data warehouse is - a subject-oriented, non-volatile, integrated, time-variant collection of data in support of management's decisions.

> Compared with the approach of the other pioneering architect of data warehousing, Ralph Kimball, Inmon's approach is often characterized as a top-down approach.

## Wikipedia, "Dimensional modeling"
URL: https://en.wikipedia.org/wiki/Dimensional_modeling

> Dimensional modeling is part of the Business Dimensional Lifecycle methodology developed by Ralph Kimball which includes a set of methods, techniques and concepts for use in data warehouse design.

> The approach focuses on identifying the key business processes within a business and modelling and implementing these first before adding additional business processes, as a bottom-up approach.

> An alternative approach from Inmon advocates a top down design of the model of all the enterprise data using tools such as entity-relationship modeling (ER).

> Because the different business process areas share some but not all dimensions, efficiency in design, operation, and consistency, is achieved using conformed dimensions, i.e. using one copy of the shared dimension across subject areas.

## Kimball Group, "Enterprise Data Warehouse Bus Architecture"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/enterprise-data-warehouse-bus-architecture/

> The enterprise data warehouse bus architecture provides an incremental approach to building the enterprise DW/BI system.

> This architecture decomposes the DW/ BI planning process into manageable pieces by focusing on business processes, while delivering integration via standardized conformed dimensions that are reused across processes.

> The bus architecture is technology and database platform independent; both relational and OLAP dimensional structures can participate.

## Fivetran, "ETL vs. ELT: Why a post-load process wins every time"
URL: https://www.fivetran.com/blog/etl-vs-elt-why-a-post-load-process-wins-every-time

> Historically, the ETL process (Extract-Transform-Load) made the most sense for data transformation because the cost of computation storage and bandwidth were both high – and transforming your data before loading it into the data warehouse would reduce both. However, in the last decade, cloud data warehouses, such as Snowflake, Amazon Redshift, and Google BigQuery, have become ubiquitous, driving down storage costs and increasing processing power exponentially.

> This has made it much less of a concern to store raw data in the data warehouse – and opened up the potential for a different way of transforming data post-load, rather than pre-load.
