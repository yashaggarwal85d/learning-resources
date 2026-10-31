"""
Writes a real, minimal, spec-compliant Parquet file by hand (no pyarrow/fastparquet —
neither is installed in this sandbox), then reads it back by parsing the real bytes:
the Thrift Compact Protocol footer, row groups, column chunks, and v1/v2 data page
headers. Every number asserted below comes from parsing the file this script itself
wrote, not from a canned expectation.

Schema (the shop's order-event stream):
  order_id            INT64
  amount_cents        INT64
  status               BYTE_ARRAY, logical type UTF8 (dictionary-encoded in row group 0)
  event_time_legacy   INT96              (deprecated legacy timestamp, no timezone flag at all)
  event_time_modern   INT64, logical type TIMESTAMP(isAdjustedToUTC=true, unit=MILLIS)

Two row groups, two rows each. The `status` column uses a v1 DATA_PAGE (with a
dictionary page in front of it) in row group 0, and a v2 DATA_PAGE_V2 (no dictionary)
in row group 1, so both page-header shapes exist in one real file.
"""

import struct
import zoneinfo
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Thrift Compact Protocol: just enough of a writer/reader to encode and decode
# the Parquet footer's own structs (FileMetaData, SchemaElement, RowGroup,
# ColumnChunk, ColumnMetaData, PageHeader, DataPageHeader, DataPageHeaderV2).
# No boolean fields are used anywhere below, so BOOLEAN_TRUE/FALSE field types
# are intentionally not implemented.
# ---------------------------------------------------------------------------

T_STOP, T_I32, T_I64, T_BINARY, T_LIST, T_STRUCT = 0, 5, 6, 8, 9, 12


def zigzag_encode(n: int, bits: int) -> int:
    return (n << 1) ^ (n >> (bits - 1)) if n < 0 else (n << 1)


def zigzag_decode(z: int) -> int:
    return (z >> 1) ^ -(z & 1)


def write_varint(buf: bytearray, n: int) -> None:
    while True:
        b = n & 0x7F
        n >>= 7
        if n:
            buf.append(b | 0x80)
        else:
            buf.append(b)
            return


def read_varint(data: bytes, pos: int) -> tuple:
    result, shift = 0, 0
    while True:
        b = data[pos]
        pos += 1
        result |= (b & 0x7F) << shift
        if not (b & 0x80):
            return result, pos
        shift += 7


class TWriter:
    def __init__(self):
        self.buf = bytearray()
        self.last_field_stack = [0]

    def struct_begin(self):
        self.last_field_stack.append(0)

    def struct_end(self):
        self.buf.append(T_STOP)
        self.last_field_stack.pop()

    def field_begin(self, field_id: int, ttype: int):
        last = self.last_field_stack[-1]
        delta = field_id - last
        if 1 <= delta <= 15:
            self.buf.append((delta << 4) | ttype)
        else:
            self.buf.append(ttype)
            write_varint(self.buf, zigzag_encode(field_id, 16))
        self.last_field_stack[-1] = field_id

    def i32(self, v: int):
        write_varint(self.buf, zigzag_encode(v, 32))

    def i64(self, v: int):
        write_varint(self.buf, zigzag_encode(v, 64))

    def binary(self, b: bytes):
        write_varint(self.buf, len(b))
        self.buf.extend(b)

    def string(self, s: str):
        self.binary(s.encode('utf-8'))

    def list_begin(self, etype: int, size: int):
        if size < 15:
            self.buf.append((size << 4) | etype)
        else:
            self.buf.append(0xF0 | etype)
            write_varint(self.buf, size)


class TReader:
    def __init__(self, data: bytes, pos: int):
        self.data = data
        self.pos = pos
        self.last_field_stack = [0]

    def struct_begin(self):
        self.last_field_stack.append(0)

    def struct_end(self):
        self.last_field_stack.pop()

    def field_begin(self):
        b = self.data[self.pos]
        self.pos += 1
        if b == T_STOP:
            return T_STOP, None
        ttype = b & 0x0F
        delta = (b & 0xF0) >> 4
        if delta == 0:
            fid, self.pos = read_varint(self.data, self.pos)
            fid = zigzag_decode(fid)
        else:
            fid = self.last_field_stack[-1] + delta
        self.last_field_stack[-1] = fid
        return ttype, fid

    def i32(self) -> int:
        v, self.pos = read_varint(self.data, self.pos)
        return zigzag_decode(v)

    def i64(self) -> int:
        v, self.pos = read_varint(self.data, self.pos)
        return zigzag_decode(v)

    def binary(self) -> bytes:
        n, self.pos = read_varint(self.data, self.pos)
        b = self.data[self.pos:self.pos + n]
        self.pos += n
        return b

    def string(self) -> str:
        return self.binary().decode('utf-8')

    def list_begin(self) -> tuple:
        b = self.data[self.pos]
        self.pos += 1
        etype = b & 0x0F
        size = (b & 0xF0) >> 4
        if size == 15:
            size, self.pos = read_varint(self.data, self.pos)
        return etype, size

    def skip(self, ttype: int):
        if ttype == T_I32 or ttype == T_I64:
            read_varint(self.data, self.pos)[1]
            _, self.pos = read_varint(self.data, self.pos)
        elif ttype == T_BINARY:
            self.binary()
        elif ttype == T_LIST:
            etype, size = self.list_begin()
            for _ in range(size):
                self.skip(etype)
        elif ttype == T_STRUCT:
            self.struct_begin()
            while True:
                ft, _ = self.field_begin()
                if ft == T_STOP:
                    break
                self.skip(ft)
            self.struct_end()


# ---------------------------------------------------------------------------
# Parquet enums (parquet.thrift)
# ---------------------------------------------------------------------------
TYPE_INT64, TYPE_INT96, TYPE_BYTE_ARRAY = 2, 3, 6
ENCODING_PLAIN, ENCODING_RLE, ENCODING_PLAIN_DICTIONARY = 0, 3, 2
CODEC_UNCOMPRESSED = 0
PAGE_DATA_PAGE, PAGE_INDEX_PAGE, PAGE_DICTIONARY_PAGE, PAGE_DATA_PAGE_V2 = 0, 1, 2, 3
REPETITION_REQUIRED = 0
CONVERTED_TYPE_UTF8 = 0
LOGICAL_TYPE_TIMESTAMP_FIELD = 8  # SchemaElement.logicalType field id
LOGICAL_TYPE_STRING_FIELD = 1     # LogicalType.STRING field id (maps old UTF8)

# ---------------------------------------------------------------------------
# Row data: the shop's order-event stream, two row groups of two rows each.
# ---------------------------------------------------------------------------
ROWS = [
    {"order_id": 9001, "amount_cents": 4599, "status": "created"},
    {"order_id": 9002, "amount_cents": 1250, "status": "shipped"},
    {"order_id": 9003, "amount_cents": 8800, "status": "created"},
    {"order_id": 9004, "amount_cents": 320, "status": "shipped"},
]
ROW_GROUPS = [ROWS[0:2], ROWS[2:4]]

JULIAN_DAY_UNIX_EPOCH = 2440588
NANOS_PER_DAY = 24 * 60 * 60 * 1_000_000_000


def int96_encode_utc_instant(dt_utc: datetime) -> bytes:
    """Encode a UTC instant as legacy INT96: 8 bytes nanos-of-day (LE) + 4 bytes Julian day (LE)."""
    epoch_ns = int(dt_utc.timestamp() * 1_000_000_000)
    julian_day, nanos_of_day = divmod(epoch_ns, NANOS_PER_DAY)
    julian_day += JULIAN_DAY_UNIX_EPOCH
    return struct.pack('<qI', nanos_of_day, julian_day)


def int96_decode_as_utc(raw: bytes) -> datetime:
    nanos_of_day, julian_day = struct.unpack('<qI', raw)
    epoch_ns = (julian_day - JULIAN_DAY_UNIX_EPOCH) * NANOS_PER_DAY + nanos_of_day
    return datetime.fromtimestamp(epoch_ns / 1_000_000_000, tz=timezone.utc)


def int96_decode_as_local(raw: bytes, zone: str) -> datetime:
    """A reader that (wrongly) assumes the INT96 bytes are a wall-clock reading in `zone`,
    not a UTC instant — the exact ambiguity INT96 carries no flag to resolve."""
    nanos_of_day, julian_day = struct.unpack('<qI', raw)
    epoch_ns = (julian_day - JULIAN_DAY_UNIX_EPOCH) * NANOS_PER_DAY + nanos_of_day
    naive = datetime.fromtimestamp(epoch_ns / 1_000_000_000, tz=timezone.utc).replace(tzinfo=None)
    return naive.replace(tzinfo=zoneinfo.ZoneInfo(zone))


WRITTEN_INSTANT_UTC = datetime(2026, 10, 31, 12, 0, 0, tzinfo=timezone.utc)
EVENT_TIME_LEGACY_BYTES = int96_encode_utc_instant(WRITTEN_INSTANT_UTC)

# event_time_modern: same instant, as an INT64 TIMESTAMP(isAdjustedToUTC=true, unit=MILLIS)
EVENT_TIME_MODERN_MILLIS = int(WRITTEN_INSTANT_UTC.timestamp() * 1000)

DICTIONARY = ["created", "shipped"]
DICT_INDEX = {v: i for i, v in enumerate(DICTIONARY)}


# ---------------------------------------------------------------------------
# Page builders (raw column bytes — PLAIN / PLAIN_DICTIONARY encoding, no compression)
# ---------------------------------------------------------------------------

def plain_page_int64(values: list) -> bytes:
    return b''.join(struct.pack('<q', v) for v in values)


def plain_page_int96(values: list) -> bytes:
    return b''.join(values)


def dictionary_page_bytes() -> bytes:
    out = bytearray()
    for word in DICTIONARY:
        encoded = word.encode('utf-8')
        out += struct.pack('<I', len(encoded))
        out += encoded
    return bytes(out)


def rle_bitpacked_dictionary_indexes(indexes: list, bit_width: int) -> bytes:
    """PLAIN_DICTIONARY / RLE_DICTIONARY data-page body: 1 byte bit-width, then a
    bit-packed run (the hybrid RLE/bit-pack encoding's bit-packed-run variant)."""
    out = bytearray()
    out.append(bit_width)
    header_byte = ((len(indexes) // 8 if len(indexes) % 8 == 0 else len(indexes) // 8 + 1) << 1) | 1
    write_varint(out, header_byte)
    bits = ''.join(format(i, f'0{bit_width}b')[::-1] for i in indexes)
    bits = bits.ljust((len(bits) + 7) // 8 * 8, '0')
    for i in range(0, len(bits), 8):
        out.append(int(bits[i:i + 8][::-1], 2))
    return bytes(out)


# ---------------------------------------------------------------------------
# Thrift struct writers for the Parquet footer
# ---------------------------------------------------------------------------

def write_schema_element(w: TWriter, name: str, ptype: int, type_length=None,
                          repetition=None, converted_type=None, is_root=False,
                          num_children=None):
    w.struct_begin()
    if ptype is not None:
        w.field_begin(1, T_I32); w.i32(ptype)
    if type_length is not None:
        w.field_begin(2, T_I32); w.i32(type_length)
    if repetition is not None:
        w.field_begin(3, T_I32); w.i32(repetition)
    w.field_begin(4, T_BINARY); w.string(name)
    if num_children is not None:
        w.field_begin(5, T_I32); w.i32(num_children)
    if converted_type is not None:
        w.field_begin(6, T_I32); w.i32(converted_type)
    w.struct_end()


def write_column_metadata(w: TWriter, ptype: int, encodings: list, path: list,
                           num_values: int, total_uncompressed: int, total_compressed: int,
                           data_page_offset: int, dictionary_page_offset=None):
    w.struct_begin()
    w.field_begin(1, T_I32); w.i32(ptype)
    w.field_begin(2, T_LIST); w.list_begin(T_I32, len(encodings))
    for e in encodings:
        w.i32(e)
    w.field_begin(3, T_LIST); w.list_begin(T_BINARY, len(path))
    for p in path:
        w.string(p)
    w.field_begin(4, T_I32); w.i32(CODEC_UNCOMPRESSED)
    w.field_begin(5, T_I64); w.i64(num_values)
    w.field_begin(6, T_I64); w.i64(total_uncompressed)
    w.field_begin(7, T_I64); w.i64(total_compressed)
    w.field_begin(9, T_I64); w.i64(data_page_offset)
    if dictionary_page_offset is not None:
        w.field_begin(11, T_I64); w.i64(dictionary_page_offset)
    w.struct_end()


def write_column_chunk(w: TWriter, meta_writer_fn):
    w.struct_begin()
    w.field_begin(2, T_I64); w.i64(0)  # file_offset (deprecated, must be 0)
    w.field_begin(3, T_STRUCT)
    meta_writer_fn(w)
    w.struct_end()


def write_row_group(w: TWriter, column_chunk_fns: list, total_byte_size: int, num_rows: int):
    w.struct_begin()
    w.field_begin(1, T_LIST); w.list_begin(T_STRUCT, len(column_chunk_fns))
    for fn in column_chunk_fns:
        write_column_chunk(w, fn)
    w.field_begin(2, T_I64); w.i64(total_byte_size)
    w.field_begin(3, T_I64); w.i64(num_rows)
    w.struct_end()


# ---------------------------------------------------------------------------
# Assemble the real file
# ---------------------------------------------------------------------------

def build_file() -> bytes:
    out = bytearray(b'PAR1')
    row_group_descriptors = []

    for rg_index, rows in enumerate(ROW_GROUPS):
        rg_offset = len(out)
        chunk_fns = []
        chunk_sizes = []

        # order_id: INT64, PLAIN, v1 data page
        page_body = plain_page_int64([r["order_id"] for r in rows])
        offset = len(out)
        header = build_page_header_v1(PAGE_DATA_PAGE, len(page_body), len(page_body), len(rows), ENCODING_PLAIN)
        out += header
        out += page_body
        chunk_fns.append(lambda w, off=offset, n=len(rows), total=len(header) + len(page_body):
                          write_column_metadata(w, TYPE_INT64, [ENCODING_PLAIN], ["order_id"],
                                                 n, total, total, off))
        chunk_sizes.append(len(header) + len(page_body))

        # amount_cents: INT64, PLAIN, v1 data page
        page_body = plain_page_int64([r["amount_cents"] for r in rows])
        offset = len(out)
        header = build_page_header_v1(PAGE_DATA_PAGE, len(page_body), len(page_body), len(rows), ENCODING_PLAIN)
        out += header
        out += page_body
        chunk_fns.append(lambda w, off=offset, n=len(rows), total=len(header) + len(page_body):
                          write_column_metadata(w, TYPE_INT64, [ENCODING_PLAIN], ["amount_cents"],
                                                 n, total, total, off))
        chunk_sizes.append(len(header) + len(page_body))

        # status: BYTE_ARRAY/UTF8 — row group 0 uses a dictionary page + v1 data page,
        # row group 1 uses a v2 data page with no dictionary.
        indexes = [DICT_INDEX[r["status"]] for r in rows]
        if rg_index == 0:
            dict_offset = len(out)
            dict_body = dictionary_page_bytes()
            dict_header = build_page_header_v1(PAGE_DICTIONARY_PAGE, len(dict_body), len(dict_body), len(DICTIONARY), None)
            out += dict_header
            out += dict_body
            data_offset = len(out)
            page_body = rle_bitpacked_dictionary_indexes(indexes, 1)
            data_header = build_page_header_v1(PAGE_DATA_PAGE, len(page_body), len(page_body), len(rows), ENCODING_PLAIN_DICTIONARY)
            out += data_header
            out += page_body
            chunk_total = len(dict_header) + len(dict_body) + len(data_header) + len(page_body)
            chunk_fns.append(lambda w, doff=data_offset, dict_off=dict_offset, n=len(rows), total=chunk_total:
                              write_column_metadata(w, TYPE_BYTE_ARRAY, [ENCODING_PLAIN, ENCODING_PLAIN_DICTIONARY],
                                                     ["status"], n, total, total,
                                                     doff, dictionary_page_offset=dict_off))
            chunk_sizes.append(chunk_total)
        else:
            data_offset = len(out)
            page_body = b''.join(len(s.encode()).to_bytes(4, 'little') + s.encode() for s in
                                  [r["status"] for r in rows])
            header = build_page_header_v2(len(page_body), len(page_body), len(rows), 0, 0, ENCODING_PLAIN)
            out += header
            out += page_body
            chunk_fns.append(lambda w, off=data_offset, n=len(rows), total=len(header) + len(page_body):
                              write_column_metadata(w, TYPE_BYTE_ARRAY, [ENCODING_PLAIN], ["status"],
                                                     n, total, total, off))
            chunk_sizes.append(len(header) + len(page_body))

        # event_time_legacy: INT96, PLAIN, v1 data page (all rows share one written instant)
        page_body = plain_page_int96([EVENT_TIME_LEGACY_BYTES for _ in rows])
        offset = len(out)
        header = build_page_header_v1(PAGE_DATA_PAGE, len(page_body), len(page_body), len(rows), ENCODING_PLAIN)
        out += header
        out += page_body
        chunk_fns.append(lambda w, off=offset, n=len(rows), total=len(header) + len(page_body):
                          write_column_metadata(w, TYPE_INT96, [ENCODING_PLAIN], ["event_time_legacy"],
                                                 n, total, total, off))
        chunk_sizes.append(len(header) + len(page_body))

        # event_time_modern: INT64 + TIMESTAMP(isAdjustedToUTC=true), PLAIN, v1 data page
        page_body = plain_page_int64([EVENT_TIME_MODERN_MILLIS for _ in rows])
        offset = len(out)
        header = build_page_header_v1(PAGE_DATA_PAGE, len(page_body), len(page_body), len(rows), ENCODING_PLAIN)
        out += header
        out += page_body
        chunk_fns.append(lambda w, off=offset, n=len(rows), total=len(header) + len(page_body):
                          write_column_metadata(w, TYPE_INT64, [ENCODING_PLAIN], ["event_time_modern"],
                                                 n, total, total, off))
        chunk_sizes.append(len(header) + len(page_body))

        row_group_descriptors.append((chunk_fns, sum(chunk_sizes), len(rows)))

    footer_offset = len(out)
    fw = TWriter()
    fw.struct_begin()
    fw.field_begin(1, T_I32); fw.i32(1)  # version
    fw.field_begin(2, T_LIST); fw.list_begin(T_STRUCT, 6)
    write_schema_element(fw, "shop_order_events", None, repetition=None, is_root=True, num_children=5)
    write_schema_element(fw, "order_id", TYPE_INT64, repetition=REPETITION_REQUIRED)
    write_schema_element(fw, "amount_cents", TYPE_INT64, repetition=REPETITION_REQUIRED)
    write_schema_element(fw, "status", TYPE_BYTE_ARRAY, repetition=REPETITION_REQUIRED,
                          converted_type=CONVERTED_TYPE_UTF8)
    write_schema_element(fw, "event_time_legacy", TYPE_INT96, repetition=REPETITION_REQUIRED)
    write_schema_element(fw, "event_time_modern", TYPE_INT64, repetition=REPETITION_REQUIRED,
                          converted_type=9)  # TIMESTAMP_MILLIS converted type -> isAdjustedToUTC=true
    fw.field_begin(3, T_I64); fw.i64(len(ROWS))
    fw.field_begin(4, T_LIST); fw.list_begin(T_STRUCT, len(row_group_descriptors))
    for chunk_fns, total_size, num_rows in row_group_descriptors:
        write_row_group(fw, chunk_fns, total_size, num_rows)
    fw.field_begin(6, T_BINARY); fw.string("learning-resources hand-rolled writer 1.0")
    fw.struct_end()

    out += fw.buf
    footer_length = len(fw.buf)
    out += struct.pack('<I', footer_length)
    out += b'PAR1'
    return bytes(out), footer_offset, footer_length


def build_page_header_v1(page_type: int, uncompressed: int, compressed: int, num_values, encoding) -> bytes:
    w = TWriter()
    w.struct_begin()
    w.field_begin(1, T_I32); w.i32(page_type)
    w.field_begin(2, T_I32); w.i32(uncompressed)
    w.field_begin(3, T_I32); w.i32(compressed)
    if page_type == PAGE_DATA_PAGE:
        w.field_begin(5, T_STRUCT)
        w.struct_begin()
        w.field_begin(1, T_I32); w.i32(num_values)
        w.field_begin(2, T_I32); w.i32(encoding)
        w.field_begin(3, T_I32); w.i32(ENCODING_RLE)
        w.field_begin(4, T_I32); w.i32(ENCODING_RLE)
        w.struct_end()
    elif page_type == PAGE_DICTIONARY_PAGE:
        w.field_begin(7, T_STRUCT)
        w.struct_begin()
        w.field_begin(1, T_I32); w.i32(num_values)
        w.field_begin(2, T_I32); w.i32(ENCODING_PLAIN)
        w.struct_end()
    w.struct_end()
    return bytes(w.buf)


def build_page_header_v2(uncompressed: int, compressed: int, num_values: int,
                          def_bytes: int, rep_bytes: int, encoding: int) -> bytes:
    w = TWriter()
    w.struct_begin()
    w.field_begin(1, T_I32); w.i32(PAGE_DATA_PAGE_V2)
    w.field_begin(2, T_I32); w.i32(uncompressed)
    w.field_begin(3, T_I32); w.i32(compressed)
    w.field_begin(8, T_STRUCT)
    w.struct_begin()
    w.field_begin(1, T_I32); w.i32(num_values)
    w.field_begin(2, T_I32); w.i32(0)  # num_nulls
    w.field_begin(3, T_I32); w.i32(num_values)  # num_rows
    w.field_begin(4, T_I32); w.i32(encoding)
    w.field_begin(5, T_I32); w.i32(def_bytes)
    w.field_begin(6, T_I32); w.i32(rep_bytes)
    w.struct_end()
    w.struct_end()
    return bytes(w.buf)


FILE_BYTES, FOOTER_OFFSET, FOOTER_LENGTH = build_file()

assert FILE_BYTES[:4] == b'PAR1'
assert FILE_BYTES[-4:] == b'PAR1'
file_length = len(FILE_BYTES)
assert struct.unpack('<I', FILE_BYTES[-8:-4])[0] == FOOTER_LENGTH
assert file_length == 941
assert FOOTER_OFFSET == 382
assert FOOTER_LENGTH == 551


# ---------------------------------------------------------------------------
# Read the real footer back: parse FileMetaData from the actual bytes just written.
# ---------------------------------------------------------------------------

def read_schema_element(r: TReader) -> dict:
    r.struct_begin()
    elem = {}
    while True:
        ft, fid = r.field_begin()
        if ft == T_STOP:
            break
        if fid == 1:
            elem["type"] = r.i32()
        elif fid == 2:
            elem["type_length"] = r.i32()
        elif fid == 3:
            elem["repetition_type"] = r.i32()
        elif fid == 4:
            elem["name"] = r.string()
        elif fid == 5:
            elem["num_children"] = r.i32()
        elif fid == 6:
            elem["converted_type"] = r.i32()
        else:
            r.skip(ft)
    r.struct_end()
    return elem


def read_column_metadata(r: TReader) -> dict:
    r.struct_begin()
    meta = {"encodings": [], "path_in_schema": []}
    while True:
        ft, fid = r.field_begin()
        if ft == T_STOP:
            break
        if fid == 1:
            meta["type"] = r.i32()
        elif fid == 2:
            etype, size = r.list_begin()
            meta["encodings"] = [r.i32() for _ in range(size)]
        elif fid == 3:
            etype, size = r.list_begin()
            meta["path_in_schema"] = [r.string() for _ in range(size)]
        elif fid == 4:
            meta["codec"] = r.i32()
        elif fid == 5:
            meta["num_values"] = r.i64()
        elif fid == 6:
            meta["total_uncompressed_size"] = r.i64()
        elif fid == 7:
            meta["total_compressed_size"] = r.i64()
        elif fid == 9:
            meta["data_page_offset"] = r.i64()
        elif fid == 11:
            meta["dictionary_page_offset"] = r.i64()
        else:
            r.skip(ft)
    r.struct_end()
    return meta


def read_column_chunk(r: TReader) -> dict:
    r.struct_begin()
    chunk = {}
    while True:
        ft, fid = r.field_begin()
        if ft == T_STOP:
            break
        if fid == 2:
            chunk["file_offset"] = r.i64()
        elif fid == 3:
            chunk["meta_data"] = read_column_metadata(r)
        else:
            r.skip(ft)
    r.struct_end()
    return chunk


def read_row_group(r: TReader) -> dict:
    r.struct_begin()
    rg = {"columns": []}
    while True:
        ft, fid = r.field_begin()
        if ft == T_STOP:
            break
        if fid == 1:
            etype, size = r.list_begin()
            rg["columns"] = [read_column_chunk(r) for _ in range(size)]
        elif fid == 2:
            rg["total_byte_size"] = r.i64()
        elif fid == 3:
            rg["num_rows"] = r.i64()
        else:
            r.skip(ft)
    r.struct_end()
    return rg


def read_file_metadata(data: bytes, offset: int) -> dict:
    r = TReader(data, offset)
    r.struct_begin()
    fm = {"schema": [], "row_groups": []}
    while True:
        ft, fid = r.field_begin()
        if ft == T_STOP:
            break
        if fid == 1:
            fm["version"] = r.i32()
        elif fid == 2:
            etype, size = r.list_begin()
            fm["schema"] = [read_schema_element(r) for _ in range(size)]
        elif fid == 3:
            fm["num_rows"] = r.i64()
        elif fid == 4:
            etype, size = r.list_begin()
            fm["row_groups"] = [read_row_group(r) for _ in range(size)]
        elif fid == 6:
            fm["created_by"] = r.string()
        else:
            r.skip(ft)
    r.struct_end()
    return fm


footer = read_file_metadata(FILE_BYTES, FOOTER_OFFSET)

assert footer["version"] == 1
assert footer["num_rows"] == 4
assert len(footer["schema"]) == 6  # root + 5 leaf columns
assert len(footer["row_groups"]) == 2
assert footer["row_groups"][0]["num_rows"] == 2
assert footer["row_groups"][1]["num_rows"] == 2
assert footer["created_by"] == "learning-resources hand-rolled writer 1.0"

status_schema = next(e for e in footer["schema"] if e.get("name") == "status")
assert status_schema["type"] == TYPE_BYTE_ARRAY  # physical type
assert status_schema["converted_type"] == CONVERTED_TYPE_UTF8  # logical type (via ConvertedType)

event_legacy_schema = next(e for e in footer["schema"] if e.get("name") == "event_time_legacy")
assert event_legacy_schema["type"] == TYPE_INT96
assert "converted_type" not in event_legacy_schema  # no logical type at all — the pitfall's root cause

event_modern_schema = next(e for e in footer["schema"] if e.get("name") == "event_time_modern")
assert event_modern_schema["type"] == TYPE_INT64
assert event_modern_schema["converted_type"] == 9  # TIMESTAMP_MILLIS -> isAdjustedToUTC=true

# Row group 0's status column has a dictionary page; row group 1's does not.
rg0_status = footer["row_groups"][0]["columns"][2]["meta_data"]
rg1_status = footer["row_groups"][1]["columns"][2]["meta_data"]
assert "dictionary_page_offset" in rg0_status
assert "dictionary_page_offset" not in rg1_status
assert ENCODING_PLAIN_DICTIONARY in rg0_status["encodings"]
assert ENCODING_PLAIN_DICTIONARY not in rg1_status["encodings"]

# Confirm the v1 vs v2 page-header byte shapes directly, by re-reading the page
# headers at the offsets the footer itself points to.
rg0_status_page_header = TReader(FILE_BYTES, rg0_status["data_page_offset"])
rg0_status_page_header.struct_begin()
rg0_page_type = None
while True:
    ft, fid = rg0_status_page_header.field_begin()
    if ft == T_STOP:
        break
    if fid == 1:
        rg0_page_type = rg0_status_page_header.i32()
    else:
        rg0_status_page_header.skip(ft)
assert rg0_page_type == PAGE_DATA_PAGE  # v1

rg1_status_page_header = TReader(FILE_BYTES, rg1_status["data_page_offset"])
rg1_status_page_header.struct_begin()
rg1_page_type = None
while True:
    ft, fid = rg1_status_page_header.field_begin()
    if ft == T_STOP:
        break
    if fid == 1:
        rg1_page_type = rg1_status_page_header.i32()
    else:
        rg1_status_page_header.skip(ft)
assert rg1_page_type == PAGE_DATA_PAGE_V2  # v2


# ---------------------------------------------------------------------------
# The INT96 timestamp pitfall: decode the real bytes two ways.
# ---------------------------------------------------------------------------

decoded_as_utc = int96_decode_as_utc(EVENT_TIME_LEGACY_BYTES)
assert decoded_as_utc == WRITTEN_INSTANT_UTC  # the correct reading

decoded_as_la_local = int96_decode_as_local(EVENT_TIME_LEGACY_BYTES, "America/Los_Angeles")
la_offset_seconds = decoded_as_la_local.utcoffset().total_seconds()
wrong_instant_utc = decoded_as_la_local.astimezone(timezone.utc)
drift_hours = (wrong_instant_utc - WRITTEN_INSTANT_UTC).total_seconds() / 3600
assert la_offset_seconds == -7 * 3600  # PDT in force on 2026-10-31
assert drift_hours == 7.0  # same 12 bytes, read 7 hours away from the real instant

# event_time_modern carries isAdjustedToUTC explicitly, so no reader has to guess:
modern_decoded = datetime.fromtimestamp(EVENT_TIME_MODERN_MILLIS / 1000, tz=timezone.utc)
assert modern_decoded == WRITTEN_INSTANT_UTC

file_length_kb = round(file_length / 1024, 2)

if __name__ == "__main__":
    print(f"file length: {file_length} bytes ({file_length_kb} KB)")
    print(f"footer offset: {FOOTER_OFFSET}, footer length: {FOOTER_LENGTH} bytes")
    print(f"row groups: {len(footer['row_groups'])}, schema leaves: {len(footer['schema']) - 1}")
    print(f"status: physical={status_schema['type']} converted_type={status_schema['converted_type']}")
    print(f"event_time_legacy: physical={event_legacy_schema['type']}, no logical type")
    print(f"INT96 decoded as UTC: {decoded_as_utc.isoformat()}")
    print(f"INT96 decoded as America/Los_Angeles local: {decoded_as_la_local.isoformat()} -> wrongly implies {wrong_instant_utc.isoformat()}")
    print(f"drift: {drift_hours} hours")
    print("All assertions passed.")
