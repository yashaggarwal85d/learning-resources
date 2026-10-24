const NUM_ROWS: usize = 10_000;

// b and c round out the logical row the way a real wide row would, and are
// touched by the point update below; they are not read by the narrow scan.
#[derive(Clone, Copy)]
struct RowMajor {
    a: i64,
    b: i64,
    c: i64,
    d: i64,
}

struct ColumnMajorTable {
    a: Vec<i64>,
    b: Vec<i64>,
    c: Vec<i64>,
    d: Vec<i64>,
    // a packed bitmask, one bit per row, matching Arrow's own validity
    // bitmap convention: a set bit means the value at that row is valid.
    a_validity: Vec<u8>,
}

fn packed_bitmask_len(num_rows: usize) -> usize {
    num_rows.div_ceil(8)
}

fn set_bit(bitmap: &mut [u8], idx: usize, valid: bool) {
    let byte = idx / 8;
    let bit = idx % 8;
    if valid {
        bitmap[byte] |= 1 << bit;
    } else {
        bitmap[byte] &= !(1 << bit);
    }
}

fn is_valid(bitmap: &[u8], idx: usize) -> bool {
    let byte = idx / 8;
    let bit = idx % 8;
    (bitmap[byte] >> bit) & 1 == 1
}

fn build_row_major(n: usize) -> Vec<RowMajor> {
    (0..n)
        .map(|i| RowMajor {
            a: i as i64,
            b: (i * 2) as i64,
            c: (i * 3) as i64,
            d: (i * 4) as i64,
        })
        .collect()
}

fn build_column_major(n: usize) -> ColumnMajorTable {
    let mut a_validity = vec![0u8; packed_bitmask_len(n)];
    let mut a = Vec::with_capacity(n);
    let mut b = Vec::with_capacity(n);
    let mut c = Vec::with_capacity(n);
    let mut d = Vec::with_capacity(n);
    for i in 0..n {
        a.push(i as i64);
        b.push((i * 2) as i64);
        c.push((i * 3) as i64);
        d.push((i * 4) as i64);
        // every seventh row's own "a" value is absent, like a real sparse column.
        set_bit(&mut a_validity, i, i % 7 != 0);
    }
    ColumnMajorTable { a, b, c, d, a_validity }
}

// a narrow scan over column "a" alone. In the row-major layout, every row's
// full struct still has to be visited to reach that one field, since the
// other three columns sit in the identical contiguous region; the real
// bytes touched is the whole row, every row.
fn narrow_scan_row_major(rows: &[RowMajor]) -> (i64, usize) {
    let mut sum = 0i64;
    for r in rows {
        sum += r.a;
    }
    let bytes_touched = rows.len() * std::mem::size_of::<RowMajor>();
    (sum, bytes_touched)
}

// the identical scan in the column-major layout touches only column "a"'s
// own contiguous buffer, plus its own validity bitmap, and skips every row
// the bitmap marks absent.
fn narrow_scan_column_major(table: &ColumnMajorTable) -> (i64, usize, usize) {
    let mut sum = 0i64;
    let mut skipped = 0usize;
    for i in 0..table.a.len() {
        if is_valid(&table.a_validity, i) {
            sum += table.a[i];
        } else {
            skipped += 1;
        }
    }
    let bytes_touched = table.a.len() * std::mem::size_of::<i64>() + table.a_validity.len();
    (sum, bytes_touched, skipped)
}

// a wide-row update, writing every one of a logical row's four fields, in
// the row-major layout touches exactly one contiguous region (the whole
// row already sits together).
fn point_update_row_major(rows: &mut [RowMajor], idx: usize, new_d: i64) -> usize {
    let row = &mut rows[idx];
    row.a += 1;
    row.b += 1;
    row.c += 1;
    row.d = new_d;
    1
}

// the identical wide-row update, in the column-major layout, has its four
// fields scattered across four separate, non-adjacent buffers; writing
// every field of that one logical row means touching all four of them
// instead of one.
fn point_update_column_major(table: &mut ColumnMajorTable, idx: usize, new_d: i64) -> usize {
    table.a[idx] += 1;
    table.b[idx] += 1;
    table.c[idx] += 1;
    table.d[idx] = new_d;
    4
}

fn main() {
    let n = NUM_ROWS;
    let mut row_major = build_row_major(n);
    let mut col_major = build_column_major(n);

    let (row_sum, row_scan_bytes) = narrow_scan_row_major(&row_major);
    let (col_sum, col_scan_bytes, col_skipped) = narrow_scan_column_major(&col_major);

    let expected_null_count = (0..n).filter(|i| i % 7 == 0).count();
    let expected_col_sum: i64 = (0..n).filter(|i| i % 7 != 0).map(|i| i as i64).sum();

    let row_update_regions = point_update_row_major(&mut row_major, n / 2, 999);
    let col_update_regions = point_update_column_major(&mut col_major, n / 2, 999);

    let validity_bitmap_bytes = col_major.a_validity.len();
    let naive_per_row_bool_bytes = n;

    let narrow_scan_column_major_touches_far_fewer_bytes = col_scan_bytes * 3 < row_scan_bytes;
    let wide_row_update_touches_more_regions_in_column_major =
        col_update_regions > row_update_regions;
    let validity_bitmap_correctly_skips_nulled_rows =
        col_skipped == expected_null_count && col_sum == expected_col_sum;

    println!("row_sum {row_sum}");
    println!("col_sum {col_sum}");
    println!("expected_col_sum {expected_col_sum}");
    println!("row_scan_bytes {row_scan_bytes}");
    println!("col_scan_bytes {col_scan_bytes}");
    println!("col_skipped {col_skipped}");
    println!("expected_null_count {expected_null_count}");
    println!("row_update_regions {row_update_regions}");
    println!("col_update_regions {col_update_regions}");
    println!("validity_bitmap_bytes {validity_bitmap_bytes}");
    println!("naive_per_row_bool_bytes {naive_per_row_bool_bytes}");
    println!(
        "narrow_scan_column_major_touches_far_fewer_bytes {narrow_scan_column_major_touches_far_fewer_bytes}"
    );
    println!(
        "wide_row_update_touches_more_regions_in_column_major {wide_row_update_touches_more_regions_in_column_major}"
    );
    println!(
        "validity_bitmap_correctly_skips_nulled_rows {validity_bitmap_correctly_skips_nulled_rows}"
    );
}
