import csv
import io
import json


def csv_unquoted_comma_breaks_naive_split():
    """RFC 4180 §2 rule 6: a field containing a comma must be quoted. A naive reader that just
    splits on "," instead of parsing quotes gets the wrong number of columns; a real csv.reader
    (which does parse quoting) gets the right one."""
    row = '"Smith, John",42,Mumbai'
    naive_fields = row.split(",")
    real_fields = next(csv.reader(io.StringIO(row)))
    assert len(naive_fields) == 4, f"expected the naive split to produce 4 wrong fields, got {len(naive_fields)}"
    assert real_fields == ["Smith, John", "42", "Mumbai"], f"expected 3 correct fields, got {real_fields}"
    print(f"CSV quoting: naive split(',') sees {len(naive_fields)} fields {naive_fields}; a real CSV parser sees {len(real_fields)} {real_fields}")
    return naive_fields, real_fields


def csv_embedded_quote_needs_doubling():
    """RFC 4180 §2 rule 7: a double-quote inside a quoted field is escaped by doubling it, never
    by a backslash. A field written with a backslash escape is read back wrong; the doubled form
    round-trips correctly."""
    wrong = '"O\\"Brien",7'
    wrong_fields = next(csv.reader(io.StringIO(wrong)))
    correct = '"O""Brien",7'
    correct_fields = next(csv.reader(io.StringIO(correct)))
    assert wrong_fields[0] != "O\"Brien", f"expected the backslash-escaped form to read back wrong, got {wrong_fields[0]!r}"
    assert correct_fields[0] == 'O"Brien', f"expected the doubled-quote form to read back correctly, got {correct_fields[0]!r}"
    print(f"CSV quote escaping: a backslash escape reads back as {wrong_fields[0]!r}; RFC 4180's doubled quote reads back as {correct_fields[0]!r}")
    return wrong_fields[0], correct_fields[0]


def csv_embedded_newline_breaks_naive_line_reader():
    """RFC 4180 §2 rule 6: a field containing a line break must be quoted, and that line break is
    legal data, not a record separator. A reader that naively splits the file on "\\n" counts too
    many records; a real csv.reader counts the correct two."""
    data = '"123 Main St\nApt 4",Chicago\n"1 Elm St",Boston\n'
    naive_record_count = len([ln for ln in data.split("\n") if ln.strip()])
    real_rows = list(csv.reader(io.StringIO(data)))
    assert naive_record_count == 3, f"expected the naive line-split to see 3 wrong records, got {naive_record_count}"
    assert len(real_rows) == 2, f"expected the real parser to see 2 records, got {len(real_rows)}"
    assert real_rows[0][0] == "123 Main St\nApt 4", f"expected the embedded newline preserved inside the field, got {real_rows[0][0]!r}"
    print(f"CSV embedded newlines: naive line-split sees {naive_record_count} wrong records; a real CSV parser sees {len(real_rows)} correct records")
    return naive_record_count, len(real_rows)


def json_number_precision_loss():
    """RFC 8259 §6: an integer outside +/-(2**53 - 1) is not guaranteed to round-trip once a
    double-precision (IEEE 754 binary64) parser is involved. Python's own json module keeps
    integers exact (arbitrary precision), so the loss is reproduced directly by parsing the same
    JSON number as a double, exactly as a double-precision-only JSON implementation would."""
    big_id = 9007199254740993  # 2**53 + 1: the smallest positive integer a double can't represent exactly
    payload = json.dumps({"order_id": big_id})

    exact = json.loads(payload)["order_id"]
    assert exact == big_id, f"expected Python's own arbitrary-precision json to keep {big_id} exact, got {exact}"

    as_double = float(json.loads(payload, parse_int=float)["order_id"])
    assert as_double != big_id, f"expected the double-precision parse to lose precision on {big_id}, got an exact match"
    assert int(as_double) == big_id - 1, f"expected the double to round to {big_id - 1}, got {int(as_double)}"

    print(f"JSON number precision: order_id {big_id} survives Python's exact parser, but a double-precision parser silently returns {int(as_double)}")
    return big_id, int(as_double)


def json_leading_bom_breaks_the_parser():
    """The Unicode BOM FAQ: U+FEFF at the start of a UTF-8 stream is a signature with no byte-order
    meaning, but a JSON parser that doesn't strip it sees an unexpected character before the
    opening brace. jsonlines.org makes the same point for JSONL: a BOM "must NOT be included"."""
    body = b'{"status": "ok"}'
    with_bom = b"\xef\xbb\xbf" + body

    text_with_bom = with_bom.decode("utf-8")
    try:
        json.loads(text_with_bom)
        raised = False
    except json.JSONDecodeError:
        raised = True
    assert raised, "expected a leading BOM to break json.loads on the raw decoded text"

    stripped = text_with_bom.lstrip("﻿")
    fixed = json.loads(stripped)
    assert fixed == {"status": "ok"}, f"expected the BOM-stripped text to parse correctly, got {fixed}"

    print(f"JSON + BOM: the raw UTF-8-with-BOM text fails to parse ({raised}); stripping U+FEFF first parses to {fixed}")
    return raised, fixed


def main():
    csv_unquoted_comma_breaks_naive_split()
    csv_embedded_quote_needs_doubling()
    csv_embedded_newline_breaks_naive_line_reader()
    json_number_precision_loss()
    json_leading_bom_breaks_the_parser()
    print("text-interchange-formats-their examples: all checks pass")


if __name__ == "__main__":
    main()
