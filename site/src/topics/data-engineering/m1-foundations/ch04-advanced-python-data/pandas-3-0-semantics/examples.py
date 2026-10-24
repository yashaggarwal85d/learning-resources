# Every claim in this topic measured directly on this sandbox's installed pandas 3.0.5 and
# pyarrow 26.0.0: the default string dtype and its NaN sentinel, contrasted against the older,
# still-present opt-in string[pyarrow] dtype's pd.NA sentinel (different dtype name, different
# sentinel); NumPy-backed Int64 vs. Arrow-backed int64[pyarrow], which share the identical pd.NA
# sentinel; the lazy copy-on-write mechanism (views reused until a mutation forces a copy);
# chained assignment's real replacement warning (pd.errors.ChainedAssignmentError, a Warning
# subclass, not named in the pandas 3.0 whatsnew prose and disclosed here as a direct sandbox
# observation); microsecond-resolution datetime inference; and the pandas 2.3 migration flags'
# real, measured asymmetry on this 3.0.5 install.

import warnings

import numpy as np
import pandas as pd


def default_string_dtype():
    series = pd.Series(["a", "b", "c"])
    assert str(series.dtype) == "str"
    return {"dtype": str(series.dtype)}


def missing_value_sentinel_contrast():
    default_str = pd.Series(["a", "b", None])
    nullable_arrow_str = pd.Series(["a", "b", None], dtype="string[pyarrow]")

    default_dtype_name = str(default_str.dtype)
    nullable_dtype_name = str(nullable_arrow_str.dtype)
    assert default_dtype_name == "str"
    assert nullable_dtype_name == "string"
    assert pd.isna(default_str.iloc[2])
    assert pd.isna(nullable_arrow_str.iloc[2])

    default_sentinel_repr = repr(default_str.iloc[2])
    nullable_sentinel_repr = repr(nullable_arrow_str.iloc[2])
    assert default_sentinel_repr != nullable_sentinel_repr
    assert default_sentinel_repr == "nan"
    assert nullable_sentinel_repr == "<NA>"

    return {
        "default_dtype_name": default_dtype_name,
        "nullable_dtype_name": nullable_dtype_name,
        "default_str_sentinel_repr": default_sentinel_repr,
        "nullable_arrow_str_sentinel_repr": nullable_sentinel_repr,
    }


def numpy_vs_arrow_nullable_numeric_sentinel():
    numpy_backed = pd.array([1, 2, None], dtype="Int64")
    arrow_backed = pd.array([1, 2, None], dtype="int64[pyarrow]")

    numpy_sentinel_repr = repr(numpy_backed[2])
    arrow_sentinel_repr = repr(arrow_backed[2])
    assert numpy_sentinel_repr == arrow_sentinel_repr == "<NA>"

    return {
        "numpy_backed_dtype": str(numpy_backed.dtype),
        "arrow_backed_dtype": str(arrow_backed.dtype),
        "numpy_backed_sentinel_repr": numpy_sentinel_repr,
        "arrow_backed_sentinel_repr": arrow_sentinel_repr,
    }


def copy_on_write_lazy_view():
    df = pd.DataFrame({"a": [1, 2, 3]})
    subset = df["a"]

    shares_before = np.shares_memory(df["a"].to_numpy(), subset.to_numpy())
    assert shares_before

    subset_after_mutation = df["a"]
    subset_after_mutation.iloc[0] = 999
    original_unchanged = df["a"].tolist() == [1, 2, 3]
    assert original_unchanged
    assert subset_after_mutation.tolist() == [999, 2, 3]

    return {
        "shares_memory_before_mutation": shares_before,
        "original_unchanged_after_subset_mutation": original_unchanged,
    }


def chained_assignment_warns():
    df = pd.DataFrame({"a": [1, 2, 3], "b": [4, 5, 6]})
    before = df["b"].tolist()

    caught = []
    with warnings.catch_warnings(record=True) as caught_warnings:
        warnings.simplefilter("always")
        df[df["a"] > 1]["b"] = 99
        caught = [w.category.__name__ for w in caught_warnings]

    after = df["b"].tolist()
    assert "ChainedAssignmentError" in caught
    assert issubclass(pd.errors.ChainedAssignmentError, Warning)
    assert before == after

    return {
        "warning_categories_seen": caught,
        "is_warning_subclass": issubclass(pd.errors.ChainedAssignmentError, Warning),
        "original_unchanged": before == after,
    }


def copy_on_write_option_deprecated():
    with warnings.catch_warnings(record=True) as caught_warnings:
        warnings.simplefilter("always")
        pd.options.mode.copy_on_write = "warn"
        categories = [w.category.__name__ for w in caught_warnings]

    assert "Pandas4Warning" in categories

    with warnings.catch_warnings(record=True) as caught_warnings_2:
        warnings.simplefilter("always")
        pd.options.future.infer_string = True
        categories_2 = [w.category.__name__ for w in caught_warnings_2]

    assert categories_2 == []

    return {
        "mode_copy_on_write_warns": categories,
        "future_infer_string_warns": categories_2,
    }


def microsecond_datetime_inference():
    from_string = pd.to_datetime(["2024-03-22 11:36"])
    from_int_seconds = pd.to_datetime([0], unit="s")

    assert str(from_string.dtype) == "datetime64[us]"
    assert str(from_int_seconds.dtype) == "datetime64[s]"

    return {
        "parsed_string_dtype": str(from_string.dtype),
        "parsed_int_seconds_dtype": str(from_int_seconds.dtype),
    }


if __name__ == "__main__":
    results = {
        "default_string_dtype": default_string_dtype(),
        "missing_value_sentinel_contrast": missing_value_sentinel_contrast(),
        "numpy_vs_arrow_nullable_numeric_sentinel": numpy_vs_arrow_nullable_numeric_sentinel(),
        "copy_on_write_lazy_view": copy_on_write_lazy_view(),
        "chained_assignment_warns": chained_assignment_warns(),
        "copy_on_write_option_deprecated": copy_on_write_option_deprecated(),
        "microsecond_datetime_inference": microsecond_datetime_inference(),
    }
    for name, result in results.items():
        print(name, "->", result)
    print("pandas-3-0-semantics examples: all numbers check out")
