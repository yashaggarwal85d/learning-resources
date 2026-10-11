import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

const reel: Reel = {
  steps: [
    {
      title: 'Is the kitchen in the rent?',
      body: (
        <>
          German starts with its sounds. On a flat viewing you ask „Ist die Küche in der Miete enthalten?“ (is the kitchen included in the rent?). Say
          Miete with a short vowel and it becomes Mitte, “middle”. Then the answer comes, and half of it doesn’t sound like it’s written. By the end of
          this reel you’ll read both lines sound by sound. Notation: [square brackets] are sounds, not letters; ː means long; ˈ marks the stressed syllable.
        </>
      ),
      duration: 4.4,
      Visual: S.Problem,
    },
    {
      title: 'Miete or Mitte?',
      body: (
        <>
          Miete means rent, Mitte means middle. Apart from the spelling, what makes them two different words?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'The vowel: long in Miete, short in Mitte (and a slightly different vowel)', correct: true },
          { label: 'The t: held longer in Mitte, because it’s written twice' },
          { label: 'The final e: spoken in Miete, silent in Mitte' },
          { label: 'Nothing you can hear: context tells them apart' },
        ],
        explain: (
          <>
            The vowel. ie is a long, tense [iː]. The i before a doubled consonant is a short, lax [ɪ], a little lower and slightly less front. The doubled
            t is spelling only, pronounced as one [t], and both words end in the same weak e, [ə].
          </>
        ),
      },
      Visual: S.MieteMitte,
    },
    {
      title: 'Long and tense, short and lax',
      body: (
        <>
          German pairs a long, tense vowel with a short, lax one: [iː]/[ɪ], [øː]/[œ], [oː]/[ɔ]. The short one is shorter <b>and</b> a different vowel.
          The exception is a (and long ä): [a] and [aː] differ (almost) only in length. The spelling usually tells you which: ie, a silent h, a doubled vowel, or a
          single consonant before another vowel or at the end of a short word (kam) means long; a doubled consonant means short. Usually, not always: Mond is long, and nothing marks length
          before ch (Drache vs Sprache). The full spelling system is the next topic.
        </>
      ),
      duration: 5.6,
      Visual: S.Ledger,
    },
    {
      title: 'Where does ü come from?',
      body: (
        <>
          Long ü (Mühle, über) is a rounded vowel: your lips round. Which German vowel does it share its tongue position with?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Long i, as in Miete', correct: true },
          { label: 'Long u, as in Mut' },
          { label: 'Short a, as in Kamm' },
          { label: 'The weak e at the end of Miete' },
        ],
        explain: (
          <>
            Long i. ü [yː] is close and front, essentially where i [iː] is, with the lips rounded as for u. Keep the tongue of i and round your lips:
            that’s ü. It isn’t a kind of u at all.
          </>
        ),
      },
      Visual: S.UmlautPredict,
    },
    {
      title: 'ü and ö: front tongue, round lips',
      body: (
        <>
          Umlaut means fronting. ü is u’s rounded lips with i’s tongue; ö is o’s rounded lips with e’s tongue. They come as pairs too: long [yː] in Mühle
          and short [ʏ] in Müller; long [øː] in Höhle and short [œ] in Hölle. ä is the odd one: short ä is exactly short e, [ɛ] (Männer, Bett), and many
          northern speakers say long ä like long e (Käse). Where umlauts can’t be typed, write ae, oe, ue: the bare vowel would be wrong and misleading.
        </>
      ),
      duration: 4.8,
      Visual: S.UmlautGrid,
    },
    {
      title: 'One ch, two places',
      body: (
        <>
          German has one ch sound with two places. After a, o, u and au it is made at the back, at the soft palate or further back: the ach-Laut [x]
          (Buch, doch). Everywhere else (after i, e, the umlauts, ei and eu, and after consonants) it is made at the front, at the hard palate: the
          ich-Laut [ç] (ich, nicht, Furcht). The vowel <em>sound</em> before it decides, not the letter: eu ends in a u letter but takes [ç] (euch). So
          fronting the vowel moves the ch too: Buch [x], Bücher [ç]. And [ç] is not sch: keep ich and Tisch apart. One spelling is not a ch at all: chs inside a stem is [ks] (sechs, Fuchs [fʊks]).
        </>
      ),
      duration: 7.6,
      Visual: S.ChPlaces,
    },
    {
      title: 'Frauchen: ach or ich?',
      body: (
        <>
          rauchen (“to smoke”) has the ach sound after au. Frauchen is a diminutive of Frau (today mostly “a dog’s owner, if she is a woman”): it also has au before ch. Which ch does it take?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'The ich sound, [ç]', correct: true },
          { label: 'The ach sound, [x], as in rauchen' },
          { label: '[k]' },
          { label: '[ʃ], the sch sound' },
        ],
        explain: (
          <>
            The ich sound. The diminutive suffix -chen is always [çən], whatever comes before it, so after au you get [ç] in Frauchen and [x] in rauchen.
            In rauchen the ch belongs to the stem rauch-. The cut in the word decides, not the letters. That holds for every -chen word.
          </>
        ),
      },
      Visual: S.Frauchen,
    },
    {
      title: "Two r's in Lehrer",
      body: (
        <>
          German has two kinds of r. Before a vowel it is a consonant, usually made with the back of the tongue at the uvula, [ʁ] (rot, the first r in
          Lehrer); a tongue-tip r is also standard, mostly in the south. At the end of a syllable, after a vowel, it usually turns into a vowel glide (der,
          wir), as in British “here” and “beer”, where the r is a vowel, not a consonant; and the ending -er becomes the vowel [ɐ], close to a (Lehrer, besser). Keep it apart from the weak e of -e, [ə]: besser is not bitte.
        </>
      ),
      duration: 4.8,
      Visual: S.TwoRs,
    },
    {
      title: 'Oper and Opa',
      body: (
        <>
          Oper (“opera”) ends in -er; Opa (“grandpa”) ends in a. In northern standard German, what is the ending of Oper closest to?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'The a at the end of Opa', correct: true },
          { label: 'A consonant r, as in rot' },
          { label: 'The weak e at the end of Miete' },
          { label: 'The long u of Mut' },
        ],
        explain: (
          <>
            The a of Opa. -er is the vowel [ɐ], just a little higher than a. Dictionaries still keep the two apart ([ˈoːpɐ] vs [ˈoːpa]), but a study of
            northern speakers found no reliable difference: there, Oper and Opa sound the same. In southern Germany -er often sounds more like the weak e,
            and in most of Switzerland the r stays a consonant.
          </>
        ),
      },
      Visual: S.OperOpa,
    },
    {
      title: 'Rad or Rat?',
      body: (
        <>
          Rad (“wheel”) is written with d; Rat (“council”) with t. How does northern standard German say them?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Identically: [ʁaːt]', correct: true },
          { label: 'Rad ends in a voiced d, as in English bad' },
          { label: 'Rad has a shorter vowel' },
          { label: 'Rad drops its final consonant' },
        ],
        explain: (
          <>
            Identically. At the end of a syllable German loses the voice in b, d, g (and in the sounds spelled v in brav and s in lesen): Rad and Rat are both [ʁaːt]. Add an ending (Räder) and the d
            starts the next syllable, so its voice comes back. This is final devoicing, and English doesn’t have it.
          </>
        ),
      },
      Visual: S.RadRat,
    },
    {
      title: 'Tag sounds like Tak',
      body: (
        <>
          Final devoicing (Auslautverhärtung): b, d, g, and the v of brav and the s of lesen (the sounds [b d ɡ v z]) lose their voice at the end of a
          <b>syllable</b>, not only of a word: Tag [taːk], brav [f], lieb|lich [p], Los [ˈloːs] against Lose [ˈloːzə]. When an ending pulls the consonant into the next syllable, its voice returns: Tage, brave, Bäder.
          German spells the stem, so the letter tells you the voiced form. One twist in the northern standard: final -ig becomes [ɪç], as in wichtig.
          English has no such rule, which is why Germans speaking English often harden final consonants.
        </>
      ),
      duration: 5.6,
      Visual: S.Devoicing,
    },
    {
      title: 'mein Auto',
      body: (
        <>
          English runs “an apple” together as “a napple”. How does a northern German speaker join mein Auto (“my car”)?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'mein | Auto: a catch in the throat before Au-', correct: true },
          { label: 'mei-Nauto, linked like English' },
          { label: 'mein-wauto, with a glide' },
          { label: 'mei Auto, dropping the n' },
        ],
        explain: (
          <>
            With a catch. Before a word that starts with a vowel, northern standard German closes the vocal folds and releases them: a glottal stop, [ʔ],
            the catch in English “uh-oh”. So in careful speech mein Auto is [maɪn ˈʔaʊto], not “mei Nauto”. German writes no letter for it.
          </>
        ),
      },
      Visual: S.MeinAuto,
    },
    {
      title: 'A catch before every vowel',
      body: (
        <>
          In standard German from Germany, a glottal stop comes before a vowel that starts a word (Acht), a stem inside a word (be|achten), or usually a stressed
          syllable right after another vowel (The|ater). It never comes before a suffix: Achtung and Fahrer link straight through. It isn’t a phoneme (a sound that can change a word): it
          marks where a word or stem begins, leaving it out doesn’t by itself make a different word, and casual speech often drops it.
        </>
      ),
      duration: 5,
      Visual: S.CatchRows,
    },
    {
      title: 'One standard, three countries',
      body: (
        <>
          German is pluricentric: newsreaders in Germany, Austria and Switzerland each speak a standard of their own. Final devoicing and the glottal stop
          are northern features of the standard from Germany; Austrian and Swiss standard German have neither. Outside the north, -ig ends in [ɪk] (devoicing is absent in southern Germany too); in Austria and Switzerland it keeps a soft g. A tongue-tip r is common in the
          south, and in Austria ch may be [x] even after front vowels. This reel models the dictionary standard usually taught to
          learners. Hearing the others is part of the skill.
        </>
      ),
      duration: 4.4,
      Visual: S.Varieties,
    },
    {
      title: 'Back to the viewing',
      body: (
        <>
          Both lines, sound by sound (citation forms; die and der often weaken in fast speech). Miete with a long [iː], Küche with [ʏ] and the front [ç].
          Richtig: a back [ʁ], two ich-Laute, -ig as [ɪç]. Bad and und end in [t]. der and Keller turn their r into a vowel. Catches before ist, in,
          enthalten, und, auch, and the ach-Laut after au. Every mark is one of six rules.
        </>
      ),
      duration: 6.4,
      Visual: S.Viewing,
    },
    {
      title: 'In one breath',
      body: (
        <>
          Six rules: long and tense vs short and lax; ü and ö as front vowels with rounded lips; ch follows the vowel before it, except -chen; r is a
          consonant before a vowel and a vowel at the end of a syllable; consonants lose their voice at the end of a syllable; a catch before vowel-initial words and
          stems (in the standard from Germany).
        </>
      ),
      duration: 3.2,
      Visual: S.Recap,
    },
    {
      title: 'Prove it · 1 of 2',
      body: (
        <>
          Hund (“dog”) is [hʊnt]. Apply every rule you’ve seen: how is Hündchen (“little dog”) pronounced?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: '[ˈhʏntçən]', correct: true },
          { label: '[ˈhʊndxən]' },
          { label: '[ˈhʏndçən]' },
          { label: '[ˈhʊntçən]' },
        ],
        explain: (
          <>
            [ˈhʏntçən]. Three rules at once: the umlaut fronts u to ü, still short before two consonants, [ʏ]; the d ends the syllable Hünd-, so it
            devoices to [t]; and -chen takes the ich sound, [ç]. In quick speech the weak e before n often disappears, leaving a syllabic n.
          </>
        ),
      },
      Visual: S.ProveHund,
    },
    {
      title: 'Prove it · 2 of 2',
      body: (
        <>
          A colleague from Vienna says Rad with a soft final d and runs mein Auto together without a catch. Is she making mistakes?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'No: Austrian standard German has neither rule', correct: true },
          { label: 'Yes, both are errors' },
          { label: 'Only the soft d is an error' },
          { label: 'Only the missing catch is an error' },
        ],
        explain: (
          <>
            No. Final devoicing and the glottal stop belong to the northern standard of Germany. Austrian and Swiss standard German have neither. In
            Austrian standard German b, d and g are soft (lenis) and voiceless everywhere, so there is nothing to harden at the end. Both pronunciations
            are correct Austrian standard.
          </>
        ),
      },
      Visual: S.ProveVienna,
    },
  ],
};

export default reel;
