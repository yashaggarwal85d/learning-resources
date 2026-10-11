# OUTLINE: ger.sound-system (The German sound system)

Kind: **full** (the syllabus line has no "(refresher)" marker). First topic of the German domain: no previous topic, no previous `REVIEW.md`.
Next topic: **Spelling-to-sound rules**: "ei vs ie, eu/äu, sch, sp and st at the start of a word, z, v and w; ß after long vowels and diphthongs vs ss after short vowels; every noun capitalised."
Syllabus line: "The German sound system: vowel length (Miete vs Mitte), the umlauts ä/ö/ü, the two *ch* sounds (ich-Laut vs ach-Laut), the uvular and vocalised r (-er as a vowel), final devoicing (Tag sounds like "Tak"), the glottal stop before initial vowels."
Chapter practice line: "minimal-pair listening (Miete/Mitte, Hölle/Höhle, Küche/Kuchen), then record yourself and compare against the model."

Planned by: content-plan agent (Opus), 2026-10-11. Sources: `SOURCES.md` (section names below) and the raw texts in `sources/`. Claims are numbered **C1–C81** in the claims list at the end (C76–C81 added by the fact-check). **TBS** = to be sourced by the fact-check agent with `node scripts/sources.mjs fetch` (URL given); if it can't be sourced, the fallback named next to it is used instead.

---

## Audience and stance

Fast, analytical adult English speakers, possibly with no German at all. We teach **mechanisms**, not imitation drills: where in the mouth each sound is made, which context picks which variant, and what the spelling does and doesn't tell you. We never talk down, and we say plainly when something is a regional variant or an open question.

**What the site can and can't do (never claim more):**
- There are no native-speaker recordings. German is spoken in the narration by the site's frozen **synthetic** German voice, and only when the learner turns sound on (sound is off by default). The Deep dive says this plainly.
- So every contrast must also work **silently**: as on-screen spelling, an IPA transcription, and a drawing (mouth schematic, vowel grid, length bars, a voicing track). No waveforms or spectrograms, and no formant or millisecond values, because none are sourced.
- Every predict question can be answered from the screen and the rules alone. None of them depends on hearing audio.
- There is no recording or "compare against the model" feature. The Practice section offers what exists: the German voice says the minimal pairs in the narration, the learner can replay a step (the R key or the replay control) and say the words in the hold, then check themselves against the on-screen transcription.

**Reference accent.** The reel models the standard pronunciation described in the German pronunciation dictionaries (the Duden Aussprachewörterbuch, Krech et al.), which is the form usually taught to learners (C67). Its regional features are northern ones (final devoicing, the glottal stop, -ig as [ɪç]). Austrian and Swiss standard German are flagged wherever they differ, in a dedicated step and in the Deep dive.

**IPA on screen.** Square brackets show sounds, not spelling, and ː means long. Both are explained once, in step 1's caption, and used throughout. The narrator never reads IPA aloud. She names a sound by an example word, and the German voice says the word.

---

## Learning outcomes ("After this topic you can")

1. Tell long, tense vowels from short, lax ones (Miete [iː] vs Mitte [ɪ]), and predict length from the spelling cues ie, h, a doubled vowel and a doubled consonant, while knowing where those cues fail.
2. Build ü and ö from parts you already have: the tongue of i or e plus the rounded lips of u or o. Say why ä is pronounced like e.
3. Choose ich-Laut [ç] or ach-Laut [x] from the sound before the ch, and apply the one override: the suffix -chen is always [ç] (Frauchen vs rauchen).
4. Say r as a consonant at the back of the mouth before a vowel, and as a vowel after one ([ɐ̯], and [ɐ] for -er). Keep -er [ɐ] apart from -e [ə].
5. Apply final devoicing at the end of every syllable (Rad = Rat [ʁaːt], lieb|lich), and the northern -ig → [ɪç].
6. Put a glottal catch before vowel-initial words and stems (mein | Auto), and know where it does not go (before suffixes, and in Austria and Switzerland).
7. Read both lines of the opening flat-viewing exchange aloud, sound by sound.

---

## The opening problem (layer 1), resolved in step 15

**Your first flat viewing in Germany.** You ask the agent: „Ist die Küche in der Miete enthalten?" ("Is the kitchen included in the rent?"). Say Miete with a short vowel and **Miete** ("rent") becomes **Mitte** ("middle"): one vowel is the only difference. Say ü as a plain u and **Küche** ("kitchen") drifts toward **Kuchen** ("cake"). So what she may hear is closer to "Is the kitchen included in the middle?". She answers: „Richtig. Das Bad und der Keller auch." ("Right. The bathroom and the cellar too."), and you can't map half of what you hear onto the words you read. (Fact-check: don't claim English *reading* habits shorten Miete. English speakers already have [iː] vs [ɪ] (beat/bit), and English ie often reads [iː] (field). The point is that German length is meaningful, not that English speakers will misread ie.)

Together the two lines contain every feature in the syllabus line:
- the question: glottal stops (Ist, in, enthalten); long vs short vowels (die, Miete vs Ist, in); the umlaut ü and the ich-Laut (Küche); vocalised r (der); schwa (Küche, Miete) and a syllabic n (enthalten);
- the answer: uvular r, two ich-Laute and the -ig ending (Richtig); final devoicing (Bad, und); glottal stops (und, auch); vocalised r (der); -er as a vowel (Keller); the ach-Laut after au (auch).

Step 15 transcribes both lines in full, so every mark is explained by a step the learner has seen.

**Target transcriptions** (citation forms, careful northern standard speech; per-word IPA from DWDS and de.wiktionary (C69, sourced by the fact-check), with [ʔ] added by C56–C57):
- Question: [ʔɪst diː ˈkʏçə ʔɪn deːɐ̯ ˈmiːtə ʔɛntˈhaltn̩]
- Answer: [ˈʁɪçtɪç | das baːt ʔʊnt deːɐ̯ ˈkɛlɐ ʔaʊ̯x]

Function words often reduce in connected speech (die → [di], der → [dɐ]). The reel shows citation forms and says so in step 15's caption. Transcription conventions: DWDS writes the r as [ʀ] and the ach-Laut after a/au as [χ] (auch [aʊ̯χ], Acht [aχt]); the reel follows the broad convention of Help:IPA and de.wiktionary ([ʁ], [x]: auch [aʊ̯x]) and the Deep dive says so. Küche: de.wiktionary (citing the Duden Aussprachewörterbuch) gives [ˈkʏçə] and notes that northern standard speech often has a long [ˈkyːçə]; the reel shows [ˈkʏçə], the Deep dive mentions the variant.

**Wording check (fact-check, done).** The bare „Ist die Küche in der Miete?" is elliptical; „… in der Miete enthalten?" is the usual phrasing for "included in the rent" (editorial judgement; no corpus source could be fetched). Use „Ist die Küche in der Miete enthalten?". enthalten [ɛntˈhaltn̩] (de.wiktionary) adds a word-initial [ʔ] and a syllabic [n̩]. Its h is a normal [h] at the start of the stem -halt-, not a length h: say so in the Deep dive, since step 3 teaches the silent h.

---

## The reel's visual idea (applies to every step)

**Each word is a strip of letter tiles above a strip of sound tiles**, with thin lines from letters to the sounds they make. A doubled tt draws two lines into one [t] tile, and ie draws two lines into one [iː] tile, so the mismatch between spelling and sound is literally visible. Wherever the mechanism lives in the mouth, a **mouth schematic** (a side view: lips, hard palate, soft palate, uvula, vocal folds, and a tongue body that moves) shows it. The vowel steps use a **vowel grid** (close ↕ open, front ↔ back) on which a **ring around a dot means rounded lips**. Length is a **bar** whose length is schematic and carries no millisecond values. Voicing is a **voice track** under the sound tiles: filled where the vocal folds vibrate, empty where they don't. It is a schematic, not a waveform.

Why this idea: German's difficulty for an English reader is the gap between letters and sounds, and the strips put that gap on screen in every step. The mouth and the grid then show the *cause* of each sound, which is what an analytical learner remembers.

Colour meaning, kept the same in every step:
- `caramel` = the German target sound in focus;
- `cinnamon` (large text and fills only) = the contrasting partner (the short vowel, the ach-Laut, the second word of a pair);
- `cherry` fill with `C.cherryText` labels = the English-habit error;
- `taupe` = axes, the labels of mouth parts, and "schematic" notes;
- `crema` and `latte` = words and IPA.

At most two accents per step (DESIGN.md).

**Shared scene components** (the builder writes them once in `scenes.tsx`, from `kit.tsx`):
- `WordStrip({word, sounds, links, highlight, voice?})`: the letter row (`T` s=20 crema) above the sound row (`T` s=20). Links are 1.5-unit taupe lines, and highlighted ones are caramel.
- `Mouth({tongue, lips, mark})`: a sagittal schematic about 260×220 units. The tongue body is a Bézier path interpolated between named poses ('rest', 'i', 'u', 'a', 'e', 'o', 'palatal', 'velar', 'uvular'). `lips` is 'spread' or 'round' and is drawn as the lip outline. `mark` is one place to pulse: 'lips' | 'hardPalate' | 'softPalate' | 'uvula' | 'glottis'. Place labels are `T` s=13 taupe, at most two visible at a time. A "schematic" tag in the corner (s=13 taupe).
- `VowelGrid({dots})`: rows for close, near-close, close-mid, open-mid and open; columns for front, central and back. A dot is a crema circle, and a rounded vowel gets a caramel ring. Placement follows the ADS descriptions (C17), not measurements, with a "schematic" tag.
- `LenBar({long})`: long bar 160 units, short bar 60 units, labelled "long" and "short" only, with no numbers.
- `VoiceTrack`: a 10-unit-tall bar under each sound tile, filled caramel = voiced, outlined only = voiceless.
- `Catch`: the Duden-Grammatik's vertical bar [|] (C61), drawn as a caramel bar 34 units tall between word strips with a small "ʔ" above it.

**Text sizes:** words and IPA 20–24 units, labels 13–15, the one key value 26+ (Fraunces for at most one word per step).

**Fonts and IPA glyphs (builder: check first).** The self-hosted JetBrains Mono latin-ext subset declares U+0100–02BA (IPA Extensions), U+02C8 (ˈ), U+02D0 (ː) and U+0329 (syllabic ̩) in its unicode-range. It does **not** declare U+032F (the non-syllabic ̯ in [ɐ̯] and [aʊ̯]) or U+0361 (the tie bar in [t͡s]). Check the actual glyphs in the woff2 (fontTools is not installed: `pip install fonttools`, then read the cmap). If ̯ or ͡ is missing, don't use the tie bar on screen (write [ts]). For ̯, check how it renders in the screenshots. If it falls back badly, write [ɐ] without the diacritic in the drawings and keep [ɐ̯] in the caption and Deep dive, which use the body font. Record which option was taken in "Changes after final" if it happens after final.

---

## The reel: 18 steps (8 predict steps, including 2 in Prove it), about 14 minutes

Canvas sizes are given as Svg `h` on the 600-unit width. "Portrait" is the phone frame (about 360×300 CSS px, scale ≈ 0.6). "Landscape" is desktop, where the visual is wider than tall, so most steps put two panels side by side. On desktop, keep the right 64 px clear.

### Step 1: "Is the kitchen in the rent?"
- **Layer:** 1, the problem. The registry `bridge` is shown on this step by the player.
- **Visual idea:** one German question, seen two ways. The letters stay the same while two vowels slip, and the meaning slips with them. This makes the cost of English reading habits concrete before any theory.
- **Portrait (Svg h=480):**
  - top, y 60: "you say" (s=14 taupe); y 110: „Ist die Küche in der Miete enthalten?" (s=24 crema, centred; if it doesn't fit 560 units at phone scale, break after "Küche"); y 145: "Is the kitchen included in the rent?" (s=14 latte).
  - middle, y 230–330: the same sentence again, with the ü in Küche and the ie in Miete drawn in cherryText, and below it the "heard" version "… Kuche… in der Mitte enthalten?" with the changed letters in cherryText and the gloss "… included in the middle?" (s=14 latte).
  - bottom, y 400–450: two small labels: "ie said short → Mitte" and "ü said as u → toward Kuchen 'cake'" (s=14 latte).
- **Landscape (Svg h=340):** two columns: left "what you meant" (German line plus gloss), right "what she may hear" (German line plus gloss), with an arrow between them. The two slip labels sit under the right column.
- **Beats:**
  - 0–0.8 s: the question types in letter by letter;
  - 0.8–1.4: the gloss fades in;
  - 1.6–2.4: the ie and ü tiles pulse cherry, then the second line drops in beneath with Mitte and the gloss;
  - 2.6–3.2: the slip labels appear;
  - 3.4–4.2: the agent's answer appears at the very bottom (y 470, s=15 latte): „Richtig. Das Bad und der Keller auch." with "?" marks over Richtig, Bad, und, auch.
- **Duration:** about 4.4 s.
- **Final frame:** the meant line, the heard line, the two slip labels, and the agent's answer with question marks. All the parts of the problem are on screen.
- **Caption (body):** "German starts with its sounds. On a flat viewing you ask „Ist die Küche in der Miete enthalten?" (is the kitchen included in the rent?). Say Miete with a short vowel and it becomes Mitte, 'middle'. Then the answer comes, and half of it doesn't sound like it's written. By the end of this reel you'll read both lines sound by sound. Notation: [square brackets] are sounds, not letters; ː means long."
- **Narration sketch:**
  - "Welcome to German. Before any grammar, its sounds."
  - "You're at a flat viewing, and you ask whether the kitchen is included in the rent."
  - {"de": "Ist die Küche in der Miete enthalten?"}
  - "Shorten one vowel, and rent turns into middle."
  - {"de": "Miete."} {"de": "Mitte."}
  - "Then the agent answers."
  - {"de": "Richtig. Das Bad und der Keller auch."}
  - "Half of that doesn't sound the way it's written. Six rules explain all of it."
- **Claims:** C13, C69, C70.

### Step 2: "Miete or Mitte?" (predict)
- **Layer:** 2, predict.
- **Visual idea:** the two strips with their vowel sound tiles hidden. The learner commits before seeing the cause.
- **Portrait (Svg h=440):** two WordStrips stacked, at y 120 and y 300.
  - Miete: letters M-i-e-t-e; sounds [m] [?] [t] [ə].
  - Mitte: letters M-i-t-t-e; sounds [m] [?] [t] [ə].
  - Glosses "rent" and "middle" (s=14 latte) to the right, or under each strip on phone.
  - The two t letters of Mitte link into **one** [t] tile from the start. That shows "doubled letter, one sound" without giving away the vowel.
- **Landscape (Svg h=320):** the two strips side by side.
- **Beats:** 0–0.6 the strips arrive; 0.6–1.2 the tt→[t] link draws; hold.
- **Duration:** 1.4 s.
- **Predict:**
  - Question (body): "Miete means rent, Mitte means middle. Apart from the spelling, what makes them two different words?"
  - Options:
    - **"The vowel: long and tense in Miete, short and lax in Mitte"** (correct)
    - "The t: held longer in Mitte, because it's written twice"
    - "The final e: spoken in Miete, silent in Mitte"
    - "Nothing you can hear: context tells them apart"
  - Explain: "The vowel. ie is a long, tense [iː]. i before a doubled consonant is a short, lax [ɪ], a little lower and (in most descriptions) slightly less front. The doubled t is spelling only, pronounced as one [t], and both words end in the same weak e, [ə]."
- **After answer (`answer !== null`):** the ? tiles flip. Miete gets [iː] in caramel with a long LenBar under it; Mitte gets [ɪ] in cinnamon with a short LenBar. The final [ə] tiles pulse once to show they are the same.
- **Final frame:** both strips fully transcribed, [ˈmiːtə] and [ˈmɪtə], with their bars.
- **Narration:** lines (question); answer: "The vowel. Long and tense in Miete... short and lax in Mitte." {"de": "Miete."} {"de": "Mitte."} "The double t is just spelling. You say one t."
- **Claims:** C2, C4, C12, C13, C41.

### Step 3: "Long and tense, short and lax"
- **Layer:** 3, mechanism, plus the spelling cues.
- **Visual idea:** a two-column ledger of real minimal pairs, LONG versus SHORT. Each row shows a long bar against a short bar and **highlights the letters that signal the length**, so the learner sees the pattern (ie / h / single consonant → long; doubled consonant → short) emerge across four rows. A small vowel grid at the top shows that the short vowels are also *different* vowels, except a, which differs only in length.
- **Portrait (Svg h=520):**
  - top band, y 20–170: a mini VowelGrid (front half only, width 300, centred).
    - i: [iː] dot at close-front, [ɪ] dot at near-close/near-front, with an arrow iː→ɪ labelled "lax" (s=13 taupe).
    - a: one dot at open-central labelled [a] = [aː], with "(nearly) only length" (s=13 latte). Fact-check: the ADS table gives a/aː (and ɛ/ɛː) identical quality descriptions, but SGP notes /aː/ is sometimes described as back [ɑː]; keep "nearly".
  - lower band, y 200–500: four rows, each about 70 units: long word (caramel, left x 40) and short word (cinnamon, right x 330), each with its LenBar under it.
    - Miete / Mitte
    - Höhle / Hölle
    - Ofen / offen
    - kam / Kamm
  - In each word the length signal is underlined: ie, öh, the single f followed by a vowel, the single m at the end vs tt, ll, ff, mm.
- **Landscape (Svg h=360):** the grid on the left (width 220), the ledger on the right (width 330), four rows.
- **Beats:**
  - 0–0.8: the grid; the iː dot slides to the ɪ position (tense → lax);
  - 0.8–1.4: the a dot pulses with "only length";
  - then one row every 0.7 s: both words, then their bars grow, then the underline;
  - 4.4–5.2: a footer line fades in (y 505, s=13 taupe): "cues, not guarantees: Mond is long; nothing marks length before ch".
- **Duration:** about 5.4 s.
- **Real values (sourced):**
  - Höhle /øː/ vs Hölle /œ/, Ofen /oː/ vs offen /ɔ/, kam /kaːm/ vs Kamm /kam/: ADS table and ORTH (C6, C8).
  - Mitte /ɪ/ (ADS table); Miete [ˈmiːtə], Mitte [ˈmɪtə] (C13, DWDS); Höhle [ˈhøːlə], Hölle [ˈhœlə], Ofen [ˈoːfn̩], offen [ˈɔfn̩] (de.wiktionary, DWDS Hölle).
  - Vowel descriptions (C17).
- **Final frame:** the grid, four ledger rows with bars and underlines, and the footer.
- **Caption (body):** "German pairs a long, tense vowel with a short, lax one: [iː]/[ɪ], [øː]/[œ], [oː]/[ɔ]. The short one is shorter **and** a different vowel. The exception is a: [a] and [aː] differ (almost) only in length (so do short e/ä [ɛ] and long ä [ɛː], for speakers who keep [ɛː]). The spelling usually tells you which: ie, a silent h, a doubled vowel, or a single consonant before another vowel means long; a doubled consonant means short. Usually, not always: Mond is long, and nothing marks length before ch (Drache vs Sprache). The full spelling system is the next topic."
- **Narration sketch:**
  - "Every German vowel comes in a pair: long and tense, or short and lax."
  - "The short one isn't just shorter. It's a slightly different vowel."
  - "Only a stays almost the same vowel, either way."
  - "Listen to the pairs."
  - {"de": "Höhle."} {"de": "Hölle."} {"de": "Ofen."} {"de": "offen."}
  - "And the spelling helps. A doubled consonant after a vowel means short. ie, a silent h, or a single consonant before another vowel means long."
  - "Helps... but doesn't promise. Some words break the pattern."
- **Claims:** C1–C12, C17.

### Step 4: "Where does ü come from?" (predict)
- **Layer:** 2, predict.
- **Visual idea:** a mouth schematic with the lips already **rounded** (ü is a rounded vowel, which the learner can see on a German speaker's face) and the tongue hidden under a "?". The trap is the letter itself: ü looks like u, but its tongue isn't u's.
- **Portrait (Svg h=460):** the Mouth (scaled to about 340×280) centred at the top, lips 'round' with a caramel pulse on the lips, the tongue drawn as a taupe dashed outline with "?". Below it, y 380: the letter "ü" (Fraunces s=44 crema) and the example "Mühle, über" (s=15 latte).
- **Landscape (Svg h=340):** the mouth on the left; the letter and examples on the right.
- **Beats:** 0–0.6 the mouth draws; 0.6–1.0 the lips round (scale the lip outline); 1.0 the "?" appears.
- **Duration:** 1.2 s.
- **Predict:**
  - Question (body): "Long ü (Mühle, über) is a rounded vowel: your lips round. Which German vowel does it share its tongue position with?"
  - Options:
    - **"Long i, as in Miete"** (correct)
    - "Long u, as in Mut"
    - "Short a, as in Kamm"
    - "The weak e at the end of Miete"
  - Explain: "Long i. ü [yː] is close and front, essentially where i [iː] is (at most a touch further back), with the lips rounded as for u. Keep the tongue of i and round your lips: that's ü. It isn't a kind of u at all."
- **After answer:** the dashed tongue morphs into the 'i' pose (front, high). Label "i's tongue" (s=14 caramel) at the tongue and "u's lips" (s=14 caramel) at the lips; the "?" becomes [yː].
- **Final frame:** the mouth with the front-high tongue and round lips, the two labels, and [yː].
- **Narration:** "Your lips round for this one. But where's your tongue?" Answer: "Exactly where it is for the long i in Miete." {"de": "Miete."} "Keep that tongue, round your lips..." {"de": "Mühle."} "That's the ü."
- **Claims:** C15, C16, C17, C20. (C71 dropped by the fact-check: Help:IPA gives "somewhat like few", not "meet with rounded lips".)

### Step 5: "ü and ö: front tongue, round lips"
- **Layer:** 3, mechanism.
- **Visual idea:** a vowel grid in which **umlaut is a visible movement**: the back rounded vowels u and o slide straight across to the front, keeping their rings. That is the definition of umlaut as fronting (C15). They land right next to i and e, which shows that ü and ö are i and e with rounded lips. a slides front to land on e's short partner [ɛ], so ä is the e sound.
- **Portrait (Svg h=500):** VowelGrid full width (560 × 360, y 40–400).
  - Rows: close (y 80), close-mid (y 180), open-mid (y 280), open (y 370).
  - Columns: front x 120 (unrounded dot) and 160 (rounded dot), back x 470.
  - Initial dots:
    - [iː] at (120, 80), [eː] at (120, 180), [ɛ] at (120, 280), plain dots;
    - [uː] at (470, 80) and [oː] at (470, 180) with rings;
    - [a] at (300, 370).
  - Labels s=17 crema next to the dots. Axis labels "front" and "back" (s=13 taupe) at the top, "close" and "open" (s=13 taupe) at the left.
  - Bottom band, y 420–490: example pairs in two lines: "Mühle [yː] · Höhle [øː]" and "Männer [ɛ] = Bett [ɛ]" (s=15 latte).
- **Landscape (Svg h=360):** the grid on the left (width 380); the examples stacked on the right.
- **Beats:**
  - 0–1.0: the grid and the starting dots;
  - 1.0–2.0: a ringed copy of [uː] slides from x 470 to x 160 on the close row, becoming [yː] (caramel ring), with a faint trail arrow;
  - 2.0–3.0: the same for [oː] → [øː];
  - 3.0–3.8: [a] slides up-left to sit on [ɛ], label "ä = [ɛ]" (cinnamon);
  - 3.8–4.6: the example lines fade in.
- **Duration:** about 4.8 s.
- **Real values:**
  - Descriptions: /iː/ geschlossen vorder ungerundet; /yː/ geschlossen vorder gerundet; /uː/ geschlossen hinter gerundet; /eː/ halbgeschlossen vorder ungerundet; /øː/ halbgeschlossen vorder gerundet; /oː/ halbgeschlossen hinter gerundet; /ɛ/ halboffen vorder ungerundet (C17).
  - Männer [ɛ] and Bett [ɛ] (C18); Mühle [yː] and Höhle [øː] (C8).
- **Final frame:** the grid with i·ü and e·ö side by side, u and o at the back with ghost arrows pointing front, ä on [ɛ], and the two example lines.
- **Caption (body):** "Umlaut means fronting. ü is u's rounded lips with i's tongue; ö is o's rounded lips with e's tongue. They come as pairs too: long [yː] in Mühle and short [ʏ] in Müller; long [øː] in Höhle and short [œ] in Hölle. ä is the odd one: short ä is exactly short e, [ɛ] (Männer, Bett), and many northern speakers say long ä like long e (Käse). Where umlauts can't be typed, write ae, oe, ue: the bare vowel would be wrong and misleading."
- **Narration sketch:**
  - "The dots in ü and ö mean: move this vowel to the front."
  - "U slides forward, and keeps its rounded lips. That's ü."
  - "O does the same. That's ö."
  - {"de": "Höhle."} {"de": "Hölle."}
  - "And a moves forward onto e. Short ä and short e are the same sound."
  - {"de": "Männer."} {"de": "Bett."}
- **Claims:** C15–C21, C8.

### Step 6: "One ch, two places"
- **Layer:** 3, mechanism.
- **Visual idea:** the **tongue doesn't jump**. Within one word, the mouth schematic shows the tongue at the vowel's place, and the ch is made where the tongue already is: front (hard palate) after i, ü and consonants, back (soft palate) after a, o and u. The two IPA symbols become one rule you can feel. A real umlaut pair, Buch [buːx] → Bücher [ˈbyːçɐ], closes the loop with the umlaut step: fronting the vowel moves the ch forward too. Küche vs Kuchen (the syllabus listening pair) then shows the same contrast in two unrelated words. Fact-check: Küche and Kuchen are not an umlaut pair (different words, different origins), and they differ in more than the vowel: short [ʏ] vs long [uː], [ç] vs [x], and -e [ə] vs -en [n̩]. Call them a near-minimal pair, never "the umlaut of Kuchen".
- **Portrait (Svg h=520):**
  - top, y 20–260: the Mouth, about 300 wide, centred. Two place marks: "hard palate" (front roof) and "soft palate" (back roof), s=13 taupe.
  - y 290: the current word strip (s=22), e.g. i-c-h → [ɪ][ç].
  - y 360–500: two lists that build up. Left column "[ç] front": ich, mich, nicht, Furcht. Right column "[x] back": ach, Buch, doch, hoch. Words s=16, the preceding vowel letter highlighted (caramel on the left, cinnamon on the right).
- **Landscape (Svg h=360):** the mouth on the left (width 260); the current word plus the two lists on the right.
- **Beats** (each word about 0.7 s: the strip appears, the tongue moves to the vowel pose, holds, the ch tile lights and its place mark pulses, then the word drops into its list):
  - 0–0.7: ich (tongue i → palatal, caramel);
  - 0.7–1.4: ach (tongue a → velar/uvular region, cinnamon; the mark pulses at "soft palate");
  - 1.4–2.1: Buch (u → velar);
  - 2.1–2.8: mich;
  - 2.8–3.5: Furcht (a consonant before ch → front: the r tile lights and the tongue goes front);
  - 3.5–4.2: doch;
  - 4.2–4.9: hoch;
  - 4.9–5.6: nicht;
  - 5.6–6.6: a final pair row at y 505: "Buch [x] → Bücher [ç]" (umlaut moves the ch), then "Küche [ʏ]+[ç] · Kuchen [uː]+[x]" (s=16), with the ü/u tiles in caramel/cinnamon. On phone, the Buch/Bücher row can replace the Küche/Kuchen row if both don't fit; Küche/Kuchen then stays in the narration and the Practice section.
- **Duration:** about 6.8 s.
- **Real values:**
  - ich [ɪç], ach [ax], Buch [buːx], mich [mɪç], Furcht [fʊʁçt], nicht [nɪçt], doch [dɔχ], hoch [hoːx] (C23–C27, C32);
  - Küche [ˈkʏçə] and Kuchen [ˈkuːxn̩] (C22, sourced: de.wiktionary); Buch [buːx] / Bücher [ˈbyːçɐ] and Koch [kɔx] / Köche [ˈkœçə] (C76, de.wiktionary).
- **Final frame:** the mouth with the both-places legend, both lists of four words, and the Küche/Kuchen row.
- **Caption (body):** "German has one ch sound with two places. After a, o, u and au it is made at the back: at the soft palate after u and o, and often further back, near the uvula, after a: the ach-Laut [x] (Buch, doch). Everywhere else (after i, e, the umlauts, ei and eu, and after consonants) it is made at the front, at the hard palate: the ich-Laut [ç] (ich, nicht, Furcht). The vowel *sound* before it decides, not the letter: eu ends in a u letter but takes [ç] (euch). So fronting the vowel moves the ch too: Buch [x], Bücher [ç]. [ç] is not sch: keep ich and Tisch apart."
  - The ei/eu clause is sourced (C31: de.wikipedia "Stimmloser palataler Frikativ"; DWDS euch [ɔɪ̯ç]; de.wiktionary leicht [laɪ̯çt]).
- **Narration sketch:**
  - "The letters c h make one sound, made in two places."
  - "Your tongue is already in place for the vowel... and the ch is made right there."
  - {"de": "ich."} {"de": "ach."}
  - "After a, o, u and au, it's at the back. Everywhere else, at the front."
  - {"de": "Buch."} {"de": "mich."} {"de": "doch."} {"de": "nicht."}
  - "So the umlaut moves the ch as well."
  - {"de": "Buch."} {"de": "Bücher."}
  - "And the pair to listen for."
  - {"de": "Kuchen."} {"de": "Küche."}
- **Claims:** C22–C32.

### Step 7: "Frauchen: ach or ich?" (predict)
- **Layer:** 2, predict.
- **Visual idea:** two strips that are spelled alike at the end (r-a-u-c-h-e-n and F-r-a-u-c-h-e-n) but **cut in different places**: rauch|en vs Frau|chen. The morpheme boundary, drawn as a gap, is the hidden variable.
- **Portrait (Svg h=420):**
  - y 120: rauchen "to smoke", sounds [ˈʁaʊ̯xən] already shown, with the [x] tile in cinnamon.
  - y 280: Frauchen, a diminutive of Frau "woman", with its ch sound tile shown as "?".
  - A thin vertical boundary appears in each word at its morpheme cut (rauch|en, Frau|chen) during the question frame. Showing it is fair: it is part of the setup.
- **Landscape (Svg h=320):** the two strips side by side.
- **Beats:** 0–0.6 the strips; 0.6–1.2 the boundaries drop in.
- **Duration:** 1.4 s.
- **Predict:**
  - Question (body): "rauchen ('to smoke') has the ach sound after au. Frauchen is the diminutive of Frau ('woman'): it also has au before ch. Which ch does it take?"
  - Options:
    - **"The ich sound, [ç]"** (correct)
    - "The ach sound, [x], as in rauchen"
    - "[k]"
    - "[ʃ], the sch sound"
  - Explain: "The ich sound. The diminutive suffix -chen is always [çən], whatever comes before it, so after au you get [ç] in Frauchen and [x] in rauchen. In rauchen the ch belongs to the stem rauch-. The cut in the word decides, not the letters. That holds for every -chen word."
- **After answer:** the "?" becomes [ç] (caramel); the |chen piece glows; a small tag "-chen → always [ç]" (s=14 caramel) appears at the bottom.
- **Final frame:** both strips fully transcribed, the boundaries, and the tag.
- **Narration:** lines (question), with {"de": "rauchen."} and {"de": "Frauchen."}; answer: "The ich sound. The little ending chen always takes it... even right after au." {"de": "Frauchen."} {"de": "rauchen."}
- **Claims:** C25, C31 (au → [x] part only).

### Step 8: "Two r's in Lehrer"
- **Layer:** 3, mechanism.
- **Visual idea:** one word, Lehrer ("teacher"), contains **both** German r's. The first, before a vowel, is a consonant made with the back of the tongue at the uvula; the mouth shows it. The last, -er, isn't a consonant at all: it becomes the vowel [ɐ], so the r tile literally moves off the consonant row onto the vowel grid. Then the general rule appears below.
- **Portrait (Svg h=520):**
  - top, y 40: the Lehrer strip, L-e-h-r-e-r → [l][eː][ʁ][ɐ]. The h links into [eː] (silent h = long, a callback to step 3). The first r links to [ʁ]; the final "er" pair links to one [ɐ] tile.
  - middle, y 140–330, split in two: on the left the Mouth (width 260) with the tongue in the 'uvular' pose and a mark on "uvula" (for [ʁ]); on the right a mini VowelGrid (width 260) with one caramel dot at near-open central labelled [ɐ].
  - bottom, y 360–510: three rule rows (s=15):
    - "before a vowel → [ʁ]  rot [ʁoːt]"
    - "end of a syllable, after a vowel → [ɐ̯]  der [deːɐ̯], wir [viːɐ̯]" (fact-check: plain "after a vowel" is wrong for Lehrer's first r, which follows e but comes before a vowel; vocalisation is regular after long vowels and variable after short ones, Help:IPA)
    - "-er → [ɐ]  besser [ˈbɛsɐ]  ≠  -e [ə]  bitte"
- **Landscape (Svg h=380):** the strip across the top; mouth, grid and rules in three columns.
- **Beats:**
  - 0–0.8: the strip;
  - 0.8–1.8: the first r tile lights, the tongue moves to the uvula, and the mark pulses;
  - 1.8–2.8: the "er" tile lifts off and flies to the [ɐ] dot on the grid;
  - 3.0–4.6: the rule rows, one per 0.5 s.
- **Duration:** about 4.8 s.
- **Real values:** Lehrer [ˈleːʁɐ] (northern; C39), rot [ʁoːt] (C35), der [deːɐ̯] (C36), wir [viːɐ̯] (C36), besser [ˈbɛsɐ] (C36), bitte [ə] (C41), ɐ near-open central (C38).
- **Final frame:** the strip, the mouth plus the grid, and the three rule rows.
- **Caption (body):** "German has two kinds of r. Before a vowel it is a consonant, usually made with the back of the tongue at the uvula, [ʁ] (rot, the first r in Lehrer); a tongue-tip r is also standard, mostly in the south. At the end of a syllable, after a vowel, it usually turns into a vowel glide, [ɐ̯] (der, wir), and the ending -er becomes the vowel [ɐ], close to a (Lehrer, besser). Keep it apart from the weak e of -e, [ə]: besser is not bitte."
- **Narration sketch:**
  - "This word has two r's, and they're different sounds."
  - {"de": "Lehrer."}
  - "The first comes before a vowel. It's a real consonant, made at the back, at the uvula."
  - "The second isn't a consonant at all. The ending e r becomes a vowel, close to a."
  - "And at the end of a syllable, after a vowel, an r turns into a little vowel glide."
  - {"de": "der."} {"de": "wir."} {"de": "besser."} {"de": "bitte."}
- **Claims:** C34–C39, C41, C42.

### Step 9: "Oper and Opa" (predict)
- **Layer:** 2, predict.
- **Visual idea:** two strips whose endings are spelled differently (-er vs -a) and fly onto the vowel grid. Do they land on the same dot? (Fact-check: question reframed from "are they the same?" to "which is closest?", because the dictionary standard the reel models (Duden 7th ed.; DWDS Opa [ˈoːpa], Oper [ˈoːpɐ]) still separates [ɐ] from [a] by height, while the 2020 study (Rathcke & Mooshammer, six northern speakers) found them merged. The new correct answer holds under both views.)
- **Portrait (Svg h=440):**
  - y 90: Oper "opera"; y 200: Opa "grandpa"; the ending tiles show "?".
  - below, y 260–420: a mini VowelGrid (centre and open area only) with [ɐ] (near-open central) and [a] (open) both marked faintly.
- **Landscape (Svg h=320):** strips on the left, grid on the right.
- **Beats:** 0–0.8 the strips and grid; hold.
- **Duration:** 1.2 s.
- **Predict:**
  - Question (body): "Oper ('opera') ends in -er; Opa ('grandpa') ends in a. In northern standard German, what is the ending of Oper closest to?"
  - Options:
    - **"The a at the end of Opa"** (correct)
    - "A consonant r, as in rot"
    - "The weak e at the end of Miete"
    - "The long u of Mut" (replaces an "English-style curled r" option: SGP records a retroflex r in Middle Hessian, so that option had a regional reading)
  - Explain: "The a of Opa. -er is the vowel [ɐ], just a little higher than a. Dictionaries still keep the two apart ([ˈoːpɐ] vs [ˈoːpa]), but a 2020 study of northern speakers found no reliable difference: there, Oper and Opa sound the same. In southern Germany -er often sounds more like the weak e, and in most of Switzerland the r stays a consonant."
  - Red-team note: "the weak e" is a real southern variant (Help:IPA, SGP), which is why the question says "northern standard German".
- **After answer:** both "?" tiles fly to two dots that sit almost on top of each other (caramel), and the label "[ˈoːpɐ] ≈ [ˈoːpa]: the same in northern speech" appears.
- **Final frame:** both strips transcribed, the two dots nearly touching.
- **Narration:** lines: {"de": "die Oper."} {"de": "der Opa."} (articles keep the speech-to-text check unambiguous; see Narration risks); answer: "Closest to the a of Opa. In the north, many speakers say them exactly the same. The ending e r is just a vowel, near a."
- **Claims:** C38, C40.

### Step 10: "Rad or Rat?" (predict)
- **Layer:** 2, predict.
- **Visual idea:** the voice track makes voicing visible. Two strips, Rad "wheel" and Rat "council", with voice tracks: Rat's final [t] is empty (voiceless); Rad's final tile is "?".
- **Portrait (Svg h=420):** strips at y 110 and y 270, each with its VoiceTrack under the sound row. Glosses at s=14.
- **Landscape (Svg h=300):** side by side.
- **Beats:** 0–0.6 the strips; 0.6–1.2 the voice tracks fill from left to right, and Rad's fill stops at the "?".
- **Duration:** 1.4 s.
- **Predict:**
  - Question (body): "Rad ('wheel') is written with d; Rat ('council') with t. How does northern standard German say them?"
  - Options:
    - **"Identically: [ʁaːt]"** (correct)
    - "Rad ends in a voiced d, as in English bad"
    - "Rad has a shorter vowel"
    - "Rad drops its final consonant"
  - Explain: "Identically. At the end of a syllable German loses the voice in b, d, g, v, z: Rad and Rat are both [ʁaːt]. Add an ending (Räder) and the d starts the next syllable, so its voice comes back. This is final devoicing, and English doesn't have it."
- **After answer:** Rad's "?" becomes [t] with an empty voice track (caramel outline); the two strips slide together into one sound row [ʁaːt]. A third strip drops in, Räder [ˈʁɛːdɐ], with a filled track under [d].
- **Final frame:** Rad = Rat [ʁaːt], and Räder with a voiced [d].
- **Narration:** lines: {"de": "das Rad."} {"de": "der Rat."}; answer: "They're identical. At the end of a syllable, a d loses its voice." {"de": "Räder."} "Add an ending, and the voice comes back."
- **Claims:** C44, C45, C49, C51.

### Step 11: "Tag sounds like Tak"
- **Layer:** 3, mechanism.
- **Visual idea:** the syllable boundary moves and voicing follows it. Each row is a word pair, a short form and a longer form. The consonant tile slides across the syllable gap and its voice track fills or empties as it crosses. Then a word-internal case (Hand|lung) proves the rule is about **syllables**, not word ends. Last, the spelling note: the letter keeps the voiced form, because German spells the stem.
- **Portrait (Svg h=520):** four rows, about 85 units each, from y 40:
  - "Tag [taːk]  ·  Tage [ˈtaːɡə]" (C54, sourced: DWDS Tag, de.wiktionary Tage)
  - "brav [bʁaːf]  ·  brave [ˈbʁaːvə]"
  - "Bad [baːt]  ·  Bäder [ˈbɛːdɐ]"
  - "lieb|lich [p]  ·  lie|ben [b]" (fact-check: replaces "Hand|lung [t] · han|deln [d]". AV writes Han[t]lung, but de.wiktionary writes Handlung [ˈhandlʊŋ], and Adler [ˈaːdlɐ] and Eigner [ˈaɪ̯ɡnɐ] likewise keep the voiced stop before l/n, because where the syllable boundary falls before l, n, r is disputed. lieblich [ˈliːplɪç] / lieben [ˈliːbn̩] (de.wiktionary) is undisputed. Alternatives: endlich [ˈɛntlɪç] / Ende [ˈɛndə]; Radweg [ˈʁaːtˌveːk]. Handlung goes to the Deep dive as the disputed case.)
  - Each row: the coda tile's voice track is empty (caramel outline); the onset tile's is filled (cinnamon).
  - Twist band, y 400–440: "one twist: -ig → [ɪç]  wichtig [ˈvɪçtɪç] (north)" (s=14). Fact-check: not an "exception" to devoicing (the result [ç] is voiceless too); it is an extra change of g to a fricative. Before -lich it stays [k]: königlich [ˈkøːnɪklɪç] (Deep dive).
  - Footer, y 480–510: "spelling keeps the stem: Tag, not Tak" (s=13 taupe).
- **Landscape (Svg h=380):** rows in a 2×2 grid, with the exception and footer across the bottom.
- **Beats:** each row 0.9 s (the short form appears, its coda tile's track empties, then the long form appears with the tile in its onset, track filled); 3.8–4.6 the exception band; 4.8–5.4 the footer.
- **Duration:** about 5.6 s.
- **Real values:** Tag [taːk] (C47, DWDS), Tage [ˈtaːɡə] (C54), brav/brave (C46), Bad/Bäder (C46), lieblich [ˈliːplɪç] / lieben [ˈliːbn̩] (C44 rule; C77 forms), wichtig [ˈvɪçtɪç] (C52).
- **Final frame:** four rows, the exception band and the footer.
- **Caption (body):** "Final devoicing (Auslautverhärtung): b, d, g, v, z and the rest of their class lose their voice at the end of a **syllable**, not only of a word: Tag [taːk], brav [f], lieb|lich [p]. When an ending pulls the consonant into the next syllable, its voice returns: Tage, brave, Bäder. German spells the stem, so the letter tells you the voiced form. One twist in the northern standard: final -ig becomes [ɪç], as in wichtig. English has no such rule, which is why Germans speaking English often harden final consonants, and why your English-style 'Tag' with a voiced g sounds foreign."
- **Narration sketch:**
  - "Here's the rule behind Rad and Rat."
  - "At the end of a syllable, these consonants lose their voice."
  - {"de": "Tag."} {"de": "Tage."} {"de": "brav."} {"de": "brave."}
  - "Not just at the end of a word. Inside one, too."
  - {"de": "lieblich."} {"de": "lieben."}
  - "The spelling keeps the original letter, so the related word tells you which one it is."
  - "One twist, in the north: the ending i g sounds like the ich sound."
  - {"de": "wichtig."}
- **Claims:** C44–C54.

### Step 12: "mein Auto" (predict)
- **Layer:** 2, predict.
- **Visual idea:** English **links** a final consonant onto the next word ("an apple" → "a napple"): the n tile slides across. German puts up a wall. The learner predicts which happens.
- **Portrait (Svg h=440):**
  - top, y 60–150: an English example row (s=15 latte): "an apple" with the n tile curving into "apple" → "a napple" (cherryText arrow). Label "English links" (s=13 taupe).
  - middle, y 230: the German strips "mein" and "Auto" side by side with a gap and a "?" in the gap.
  - Gloss "my car" (s=14 latte).
  - bottom, y 330–420: a small Mouth inset (width 160) with the mark on "vocal folds", inactive in the question frame.
- **Landscape (Svg h=320):** English on the left, German on the right, the mouth inset bottom right.
- **Beats:** 0–0.8 the English example animates the linking; 0.8–1.2 the German strips arrive with the "?".
- **Duration:** 1.4 s.
- **Predict:**
  - Question (body): "English runs 'an apple' together as 'a napple'. How does a northern German speaker join mein Auto ('my car')?"
  - Options:
    - **"mein | Auto: a catch in the throat before Au-"** (correct)
    - "mei-Nauto, linked like English"
    - "mein-wauto, with a glide"
    - "mei Auto, dropping the n"
  - Explain: "With a catch. Before a word that starts with a vowel, northern standard German closes the vocal folds and releases them: a glottal stop, [ʔ], the catch in English 'uh-oh'. So in careful speech mein Auto is [maɪ̯n ˈʔaʊ̯to], not 'mei Nauto'. German writes no letter for it."
- **After answer:** a Catch bar drops into the gap (caramel); the mouth inset's vocal folds close (two lines meet) then open; label [ˈʔaʊ̯to].
- **Final frame:** "mein | Auto", [ʔ] above the bar, the English linking row dimmed to 40% for contrast.
- **Narration:** lines: "English runs an apple together. How does German join these two words?" {"de": "mein Auto."}; answer: "With a little catch in the throat... like the middle of uh-oh." {"de": "mein Auto."}
- **Claims:** C55, C56, C60, C61.

### Step 13: "A catch before every vowel"
- **Layer:** 3, mechanism.
- **Visual idea:** a set of word strips where catch bars **drop in exactly at the starts of stems**, and visibly refuse to drop where a suffix begins. The learner sees the rule as "a vowel at the start of a meaningful piece".
- **Portrait (Svg h=520):** five rows of about 80 units, s=17 words with IPA under each:
  1. "Acht [ˈʔaxt]": catch at the word start.
  2. "be|achten [bəˈʔaxtən]": catch inside the word, at the stem.
  3. "The|ater [teˈʔaːtɐ]": catch before a stressed vowel after a vowel.
  4. "O|a|se [ʔoˈʔaːzə]": two catches in one word (SGP, KL). Fact-check: replaces "die Ode · Diode: the catch is in the first only". That is wrong. Diode has its own catch by the hiatus rule of row 3: de.wiktionary gives [diˈʔoːdə]. So die Ode [diː ˈʔoːdə] and Diode [diˈʔoːdə] differ in the length of i and the word boundary, not in the catch. The other "minimal pairs" in KL also differ in more than the catch: Spiegel-Ei/Spiegelei in stress (KL says so), Sandaale/Sandale in stress and [t]/[d] (Sandale [zanˈdaːlə]). This goes to the Deep dive's open questions.
  5. "Ach|tung · Fah|rer": no catch before the suffix, because it attaches to the consonant before it. Shown as a crossed-out ghost bar (taupe), never cherry, since nothing is wrong. Builder: Achtung still has a catch at its start ([ˈʔaxtʊŋ]); draw the word-initial bar and put the ghost bar only at the -ung cut.
  - Footer, y 500: "not a phoneme: a boundary marker · north, careful speech" (s=13 taupe).
- **Landscape (Svg h=380):** rows 1–4 in a 2×2 grid, row 5 and the footer across the bottom.
- **Beats:** one row every 0.8 s, the bar dropping with `easeOutBack`; row 5's ghost bar appears, shakes slightly (position only), and fades to 30%; footer at 4.4 s.
- **Duration:** about 4.8 s.
- **Real values:** Acht [ˈʔaxt]; beachten [bəˈʔaxtʰən] (shown as [bəˈʔaxtən]: aspiration dropped for clarity; the Deep dive gives the full form); Theater [teˈʔaːtɐ] (KL; DWDS also writes [teˈʔaːtɐ]; de.wiktionary gives [teˈaːtɐ] as well, so the hiatus catch is optional); Oase [ʔoˈʔaːzə]; Ach-tung, Fah-rer (C57, C63).
- **Final frame:** all five rows, the bars in place, the ghost in row 5, and the footer.
- **Caption (body):** "In standard German from Germany, a glottal stop comes before a vowel that starts a word (Acht), a stem inside a word (be|achten), or a stressed syllable right after another vowel (The|ater). It never comes before a suffix: Achtung and Fahrer link straight through. It isn't a phoneme: it marks where a word or stem begins, leaving it out doesn't by itself make a different word, and casual speech often drops it."
- **Narration sketch:**
  - "So where does the catch go?"
  - "Before a vowel that starts a word, or that starts a stem inside one."
  - {"de": "Acht."} {"de": "beachten."}
  - "Before a stressed vowel that follows another vowel."
  - {"de": "Theater."}
  - "It can even come twice in one word."
  - {"de": "Oase."}
  - "But never before an ending."
  - {"de": "Achtung."}
- **Claims:** C56, C57, C59, C62, C63 (C58 removed from the reel by the fact-check).

### Step 14: "One standard, three countries"
- **Layer:** 4, trade-offs and variation.
- **Visual idea:** a compact comparison grid: four rules down the side, three standard varieties across the top. Each cell is a ✓, a — or a short IPA value. The variety is visible at a glance, and nothing in it is "wrong German".
- **Portrait (Svg h=500):**
  - header row, y 50: "Germany (north)" | "Austria" | "Switzerland" (s=13 latte; on phone use two lines: "Germany" with "(north)" below).
  - Rows (s=15):
    - "Rad → [ʁaːt]": ✓ | — | —
    - "mein | Auto": ✓ | — | —
    - "-ig → [ɪç]": ✓ | [ɪɡ̊] | [ɪɡ̊]
    - "-er → [ɐ]": ✓ | ✓ | less common
  - Footer, y 470: "all three are standard German · this reel models the dictionary standard" (s=13 taupe).
- **Landscape (Svg h=340):** the same grid, wider columns.
- **Beats:** the header 0–0.6; then one row every 0.8 s, cells filling left to right; footer at 4.0 s.
- **Duration:** about 4.4 s.
- **Real values (sourced):**
  - devoicing absent in Austrian and Swiss standard (C49);
  - glottal stop absent in Austrian and Swiss standard (C59);
  - -ig [ɪɡ̊] in Austro-Bavarian and Alemannic standard varieties (C52);
  - [ɐ] less common in Switzerland (C38).
  - Austria may use [x] for every ch (C30), and the tongue-tip r is common in the south (C35): both go in the caption, not the grid, to keep four rows.
- **Final frame:** the full grid and the footer.
- **Caption (body):** "German is pluricentric: newsreaders in Germany, Austria and Switzerland each speak a standard of their own. Final devoicing and the glottal stop are northern features of the standard from Germany (devoicing is absent in southern Germany too, and the catch is much rarer there); Austrian and Swiss standard German have neither. In the south, Austria and Switzerland, -ig keeps a soft g, a tongue-tip r is common, and in Austria ch may be [x] even after front vowels. This reel models the dictionary standard usually taught to learners. Hearing the others is part of the skill."
- **Narration sketch:**
  - "German has more than one standard."
  - "Newsreaders in Germany, Austria and Switzerland each sound a little different... and all of them are correct."
  - "The hard final consonant and the catch in the throat are from northern Germany. Austrian and Swiss speakers do without both."
  - "This course models the standard in the pronunciation dictionaries. Expect the others."
- **Claims:** C30, C35, C38, C49, C52, C59, C66, C67.

### Step 15: "Back to the viewing"
- **Layer:** 1, resolved (the worked example).
- **Visual idea:** the opening exchange again, now **annotated**. Each word gets its sound strip, and each feature lights up in the order it was taught. The final frame is the whole problem, solved.
- **Portrait (Svg h=540):**
  - top half, y 30–250: the question in German (s=20) with its IPA under it (s=17): [ʔɪst diː ˈkʏçə ʔɪn deːɐ̯ ˈmiːtə ʔɛntˈhaltn̩]. On phone the German line wraps after Küche and the IPA after ˈkʏçə.
  - bottom half, y 290–520: the answer (s=20) with its IPA (s=17): [ˈʁɪçtɪç | das baːt ʔʊnt deːɐ̯ ˈkɛlɐ ʔaʊ̯x], wrapping after baːt.
  - Under the IPA, small taupe tick labels (s=13) appear one at a time under the relevant symbols and fade to 50% once the next appears: "long", "ü", "ç", "ʁ", "ɐ", "-ig", "devoiced", "ʔ", "x".
- **Landscape (Svg h=380):** each sentence on one line.
- **Beats:**
  - 0–0.8: both German lines;
  - 0.8–1.6: the IPA types in;
  - then the features light in reel order, about 0.6 s each: length (iː in Miete, caramel; ɪ in ist, cinnamon) → ü (ʏ) → ç (Küche, Richtig) → ʁ (Richtig) and ɐ̯/ɐ (der, Keller) → devoicing (t in baːt and ʊnt) → ʔ (ʔɪst, ʔɪn, ʔɛnt…, ʔʊnt, ʔaʊ̯x) → x (aʊ̯x);
  - 6.4–7.0: all highlights settle to caramel underlines.
- **Duration:** about 7.2 s.
- **Final frame:** both lines, fully transcribed, with every feature underlined and the "Mitte" ghost gone.
- **Caption (body):** "Both lines, sound by sound (citation forms; die and der often weaken in fast speech). Miete with a long [iː], Küche with [ʏ] and the front [ç]. Richtig: a back [ʁ], two ich-Laute, -ig as [ɪç]. Bad and und end in [t]. der and Keller vocalise their r. Catches before ist, in, enthalten, und, auch, and the ach-Laut after au. Every mark is one of six rules."
- **Narration sketch:**
  - "Back to the flat. Here's your question again."
  - {"de": "Ist die Küche in der Miete enthalten?"}
  - "A long vowel in Miete. A front vowel with rounded lips in Küche, and the ch at the front."
  - "And her answer."
  - {"de": "Richtig. Das Bad und der Keller auch."}
  - "A back r, the ich sound twice, hard endings on Bad and und, an r that turns into a vowel, a catch before each vowel, and the ach sound after au."
  - "Six rules. That's the whole system."
- **Claims:** C69, C70 plus every feature claim.

### Step 16: "In one breath"
- **Layer:** recap.
- **Visual idea:** six stacked rule cards. Each is one line with one example and its sound, in the colours the reel used. It is the still summary of the topic.
- **Portrait (Svg h=520):** six rows of about 80 units. Per QUALITY.md #44, the label and the example are **stacked in two lines**, never side by side:
  1. "length": "Miete [iː] ≠ Mitte [ɪ]"
  2. "umlaut": "ü = i's tongue + round lips"
  3. "ch": "ich [ç] · ach [x] · -chen [ç]"
  4. "r": "rot [ʁ] · der [ɐ̯] · Lehrer [ɐ]"
  5. "devoicing": "Rad = Rat [ʁaːt]"
  6. "catch": "mein | Auto"
  - Labels s=13 taupe, examples s=16 crema, with key symbols in caramel.
- **Landscape (Svg h=360):** a 2×3 grid of cards.
- **Beats:** one card every 0.5 s.
- **Duration:** about 3.2 s.
- **Final frame:** all six cards.
- **Caption (body):** "Six rules: long and tense vs short and lax; ü and ö as front vowels with rounded lips; ch follows the vowel before it, except -chen; r is a consonant before a vowel and a vowel after one; consonants lose their voice at the end of a syllable; a catch before vowel-initial words and stems (in the standard from Germany)."
- **Narration:** one sentence per card, with a de line for each example word.
- **Claims:** recap only.

### Step 17: "Prove it · 1 of 2" (predict)
- **Visual idea:** a strip that combines three rules in one word. Hund [hʊnt] is shown; Hündchen's sound row is blank.
- **Portrait (Svg h=400):** y 110: Hund [hʊnt]; y 260: Hündchen, sound tiles "? ? ? ?". Morpheme cut shown: Hünd|chen.
- **Landscape (Svg h=300):** side by side.
- **Duration:** 1.2 s.
- **Predict:**
  - Question (body): "Hund ('dog') is [hʊnt]. Apply every rule you've seen: how is Hündchen ('little dog') pronounced?"
  - Options:
    - **"[ˈhʏntçən]"** (correct; fact-check: changed from [ˈhʏntçn̩] so that the answer matches step 7's "-chen is always [çən]" and every wrong option differs from it in exactly the rules being tested. de.wiktionary gives [ˈhʏntçən]; SGP gives [ˈhʏntçn̩]; both are right)
    - "[ˈhʊndxən]" (no rule applied)
    - "[ˈhʏndçən]" (no devoicing)
    - "[ˈhʊntçən]" (no umlaut)
  - Explain: "[ˈhʏntçən]. Three rules at once:
    - the umlaut fronts u to ü, still short before two consonants: [ʏ];
    - d ends the syllable Hünd-, so it devoices: [t];
    - -chen takes the ich sound: [ç] (here it would anyway, after the t; Frauchen showed the rule wins even after au).

    In quick speech the weak e before n often disappears, leaving a syllabic n: [ˈhʏntçn̩]."
- **After answer:** the tiles fill in sequence, ʏ (caramel) → t (empty voice track) → ç → ən, then a small taupe note "fast: [ˈhʏntçn̩]".
- **Narration:** answer: "Umlaut, final devoicing, and the chen rule, all in one word." {"de": "Hündchen."}
- **Claims:** C25 (Hund/Hündchen is SGP's own example), C41 (syllabic n), C44.

### Step 18: "Prove it · 2 of 2" (predict)
- **Visual idea:** a speech bubble from a Viennese colleague with two tags: "Rad: soft d" and "mein Auto: no catch". The learner decides whether these are errors. The final frame reuses step 14's grid with the Austria column highlighted.
- **Portrait (Svg h=420):** a bubble at the top (y 40–180) with the two tags (s=15). At the bottom (y 230–400), step 14's grid, shrunk, with the Austria column dimmed.
- **Landscape (Svg h=320):** the bubble on the left, the grid on the right.
- **Duration:** 1.2 s.
- **Predict:**
  - Question (body): "A colleague from Vienna says Rad with a soft final d and runs mein Auto together without a catch. Is she making mistakes?"
  - Options:
    - **"No: Austrian standard German has neither rule"** (correct)
    - "Yes, both are errors"
    - "Only the soft d is an error"
    - "Only the missing catch is an error"
  - Explain: "No. Final devoicing and the glottal stop belong to the northern standard of Germany. Austrian and Swiss standard German have neither. In Austrian standard German b, d and g are soft (lenis) and voiceless everywhere, so there is nothing to harden at the end. Both pronunciations are correct Austrian standard."
- **After answer:** the Austria column lights up (caramel outline) on the "—" cells.
- **Narration:** answer: "Not a mistake. Austrian standard German doesn't harden final consonants, and doesn't use the catch."
- **Claims:** C49, C59, and C49's lenis note (SGP L86).

**End card handoff** (registry `handoff`): "You can hear the system now. Next: Spelling-to-sound rules: read ei and ie, sch, sp and st, z, v and w, and ß against ss straight off the page."

---

## Prerequisites panel (`prerequisites.mdx`)

No German is needed. Items:
1. **"You speak English."** The reel compares with English sounds (uh-oh, an apple). Self-check: can you hear the catch in the middle of "uh-oh"?
2. **"Square-bracket notation (IPA), the basics: explained in the reel."** [ ] means sound, not spelling; ː means long; ˈ marks the stressed syllable. Self-check: how many sounds does the IPA [ˈmɪtə] contain? (Four: m, ɪ, t, ə. The builder asserts 4 in examples.py if this number goes on screen; in mdx it is prose.)

Resources, each verified by the builder for a 200 status and a matching title:
- the International Phonetic Association's IPA chart page (https://www.internationalphoneticassociation.org/content/ipa-chart);
- the Wikipedia page "Help:IPA/Standard German" (https://en.wikipedia.org/wiki/Help:IPA/Standard_German).

No on-site reels come before this one. Leave out any metadata (author, length) that can't be verified.

---

## Bridge and handoff

- **Bridge** (registry; this is the course start, so it is a welcome, not a link back): "German starts here. Before any grammar, the sounds: six places where English reading habits will mislead you, and the mechanism behind each."
- **Handoff:** "You can hear the system now. Next: Spelling-to-sound rules: read ei and ie, sch, sp and st, z, v and w, and ß against ss straight off the page."
- **Keep for the next topic:** ß vs ss, ei vs ie, sp/st, z/v/w, and initial ch in loanwords (China, Chemie). This topic uses ie only as "the long i" and mentions ß nowhere in the reel.

---

## Concept ledger (registry entry)

```ts
introduces: [
  'ipa-notation',            // [ ] sounds vs spelling, ː long, ˈ stress (step 1 caption)
  'phoneme-vs-allophone',    // one ch, two places; r and [ɐ]; Deep dive "The system in one table"
  'vowel-length',            // Miete/Mitte (steps 2–3)
  'tense-lax-vowels',        // quality goes with length (step 3)
  'length-spelling-cues',    // ie, h, doubled vowel, doubled consonant (step 3)
  'umlaut-vowels',           // ä ö ü as fronting (step 5)
  'front-rounded-vowels',    // ü = i tongue + round lips (steps 4–5)
  'schwa',                   // [ə] in -e, syllabic n (steps 2, 8, 17)
  'ich-laut-ach-laut',       // [ç]/[x] by the preceding sound (step 6)
  'chen-ich-laut',           // -chen always [ç] (step 7)
  'uvular-r',                // [ʁ] (step 8)
  'vocalised-r',             // [ɐ̯], -er [ɐ] (steps 8–9)
  'final-devoicing',         // syllable-coda devoicing (steps 10–11)
  'ig-ending',               // -ig [ɪç] north, [ɪɡ̊] south (steps 11, 14)
  'glottal-stop',            // [ʔ] before vowel-initial stems (steps 12–13)
  'standard-german-varieties', // DE / AT / CH standards (step 14)
  'minimal-pairs',           // the method (steps 2–3, Practice)
],
uses: [],
declared: ['english'],       // the learner's own language, used for comparisons (uh-oh, an apple)
```

Registry fields:
- `id: 'ger.sound-system'`, `domain: 'german-language'`, `kind: 'full'`;
- `milestone: { number: 1, title: 'A1: The Sound and Skeleton of German' }` (check against the syllabus heading the build parses);
- `chapter: { number: 1, title: 'Sounds and Spelling', section: '1.1' }`;
- `minutes: 14`;
- `status`: 'live' if it is the first German topic and nothing precedes it, which the flow check allows.

---

## Deep dive (`index.mdx`): headings and coverage

1. **`## After this topic you can`**: the seven outcomes.
2. **`## The system in one table`**:
   - phoneme vs allophone, in one paragraph;
   - the vowel inventory (C68: about 15 monophthong phonemes from 8 letters), the full ADS table: Kamm/kam, Stelle, Käse/stehlen, Mitte/Mieter, offen/Ofen, Hölle/Höhle, Mutter/Mut, Müller/Mühle, bitte (ə), with the German descriptions translated (C8, C17);
   - the consonants this topic touches.
3. **`## Into the system`**
   - **`### Vowels: length and tension`**:
     - quantity vs quality analyses (C3, C2);
     - lax vowels are "checked", so a stressed final vowel is long (C2);
     - unstressed long vowels shorten (vital, Genom; C14), which the stress topic returns to;
     - spelling cues and their failures in full: Mond, Drache/Sprache, function words an, das, es, in, mit, von (C9–C11);
     - the [ɛː] question (C19).
   - **`### The umlaut vowels`**:
     - fronting (C15); rounding (compressed lips, C16);
     - near-front placement of the rounded front vowels (C16);
     - ä = e (C18);
     - ae/oe/ue substitution (C21), with a pointer to "Introducing yourself";
     - umlaut as grammar (Gast–Gäste), with a pointer to "Plural formation".
   - **`### Schwa and the -er vowel`**:
     - [ə] only unstressed (C41); syllabic n/l (Kissen [ˈkɪsn̩]);
     - [ɐ] near-open central; Oper = Opa (2020 study) and Wiese's neutralisation note (C40);
     - -er in other regions [ʀ̩]/[r̩] (C37).
   - **`### ich-Laut and ach-Laut: one phoneme`**:
     - complementary distribution (C24);
     - why [ç] is the underlying form: Chemie, Molch (C26);
     - Kohler's [x] vs [χ] (C27);
     - -chen and Frauchen (C25);
     - the Western [ʃ] merger and the Fisch hypercorrection (C29);
     - Austrian [x] (C30);
     - word-initial ch in loanwords, with a pointer to "Spelling-to-sound rules";
     - "Laut" = sound (C72).
   - **`### The r and its variants`**:
     - uvular fricative or approximant [ʁ] (the most common; Mangold); uvular trill [ʀ] (conservative); apical trill [r] (south) (C34, C35);
     - Kohler: place varies uvular (rot) to velar (treten) (C43);
     - the r-vocalisation table (wir, für, mehr, Oper, Bär…) (C36);
     - Austrian Lehrer [ˈlɛɐ̯ʁɐ] and rar [ʁɑː] (C39).
   - **`### Final devoicing, fortis and lenis`**:
     - the rule stated on syllable codas (C44); the affected classes (C48);
     - loanwords (Klub, Trend);
     - fortis/lenis as the better analysis, and aspiration (C53);
     - -g → [ç]/[x] colloquially in central and northern Germany (Krieg, lag) vs the prescribed -ig (C52); -ig before -lich stays [k]: königlich [ˈkøːnɪklɪç] (de.wiktionary);
     - the disputed cases (fact-check): AV writes Han[t]lung and Ei[k]ner, de.wiktionary writes Handlung [ˈhandlʊŋ], Eigner [ˈaɪ̯ɡnɐ], Adler [ˈaːdlɐ]. Before l, n, r the syllable boundary (and so devoicing) is analysed differently; lieblich [ˈliːplɪç], endlich [ˈɛntlɪç] and Radweg [ˈʁaːtˌveːk] are not disputed;
     - history: Middle High German spelled it, tac vs tages (C50).
   - **`### The glottal stop as a boundary marker`**:
     - all the contexts (C57); exceptions (erinnern, Verein both ways, but vereinen always) (C57);
     - Thea vs Theater (C63); Spiegel-Ei vs Spiegelei (stress differs too) (C58); why the often-cited "minimal pairs" are not clean: die Ode [diː ˈʔoːdə] vs Diode [diˈʔoːdə] (both have a catch; they differ in the length of i), Sandaale vs Sandale [zanˈdaːlə] (stress and [t]/[d] differ) (C58, corrected);
     - not a phoneme (C62); Beamter (C65);
     - Duden notation [|] (C61).
4. **`## Practice: minimal pairs, out loud`** (layer 6, adapted; the lab for a language topic):
   - What exists: with sound on, steps 2, 3, 5, 6, 9, 10 and 12 have the German voice say the pairs (Miete/Mitte, Höhle/Hölle, Ofen/offen, Küche/Kuchen, die Oper/der Opa, das Rad/der Rat, mein Auto). Replay a step with R or the replay control, say the pair in the hold, and check yourself against the transcription.
   - A printed table of the syllabus pairs with IPA: Miete/Mitte, Hölle/Höhle, Küche/Kuchen, plus Müller/Mühle, Kamm/kam.
   - A self-check list: "Is your Mitte shorter **and** lower than your Miete? Do your lips stay round through ü? Does your tongue stay back after a, o, u?"
   - Say plainly: "The German here is a synthetic voice, not a native speaker. Where the voice and the transcription seem to disagree, trust the transcription. Recording yourself and comparing against a model is not available on this site. Your phone's voice recorder works for now."
   - Never claim native audio.
5. **`## In real life`**:
   - **`### Germany, Austria, Switzerland`**: the full variation table: rows of step 14 plus [ç]→[x] in Austria, apical r, the /ɛː/ merger in the north and east of Austria, Austrian /k/ affrication, Austrian -ar → [ɑː] (C19, C30, C35, C39, C49, C52, C59, C66, C67).
   - **`### Mistakes in both directions`**:
     - what English speakers get wrong: short Miete, u for ü, k or h for ch, sch for ich, an English r, a voiced final d, linking mein Auto;
     - what Germans get wrong in English (final devoicing and the glottal stop carried over: C51, C64), since learners will hear it from colleagues.
6. **`## Open questions`** (layer 8, frontier):
   - is /ɛː/ a phoneme (C19);
   - the Oper = Opa merger: Rathcke & Mooshammer (2020; six northern speakers, read speech) vs Duden 7th ed., which keeps [ɐ] and [a] apart by height (C40);
   - whether [ç] or [x] is underlying (C26);
   - why the glottal stop isn't a phoneme, and why the pairs said to show it separating words (Spiegel-Ei/Spiegelei, die Ode/Diode, Sandaale/Sandale) all differ in something else too (C58 corrected, C62);
   - Küche: [ˈkʏçə] in the dictionaries, but often a long [ˈkyːçə] in northern standard speech (de.wiktionary citing the Duden Aussprachewörterbuch, 2015);
   - transcription conventions differ: DWDS writes [ʀ] and [χ] (Rad [ʀaːt], auch [aʊ̯χ]), the reel writes [ʁ] and [x]; neither is wrong;
   - its newer use as a "gender pause" (one sentence, KL L589; out of the reel, see coverage).
7. **`## Prove it`**: the two reel questions, plus four more with worked answers:
   - (a) "rauchen vs Frauchen: why do they differ?";
   - (b) "Is lieblich said with [b] or [p], and why does 'only at the end of a word' fail?" (fact-check: was Handlung, whose transcription is disputed);
   - (c) "Thea vs Theater: where does the catch go?";
   - (d) "Debug this transcription: [ˈʁaːd] for Rad in northern standard." (Answer: devoicing, [ʁaːt].)
8. **`## Sources`**: every source in `SOURCES.md` plus the sources the fact-check added (DWDS, de.wiktionary, Help:IPA, de.wikipedia ich-Laut, Rathcke & Mooshammer 2020), with "last verified" and "Expert sign-off: pending".

---

## Examples to execute (`examples.py`, Python 3, no network)

Everything shown on screen comes from here (topic-checks rule 3). Each word's IPA is a constant with a comment naming its source (SOURCES.md section, or the TBS file once fetched). The functions **derive** surface forms from simple underlying forms, and the asserts check them against the sourced transcriptions.

1. **`VOWELS`**: a feature table from the ADS descriptions:
   - `{ 'iː': ('close','front','unrounded','long'), 'yː': ('close','front','rounded','long'), 'uː': ('close','back','rounded','long'), 'eː': ('close-mid','front','unrounded','long'), 'øː': ('close-mid','front','rounded','long'), 'oː': ('close-mid','back','rounded','long'), 'ɪ': ('near-close','near-front','unrounded','short'), 'ʏ': ('near-close','near-front','rounded','short'), 'ʊ': …, 'ɛ': ('open-mid','front','unrounded','short'), 'œ': ('open-mid','front','rounded','short'), 'ɔ': ('open-mid','back','rounded','short'), 'a': ('open','front-to-back','unrounded','short'), 'aː': ('open','front-to-back','unrounded','long'), 'ɛː': ('open-mid','front','unrounded','long') }`.
   - Asserts:
     - `umlaut('uː') == 'yː'` where `umlaut(v)` = the vowel with v's height and rounding, backness set to front;
     - `height/backness(yː) == height/backness(iː)` and `rounding(yː) == rounding(uː)`; the same for øː against eː and oː;
     - aː and a differ only in length;
     - `len(VOWELS) == 15` (C68, "rund 15", schwa excluded);
     - `len(VOWEL_LETTERS) == 8` (Deep dive only).
2. **`length_from_spelling(word)`** → 'long' | 'short' | 'unknown', implementing only step 3's cues:
   - ie / vowel+h / a doubled vowel / a single consonant letter followed by a vowel letter → long;
   - a doubled consonant letter, ck, tz → short;
   - a vowel before ch or sch → unknown.
   - Asserts:
     - Miete long, Mitte short, Höhle long, Hölle short, Ofen long, offen short, kam long, Kamm short;
     - Saat/See/Moor long, Zahn long, Liebe long, Sonne short;
     - Drache and Sprache 'unknown' (C11);
     - `'Mond'` is listed in `EXCEPTIONS` and the rule alone returns short while the source says long. Assert that mismatch, to document "cues, not guarantees".
3. **`ch_sound(stem, suffix='')`** → 'ç' | 'x':
   - if the suffix is 'chen' → 'ç';
   - if the stem starts with ch → 'ç' (northern loanword onset, Chemie; Deep dive only);
   - else look at the vowel or consonant before ch: au, a, o, u → 'x'; anything else (i, e, ä, ö, ü, ei, ai, eu, äu, a consonant) → 'ç'.
   - Asserts: ich ç, mich ç, nicht ç, Furcht ç, manchmal ç, Molch ç, ach x, Buch x, Bach x, doch x, hoch x, rauch|en x, Frau|chen ç, Hünd|chen ç, Drache x, Sprache x; Küche ç and Kuchen x; Bücher ç, Koch x, Köche ç; euch ç and leicht ç (all sourced by the fact-check).
   - The diphthongs must be matched before single letters: eu/äu/ei/ai → ç, then au → x, then a/o/u → x. (euch ends in the letter u but is [ç]; a letter-by-letter rule gets it wrong.)
   - Also assert `ch_sound('Kuchen')` is x **without** treating the spelled -chen as the suffix. Kuchen is the test that the rule is morphological.
4. **`devoice(syllables, region='north')`**: input a syllabified phonemic form (a list of syllables). In each syllable's coda, map b→p, d→t, ɡ→k, v→f, z→s, ʒ→ʃ, except the ending ɪɡ in the north → ɪç. `region in ('AT','CH')` returns the form unchanged.
   - Asserts: ['ʁaːd'] → 'ʁaːt' == Rat's 'ʁaːt'; ['ʁɛː','dɐ'] unchanged; ['taːɡ'] → 'taːk' (C47); ['baːd'] → 'baːt'; ['bʁaːv'] → 'bʁaːf'; ['bʁaː','və'] unchanged; ['liːb','lɪç'] → 'liːplɪç' and ['liː','bən'] keeps b (the on-screen pair); ['ɛnd','lɪç'] → 'ɛntlɪç'; (Handlung is not asserted: its transcription is disputed); ['tsuːɡ'] → 'tsuːk'; ['loːz'] → 'loːs'; ['ʁiːb'] → 'ʁiːp'; ['vɪç','tɪɡ'] → 'vɪçtɪç' (C52); `devoice(['ʁaːd'], 'AT') == 'ʁaːd'`.
5. **`r_surface(phonemic)`**: /r/ before a vowel → ʁ; /ər/ → ɐ; /r/ after a vowel → ɐ̯.
   - Asserts: /ˈleːrər/ → ˈleːʁɐ (C39); /ˈoːpər/ → ˈoːpɐ (C40); /viːr/ → viːɐ̯; /fyːr/ → fyːɐ̯; /zeːr/ → zeːɐ̯; /ˈbɛsər/ → ˈbɛsɐ; /roːt/ → ʁoːt; /deːr/ → deːɐ̯ (C36). Also assert Oper's surface == Opa's northern surface 'ˈoːpɐ' (C40, Rathcke & Mooshammer 2020), and that the dictionary forms differ (DWDS Oper 'ˈoːpɐ', Opa 'ˈoːpa').
6. **`glottal(words, region='north')`**: words given as morph lists with stem boundaries and the stressed-syllable index. Insert ʔ before a vowel that starts a word or a stem, and before a stressed vowel that follows a vowel; never before a suffix; nothing in 'AT' or 'CH'.
   - Asserts: mein Auto → 'maɪ̯n ʔaʊ̯to'; Acht → 'ʔaxt'; be+achten → 'bəʔaxtən'; Theater → 'teʔaːtɐ'; Thea → 'teːa' (no ʔ); Oase → 'ʔoʔaːzə'; Acht+ung → 'ʔaxtʊŋ' (one ʔ only); ver+einen → 'fɛɐ̯ʔaɪ̯nən'; die Ode → 'diː ʔoːdə' and Diode → 'diʔoːdə' (hiatus rule; de.wiktionary [diˈʔoːdə]); assert both contain ʔ, so the pair does not differ in the catch; region 'AT' → 'maɪ̯n aʊ̯to'.
7. **`opening()`**: builds both opening lines (question with „enthalten") from the per-word IPA constants (DWDS and de.wiktionary forms, C69) through `glottal`, `devoice` and `r_surface`.
   - Assert equality with the two target strings in this outline.
   - Assert the set of features found (via simple detectors) covers all six syllabus features: length, umlaut, ch, r, devoicing, glottal.
   - Assert that replacing iː with ɪ in Miete yields Mitte's IPA (DWDS forms).
8. **`hundchen()`**: apply umlaut (ʊ→ʏ), devoice (d→t in the coda Hünd-) and ch_sound(suffix='chen').
   - Assert == 'ˈhʏntçən' (de.wiktionary); with an optional fast-speech schwa→syllabic n step, assert == 'ˈhʏntçn̩' (SGP, C25).
   - Assert each wrong option of Prove it 1 differs from it.
9. **Numbers on screen:** the reel shows no digits except "1 of 2" and "2 of 2" in the Prove-it titles, so `examples.py` must contain 1 and 2 as values (e.g. `PROVE_IT = 2`, `assert PROVE_IT == 2`). If the prerequisites self-check number goes into the reel, also assert `len(['m','ɪ','t','ə']) == 4`.

---

## Coverage map (for the run's `coverage.json`)

**Syllabus clauses** (word for word):
- "The German sound system" → steps 1, 15, 16;
- "vowel length (Miete vs Mitte)" → "Miete or Mitte?" and "Long and tense, short and lax";
- "the umlauts ä/ö/ü" → "Where does ü come from?" and "ü and ö: front tongue, round lips";
- "the two *ch* sounds (ich-Laut vs ach-Laut)" → "One ch, two places" and "Frauchen: ach or ich?";
- "the uvular and vocalised r (-er as a vowel)" → "Two r's in Lehrer" and "Oper and Opa";
- "final devoicing (Tag sounds like "Tak")" → "Rad or Rat?" and "Tag sounds like Tak";
- "the glottal stop before initial vowels" → "mein Auto" and "A catch before every vowel".

**Expert list (35 items):**
- 1 → step "One standard, three countries", plus Deep dive "Germany, Austria, Switzerland";
- 2, 3 → steps 2–3;
- 4 → step 3 (the a dot), sourced from the ADS table (C7), not the unfetched VQ page;
- 5 → Deep dive "Vowels: length and tension";
- 6 → step 5 caption, Deep dive;
- 7 → topic "Word stress and sentence melody" (quote: "stress on the stem syllable"; a weak fit, so also map Deep dive "Vowels: length and tension", which covers vital/Genom);
- 8 → step 3 and topic "Spelling-to-sound rules" (quote: "ß after long vowels and diphthongs vs ss after short vowels");
- 9 → steps 4–5;
- 10, 11 → step 5;
- 12 → topic "Plural formation" (quote: "(-e, -er, -(e)n, -s, no ending; with or without umlaut)");
- 13 → topic "Introducing yourself" (quote: "spelling with the German alphabet (including ä, ö, ü, ß)"), plus Deep dive "The umlaut vowels";
- 14, 15 → step 6 (15's diphthong part depends on C31);
- 16 → step 7;
- 17 → Deep dive "ich-Laut and ach-Laut: one phoneme";
- 18 → step 6 caption, Deep dive;
- 19 → step 11, step 14;
- 20 → topic "Spelling-to-sound rules" (quote "z, v and w" doesn't fit; there is no explicit ch clause, so map it to Deep dive "ich-Laut and ach-Laut: one phoneme", which covers Chemie);
- 21, 22 → step 8;
- 23 → steps 8–9;
- 24 → step 8, Deep dive "Schwa and the -er vowel";
- 25 → steps 10–11;
- 26, 27 → step 11;
- 28 → step 11 caption, Deep dive "Mistakes in both directions";
- 29 → step 14;
- 30 → Deep dive "Final devoicing, fortis and lenis";
- 31, 33 → step 12;
- 32 → step 13;
- 34 → steps 13–14;
- 35 → `out`: "sociolinguistic usage, not part of the sound system; one sentence in Deep dive 'Open questions' for awareness".

**Sources' contents:**
- From SGP, ORTH, ADS, AV and KL, map item by item to the steps and Deep dive headings above.
- Mark `out` only with a reason:
  - SGP "Stress, Acquisition" → topic "Word stress and sentence melody" or out (acquisition);
  - ADS "Phonotaktik" → out (consonant clusters are not in this line; the spelling topic touches them);
  - ADS "Prosodie" → topic "Word stress and sentence melody";
  - ADS "Gesang" → out (singing);
  - AV comparative sections (Gothic, Slavic, Turkish…) → out (other languages);
  - KL Arabic section → out;
  - ORTH punctuation, history, sorting → out or later topics.

---

## Narration risks and rules (for section 7)

- German lines are **real words or phrases** only. Never put the mispronunciations ("Tak", "Kuche", "mei Nauto") in a `{"de": …}` line: the speech-to-text check would fail them, and the voice should never model an error. Show them on screen only.
- **Homophones fail the word-perfect check:** Rad/Rat and Oper/Opa sound the same by design. Always say them with their articles ("das Rad", "der Rat", "die Oper", "der Opa") so the transcript can tell them apart. If a single word like "Mitte" or "ach" keeps failing, use a carrier phrase ("in der Mitte", "ach so") and update the step's on-screen text if it shows the phrase.
- The English narrator never says IPA or German words. "ich-Laut" in an English line becomes "the ich sound", with the German word in its own de line. Spell letters as said: "e r", "c h", "i g".
- **Listening review (QUALITY "Before shipping" #7):** check that the German voice really produces what each step claims: a long vs short vowel in Miete/Mitte, [ç] vs [x], a uvular r, a voiceless final consonant in Rad and Tag, and an audible catch in "mein Auto" and "beachten". Where the voice doesn't, change the narration to point at the screen ("look at the transcription"), never the claim. Log any such change.

---

## THE CLAIMS LIST

Sections of `SOURCES.md` are abbreviated:
- **SGP** = Standard German phonology;
- **CFRV** = Close front rounded vowel;
- **UT** = Voiced uvular trill;
- **WPal** = Voiceless palatal fricative;
- **WVel** = Voiceless velar fricative;
- **WG** = Glottal stop;
- **VL** = Vowel length;
- **WPD** = Final-obstruent devoicing;
- **ORTH** = German orthography;
- **ADS** = Aussprache der deutschen Sprache;
- **AV** = Auslautverhärtung;
- **KL** = Glottaler Plosiv (Knacklaut).

"L" numbers are lines in `SOURCES.md` as of 2026-10-11. "raw" means the passage is in the fetched text in `sources/` but not yet quoted in `SOURCES.md`: the fact-check agent adds the quote and runs `sources.mjs check`.

**TBS fetch commands** (topic folder `T`):
- `node scripts/sources.mjs fetch https://www.dwds.de/wb/Miete $T/sources/dwds-miete.txt`, and the same for `Mitte`, `K%C3%BCche`, `Kuchen`, `richtig`, `Keller`, `und`, `auch`, `in`, `das`, `die`, `sein` (for ist), `Tag` and `euch`. If DWDS blocks the fetch or gives no IPA, use `https://en.wiktionary.org/wiki/<word>` (secondary; acceptable only for a citation IPA, and only alongside a rule from a primary source).
- `node scripts/sources.mjs fetch https://de.wikipedia.org/wiki/Stimmloser_palataler_Frikativ $T/sources/de-ich-laut.txt` (for ei/eu/äu → [ç], C31).
- `node scripts/sources.mjs fetch https://en.wikipedia.org/wiki/Help:IPA/Standard_German $T/sources/wp-help-ipa.txt` (for C71, the optional English cue, and the [ə]/[ɐ] caution).

### Standard and inventory
| # | Claim | Source |
|---|---|---|
| C66 | German pronunciation has no official standard; a de facto standard is documented in pronunciation dictionaries. | SGP raw (wp-phonology.txt L252: "the pronunciation has no official standard and relies on a de facto standard…") |
| C67 | German is pluricentric; newsreaders in DE, AT and CH differ; the Duden Aussprachewörterbuch is the widely recognised norm, which is taught to foreigners. | ADS L348, L356, L352, L354 |
| C68 | About 15 monophthong vowel phonemes, written with 8 vowel letters. | ADS L358 |

### Vowel length
| # | Claim | Source |
|---|---|---|
| C1 | Vowel length is phonemic but not consistently spelled. | ORTH L278 |
| C2 | Long /iː yː uː eː øː oː/ are tense and short /ɪ ʏ ʊ ɛ œ ɔ/ lax; lax vowels need a following consonant (as in English checked vowels). | SGP L8 |
| C3 | One analysis: quantity is the distinguishing feature, quality follows from it. | ADS L360 |
| C4 | Ritt /rɪt/ vs riet /riːt/ also differ in quality; most long vowels are closer. | ADS L364 |
| C5 | Long vowels are generally pronounced tenser than short ones. | ORTH L312 |
| C6 | Kamm /kam/ short vs kam /kaːm/ long; a doubled consonant marks a short vowel, a single one often a long one. | ORTH L288 |
| C7 | /a/ and /aː/ have the same quality description (open, front to back, unrounded): length only. | ADS raw table ("kurzer, offener vorderer bis hinterer ungerundeter Vokal" / "langer, offener vorderer bis hinterer ungerundeter Vokal") |
| C8 | Example words: Mitte /ɪ/, Mieter /iː/, offen /ɔ/, Ofen /oː/, Hölle /œ/, Höhle /øː/, Mutter /ʊ/, Mut /uː/, Müller /ʏ/, Mühle /yː/, Kamm /a/, kam /aː/, bitte /ə/, Käse /ɛː/. | ADS raw "Monophthonge" table (de-aussprache.txt L255–347); ORTH L318 (Müller [ʏ]) |
| C9 | Long-vowel cues: ie (Liebe, hier); silent h (Zahn; ah, eh…); doubled a/e/o (Saat, See, Moor); a vowel in an open syllable (geben, sagen; Leben, raten). | ORTH L282, L284, L286, L280; VL L222; ADS L436–440, L446 |
| C10 | Two identical consonant letters (also ck, tz) after a single vowel signal shortness (Sonne, irren, Ratte, Masse). | ADS L450 |
| C11 | Cue failures: Mond long before two consonants; no length marking before ch (Drache /a/ vs Sprache /aː/); short one-syllable words an, das, es, in, mit, von. | ORTH L310, L294, L296 |
| C12 | Double consonants are pronounced as single consonants (except in compounds). | ORTH raw (wp-orth.txt L820) |
| C13 | Miete [ˈmiːtə] "rent"; Mitte [ˈmɪtə] "middle". | DWDS Miete, Mitte; de.wiktionary Miete, Mitte (sourced by the fact-check) |
| C14 | Close (long) vowels are usually short when unstressed (/ɡeˈnoːm/, /viˈtaːl/). | ADS L362 (Deep dive only) |

### Umlauts
| # | Claim | Source |
|---|---|---|
| C15 | ä, ö, ü indicate umlaut, the fronting of back vowels. | ORTH L274 |
| C16 | [y] is close, front and rounded (compressed lips); rounded front vowels are often centralised to near-front; German /yː/ is close near-front rounded. | CFRV L118–126; SGP L10, L12 |
| C17 | Descriptions: iː geschlossen vorder ungerundet; yː geschlossen vorder gerundet; øː halbgeschlossen vorder gerundet; œ halboffen vorder gerundet; ɪ fast geschlossen fast vorder ungerundet; ʏ fast geschlossen fast vorder gerundet; uː geschlossen hinter gerundet; eː halbgeschlossen vorder ungerundet; oː halbgeschlossen hinter gerundet; ɛ halboffen vorder ungerundet. | ADS L374–386 (quoted), and raw for uː, eː, oː, ɛ |
| C18 | Short ä = [ɛ] (Männer); short e = [ɛ] (Bett). | ORTH L314; ORTH raw (wp-orth.txt L1247 "⟨e⟩: [ɛ] as in Bett 'bed'") |
| C19 | Long ä is [ɛː] or [eː]; in the north of Germany and the east of Austria /ɛː/ (Käse) is usually said as /eː/; many authors treat /ɛː/ as peripheral. | ORTH L320; ADS L368; SGP L20 |
| C20 | ö [œ] (Göttin) / [øː] (Österreich); ü [ʏ] (Müller) / [yː] (über). | ORTH L316–324 |
| C21 | Without umlauts, write ae/oe/ue; a bare base vowel is wrong and misleading. | ORTH L276 (Deep dive) |
| C22 | Küche [ˈkʏçə] "kitchen" (northern standard often [ˈkyːçə]); Kuchen [ˈkuːxn̩] "cake". A near-minimal pair (vowel quality and length, ch, -e/-en), not an umlaut pair. | de.wiktionary Küche (citing Duden Aussprachewörterbuch 2015 for the variant), Kuchen; DWDS gives no IPA for either |

### ich-Laut and ach-Laut
| # | Claim | Source |
|---|---|---|
| C23 | The ich-Laut is [ç] (ich [ɪç]); the ach-Laut is [x] (ach [ax]). | SGP L66 |
| C24 | Complementary distribution: [x] after back vowels and /a aː/ (Buch); [ç] after front vowels (mich) and consonants (Furcht, manchmal). Spelling table: ch after a, o, u → [x]; after other vowels or consonants → [ç]; suffix -chen → [ç]. | SGP L68; ADS L400; ORTH raw (wp-orth.txt ch rows) |
| C25 | -chen is always [çən]; Hund [hʊnt] → Hündchen [ˈhʏntçn̩]; Frauchen (diminutive of Frau) [ç] vs rauchen [ˈʁaʊ̯xən]. | SGP L72, L74; ADS L400, L402 |
| C26 | Better described as backing of /ç/ after back vowels; [ç] in onsets (Chemie [çeˈmiː]) and after consonants (Molch [mɔlç]). | SGP L76 |
| C27 | Kohler: [x] after /uː oː/ (Buch, hoch), [χ] after /a aː/ (Bach, doch). | SGP L78; ADS L406–414 |
| C28 | Palatal = middle or back of the tongue raised to the hard palate; velar = back of the tongue at the soft palate; voiceless = no vocal-cord vibration. | WPal L161, L163; WVel L179, L181 |
| C29 | Western varieties tend to merge /ç/ with /ʃ/; hypercorrection Fisch → [fɪç]. | SGP L80 |
| C30 | In Austro-Bavarian, especially in Austria, [ç] may always be replaced by [x]; southeastern Furcht [fʊɐ̯xt]. | ORTH L330; SGP L70 |
| C31 | au takes [x] (rauchen); ei, ai, eu, äu take [ç] (euch, leicht). | au: SGP L74; DWDS rauchen [ˈʀaʊ̯χn̩]. ei/eu/äu: de.wikipedia "Stimmloser palataler Frikativ"; DWDS euch [ɔɪ̯ç]; de.wiktionary leicht [laɪ̯çt] |
| C32 | nicht [nɪçt]. | WPal raw (occurrence table) |
| C72 | "Laut" is the German word for "sound". | SGP raw (wp-phonology.txt L829) |

### r
| # | Claim | Source |
|---|---|---|
| C34 | The uvular fricative [ʁ] predominates among professional announcers (Mangold); the dorsal r is used in almost all areas apart from Bavaria and parts of Switzerland. | SGP L50, L52 (context raw L774) |
| C35 | Uvular = dorsum at the uvula. The uvular trill [ʀ] occurs in conservative varieties. rot [roːt, ʀoːt, ʁoːt] are free variants, with [r] almost only in some southern varieties. The apical trill is common in the south (Bavaria, many parts of CH and AT). | UT L142; SGP L48, L54; ADS L416, L418 |
| C36 | After a vowel, r vocalises: sehr [zeːɐ̯], besser [ˈbɛsɐ], der [deːɐ̯], wir [viːɐ̯], für [fyːɐ̯]. | ADS L416; KL L561; SGP raw (r-vocalisation table) and L36 |
| C37 | -er is often [ɐ]; in some regions [ʀ̩] or [r̩]; ⟨er⟩ [ɐ] in Wasser. | ORTH L298, L332; ADS L430 |
| C38 | [ɐ] is near-open central unrounded, an allophone of /ər/ in all areas but Switzerland ("widespread, but less common in Switzerland"). | SGP L28, L56, L58 |
| C39 | Northern Lehrer [ˈleːʁɐ]; Austrian [ˈlɛɐ̯ʁɐ]; Austrian rar [ʁɑː]. | SGP L42, L44 |
| C40 | **Disputed:** a 2020 study (Rathcke & Mooshammer; six northern speakers) found [ɐ] not distinguished from unstressed [a] in northern standard German, so Oper and Opa are homophones; the Duden 7th ed. keeps them apart by height, and DWDS writes Opa [ˈoːpa]. Wiese notes a tendency to neutralise [a(ː)], [aɐ̯], [ɐ]. Step 9 now asks "closest to". | SGP L34, L32 and raw (Duden 7th ed.); Rathcke & Mooshammer 2020; DWDS Oper, Opa |
| C41 | [ə] occurs only in unstressed syllables (besetzen); bitte has [ə]; before a sonorant in the coda the schwa often disappears, giving a syllabic consonant (Kissen [ˈkɪsn̩]). | SGP L18; ADS raw table (bitte, Schwa); SGP raw (wp-phonology.txt L360) |
| C42 | In the Standard Austrian accent the uvular fricative is the most common r, with variable voicing ([ʁ] or [χ]). | SGP raw (wp-phonology.txt, after L768) |
| C43 | Kohler: the place of the r varies from uvular (rot) to velar (treten). | SGP raw (Deep dive only) |

### Final devoicing and -ig
| # | Claim | Source |
|---|---|---|
| C44 | Plosives, affricates and fricatives are voiceless in the syllable coda; this applies inside words too, not only at the end of a word. On-screen example: lieb|lich (C77); AV's own examples (handeln – Handlung, eigen – Eigner) are disputed in de.wiktionary and go to the Deep dive only. | AV L532, L530; WPD L240 ("at the ends of all syllables"); C77 |
| C45 | Rad and Rat are both [ʁaːt]; Räder keeps its voicing because the d starts a syllable. | WPD L240; AV L494 |
| C46 | Bad [baːt] / Bäder [ˈbɛːdɐ]; Zug [t͡suːk] / Züge [ˈt͡syːɡə]; sag! [zaːk] / sagen; rieb [ˈʁiːp]; Süd [zyːt]; schwieg [ˈʃviːk]; Los [ˈloːs]; brav [ˈbʁaːf] / brave [ˈbʁaːvə]. | WPD L244–254; AV L504–512 |
| C47 | Tag /taːk/. | ADS L398 |
| C48 | Affected: /b d g/, /v z ʒ/ and the affricate; all plosives, affricates and fricatives, in loanwords too (Klub, Trend, Standard). | AV L502, L528; WPD L242 |
| C49 | Devoicing is northern; absent in southern Germany, Austrian and Swiss standard German. /b d g z/ are voiceless lenis in Austrian standard and most southern varieties. | AV L500; WPD L256; SGP L88, L86; ADS L394 |
| C50 | The spelling keeps the stem (Stammprinzip); Middle High German wrote tac vs tages. | AV L536 |
| C51 | English has no final devoicing; German speakers carry it into foreign languages (a typical accent). | AV L496, L498, L538 |
| C52 | -ig: the fricative [ɪç] is prescribed by Siebs (wichtig [ˈvɪçtɪç]), for northern Germany only; elsewhere [ɪk]; in Austro-Bavarian and Alemannic standard varieties [ɪɡ̊]. Other final g → [ç]/[x] (Krieg, lag) is frequent in central and northern Germany but colloquial. | SGP L94, L92; ADS L404 |
| C53 | Fortis/lenis is a better description than voiced/voiceless; aspiration is strongest in the onset of a stressed syllable (Taler) and weakest in the coda. | SGP L84, L90; WPD L238; ADS L390 (Deep dive) |
| C54 | Tag [taːk]; Tage [ˈtaːɡə]. | DWDS Tag; de.wiktionary Tage |

### Glottal stop
| # | Claim | Source |
|---|---|---|
| C55 | The glottal stop is made by closing the glottis (the vocal folds), as in English "uh-oh"; symbol ʔ. | WG L193, L195; KL L555 |
| C56 | It occurs in careful speech before vowel-initial stems and stressed vowels word-internally (Oase twice); much more frequent in the north; often omitted in colloquial speech, especially when unstressed; not usually a phoneme. | SGP L60, L62 |
| C57 | Before a word-initial vowel (Acht [ˈʔaxt], der Alte); before vowel-initial stems in compounds (beachten [bəˈʔaxtʰən], Spiegelei); in hiatus before a more stressed vowel (Theater, Aorta, Oase). Frequent words may lose it (erinnern, Verein), but vereinen always has it. | KL L561–567, L565 |
| C58 | **Corrected:** KL calls these minimal pairs (das Spiegel-Ei / die Spiegelei, die Ode / Diode, Sandaale / Sandale), but each also differs in stress, vowel length or [t]/[d] (see C79). Deep dive only, as an open question; not in the reel. | KL L569, L577; C79 |
| C59 | Absent in Austrian and Swiss standard German, and in some dialects. | KL L571, L573 |
| C60 | mein Auto [ˌmaɪ̯n ˈʔaʊ̯tʰo]; without the stop it sounds like *mei Nauto, as English an apple sounds like *a napple. | KL L575 |
| C61 | No letter for it in German spelling; the Duden-Grammatik writes [|]. | KL L557 |
| C62 | Not a phoneme in most analyses: a boundary marker before a foot-initial vowel; its presence or absence alone makes no difference in meaning. | KL L581, L583; ADS L396 |
| C63 | No catch before suffixes that start with a vowel (Ach-tung, Fah-rer, kin-disch); none when the second vowel is less stressed (Thea vs Theater). | KL L587, L585 |
| C64 | German speakers carry it into foreign languages; learners of German find it hard to imitate. | KL L579 |
| C65 | Beamter [bəˈʔamtɐ]. | WG L197–199 (Deep dive) |

### Opening problem and cues
| # | Claim | Source |
|---|---|---|
| C69 | Per-word citation IPA for the opening lines: ist [ɪst], die [diː], Küche [ˈkʏçə], in [ɪn], der [deːɐ̯], Miete [ˈmiːtə], enthalten [ɛntˈhaltn̩], richtig [ˈʁɪçtɪç], das [das], Bad [baːt], und [ʊnt], Keller [ˈkɛlɐ], auch [aʊ̯x]. | DWDS: die, der, das, in, und, Miete, Bad (auch as [aʊ̯χ]); de.wiktionary: ist, Küche, enthalten, richtig, Keller, auch [aʊ̯x]; KL L561 (der); WPD L244 (Bad). [ʔ] is added by C56/C57, final [t] by C44, [ç]/[x] by C24, [ɐ] by C37. |
| C70 | The scenario (a short [ɪ] in Miete is heard as Mitte; ü said as u drifts toward Kuchen) follows from C13 and C22: the pairs differ in those vowels. It is presented as "may hear", not as a measured fact. | derived |
| C71 | ~~(Optional) English teaching cue: German [yː] is like "meet" with rounded lips.~~ **Dropped**: Help:IPA gives "somewhat like few", not this cue. | Help:IPA/Standard German |
| C73 | The site has no recording feature; sound is off until the learner turns it on; steps can be replayed. | PROJECT_PLAN.md "In the reel"; QUALITY.md #13 (site facts, no outside source) |
| C74 | The German voice is synthetic (Qwen3-TTS voice designed from a text description, frozen). | PROJECT_PLAN.md "German domain" |
| C75 | Gender pause (since the mid-1980s). | KL L589 (Deep dive, one sentence) |

### Claims added by the fact-check
| # | Claim | Source |
|---|---|---|
| C76 | Umlaut moves the ch: Buch [buːx] → Bücher [ˈbyːçɐ]; Koch [kɔx] → Köche [ˈkœçə]. | de.wiktionary Buch, Bücher, Koch, Köche |
| C77 | Word-internal devoicing: lieblich [ˈliːplɪç] vs lieben [ˈliːbn̩]; endlich [ˈɛntlɪç] vs Ende [ˈɛndə]; Radweg [ˈʁaːtˌveːk]. Disputed: Handlung [ˈhandlʊŋ], Eigner [ˈaɪ̯ɡnɐ], Adler [ˈaːdlɐ] in de.wiktionary vs Han[t]lung, Ei[k]ner in AV. | de.wiktionary (each word); AV L530 |
| C78 | Oper [ˈoːpɐ] vs Opa [ˈoːpa] in the dictionaries (DWDS; Duden 7th ed. separates [ɐ] and [ä] by height); merged in northern standard speech per Rathcke & Mooshammer 2020 (six speakers, read speech; "unlikely to generalise to other dialects"). | DWDS Oper, Opa; SGP raw (Duden 7th ed. passage); Rathcke & Mooshammer 2020 |
| C79 | Diode [diˈʔoːdə] has a glottal stop by the hiatus rule, so die Ode / Diode is not a glottal-stop minimal pair; Sandale [zanˈdaːlə]. | de.wiktionary Diode, Ode, Sandale; KL L567 |
| C80 | -ig before -lich stays [k]: königlich [ˈkøːnɪklɪç]. | de.wiktionary königlich (Deep dive only) |
| C81 | DWDS's own conventions: [ʀ] for r (Rad [ʀaːt], Lehrer [ˈleːʀɐ]) and [χ] after a/au (auch [aʊ̯χ], Acht [aχt], rauchen [ˈʀaʊ̯χn̩]); DWDS writes Theater [teˈʔaːtɐ] with the catch. | DWDS entries |

### Corrections from fact-check (2026-10-11; details and verdicts in `FACT-CHECK.md`)
1. **Opening question** is now „Ist die Küche in der Miete enthalten?" [ʔɪst diː ˈkʏçə ʔɪn deːɐ̯ ˈmiːtə ʔɛntˈhaltn̩]. The slip is framed as "a short vowel turns Miete into Mitte", not as an English reading habit: English has [iː]/[ɪ], and English ie usually reads [iː].
2. **Step 3:** "only a differs by length alone" → a/aː (and ɛ/ɛː) differ (almost) only in length; SGP reports /aː/ as back [ɑː] in some descriptions.
3. **Step 4:** ü's tongue is "essentially" where i is (SGP: /yː/ close near-front). The question now asks about long ü. C71 is dropped (Help:IPA's cue is "somewhat like few").
4. **Step 5:** "never the bare vowel" → "the bare vowel would be wrong and misleading" (ORTH wording).
5. **Step 6:** Küche/Kuchen is not an umlaut pair and differs in vowel length, ch and ending too, so it is a *near*-minimal pair. Buch → Bücher (C76) now demonstrates that umlaut moves the ch. The ach-Laut after a is often uvular [χ] (Kohler, ADS, DWDS, Help:IPA), so the caption no longer says "soft palate" for every case. The rule follows the vowel *sound*: eu → [ç] although its letter is u. ei/eu → [ç] is sourced (C31).
6. **Step 7:** "Same in Hündchen" is removed. After t, ch is [ç] anyway, so Hündchen doesn't show the -chen override.
7. **Step 8:** the r rule is now "at the end of a syllable, after a vowel → [ɐ̯]". Plain "after a vowel" mispredicts Lehrer's first r. Vocalisation is regular after long vowels and variable after short ones.
8. **Step 9:** the predict question is reframed ("closest to the a of Opa"). The old "they sound the same" contradicted the dictionary standard the reel says it models (Duden 7th ed., DWDS Opa [ˈoːpa]); the merger rests on one six-speaker study. A wrong option with a regional reading (curled r: Middle Hessian) is replaced.
9. **Step 11:** Hand|lung → lieb|lich / lie|ben (Handlung is transcribed [ˈhandlʊŋ] in de.wiktionary; disputed syllabification before l/n). "-ig exception" → "twist" (the result is still voiceless). The caption's "a German accent says 'Hund' with a hard d" was garbled; it now says Germans speaking English often harden final consonants. Tage [ˈtaːɡə] is sourced.
10. **Step 12:** the catch is "northern standard German, careful speech"; "never 'mei Nauto'" → "not … in careful speech".
11. **Step 13:** "die Ode · Diode" is removed. Diode [diˈʔoːdə] has its own catch (hiatus rule), so the pair differs in the length of i, not in the catch, and the claim also clashed with C62. The row is now Oase [ʔoˈʔaːzə]. The Achtung row must keep the word-initial catch.
12. **Step 14:** devoicing and the catch are *northern* features (AV: absent in southern Germany too). Austria: ch "may be [x] even after front vowels" (ORTH speaks of Austro-Bavarian), not "everywhere" in the standard.
13. **Step 15:** the transcription includes enthalten. Conventions: DWDS [ʀ]/[χ] vs the reel's [ʁ]/[x].
14. **Step 17:** the correct option is [ˈhʏntçən] (de.wiktionary; matches "-chen is always [çən]"), with [ˈhʏntçn̩] as the fast-speech form. Each wrong option now misses exactly the rules it tests.
15. **Step 18:** the lenis-voiceless statement is limited to Austrian standard (SGP L86 says nothing about Swiss).
16. **Deep dive / examples.py** are updated accordingly: the Küche [yː] variant, the devoicing dispute, the Ode/Diode pair as an open question, the DWDS conventions, the königlich [k] note, the eu-before-u order in `ch_sound`, and the asserts for Diode, lieblich and Hündchen.

---

## Progress

- Done: claim; narration tools built (`setup.sh`); `npm ci`; 2.1 `SOURCES.md` (all quotes verified by `sources.mjs check`), `expert-list.md` (35 items, sources opened).
- Done 2.2 (2026-10-11): this OUTLINE.md (content plan and storyboards, 18 steps, claims C1–C75).
- Source caveats carried forward:
  - several expert-list quotes come from pages that are not in `sources/` (Vokalquantität, Help:IPA, Wiktionary, de Ich-Laut, Guttural R, de Schwa, de Umlaut, Rechtschreibrat). The plan relies on none of them except the TBS items above;
  - per-word IPA for the opening lines, Miete, Küche/Kuchen and Tage was TBS; sourced in 2.3 (DWDS, de.wiktionary).
- Done 2.3 (2026-10-11): fact-check → `FACT-CHECK.md`. All TBS items are sourced (DWDS, de.wiktionary, de.wikipedia "Stimmloser palataler Frikativ", Help:IPA, Rathcke & Mooshammer 2020) and added to `SOURCES.md`, where `sources.mjs check` reports 0 problems. The corrections are applied above (see "Corrections from fact-check").
- Next:
  - coverage.json, using the map above;
  - `claim.mjs outlined`;
  - then sections 3–8.
- Open builder risks: IPA glyph coverage (U+032F, U+0361) in the self-hosted fonts; "1 of 2" and "2 of 2" digits in Prove-it titles need values in examples.py; check the milestone title string against the syllabus parser.

## Changes after final

(none yet)
