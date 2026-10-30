import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number and string shown is executed and asserted in examples.py: a naive split(",") on
// "Smith, John",42,Mumbai sees four fields where a real CSV parser sees three; a backslash-escaped
// embedded quote reads back as O\Brien" where RFC 4180's doubled quote reads back as O"Brien; a
// naive line-split on a file with one multi-line address field sees three records where a real
// parser sees two; the JSON integer 9,007,199,254,740,993 survives an exact parser but a
// double-precision parse returns 9,007,199,254,740,992; and a BOM-prefixed JSON document fails to
// parse as-is but parses correctly once the BOM is stripped.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          One customer's name has a comma in it. A naive reader that just splits every line on
          commas sees four fields where there are only three.
        </>
      ),
      duration: 4.4,
      fig: 'one comma, one name — naive split sees 4 fields, not 3',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does quoting fix everything?',
      body: (
        <>
          Wrapping the name in quotes fixes the comma. Now a second field has a quote inside
          it — does quoting alone handle that too?
        </>
      ),
      duration: 2.6,
      fig: 'quoting fixed the comma. What about a quote inside the field?',
      predict: {
        options: [
          { label: "Yes — once it's quoted, nothing inside it can break it" },
          { label: 'No — an embedded quote still needs its own escape', correct: true },
        ],
        explain: (
          <>
            Quoting really did fix the comma — that's the trap. It only answered one problem.
            An embedded quote inside the field is a second problem with its own separate rule.
          </>
        ),
      },
      Visual: S.PredictQuoting,
    },
    {
      title: 'Reveal: the embedded quote',
      body: (
        <>
          A backslash-escaped quote reads back corrupted. RFC 4180 has exactly one rule for an
          embedded quote: double it, never escape it with a backslash — CSV has no backslash
          escape at all.
        </>
      ),
      duration: 4.6,
      fig: 'a backslash reads back wrong. RFC 4180’s doubled quote reads back correctly.',
      Visual: S.RevealEmbeddedQuote,
    },
    {
      title: 'Reveal: the embedded newline',
      body: (
        <>
          A multi-line address inside a quoted field is legal CSV. A reader that splits the file
          on newline instead of parsing quotes counts one record too many.
        </>
      ),
      duration: 4.6,
      fig: 'naive line-split sees 3 records; a real CSV parser sees 2.',
      takeaway: 'A legal CSV field can contain its own line break; splitting on newline instead counts the wrong number of records.',
      Visual: S.RevealEmbeddedNewline,
    },
    {
      title: 'Reveal: the surprising number',
      body: (
        <>
          An order id this exact-looking — sixteen digits — still isn't safe. Read by a
          double-precision parser, it comes back one smaller, with nothing in the file itself
          ever having changed.
        </>
      ),
      duration: 4.8,
      fig: 'order_id 9,007,199,254,740,993 → a double-precision parser returns 9,007,199,254,740,992.',
      takeaway: 'A number this large can look exact in a file and still come back one smaller to a double-precision parser.',
      Visual: S.RevealSurprisingNumber,
    },
    {
      title: 'Reveal: the BOM trap',
      body: (
        <>
          The file looks empty of any problem to a human reading it in an editor. A byte order
          mark at the very front is already the wrong first character to a parser that doesn't
          tolerate it.
        </>
      ),
      duration: 4.6,
      fig: "a byte order mark at the front: a parser that doesn't tolerate it fails before the first field.",
      takeaway: 'A byte order mark carries no byte-order meaning in UTF-8; an intolerant parser reads it as the file’s first character.',
      Visual: S.RevealBom,
    },
    {
      title: 'Reveal: no types, no schema',
      body: (
        <>
          CSV, JSON and XML all share the same shape: no types, no columnar pushdown, and in
          XML's case a schema that lives in a separate file if it exists at all. That's why all
          three are still accepted at the edge and converted immediately.
        </>
      ),
      duration: 4.6,
      fig: 'CSV, JSON, XML: three formats, zero of them typed.',
      Visual: S.RevealNoTypes,
    },
    {
      title: 'Recap',
      body: (
        <>
          Five traps, one reader each confidently wrong about: a comma, a quote, a newline, a
          number, a byte order mark. Underneath every one of them is a column — row or
          columnar — and that choice is next.
        </>
      ),
      duration: 4.8,
      fig: 'five traps, one rule: accept them at the edge, convert immediately.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
