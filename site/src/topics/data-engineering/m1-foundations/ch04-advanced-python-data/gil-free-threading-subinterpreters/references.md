Last verified against these sources: 23 October 2026. Real measurements on this sandbox's own
CPython (`examples.py`). Expert sign-off: pending.

- Python Software Foundation, "global interpreter lock" (Python Glossary): [docs.python.org](https://docs.python.org/3/glossary.html#term-global-interpreter-lock). The GIL's own definition, GIL release during I/O and in extensions, the `--disable-gil` build flag.
- Sam Gross, "PEP 703 – Making the Global Interpreter Lock Optional in CPython": [peps.python.org](https://peps.python.org/pep-0703/). Free-threading's own disclosed distribution and C-extension-compatibility cost.
- "PEP 779 – Criteria for supported status for free-threaded Python": [peps.python.org](https://peps.python.org/pep-0779/). The three-phase rollout, the disclosed single-thread performance penalty and memory cost.
- Python Software Foundation, "multiprocessing — Process-based parallelism": [docs.python.org](https://docs.python.org/3/library/multiprocessing.html). `fork`/`spawn`/`forkserver`, the 3.14 default-start-method change.
- Python Software Foundation, "concurrent.interpreters — Multiple interpreters in the same process": [docs.python.org](https://docs.python.org/3/library/concurrent.interpreters.html). Subinterpreter isolation and the no-shared-GIL property, true since 3.12.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=gil-free-threading-subinterpreters:%20).
