#!/usr/bin/env bash
# Compiles and runs examples.c: the real, compiled benchmarks this topic's post-notes Lab quotes
# (false sharing padded vs. unpadded; Vyukov's queue vs. a mutex-protected ring at 1/2/4/8
# producer-and-consumer threads each). Never a Python thread timing (CHAPTER.md: the interpreter's
# own global lock would dominate any such measurement). Machine, compiler and flags are recorded
# in OUTLINE.md alongside the exact output this script produced on the builder's own machine.
set -euo pipefail
cd "$(dirname "$0")"
gcc -O2 -pthread -std=c11 -o examples_bin examples.c
./examples_bin
rm -f examples_bin
