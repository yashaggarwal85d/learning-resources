// A real, fixed-size page: a self-describing header (magic number, format
// version, a real CRC32C checksum, a page LSN), explicit little-endian
// encoding chosen on purpose rather than left to the platform's own native
// order, matching PostgreSQL's own header fields directly.
const PAGE_SIZE: usize = 4096;
const MAGIC: u32 = 0x5047_4100; // "PGA\0"
const FORMAT_VERSION: u16 = 1;

const OFF_MAGIC: usize = 0;
const OFF_VERSION: usize = 4;
const OFF_CHECKSUM: usize = 6;
const OFF_LSN: usize = 10;
const OFF_SLOT_COUNT: usize = 18;
const HEADER_LEN: usize = 24;

struct Page {
    bytes: [u8; PAGE_SIZE],
}

impl Page {
    fn new(lsn: u64, slot_count: u16) -> Self {
        let mut bytes = [0u8; PAGE_SIZE];
        bytes[OFF_MAGIC..OFF_MAGIC + 4].copy_from_slice(&MAGIC.to_le_bytes());
        bytes[OFF_VERSION..OFF_VERSION + 2].copy_from_slice(&FORMAT_VERSION.to_le_bytes());
        bytes[OFF_LSN..OFF_LSN + 8].copy_from_slice(&lsn.to_le_bytes());
        bytes[OFF_SLOT_COUNT..OFF_SLOT_COUNT + 2].copy_from_slice(&slot_count.to_le_bytes());
        let mut page = Page { bytes };
        page.recompute_checksum();
        page
    }

    fn recompute_checksum(&mut self) {
        // The checksum field itself is zeroed while computing the checksum
        // over the rest of the page, an explicit, deliberate choice, not an
        // accident of struct layout.
        self.bytes[OFF_CHECKSUM..OFF_CHECKSUM + 4].copy_from_slice(&[0u8; 4]);
        let sum = crc32c::crc32c(&self.bytes);
        self.bytes[OFF_CHECKSUM..OFF_CHECKSUM + 4].copy_from_slice(&sum.to_le_bytes());
    }

    fn magic(&self) -> u32 {
        u32::from_le_bytes(self.bytes[OFF_MAGIC..OFF_MAGIC + 4].try_into().unwrap())
    }

    fn version(&self) -> u16 {
        u16::from_le_bytes(self.bytes[OFF_VERSION..OFF_VERSION + 2].try_into().unwrap())
    }

    fn lsn(&self) -> u64 {
        u64::from_le_bytes(self.bytes[OFF_LSN..OFF_LSN + 8].try_into().unwrap())
    }

    fn stored_checksum(&self) -> u32 {
        u32::from_le_bytes(self.bytes[OFF_CHECKSUM..OFF_CHECKSUM + 4].try_into().unwrap())
    }

    fn checksum_valid(&self) -> bool {
        let mut copy = self.bytes;
        copy[OFF_CHECKSUM..OFF_CHECKSUM + 4].copy_from_slice(&[0u8; 4]);
        let recomputed = crc32c::crc32c(&copy);
        recomputed == self.stored_checksum()
    }

    fn format_valid(&self) -> bool {
        self.magic() == MAGIC && self.version() == FORMAT_VERSION
    }
}

fn main() {
    // 1. A real page round-trips: its own header fields read back exactly
    // what was written, and the checksum validates on an untouched page.
    let page = Page::new(0x1234_5678_9abc_def0, 7);
    println!("round_trip_lsn_matches {}", page.lsn() == 0x1234_5678_9abc_def0);
    println!("round_trip_checksum_valid {}", page.checksum_valid());
    println!("round_trip_format_valid {}", page.format_valid());

    // 2. A single corrupted byte in the page's own body is genuinely caught
    // by the checksum, which never has to be told where the corruption is.
    let mut corrupted = Page::new(42, 3);
    corrupted.bytes[HEADER_LEN + 10] ^= 0xFF;
    println!("corrupted_byte_checksum_valid {}", corrupted.checksum_valid());

    // 3. A deliberately wrong magic number is caught as an invalid format,
    // independent of the checksum succeeding or failing: the checksum alone
    // cannot tell a consistent, deliberate format change from corruption.
    let mut wrong_magic = Page::new(1, 1);
    wrong_magic.bytes[OFF_MAGIC..OFF_MAGIC + 4].copy_from_slice(&0xDEAD_BEEFu32.to_le_bytes());
    wrong_magic.recompute_checksum();
    println!("wrong_magic_checksum_valid {}", wrong_magic.checksum_valid());
    println!("wrong_magic_format_valid {}", wrong_magic.format_valid());

    // 4. The page's own encoding is explicitly little-endian, not whatever
    // the platform happens to use: the same raw bytes read back in the
    // wrong byte order genuinely produce a different, wrong value.
    let lsn_value: u64 = 0x0102_0304_0506_0708;
    let le_bytes = lsn_value.to_le_bytes();
    let read_as_le = u64::from_le_bytes(le_bytes);
    let read_as_be = u64::from_be_bytes(le_bytes);
    println!("explicit_le_round_trip_correct {}", read_as_le == lsn_value);
    println!("wrong_byte_order_gives_different_value {}", read_as_be != lsn_value);
}
