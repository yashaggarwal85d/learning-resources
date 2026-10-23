# Sources — de.cpython-object-model-memory

All quotes verified word for word against the fetched text in `sources/` via
`node scripts/sources.mjs check`.

## Python/C API Reference, "Common Object Structures"
URL: https://docs.python.org/3/c-api/structures.html

> This is a type which contains the information Python needs to treat a pointer to an object as an object. In a normal "release" build, it contains only the object's reference count and a pointer to the corresponding type object.

> The object's reference count, as returned by Py_REFCNT.

> The object's type.

> A per-object lock, present only in the free-threaded build (when Py_GIL_DISABLED is defined).

> This is a macro used when declaring new types which represent objects without a varying length. The PyObject_HEAD macro expands to:

## PEP 659, "Specializing Adaptive Interpreter"
URL: https://peps.python.org/pep-0659/

> A specializing, adaptive interpreter is one that speculatively specializes on the types or values it is currently operating on, and adapts to changes in those types and values.

> Specialization gives us improved performance, and adaptation allows the interpreter to rapidly change when the pattern of usage in a program alters, limiting the amount of additional work caused by mis-specialization.

> Extensive experimentation suggests speedups of up to 50%.

> By using adaptive and speculative specialization at the granularity of individual virtual machine instructions, we get a faster interpreter that also generates profiling information for more sophisticated optimizations in the future.

## Python 3.13 Release Notes, "What's New In Python 3.13"
URL: https://docs.python.org/3/whatsnew/3.13.html

> When CPython is configured and built using the --enable-experimental-jit option, a just-in-time (JIT) compiler is added which may speed up some Python programs.

> We start with specialized Tier 1 bytecode.

> When the Tier 1 bytecode gets hot enough, it gets translated to a new purely internal intermediate representation (IR), called the Tier 2 IR, and sometimes referred to as micro-ops ("uops").

> When the JIT is enabled, the optimized Tier 2 IR is translated to machine code, which is then executed.

> The machine code translation process uses a technique called copy-and-patch. It has no runtime dependencies, but there is a new build-time dependency on LLVM.
