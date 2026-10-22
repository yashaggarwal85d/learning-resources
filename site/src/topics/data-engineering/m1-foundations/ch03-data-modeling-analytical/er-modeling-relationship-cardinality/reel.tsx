import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Refresher. No runnable system backs this topic (FACT-CHECK.md): it is a notation and structure refresher, every
// claim sourced to Wikipedia's "Entity–relationship model" and "Associative entity" articles (SOURCES.md), and the
// worked example (a customer, an order, a product — one relationship of each cardinality) is traced by hand.
const reel: Reel = {
  steps: [
    {
      title: 'Cardinality, in five minutes',
      body: (
        <>
          The same box-and-line diagram answers one specific question for every relationship: how many of one
          thing can relate to how many of another.
        </>
      ),
      duration: 2,
      Visual: S.Opening,
    },
    {
      title: 'Reveal: the three symbols',
      body: (
        <>
          Crow's foot notation uses three shapes at the end of a relationship line: a ring for zero, a dash for
          one, a crow's foot for many — paired to mark a minimum and a maximum on each end.
        </>
      ),
      duration: 4.4,
      fig: 'ring = zero, dash = one, crow’s foot = many — paired, minimum and maximum',
      Visual: S.RevealThreeSymbols,
    },
    {
      title: 'Reveal: one-to-one — customer and loyalty card',
      body: (
        <>
          A dash at both ends: one customer, one card, each side mandatory.
        </>
      ),
      duration: 3.2,
      fig: 'Customer — dash — Card: one-to-one, mandatory both ends',
      Visual: S.RevealOneToOne,
    },
    {
      title: 'Predict: which table gets the foreign key?',
      body: (
        <>
          A customer can have many orders, but each order has only one customer. Which table actually holds that
          relationship — the customer table, or the order table?
        </>
      ),
      duration: 2.8,
      fig: 'one customer, many orders — where does the key live?',
      predict: {
        options: [
          { label: 'The customer table — it is the "one" side' },
          { label: 'The order table — it is the "many" side', correct: true },
        ],
        explain: (
          <>
            The order table. Each order names exactly one customer, so a single column can hold that value; a
            customer row would need a column that somehow holds a whole list of order ids, which an ordinary
            column cannot do.
          </>
        ),
      },
      Visual: S.PredictForeignKeySide,
    },
    {
      title: 'Reveal: the foreign key lives on the many side',
      body: (
        <>
          Each order names exactly one customer, so that single value fits in one column on the order row. The
          customer side would need a variable-length list, which no ordinary column can hold.
        </>
      ),
      duration: 4.4,
      fig: 'order row: one customer id — fits a single column',
      takeaway: "A one-to-many relationship's foreign key lives on the \"many\" side, naming the one thing it belongs to.",
      Visual: S.RevealForeignKeyOnMany,
    },
    {
      title: 'Reveal: many-to-many — orders and products',
      body: (
        <>
          An order lists many products, and a product appears on many orders. Now the crow's foot sits at both
          ends of the line.
        </>
      ),
      duration: 3.6,
      fig: 'Order — crow’s foot both ends — Product: many-to-many',
      Visual: S.RevealManyToMany,
    },
    {
      title: 'Reveal: why many-to-many forces a junction table',
      body: (
        <>
          Neither table has a column that can hold a variable number of values, so a third table appears: a
          foreign key to each side, with both foreign keys together often forming its own primary key.
        </>
      ),
      duration: 4.8,
      fig: 'order_product: order id + product id — a table of its own',
      takeaway: 'A many-to-many relationship always resolves to a third table, never to a column on either original one.',
      Visual: S.RevealJunctionTable,
    },
    {
      title: 'Reveal: optionality changes the symbol, not the shape',
      body: (
        <>
          Swap the dash for a ring at either end and the relationship becomes optional there instead of mandatory
          — the same crow's-foot shape, a different symbol at that one end.
        </>
      ),
      duration: 4,
      fig: 'ring at an end = optional there; dash = mandatory there',
      takeaway: "Optionality is read directly off the diagram's symbols, never assumed from a relationship's name.",
      Visual: S.RevealOptionality,
    },
    {
      title: 'In one breath',
      body: (
        <>
          Three symbols, paired for minimum and maximum. The many side holds the foreign key. Many-to-many always
          means a third table. Swipe on to the next refresher: which columns actually determine which others, now
          that the relationships themselves are named.
        </>
      ),
      duration: 2.4,
      Visual: S.Recap,
    },
  ],
};

export default reel;
