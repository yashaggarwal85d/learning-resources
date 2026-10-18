- **Cache and cache line**: a small, fast memory between the processor and main memory, which moves data in fixed chunks called lines. *Where you meet it:* a program that walks an array in order runs faster than one that jumps around, because each line fetched serves several neighbouring items.
- **Working set**: the amount of memory a program actively touches during a stretch of execution. *Where you meet it:* a loop over a 10 KB array has a 10 KB working set.
- **Virtual address and page**: programs use virtual addresses, which the processor translates to physical ones in fixed-size pages. *Where you meet it:* a 4 KiB page is the default unit on x86-64 Linux.
- **Nanosecond**: a billionth of a second, the natural unit for one memory access. *Where you meet it:* a main-memory load is on the order of tens to a hundred nanoseconds.
- **Pointer dereference**: reading the value at an address a variable holds. *Where you meet it:* `p = next[p]` in C, or following a link in a linked list.

**Check yourself:** in `for (i = n-1; i &gt; 0; i--) swap(a[i], a[rand_below(i)]);`, what does drawing the partner from strictly below `i` guarantee? (Answer: a single cycle through all elements, Sattolo's algorithm.)
