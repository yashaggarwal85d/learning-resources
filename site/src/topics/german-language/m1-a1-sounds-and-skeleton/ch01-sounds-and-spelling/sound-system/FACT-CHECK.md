# Fact-check: The German sound system (ger.sound-system)

Adversarial fact-check of `OUTLINE.md` (claims C1–C75, plus C76–C81 added here), run on 2026-10-11 against the fetched texts in `sources/`, not against summaries.

New sources fetched with `scripts/sources.mjs fetch` and quoted in `SOURCES.md`:
- DWDS entries for 22 words;
- de.wiktionary entries for 37 words;
- de.wikipedia "Stimmloser palataler Frikativ";
- en.wikipedia "Help:IPA/Standard German";
- the 2020 study behind the Oper/Opa claim: Rathcke & Mooshammer, *JIPA* 52(1), doi 10.1017/S0025100320000110, full text opened.

`node scripts/sources.mjs check` reports 326 quotes word for word and 0 problems.

Source notes:
- DWDS gives no IPA (audio only) for Küche, Kuchen, Keller, Höhle, Ode, Diode, richtig, wichtig, leicht, beachten, Frauchen and Hündchen. For those, de.wiktionary is the citation source: it is a secondary source for a citation IPA, and each one sits next to a primary rule source.
- In DWDS quotes, "Fehler" is the text of the page's audio-player label, not part of the entry (noted in `SOURCES.md`).
- Currency: the sources name the Duden Aussprachewörterbuch "(Max Mangold)". The edition the fetched texts cite as current is the **7th (2015), by Stefan Kleiner, Ralf Knöbl and the Dudenredaktion** (de.wiktionary Küche footnote; SGP's "7th edition" passage). Name that edition in the Deep dive, with Mangold as the editor of earlier editions.

Verdicts used in the table:
- **CONFIRMED**: the source says it.
- **CONFIRMED + caveat**: true, but region- or analysis-dependent.
- **CORRECTED**: the outline was wrong, and it is now fixed in `OUTLINE.md`.
- **DISPUTED**: the sources disagree, and the outline now presents both views.
- **DROPPED**: the claim is no longer used.

## Per-claim verdicts

| # | Verdict | Note / correction | Source checked |
|---|---|---|---|
| C1 | CONFIRMED | "vowel length is phonemic in German, it is not consistently represented" | ORTH |
| C2 | CONFIRMED | tense/lax pairs; lax vowels need a following consonant | SGP L8 |
| C3 | CONFIRMED + caveat | ADS gives quantity as *one* of three analyses (its contents also list quality and syllable cut). Say "one analysis" (the outline does). | ADS L360, Contents |
| C4 | CONFIRMED | Ritt/riet differ in quality too | ADS L364 |
| C5 | CONFIRMED | | ORTH L312 |
| C6 | CONFIRMED | Kamm /kam/ vs kam /kaːm/ | ORTH L288 |
| C7 | CONFIRMED + caveat | ADS gives a and aː identical descriptions, and so also ɛ and ɛː. SGP: /aː/ is sometimes described as back [ɑː], and Low-German-influenced northern speech has a different quality for /aː/. Step 3 now says "(almost) only length" and mentions ä. | ADS raw table (quoted now); SGP raw L373, L378 (quoted) |
| C8 | CONFIRMED | ADS table rows verified in the raw text; the example words carry wiki markup and aren't quotable cleanly. Mitte, Miete, Höhle, Hölle, Ofen and offen are also confirmed by DWDS or de.wiktionary. | ADS raw; DWDS; de.wiktionary |
| C9 | CONFIRMED | ie, silent h, aa/ee/oo, open syllable | ORTH, VL, ADS |
| C10 | CONFIRMED | | ADS L450 |
| C11 | CONFIRMED | Mond; Drache/Sprache; an, das, es, in, mit, von | ORTH |
| C12 | CONFIRMED | quote added: "Double consonants are pronounced as single consonants, except in compound words." | ORTH raw |
| C13 | CONFIRMED (sourced) | Miete [ˈmiːtə], Mitte [ˈmɪtə]: a true minimal pair (only the vowel differs) | DWDS Miete, Mitte; de.wiktionary |
| C14 | CONFIRMED | | ADS L362 |
| C15 | CONFIRMED | | ORTH L274 |
| C16 | CONFIRMED + caveat | SGP: /yː/ is close *near-front*. "Exactly where i is" (step 4) is now "essentially". | CFRV; SGP L10 |
| C17 | CONFIRMED | all ten descriptions verified in the ADS table; the missing rows are now quoted | ADS raw |
| C18 | CONFIRMED | Männer [ɛ] (de.wiktionary [ˈmɛnɐ]); Bett [ɛ] (quote added) | ORTH |
| C19 | CONFIRMED + caveat (regional) | Long ä is [ɛː] in the Hochlautung and usually [eː] in the north and in eastern Austria. Käse [ˈkɛːzə], [ˈkeːzə] (de.wiktionary). Rathcke & Mooshammer fn. 3: neutralised toward /eː/ "particularly in Standard Northern German". | ORTH L320; ADS L368; SGP L20; de.wiktionary Käse |
| C20 | CONFIRMED | | ORTH |
| C21 | CONFIRMED | Wording now follows the source: "wrong and misleading", not "never". | ORTH L276 |
| C22 | CONFIRMED + caveat (sourced) | Küche [ˈkʏçə], Kuchen [ˈkuːxn̩]. de.wiktionary, citing the Duden Aussprachewörterbuch 2015: northern standard "oft" [ˈkyːçə] (long). The pair differs in vowel quality **and** length, in ch and in -e/-en, so it is a near-minimal pair. Küche is not the umlaut of Kuchen. | de.wiktionary Küche, Kuchen |
| C23 | CONFIRMED | | SGP L66 |
| C24 | CONFIRMED + caveat | The ORTH spelling row "ch after ⟨a, o, u⟩ [x]" fails for **eu** (euch [ɔɪ̯ç]). The rule is about the vowel *sound*. Step 6 and the `ch_sound` ordering are fixed. | SGP L68; ADS L400; ORTH raw (quoted) |
| C25 | CONFIRMED + caveat | -chen [çən] (SGP); SGP itself writes Hündchen [ˈhʏntçn̩], de.wiktionary [ˈhʏntçən]: both are valid. Frauchen [ˈfʁaʊ̯çən] (de.wiktionary) and rauchen [ˈʁaʊ̯xn̩] (de.wiktionary; DWDS [ˈʀaʊ̯χn̩]). "Same in Hündchen" is removed from step 7: after t the ch is [ç] anyway. | SGP L72–74; de.wiktionary |
| C26 | CONFIRMED | | SGP L76 |
| C27 | CONFIRMED | DWDS writes [χ] after a/au (auch [aʊ̯χ], Acht [aχt]); Help:IPA: "may instead be uvular [χ]". The step 6 caption no longer says "soft palate" for every case. | SGP L78; ADS; DWDS; Help:IPA |
| C28 | CONFIRMED | | WPal, WVel |
| C29 | CONFIRMED (regional) | | SGP L80 |
| C30 | CONFIRMED + caveat | ORTH says "Austro-Bavarian, especially in Austria", which describes Austrian speech, not explicitly the Austrian standard. Caption: "may be [x] even after front vowels". | ORTH; SGP L70 |
| C31 | CONFIRMED (sourced) | ei, äu, ai, eu → [ç]; euch [ɔɪ̯ç], leicht [laɪ̯çt] | de.wikipedia Stimmloser palataler Frikativ; DWDS euch; de.wiktionary leicht |
| C32 | CONFIRMED | quote "nicht [nɪçt]" added | WPal raw |
| C34 | CONFIRMED | | SGP |
| C35 | CONFIRMED | Help:IPA: the apical [r] is "now found mainly in Switzerland, Bavaria and Austria" | UT; SGP; ADS; Help:IPA |
| C36 | CONFIRMED + caveat | Vocalisation is in the syllable coda, regular after long vowels and "after long vowels or after all vowels" depending on region (Help:IPA). Step 8's "after a vowel" mispredicted Lehrer's first r and is reworded. wir/für are also checked in the SGP r table (raw, too much markup to quote) and in ADS L458. | ADS L416; KL L561; Help:IPA; DWDS der |
| C37 | CONFIRMED | | ORTH; ADS L430 |
| C38 | CONFIRMED | Note SGP says both "all areas but Switzerland" (L28) and "less common in Switzerland" (L58); use the latter. | SGP |
| C39 | CONFIRMED | Lehrer: de.wiktionary [ˈleːʁɐ]; DWDS [ˈleːʀɐ] (trill symbol) | SGP L42; DWDS; de.wiktionary |
| C40 | **DISPUTED** | Study opened. Six northern speakers in read speech; only one kept [a] and [ɐ] apart; "can be considered homophones"; "unlikely to generalise to other dialects". The Duden 7th ed. separates [ɐ] from [ä] by height, and DWDS writes Opa [ˈoːpa] and Oper [ˈoːpɐ]. Since the reel says it models the dictionary standard, the step 9 answer "they sound the same" contradicted it: **reframed** to "closest to the a of Opa". | Rathcke & Mooshammer 2020; SGP raw (quoted); DWDS |
| C41 | CONFIRMED | quote added (syllabic sonorants) | SGP raw; ADS |
| C42 | CONFIRMED | quote added | SGP raw |
| C43 | CONFIRMED | quote added | SGP raw |
| C44 | CONFIRMED + **CORRECTED example** | The rule (syllable coda) is confirmed. AV's own examples are contradicted by de.wiktionary: Handlung [ˈhandlʊŋ], Eigner [ˈaɪ̯ɡnɐ], Adler [ˈaːdlɐ] (before l/n the syllable boundary is analysed differently). The reel now uses lieb\|lich [ˈliːplɪç] / lie\|ben [ˈliːbn̩]; the alternatives are endlich [ˈɛntlɪç] and Radweg [ˈʁaːtˌveːk]. | AV; WPD; de.wiktionary |
| C45 | CONFIRMED | Räder [ˈʁɛːdɐ] (de.wiktionary) | WPD; AV |
| C46 | CONFIRMED | | WPD; AV |
| C47 | CONFIRMED | DWDS Tag [taːk] | ADS; DWDS |
| C48 | CONFIRMED | | AV; WPD |
| C49 | CONFIRMED + caveat (regional) | AV: absent in southern Germany *too*, so it is "northern", not "the standard from Germany". The lenis-voiceless statement (SGP L86) is about Austria and the south only, not Switzerland. Steps 14 and 18 are reworded. | AV L500; SGP L86, L88; WPD |
| C50 | CONFIRMED | | AV L536 |
| C51 | CONFIRMED | The step 11 caption's "a German accent says 'Hund' with a hard d" was garbled and is reworded. | AV |
| C52 | CONFIRMED + wording | -ig → [ɪç] is an extra spirantisation, not an "exception" to devoicing ([ç] is voiceless), so it is now called a "twist". richtig and wichtig are [ɪç] or [ɪk] (de.wiktionary); königlich [ˈkøːnɪklɪç] keeps [k] before -lich (C80). | SGP; ADS L404; de.wiktionary |
| C53 | CONFIRMED | | SGP; WPD; ADS |
| C54 | CONFIRMED (sourced) | Tage [ˈtaːɡə] | de.wiktionary Tage; DWDS Tag |
| C55 | CONFIRMED | | WG; KL |
| C56 | CONFIRMED + caveat | careful speech, northern; often omitted colloquially | SGP L60, L62 |
| C57 | CONFIRMED + caveat | The hiatus catch is optional: Theater is [teˈʔaːtɐ] in DWDS but [teˈaːtɐ], [teˈʔaːtɐ] in de.wiktionary. Achtung keeps its word-initial catch. | KL; DWDS; de.wiktionary |
| C58 | **CORRECTED** | die Ode / Diode is not a glottal-stop minimal pair. Diode is [diˈʔoːdə] (de.wiktionary) by KL's own hiatus rule, so both members have a catch and they differ in [iː]/[i] and the word boundary. Sandaale/Sandale [zanˈdaːlə] differs in stress and [t]/[d]; Spiegel-Ei/Spiegelei in stress (KL says so). The claim also clashed with C62. Removed from step 13 (now Oase); it goes to the Deep dive's open questions. | KL L569, L577; de.wiktionary Diode, Ode, Sandale |
| C59 | CONFIRMED (regional) | | KL L571, L573 |
| C60 | CONFIRMED | "never 'mei Nauto'" → "not … in careful speech" | KL L575 |
| C61 | CONFIRMED | | KL L557 |
| C62 | CONFIRMED | | KL; ADS L396 |
| C63 | CONFIRMED | | KL L585, L587 |
| C64 | CONFIRMED | | KL L579 |
| C65 | CONFIRMED | | WG |
| C66 | CONFIRMED + currency | quote added; Duden edition note above | SGP raw |
| C67 | CONFIRMED + currency | Mangold → current edition: 7th ed. 2015 (Kleiner, Knöbl) | ADS; de.wiktionary Küche footnote |
| C68 | CONFIRMED | 15 = iː yː uː eː øː oː ɪ ʏ ʊ ɛ œ ɔ a aː ɛː (schwa and ɐ excluded) | ADS L358 |
| C69 | CONFIRMED (sourced) + conventions | Every word was looked up (table below). auch is [aʊ̯χ] in DWDS and [aʊ̯x] in de.wiktionary and Help:IPA; the reel uses broad [x] and says so. | DWDS; de.wiktionary |
| C70 | CORRECTED | "Read with English habits, the short [ɪ] turns Miete into Mitte" is not supported, and is unlikely: English has the [iː]/[ɪ] contrast (beat/bit), and English ie usually reads [iː]. Reframed as "a short vowel turns Miete into Mitte". "Some English accents have [y]" (South African, Scouse, Ulster: CFRV), so the outline must not say "English has no ü". | derived; CFRV (quote added) |
| C71 | **DROPPED** | Help:IPA's cue for [yː] is "somewhat like few", not "meet with rounded lips". No other source for the cue was found. | Help:IPA |
| C72 | CONFIRMED | quote added | SGP raw |
| C73 | CONFIRMED (site fact) | PROJECT_PLAN L312: "Sound is off until the learner turns it on"; the R key replays (`ReelPlayer.tsx` L172) | repo |
| C74 | CONFIRMED (site fact) | PROJECT_PLAN L319 (Qwen3-TTS VoiceDesign reference, cloned with Qwen3-TTS 1.7B Base) | repo |
| C75 | CONFIRMED | | KL L589 |
| C76 | NEW, CONFIRMED | Buch [buːx] → Bücher [ˈbyːçɐ]; Koch [kɔx] → Köche [ˈkœçə] | de.wiktionary |
| C77 | NEW, CONFIRMED | lieblich [ˈliːplɪç] / lieben [ˈliːbn̩]; endlich [ˈɛntlɪç] / Ende [ˈɛndə]; Radweg [ˈʁaːtˌveːk]; the disputed cases (Handlung, Eigner, Adler) | de.wiktionary |
| C78 | NEW, CONFIRMED | dictionary Oper [ˈoːpɐ] vs Opa [ˈoːpa] | DWDS |
| C79 | NEW, CONFIRMED | Diode [diˈʔoːdə], Ode [ˈoːdə], Sandale [zanˈdaːlə] | de.wiktionary |
| C80 | NEW, CONFIRMED | königlich [ˈkøːnɪklɪç] | de.wiktionary |
| C81 | NEW, CONFIRMED | DWDS conventions: [ʀ], [χ]; Theater [teˈʔaːtɐ] | DWDS |

### Per-word IPA recorded (the TBS items)

| Word | IPA | Source |
|---|---|---|
| Miete | [ˈmiːtə] | DWDS; de.wiktionary |
| Mitte | [ˈmɪtə] | DWDS; de.wiktionary |
| Küche | [ˈkʏçə], northern standard often [ˈkyːçə] | de.wiktionary (Duden 2015) |
| Kuchen | [ˈkuːxn̩] | de.wiktionary |
| Höhle | [ˈhøːlə] | de.wiktionary |
| Hölle | [ˈhœlə] | DWDS; de.wiktionary |
| Tag | [taːk] | DWDS |
| Tage | [ˈtaːɡə] | de.wiktionary |
| ist | [ɪst] (colloquial [ɪs]) | de.wiktionary |
| die | [diː] | DWDS |
| der | [deːɐ̯] | DWDS |
| das | [das] | DWDS |
| in | [ɪn] | DWDS |
| und | [ʊnt] | DWDS |
| auch | [aʊ̯χ] (DWDS) / [aʊ̯x] (de.wiktionary) | both |
| richtig | [ˈʁɪçtɪç], [ˈʁɪçtɪk] | de.wiktionary |
| Keller | [ˈkɛlɐ] | de.wiktionary |
| Bad | [baːt] | DWDS |
| enthalten | [ɛntˈhaltn̩] | de.wiktionary |
| euch | [ɔɪ̯ç] | DWDS |
| leicht | [laɪ̯çt] | de.wiktionary |
| Ode | [ˈoːdə] | de.wiktionary |
| Diode | [diˈʔoːdə] | de.wiktionary |
| Hündchen | [ˈhʏntçən] (SGP: [ˈhʏntçn̩]) | de.wiktionary; SGP |
| Lehrer | [ˈleːʀɐ] (DWDS) / [ˈleːʁɐ] (de.wiktionary) | both |
| Rad, Rat | [ʀaːt] (DWDS) / [ʁaːt] (de.wiktionary) | both |
| Oper | [ˈoːpɐ] | DWDS |
| Opa | [ˈoːpa] | DWDS |
| Theater | [teˈʔaːtɐ] (DWDS); [teˈaːtɐ], [teˈʔaːtɐ] (de.wiktionary) | both |

## Red team: predict questions and explanations

- **Step 2 (Miete/Mitte).** Holds: a true minimal pair, and none of the wrong options has a correct reading. Small fix: "less front" became "in most descriptions slightly less front" (SGP gives /ɪ/ as front [ɪ̟] in one description).
- **Step 3 ledger.** All four pairs differ only in the vowel:
  - Höhle/Hölle [ˈhøːlə]/[ˈhœlə];
  - Ofen/offen [ˈoːfn̩]/[ˈɔfn̩];
  - kam/Kamm [kaːm]/[kam];
  - Miete/Mitte.

  "Only a differs by length alone" was too strong: ɛ/ɛː do too (ADS), and aː is sometimes [ɑː] (SGP).
- **Step 4 (ü's tongue).** "Exactly" was too strong (SGP: near-front). The question now names long ü, because short ü [ʏ] pairs with short [ɪ], not with long i.
- **Step 6.** Two problems:
  - Küche/Kuchen is not an umlaut pair, so "fronting the vowel moves the ch" now uses Buch/Bücher.
  - "After a, o, u" read letter by letter mispredicts **euch**.
- **Step 7 (Frauchen).** Holds. The wrong option [ʃ] matches the Western merger (SGP L80), but the question is about the standard, so this is acceptable. "Same in Hündchen" was a non-example and is removed.
- **Step 8.** "after a vowel → [ɐ̯]" contradicted the first r of the step's own Lehrer. Fixed to "end of a syllable".
- **Step 9 (Oper/Opa).** The keyed answer was contested by the dictionary standard the reel claims to model. Reframed so the answer holds under both views. The wrong option "weak e" is a real southern realisation (Help:IPA, SGP); "northern" in the question rules it out. The curled-r option had a Middle Hessian reading and was replaced.
- **Step 10 (Rad/Rat).** Holds. de.wiktionary's [ʁat] belongs to "die Rad" (the radiation unit), a different word. The wheel is [ʁaːt].
- **Step 11.** The Hand|lung showcase is disputed and replaced. "-ig exception" is now "twist". The garbled 'Hund' sentence is fixed.
- **Step 12.** Holds for northern careful speech. "never" was softened.
- **Step 13.** die Ode/Diode was wrong (see C58) and is replaced by Oase. Builder: Achtung needs its initial catch.
- **Step 17 (Hündchen).** The keyed [ˈhʏntçn̩] clashed with step 7's "-chen is always [çən]", and every distractor ended in [ən]. A learner applying the taught rules exactly would find no option that matches. The key is now [ˈhʏntçən] (de.wiktionary), with [n̩] as the fast form, so each distractor misses exactly one rule (or all three).
- **Step 18.** Holds (AV, KL, SGP L86). The lenis claim is restricted to Austria.
- **Opening.** The wording „… in der Miete enthalten?" is an editorial judgement; no corpus could be fetched. The English-habit premise for Miete is removed (C70).

## Open caveats (for the builder and the Deep dive)

1. **Region-dependent**, keep flagged:
   - devoicing and the glottal stop are northern;
   - -ig is [ɪç] north, [ɪk] centre and south, [ɪɡ̊] in Austria and Switzerland;
   - long ä is [ɛː] or [eː];
   - -er [ɐ] vs Swiss consonantal r and southern [ə];
   - Austrian [x] after front vowels;
   - Küche [ʏ] vs northern [yː].
2. **Analysis-dependent:**
   - the glottal stop is not a phoneme;
   - [ç] vs [x] as the underlying form;
   - quantity vs quality as the distinctive feature;
   - the syllabification behind word-internal devoicing (Handlung, Adler, Eigner).
3. **Single-study claim:** the Oper = Opa merger (n = 6, read speech). Present it as a finding, not a rule.
4. **Transcription conventions:** DWDS [ʀ]/[χ] vs the reel's [ʁ]/[x]. Theater's hiatus catch is optional.
5. **Unsourced, editorial:** the naturalness of the opening question. The narration listening check (QUALITY "Before shipping" #7) should also confirm that the synthetic voice produces the catch in „enthalten" and Oase.
6. **Fonts:** [ɛntˈhaltn̩] and [n̩] use U+0329, which the outline says is in the font subset. [aʊ̯x] and [ɐ̯] still depend on U+032F (the existing builder risk).
