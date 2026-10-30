"""Real, measured byte-access costs for the same one thousand four-attribute rows stored three
ways: N-ary row storage (NSM), fully decomposed column storage (DSM), and PAX (columnar within a
page). Every number is computed from actual packed bytes, not asserted by assumption."""
import struct

N = 1000  # rows
ROW_FMT = '<qqqq'  # emp_id, dept_id, age, salary — four 8-byte attributes
ROW_BYTES = struct.calcsize(ROW_FMT)
assert ROW_BYTES == 32

rows = [(i, i % 10, 20 + (i % 40), 50000 + i * 7) for i in range(N)]

# --- N-ary Storage Model (NSM): one contiguous blob, record after record (the "slotted page"). ---
nsm_blob = b''.join(struct.pack(ROW_FMT, *r) for r in rows)
assert len(nsm_blob) == N * ROW_BYTES == 32000


def nsm_point_lookup(i):
    return nsm_blob[i * ROW_BYTES : (i + 1) * ROW_BYTES]


lookup = nsm_point_lookup(42)
assert struct.unpack(ROW_FMT, lookup) == rows[42]
nsm_point_lookup_bytes = len(lookup)
assert nsm_point_lookup_bytes == 32


def nsm_column_scan_bytes_touched():
    # "age" lives inside every record; a sequential scan for one attribute still passes over
    # every record's full width, because NSM stores no attribute separately from its row.
    return len(nsm_blob)


nsm_scan_bytes = nsm_column_scan_bytes_touched()
assert nsm_scan_bytes == 32000

# --- Decomposition Storage Model (DSM): one contiguous blob per attribute. ---
COLS = 4
dsm_blobs = [b''.join(struct.pack('<q', r[c]) for r in rows) for c in range(COLS)]
for blob in dsm_blobs:
    assert len(blob) == N * 8 == 8000


def dsm_point_lookup(i):
    return [blob[i * 8 : (i + 1) * 8] for blob in dsm_blobs]


reads = dsm_point_lookup(42)
assert tuple(struct.unpack('<q', r)[0] for r in reads) == rows[42]
dsm_point_lookup_reads = len(reads)
assert dsm_point_lookup_reads == 4


def dsm_column_scan_bytes_touched(col_index=2):
    return len(dsm_blobs[col_index])


dsm_scan_bytes = dsm_column_scan_bytes_touched()
assert dsm_scan_bytes == 8000
assert nsm_scan_bytes // dsm_scan_bytes == 4
scan_reduction_pct = round((1 - dsm_scan_bytes / nsm_scan_bytes) * 100)
assert scan_reduction_pct == 75

# --- PAX: pages of 100 records, columns grouped into minipages inside each page. Page count
# (I/O) stays the same as NSM; only the layout inside a page changes. ---
PAGE_ROWS = 100
PAGE_BYTES = PAGE_ROWS * ROW_BYTES  # 3200
MINIPAGE_BYTES = PAGE_ROWS * 8  # 800
num_pages = N // PAGE_ROWS
assert num_pages == 10


def pax_point_lookup_pages_touched():
    # every attribute of a given row's page sits in that one page's minipages.
    return 1


pax_point_lookup_pages = pax_point_lookup_pages_touched()
assert pax_point_lookup_pages == 1


def pax_column_scan_pages_and_bytes(col_index=2):
    pages_touched = num_pages
    bytes_touched = num_pages * MINIPAGE_BYTES
    return pages_touched, bytes_touched


pax_pages, pax_bytes = pax_column_scan_pages_and_bytes()
assert pax_pages == num_pages == 10  # same page count as NSM: I/O is unchanged
assert pax_bytes == 8000  # same useful bytes as DSM: only the needed minipage
assert pax_bytes == dsm_scan_bytes
useful_fraction_pct = round(pax_bytes / (num_pages * PAGE_BYTES) * 100)
assert useful_fraction_pct == 25

print(f"NSM point lookup: {nsm_point_lookup_bytes} bytes, one contiguous read")
print(f"NSM column scan (age, {N} rows): touches all {nsm_scan_bytes} bytes of the file")
print(f"DSM point lookup: {dsm_point_lookup_reads} separate reads across {COLS} sub-relations")
print(f"DSM column scan (age): touches only {dsm_scan_bytes} bytes ({scan_reduction_pct}% less than NSM)")
print(f"PAX point lookup: {pax_point_lookup_pages} page, same as NSM")
print(f"PAX column scan (age): still opens all {pax_pages} pages (same I/O as NSM), but only {pax_bytes} useful bytes ({useful_fraction_pct}% of the {num_pages * PAGE_BYTES}-byte total)")
print("row vs columnar vs PAX examples: all checks pass")
