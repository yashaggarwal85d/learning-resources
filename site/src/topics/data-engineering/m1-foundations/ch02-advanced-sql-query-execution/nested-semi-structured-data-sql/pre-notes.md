- **Scalar column**: a column holding one atomic value per row, such as an integer or a short string. *Where you meet it:* nearly every column in a classic schema.
- **JSON**: a text format for nested data made of objects (key-value pairs), arrays and scalars. *Where you meet it:* the body of almost every web API.
- **Cartesian product**: every row of one input paired with every row of another. *Where you meet it:* a join with a missing condition returns one.
- **Columnar file format**: a file layout that stores each column's values together, often with min and max statistics per block. *Where you meet it:* Parquet.
- **Set-returning function**: a function that returns rows, usable in `FROM`. *Where you meet it:* `generate_series` or `unnest` in PostgreSQL.

**Check yourself:** two tables of 3 rows each are joined with no condition. How many rows result? (Answer: 9, the Cartesian product.)
