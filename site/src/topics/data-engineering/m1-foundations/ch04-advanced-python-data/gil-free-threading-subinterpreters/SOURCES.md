# Sources — de.gil-free-threading-subinterpreters

All quotes verified word for word against the fetched text in `sources/` via
`node scripts/sources.mjs check`.

## Python Glossary, "global interpreter lock"
URL: https://docs.python.org/3/glossary.html#term-global-interpreter-lock

> The mechanism used by the CPython interpreter to assure that only one thread executes Python bytecode at a time.

> This simplifies the CPython implementation by making the object model (including critical built-in types such as dict) implicitly safe against concurrent access.

> However, some extension modules, either standard or third-party, are designed so as to release the GIL when doing computationally intensive tasks such as compression or hashing. Also, the GIL is always released when doing I/O.

> As of Python 3.13, the GIL can be disabled using the --disable-gil build configuration.

## PEP 779, "Criteria for supported status for free-threaded Python"
URL: https://peps.python.org/pep-0779/

> Phase I started early in the development of Python 3.13, and includes making the free-threaded (GIL-less) Python build available but explicitly experimental. Phase II would make the free-threaded build officially supported but still optional, and phase III would make the free-threaded build the default.

> the performance penalty on linear performance, comparing a free-threaded build against a with-GIL build, as measured by the pyperformance benchmarks (for example as run by Microsoft's Faster CPython team, or Meta's Python Runtime team), is currently around 10% (except on macOS, where it's more like 3%).

> free-threaded Python currently sees about 15-20% higher memory use (geometric mean, as measured by pyperformance).

## PEP 703, "Making the Global Interpreter Lock Optional in CPython"
URL: https://peps.python.org/pep-0703/

> At least for some time, there will be two versions of Python requiring separately compiled C-API extensions. It may take some time for C-API extension authors to build --disable-gil compatible packages and upload them to PyPI.

## Python Documentation, "multiprocessing — Process-based parallelism"
URL: https://docs.python.org/3/library/multiprocessing.html

> The parent process starts a fresh Python interpreter process. The child process will only inherit those resources necessary to run the process object's run() method.

> Starting a process using this method is rather slow compared to using fork or forkserver.

> The parent process uses os.fork() to fork the Python interpreter. The child process, when it begins, is effectively identical to the parent process. All resources of the parent are inherited by the child process.

> Changed in version 3.14: This is no longer the default start method on any platform.

> Changed in version 3.14: On POSIX platforms the default start method was changed from fork to forkserver to retain the performance but avoid common multithreaded process incompatibilities.

## Python Documentation, "concurrent.interpreters — Multiple interpreters in the same process"
URL: https://docs.python.org/3/library/concurrent.interpreters.html

> Each interpreter is effectively isolated from the others (with a limited number of carefully managed process-global exceptions to the rule).

> As a significant bonus, interpreters are sufficiently isolated that they do not share the GIL, which means combining threads with multiple interpreters enables full multi-core parallelism. (This has been the case since Python 3.12.)

> No other threads are automatically started for the operation.
