- **Word-RAM**: the standard model in which every memory access and arithmetic step on a machine word costs one unit. *Where you meet it:* the cost counts in every earlier topic of this chapter.
- **Disk page / block read**: storage devices hand data over in whole fixed-size chunks, not single bytes. *Where you meet it:* a database reading an 8 KB page to return one row.
- **Binary search**: finding a key in a sorted array by repeatedly halving the range, about log base 2 of N probes. *Where you meet it:* `bisect` in Python.
- **Merge sort**: sort halves, then merge two sorted lists into one by repeatedly taking the smaller front item. *Where you meet it:* the sort inside many standard libraries.
- **Logarithm base**: log base b of x counts how many times you divide by b to reach 1, and a larger base gives a smaller number. *Where you meet it:* log base 1000 of a billion is 3.

**Check yourself:** how many halvings does binary search need on 1,024 sorted items? (Answer: 10, since 2<sup>10</sup> = 1,024.)
