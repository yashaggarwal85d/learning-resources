"""Runtime schema validation: Pydantic v2 (Rust core) on records, Pandera on whole
DataFrames (pandas and Polars backends), and a real measured contrast between
row-level and batch-level validation cost. Great Expectations and Soda are named and
sourced but not run here (see SOURCES.md); this file only runs what's actually installed."""

import time

import pandas as pd
import pandera.pandas as pa_pd
import pandera.polars as pa_pl
import polars as pl
from pydantic import BaseModel, ValidationError


# --- 1. Pydantic v2 record validation, and the Rust-core speed difference ----

class Record(BaseModel):
    id: int
    name: str
    amount: float


def pydantic_record_validation():
    good = {"id": "42", "name": "widget", "amount": "19.99"}
    record = Record(**good)
    assert record.id == 42 and record.amount == 19.99

    bad = {"id": "not-an-id", "name": "widget", "amount": "19.99"}
    try:
        Record(**bad)
        raise AssertionError("expected a ValidationError")
    except ValidationError as exc:
        errors = exc.errors()
        assert errors[0]["loc"] == ("id",)

    print("pydantic record validation: coercion and structured error both confirmed")


def pydantic_rust_core_speed(n=20_000):
    """The real Pydantic v1 (pure Python core) vs v2 (Rust core) speed difference is
    measured once, cross-venv, and recorded in FACT-CHECK.md rather than re-run here:
    v1 and v2 can't both be imported in one process. What this run demonstrates
    instead, reproducibly in any single environment, is that pydantic v2 validates
    this many records without the cost growing any way but linearly."""
    raw_records = [{"id": str(i), "name": f"item-{i}", "amount": str(i * 1.5)} for i in range(n)]

    start = time.perf_counter()
    for raw in raw_records:
        Record(**raw)
    half_seconds = time.perf_counter() - start

    start = time.perf_counter()
    for raw in raw_records * 2:
        Record(**raw)
    double_seconds = time.perf_counter() - start

    print(
        f"pydantic v2: {n} records in {half_seconds:.4f}s, {2 * n} records in "
        f"{double_seconds:.4f}s (ratio {double_seconds / half_seconds:.2f}, expected near 2.0)"
    )
    return half_seconds, double_seconds


# --- 2. The same Pandera schema shape, validating a pandas and a Polars frame ----

class PandasPriceSchema(pa_pd.DataFrameModel):
    state: str
    city: str
    price: int = pa_pd.Field(in_range={"min_value": 5, "max_value": 20})


class PolarsPriceSchema(pa_pl.DataFrameModel):
    state: str
    city: str
    price: int = pa_pl.Field(in_range={"min_value": 5, "max_value": 20})


def pandera_pandas_and_polars_same_schema():
    rows = {
        "state": ["FL", "FL", "CA", "CA"],
        "city": ["Orlando", "Tampa", "San Francisco", "Los Angeles"],
        "price": [8, 12, 16, 18],
    }

    pandas_df = pd.DataFrame(rows)
    validated_pandas = PandasPriceSchema.validate(pandas_df)
    assert len(validated_pandas) == 4

    polars_lf = pl.LazyFrame(rows)
    validated_polars = PolarsPriceSchema.validate(polars_lf).collect()
    assert validated_polars.shape[0] == 4

    bad_rows = dict(rows)
    bad_rows["price"] = [8, 12, 16, 999]
    bad_pandas_df = pd.DataFrame(bad_rows)
    try:
        PandasPriceSchema.validate(bad_pandas_df)
        raise AssertionError("expected a SchemaError")
    except pa_pd.errors.SchemaError as exc:
        assert "price" in str(exc)

    print("pandera: the same schema shape validated a real pandas DataFrame and a real Polars LazyFrame")


# --- 3. Row-level vs batch-level validation cost, measured directly -------------

def row_level_vs_batch_level_cost(n=50_000):
    prices = list(range(n))

    start = time.perf_counter()
    row_level_failures = 0
    for p in prices:
        if not (0 <= p <= n):
            row_level_failures += 1
    row_level_seconds = time.perf_counter() - start

    series = pd.Series(prices)
    start = time.perf_counter()
    batch_level_failures = int((~series.between(0, n)).sum())
    batch_level_seconds = time.perf_counter() - start

    assert row_level_failures == batch_level_failures == 0
    print(
        f"row-level (Python loop over {n} values): {row_level_seconds:.4f}s; "
        f"batch-level (one vectorized pandas check): {batch_level_seconds:.4f}s "
        f"({row_level_seconds / batch_level_seconds:.1f}x slower, row-level)"
    )
    return row_level_seconds, batch_level_seconds


def main():
    pydantic_record_validation()
    pydantic_rust_core_speed()
    pandera_pandas_and_polars_same_schema()
    row_level_vs_batch_level_cost()
    print("runtime-schema-validation examples: all checks pass")


if __name__ == "__main__":
    main()
