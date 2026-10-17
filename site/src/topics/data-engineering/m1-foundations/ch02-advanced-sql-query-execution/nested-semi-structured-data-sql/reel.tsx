import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Data that is not flat. Running example: order 42 carries tags and a matching list of discounts (3 each) and a JSON
// metadata document. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Rows are not always flat',
      body: (
        <>
          Order 42 carries a list of promo tags, a matching list of discounts, and a free-form JSON document of checkout context. None of these is a
          plain scalar, and SQL has to read, unpack and query each of them.
        </>
      ),
      duration: 3.4,
      Visual: S.NotFlat,
    },
    {
      title: 'Three nested shapes',
      body: (
        <>
          An <b>array</b> is an ordered list of same-typed values; a <b>composite</b> (struct) is a labelled bundle of fields; a <b>map</b> is key-value
          data. PostgreSQL has no native map type, so JSON plays that part.
        </>
      ),
      duration: 4,
      Visual: S.Shapes,
    },
    {
      title: 'unnest turns an array into rows',
      body: (
        <>
          <code>unnest</code> expands one array into one row per element, in storage order. Order 42&rsquo;s <b>3</b> tags become <b>3</b> rows. One
          array is safe; the trap begins with two.
        </>
      ),
      duration: 3.6,
      Visual: S.OneUnnest,
    },
    {
      title: 'Predict: two unnests in FROM',
      body: (
        <>
          Order 42 has 3 tags and 3 discounts that are meant to line up. You write <code>FROM orders, unnest(tags), unnest(discount_amounts)</code>.
          How many rows come back for that order?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: '3' }, { label: '6' }, { label: '9', correct: true }, { label: '1' }],
        explain: (
          <>
            Nine. Two separate <code>FROM</code> items with no condition between them combine as a product: every tag pairs with every discount,
            including the wrong ones. This is the Cartesian product from the first topic, produced by two function calls.
          </>
        ),
      },
      Visual: S.ProductPredict,
    },
    {
      title: 'One call, both arrays, paired by position',
      body: (
        <>
          Pass both arrays to a single <code>unnest</code> and they are zipped by position: <b>3</b> rows, each tag with its own discount. If one array is
          longer, the shorter is padded with NULLs, so 4 tags and 3 discounts give <b>4</b> rows.
        </>
      ),
      duration: 4.4,
      Visual: S.Zip,
    },
    {
      title: 'WITH ORDINALITY keeps the position',
      body: (
        <>
          Add <code>WITH ORDINALITY</code> and each row also carries its position in the array, starting from 1. Use it whenever order carries meaning,
          such as the first tag applied, instead of trusting row order.
        </>
      ),
      duration: 3.4,
      Visual: S.Ordinality,
    },
    {
      title: 'Arrow operators drill into JSON',
      body: (
        <>
          <code>metadata -&gt; &lsquo;utm&rsquo;</code> returns the nested object and keeps it as JSON for more chaining; <code>-&gt;&gt;</code> returns text.
          So <code>metadata -&gt; &lsquo;utm&rsquo; -&gt;&gt; &lsquo;source&rsquo;</code> gives the string.
        </>
      ),
      duration: 3.8,
      Visual: S.Arrows,
    },
    {
      title: 'JSON_TABLE makes JSON a table',
      body: (
        <>
          Past a field or two, <code>JSON_TABLE</code> (PostgreSQL <b>17</b>) turns a document into rows and typed columns with a path expression, and joins
          them laterally to the row that held the JSON, so no explicit join is needed.
        </>
      ),
      duration: 4,
      Visual: S.JsonTable,
    },
    {
      title: 'JSON text is parsed again and again',
      body: (
        <>
          Stored as text, a document must be parsed byte by byte on every read, even to reach one field, and the storage layer sees one opaque string
          with no statistics. A binary variant type stores the parsed form instead.
        </>
      ),
      duration: 3.8,
      Visual: S.TextCost,
    },
    {
      title: 'Shredding makes fields real columns',
      body: (
        <>
          The Parquet and Iceberg v3 <b>Variant</b> type can <i>shred</i> common fields into their own columns, with statistics and pruning. A query for
          one timestamp loads just that column. Snowflake and Databricks offer a <code>VARIANT</code> type too.
        </>
      ),
      duration: 4.4,
      Visual: S.Shredding,
    },
    {
      title: 'Back to order 42',
      body: (
        <>
          Zip arrays with one <code>unnest</code>, keep positions with <code>WITH ORDINALITY</code>, use <code>JSON_TABLE</code> for anything beyond a
          field or two, and pull the fields you query constantly out into real typed columns.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>4 tags and 3 discounts go into one multi-argument unnest. How many rows come back?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '3' }, { label: '4', correct: true }, { label: '7' }, { label: '12' }],
        explain: <>Four. The shorter array is padded with NULLs, so the longer one sets the row count. Twelve is what two separate unnests would give.</>,
      },
      Visual: S.ProveZip,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>Which PostgreSQL release added JSON_TABLE?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '15' }, { label: '16' }, { label: '17', correct: true }],
        explain: <>PostgreSQL 17, released in September 2024.</>,
      },
      Visual: S.ProveVersion,
    },
  ],
};

export default reel;
