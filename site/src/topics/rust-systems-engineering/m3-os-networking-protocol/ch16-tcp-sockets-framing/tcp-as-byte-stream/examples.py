"""Every example shown in the "TCP as a byte stream" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the
pinned CI toolchain is 1.97.0) and cargo on PATH. These examples open real loopback
TCP connections and measure real read()/write() call counts and real half-close
behavior; no mocks. Rust sources live in examples/runtime-demo/ next to this file;
every path is resolved from __file__."""
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')
PAYLOAD_BYTES = 4 * 1024 * 1024


def cargo_build(name, timeout=60):
    r = subprocess.run([CARGO, 'build', '--release', '--quiet', '--bin', name], cwd=CRATE,
                        capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build:\n{r.stdout}\n{r.stderr}'
    return os.path.join(CRATE, 'target', 'release', name)


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} should run:\n{r.stdout}\n{r.stderr}'
    return r.stdout.strip()


# ---- 1. TCP genuinely delivers an undifferentiated byte stream: one real write_all() ----
# ---- call on one side can take many real read() calls to receive on the other. ----
partial_bin = cargo_build('partial_reads_on_a_real_tcp_stream')
out = run(partial_bin)
total, reads = (int(x) for x in out.split())
assert total == PAYLOAD_BYTES, f'expected the full {PAYLOAD_BYTES} bytes to arrive, got {total}'
assert reads > 10, f'a single write_all() of {PAYLOAD_BYTES} bytes through a 64 KiB read buffer should genuinely take many real read() calls, got {reads}'
print(f'partial_reads_on_a_real_tcp_stream: {total} bytes, written in one real call, took {reads} real read() calls to receive')

# ---- 2. shutdown(Write) is a genuine, real half-close: the peer's read() genuinely sees ----
# ---- EOF, but the peer can still write a real reply back over the still-open direction. ----
half_close_bin = cargo_build('half_close_lets_the_peer_still_reply')
out = run(half_close_bin)
saw_eof, server_got, reply = out.split(maxsplit=2)
assert saw_eof == 'true', f'the server should genuinely observe EOF after the client half-closed, got {out}'
assert server_got == 'hello', f'the server should have received the client\'s real message, got {server_got!r}'
assert reply == 'world', f'the client should still receive a real reply after half-closing its own write side, got {reply!r}'
print(f'half_close_lets_the_peer_still_reply: server saw EOF={saw_eof}, got {server_got!r}, client still received {reply!r}')

print('all tcp-as-byte-stream examples pass')
