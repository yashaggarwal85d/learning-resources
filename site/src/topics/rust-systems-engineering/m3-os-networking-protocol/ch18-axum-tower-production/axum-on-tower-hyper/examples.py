"""Every example shown in the "Axum on Tower and hyper" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the
pinned CI toolchain is 1.97.0) and cargo on PATH. This example stands up a real,
minimal Axum server over a real TcpListener and drives it with real HTTP
requests from a real client; no mocks. Rust sources live in
examples/runtime-demo/ next to this file; every path is resolved from __file__."""
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


def cargo_build(name, timeout=180):
    r = subprocess.run([CARGO, 'build', '--release', '--quiet', '--bin', name], cwd=CRATE,
                        capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build:\n{r.stdout}\n{r.stderr}'
    return os.path.join(CRATE, 'target', 'release', name)


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} should run:\n{r.stdout}\n{r.stderr}'
    return r.stdout.strip()


def parse(out):
    kv = {}
    for line in out.splitlines():
        k, v = line.rsplit(' ', 1)
        kv[k] = v
    return kv


# ---- A real, minimal Axum server, with a real extractor, real shared State, ----
# ---- a real middleware::from_fn layer, and a real tower-http layer, all driven ----
# ---- by a real HTTP client against a real TcpListener. ----
server_bin = cargo_build('axum_is_tower_underneath')
out = parse(run(server_bin))

assert out['path_param_extracted'] == 'true', 'the 0.8 /{param} routing syntax should genuinely extract a real path parameter'
print('axum_is_tower_underneath: the /{param} routing syntax genuinely extracted a real path parameter')

assert out['state_genuinely_shared'] == 'true', 'State should genuinely persist and accumulate across separate real requests'
print('axum_is_tower_underneath: State was genuinely shared and accumulated across three separate real requests')

assert out['from_fn_middleware_ran'] == 'true', 'a middleware::from_fn layer should genuinely run against a real response'
print('axum_is_tower_underneath: a middleware::from_fn layer genuinely ran and modified a real response')

assert out['tower_http_timeout_fired'] == 'true', "a real tower-http TimeoutLayer should genuinely cut off a handler that outlives it"
assert out['tower_http_timeout_elapsed_ms_is_small'] == 'true', 'the timeout should fire close to its own configured deadline, not the slow handler\'s own delay'
print('axum_is_tower_underneath: a real tower-http TimeoutLayer genuinely cut off a handler that would have taken far longer')

print('all axum-on-tower-hyper examples pass')
