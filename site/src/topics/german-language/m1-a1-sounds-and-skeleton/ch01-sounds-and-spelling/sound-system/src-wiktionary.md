# Source notes: German words and pronunciation (Wiktionary and DWDS)

Access date: 2026-10-11

Sources:
- Wiktionary entries: https://en.wiktionary.org/wiki/<word> (German section only)
- DWDS entries: https://www.dwds.de/wb/<word>
- Pronunciation appendix: https://en.wiktionary.org/wiki/Appendix:German_pronunciation

Method and caveats:
- Every page was fetched with WebFetch and the answer was extracted by a model. The IPA strings below are copied from that extraction, not from a byte-level copy of the page. The raw wikitext and REST HTML were not reachable (both returned a Wikimedia error page), so treat the IPA strings as "as returned by WebFetch" and re-check them against the live page before publishing.
- "Schön" and "schön" are one headword on each site; the entry was fetched once, as `schön`.
- Bär and Ofen each appear twice in the word list; each was fetched once.
- Wiktionary lists several etymologies for some words (Bund, Tag, See, Rad, Bär, Rat, Hölle is single). Only the first main sense is given.
- DWDS returned HTTP 404 for `Bücher`. Wiktionary's `Bücher` entry is a plural form of `Buch`.

## Word table

Columns: Word | Wiktionary IPA (verbatim as returned) | DWDS Aussprache (verbatim as returned) | Part of speech | Gender / plural | English meaning (Wiktionary) | German first definition (DWDS)

| Word | Wiktionary IPA | DWDS Aussprache | POS | Gender / plural | English meaning | DWDS Bedeutung (first) |
|---|---|---|---|---|---|---|
| Miete | IPA(key): /ˈmiːtə/ | [ˈmiːtə] | Noun | f; pl. Mieten | rent (Etym. 1); clamp, a heap of potatoes stored under straw or earth (Etym. 2) | Entgelt des Mieters für den Gebrauch einer gemieteten Sache, besonders einer Wohnung |
| Mitte | IPA(key): /ˈmɪ.tə/ | [ˈmɪtə] | Noun | f; pl. Mitten | middle; center | Punkt eines Ganzen, der von dessen äußerer Begrenzung überall gleich weit entfernt ist |
| Hölle | IPA(key): /ˈhœlə/ | [ˈhœlə] | Noun | f; pl. Höllen | hell | Strafort für die nach dem Tod verdammten Seelen |
| Höhle | IPA(key): /ˈhøːlə/ | no IPA; audio only | Noun | f; pl. Höhlen | cave; cavity (of the body) | großer, hohler, unausgefüllter Raum in der Erde oder zwischen Felsen |
| Küche | IPA(key): /ˈkʏçə/ (Germany); /ˈkʏçɛ/ (Austria, Southern Germany, Switzerland); /ˈkyːçə/ (some Low German areas) | no IPA; audio only | Noun | f; pl. Küchen | kitchen (room); cuisine | Raum, in dem die Speisen zubereitet und gekocht werden |
| Kuchen | IPA(key): /ˈkuːxən/, [ˈkuːxn̩], [ˈkuːχn̩], [-ən] | no IPA; audio only | Noun | m; pl. Kuchen (same as singular) | pie; cake; tart | größeres Gebäck, das aus Mehl, Fett, Eiern, Zucker und verschiedenen anderen Zutaten in mannigfaltiger Weise bereitet wird |
| Tag | /taːk/, [tʰaːkʰ] (Germany, Austria); /tax/ (northern and parts of central Germany); /taːx/; /taːɡ̊/ (Switzerland, Austria); /d̥aːɡ̊/, [d̥ɑːɡ̊] (Austria) | [taːk] (1Tag); [tæg] (2Tag, anglicism) | Noun (1Tag); Noun (2Tag); interjection (Etym. 2) | 1Tag m; pl. Tage. 2Tag n or m; pl. Tags | day (a 24-hour period); colloquial greeting "hello" / "(good) day" (Etym. 2); tag (label), Internet sense (Etym. 3) | Zeitraum von 24 Stunden, von Mitternacht bis Mitternacht, Zeitraum einer vollen Drehung der Erde um ihre Achse |
| Tage | IPA(key): /ˈtaːɡə/ | DWDS returned the Tag entry: [taːk] (no separate Tage entry shown) | Noun (inflected form of Tag; plural-only entry) | m; pl. Tage | inflection of Tag (nom./acc./gen. plural); "period, that time of the month (female menstruation)" (informal) | see Tag: Zeitraum von 24 Stunden, von Mitternacht bis Mitternacht |
| ich | IPA(key): /ɪç/, [ʔɪç] | [ɪç] | Pronoun (personal) | not applicable | I | Bezeichnung für die eigene Person |
| ach | IPA(key): /ax/ | no IPA; audio only | Interjection | not applicable | oh, alas (surprise, sorrow, understanding) | als Ausdruck des Schmerzes, der Betroffenheit, des Mitleids o. Ä. |
| Buch | /buːx/ | [buːχ] | Noun | n; pl. Bücher | book (Etym. 1); omasum (Etym. 2, rare); municipality in Vorarlberg (Etym. 3, proper noun) | Ein meist umfangreicheres, abgeschlossenes Werk mit geschriebenen oder grafischen Inhalten, als Druckwerk oder E-Book |
| Bücher | IPA(key): /ˈbyːçɐ/ | DWDS: HTTP 404 | Noun (plural form of Buch) | no separate gender or plural; lemma is Buch | books (example sentence only; the entry is a form-of entry for Buch) | not available (404) |
| Licht | /lɪçt/ | [lɪçt] | Noun | n (strong); pl. Lichter or Lichte | light (electromagnetic radiation, visible spectrum); light source, often artificial | mit dem Auge wahrnehmbare Helligkeit, Strahlung, die durch elektromagnetische Schwingungen hervorgerufen wird |
| Nacht | /naxt/, [naχt], [nɑxt] | [naχt] | Noun | f; pl. Nächte | night (sense 1); darkness (sense 2) | Zeit zwischen Ende der Abenddämmerung und Beginn der Morgendämmerung |
| Rad | IPA(key): /ʁaːt/ (prescriptive standard; southern Germany, Austria, Switzerland); IPA(key): /ʁat/ (northern and parts of central Germany; inflected forms with long vowel) | [ʀaːt] | Noun (n) | n; gen. Rades or Rads; pl. Räder (Etym. 1). Etym. 2: n; pl. Rads | wheel (Etym. 1); rad, unit of absorbed radiation dose (Etym. 2) | kreisrundes, scheibenförmiges Teil, das sich um seinen Mittelpunkt dreht |
| Rat | IPA(key): /raːt/, [ʁaːt] | [ʀaːt] | Noun | m; pl. Räte (gen. Rates or Rats) | advice, counsel; council; councilor | an jmdn. gerichteter Hinweis, Vorschlag, sich im Allgemeinen oder in einer konkreten Situation … |
| Hund | IPA(key): /hʊnt/ | [hʊnt] | Noun | m; pl. Hunde (regional Hünde) | dog, hound; (derogatory) scoundrel | kleines oder mittelgroßes, zu den Raubtieren gehörendes Säugetier mit feinem Gehör und Geruchssinn (gekürzt) |
| Bund | /bʊnt/ (Wiktionary); DWDS: [bʊnt] | [bʊnt] | Noun (three Wiktionary entries) | m; gen. Bundes / Bunds; pl. Bünde (alliance, federation, league). Also n (Germany, Switzerland) / m (Austria), pl. Bunde (bunch). Also m, no plural (federal government) | alliance, federation, league; bunch; federal government (Germany, Austria, Switzerland) | Vereinigung, Zusammenschluss, Bündnis von einzelnen Personen oder Personengruppen |
| Bett | IPA(key): /bɛt/ | [bɛt] | Noun | n; pl. Betten | bed (furniture); bed (bottom of a body of water) | Möbelstück mit Matratze und Decke, in das man sich zum Schlafen legt oder wenn man krank ist |
| Bäcker | IPA(key): /ˈbɛkɐ/ | [ˈbɛkɐ] | Noun | m; pl. Bäcker (same as singular) | baker | Handwerker, der gewerblich Backwaren herstellt |
| Lehrer | IPA(key): /ˈleːrər/, [ˈleːʁɐ] | [ˈleːʀɐ] | Noun | m; pl. Lehrer (same as singular); feminine counterpart Lehrerin | one who teaches, teacher, instructor, esp. school teacher | Person, die an einer Schule allgemeinbildenden oder berufsbezogenen Unterricht erteilt |
| Wasser | /ˈvasər/, [ˈva.sɐ], [ˈva.səʁ] | [ˈvasɐ] | Noun | n; pl. Wasser or Wässer (Wässer for different kinds of water) | water (H₂O); water, waters (body of water, river or lake) | weitgehend farblose, geruchlose und geschmacklose flüssige chemische Verbindung von Wasserstoff und Sauerstoff |
| Uhr | /uːr/, [ʔuːɐ̯] | [uːɐ̯] | Noun | f; pl. Uhren (gen. sg. Uhr) | hours, o'clock (invariable, time of day); clock, watch | Gerät in verschiedenster Form und Größe, das mit einem Zifferblatt und meist zwei Zeigern versehen ist und die Zeit angibt |
| Bär | IPA(key): /bɛːr/, [bɛːɐ̯], [beːɐ̯], [bɛɐ̯] | [bɛːɐ̯] | Noun (m) | m; pl. Bären (Etym. 1, entry 1: animal). Entry 2: heavy block or hammer (pl. Bären, or Bäre in technical writing). Etym. 2: boar (obsolete outside compounds) | bear (animal); heavy block or hammer (machining/pile-driving); boar (Etym. 2) | Tier aus der Familie der Ursidae, relativ schwerer, stämmiger Raubtier mit dichtem Pelz |
| Beamter | /bəˈʔamtɐ/ (most of Germany); /bɛˈamtɛr/ (Switzerland, some southern German and Austrian speakers); /b̥eˈamtɐ/ (Austria) | [bəˈʔamtə] | Noun (adjectival noun, declined like an adjective) | m; fem. Beamtin; pl. Beamte | government employee, (government) official, civil servant, public servant (police officer also listed) | Angestellter oder Amtsträger eines Staates oder einer überstaatlichen Behörde oder Organisation |
| Verein | /fɛɐ̯ˈʔaɪ̯n/, /fɛˈʁaɪ̯n/ (standard German, Germany); /fɛɐ̯ˈʁaɪ̯n/ (Austria, southern Germany, Switzerland) | [fɛɐ̯ˈʔaɪ̯n] | Noun | m; pl. Vereine | association; club; society | Zusammenschluss, Vereinigung von Personen zu dem Zweck, sich gemeinsam auf einem bestimmten Gebiet zu betätigen und gemeinsame Interessen zu pflegen |
| Spiegel | IPA(key): /ˈʃpiːɡl̩/ | [ˈʃpiːgl̩] | Noun | m (strong); pl. Spiegel (same as singular) | mirror | Gegenstand aus Glas oder Metall, dessen glänzende, glatte Fläche Bilder, optische Erscheinungen zurückwirft |
| See | /zeː/ (Germany); /seː/ (Austria, southern Germany, Switzerland) | [zeː] | Noun: m (lake, pl. Seen, gen. Sees); f (sea, uncountable, gen. See); proper noun n (Tyrol municipality) | m: pl. Seen. f: pl. Seen (sg.-only in some uses) | lake (m); sea, ocean (f) | große Wasseransammlung in einer Bodenvertiefung des Binnenlandes, stehendes Binnengewässer (m); Meer (f) |
| Ofen | IPA(key): /ˈoːfən/, [ˈoːfən], [ˈoːfn̩] | [ˈoːfn̩] | Noun | m; pl. Öfen | oven (clipping of Backofen); stove; furnace | im Haushalt und in der Industrie vielseitig verwendete Vorrichtung mit einem feuerfesten Raum (gekürzt) |
| Kind | /kɪnt/ | [kɪnt] | Noun | n (strong); pl. Kinder | kid; child (young person); child, offspring (in relation to parents) | Mensch in der Lebensphase zwischen Geburt und (Beginn der) Pubertät, Geschlechtsreife |
| Dach | IPA(key): /dax/, [däχ] | [daχ] | Noun (n); also a proper noun (surname) | n; pl. Dächer | roof | oberer Abschluss eines Gebäudes |
| China | /ˈçiːna/ (Germany, Berlin); /ˈkiːna/ (southern Germany, Austria, Switzerland); /ˈʃiːna/ (northern and western Germany); /ˈxiːna/ (Switzerland) | no IPA; audio only | Proper noun | n; gen. Chinas (or with article China); pl. China | China (country in East Asia) | Ländername (eWDG 1967); used only in the singular |
| Chemie | /çeˈmiː/ (standard); /ʃeˈmiː/ (northern and central Germany); /keˈmiː/ (Bavaria, Austria); /xeˈmiː/ (Switzerland) | [çeˈmiː] (regional); [keˈmiː]; [ʃeˈmiː] | Noun | f; no plural (Chemien listed by Wiktionary; DWDS: only used in singular) | chemistry | Wissenschaft, die sich mit dem Aufbau, den Eigenschaften, der Zusammensetzung und der Umwandlung von Substanzen beschäftigt |
| Sprache | /ˈʃpʁaːxə/, [ˈʃpʁäːχə], [ˈʃpʁɑːχə], [ˈʃprɑːxə] | [ˈʃpʀaːχə] | Noun | f; pl. Sprachen | language (countable system of words and methods for combining them); speech (manner of speaking, uncountable); speech (ability to utter words, uncountable) | historisch entstandenes und sich entwickelndes System verbaler Zeichen (…) |
| bitte | /ˈbɪtə/ | [ˈbɪtə] | Adverb / interjection / verb form (no noun entry) | not applicable | please (adverb); you're welcome (interjection); inflected form of "bitten" (verb) | begleitet höfliche Wünsche, Bitten oder Fragen (Partikel) |
| schön | /ʃøːn/ | no IPA; audio only | Adjective (also an adverb entry) | not applicable | beautiful, lovely, pretty, handsome (adj.); well, beautifully (adv.) | jmds. ästhetisches Empfinden sehr angenehm berührend, höchstes, bewunderndes Wohlgefallen hervorrufend |
| Mädchen | IPA(key): /ˈmɛːtçən/ (Germany, prescriptive); /ˈmeːtçən/ (Germany, more common, northern and eastern); /ˈmeːtçɛn/ (Austria, southern Germany); /ˈmɛːtçɛn/ (Switzerland, southern Germany) | [ˈmɛːtçən] | Noun | n (grammatically; feminine pronouns possible when referring to a girl or woman); pl. Mädchen (same as singular) | girl; maiden | Bezeichnung für weibliche Personen |
| Mann | /man/ | [man] | Noun | m; pl. Männer (historical Mannen) | man, male human being; husband | erwachsene Person männlichen Geschlechts |
| Männer | IPA(key): /ˈmɛnɐ/ | [man] (DWDS returned the Mann entry, with Plural Männer) | Noun (plural form of Mann) | Wiktionary: no separate gender or plural; DWDS: pl. Männer (historisch: Mannen) | nominative/accusative/genitive plural of Mann | see Mann: erwachsene Person männlichen Geschlechts |
| Tür | IPA(key): /tyːr/, [tʰyːɐ̯] | no IPA; audio only | Noun | f; pl. Türen | door (a rigid plane on a hinge) | meist rechteckige Öffnung in einer vertikalen Fläche (the wall opening), plus the movable panel that closes it |
| Tier | IPA(key): /tiːr/, [tʰiːɐ̯] | [tiːɐ̯] | Noun | n; pl. Tiere | animal; (of a person) animalistic qualities; hind (hunting jargon, female red deer) | (vom Menschen verschiedenes) Lebewesen, das sich in der Regel fortbewegen kann und Sauerstoff atmet |
| Tisch | IPA(key): /tɪʃ/ | [ˈtɪʃ] | Noun | m; pl. Tische | table (furniture); meal (figurative, mainly in compounds) | Möbelstück, das aus einer auf vier, auch drei Beinen ruhenden, waagerechten Platte besteht |
| können | IPA(key): /ˈkœnən/, [ˈkœnən], [ˈkœnn̩] (Germany); /ˈkœnɛn/ (Austria, southern Germany, Switzerland) | [ˈkœnən] | Verb (preterite-present modal) | not applicable | to be able (to do or be something); to have the possibility of; can | die geistige, körperliche Fähigkeit zu etw. haben, etw. verstehen, beherrschen |
| Könige | IPA(key): /ˈkøː.nɪ.ɡə/, [ˈkʰøː.nɪ.ɡə] | [ˈkøːnɪç] | Noun (Wiktionary: inflected form); DWDS: Substantiv (Maskulinum) | m (König); pl. Könige (nom.) | (archaic) dative singular of König; nominative/genitive/accusative plural of König | Inhaber der höchsten monarchischen Würde in bestimmten Monarchien oder der zweithöchsten in Monarchien mit einem Kaiser |

Notes on this table:
- Wiktionary gave the Könige IPA as /ˈkøː.nɪ.ɡə/, for an inflected form of König. The DWDS page for Könige returned the noun entry (Substantiv, Maskulinum, Plural Könige) with the pronunciation [ˈkøːnɪç]; the two IPA strings differ and both are kept as returned.
- Männer: the Wiktionary entry is a plural form of Mann. DWDS does not show a separate pronunciation for Männer; the Mann pronunciation [man] is given.

## Pronunciation appendix

Source: https://en.wiktionary.org/wiki/Appendix:German_pronunciation (access date 2026-10-11)

Caveat: the quotes below are the text returned by WebFetch's extraction. They were checked against the page only at that level; the raw wikitext could not be fetched. Some items are table fragments, not full sentences. Re-check each quote against the live page before using it in teaching material.

1. Vowel length
- "Nasal vowels are generally long in stressed syllables and short in unstressed ones."
- Table fragments: "(short [eː])", "(short [iː])", "(short [uː])", "as above but longer" (fragments, not full sentences).

2. Ch-sounds (ich-Laut and ach-Laut)
- /ç/ examples: "ich", "durch" (English approximation: "hue").
- "/x/ is realized as a uvular fricative [χ] after [a], [aː], and often [ʊ], [ɔ], and [aʊ]."

3. R realisations
- "In free variation with [ʀ] and also — in Switzerland, Bavaria, and Austria — the voiced alveolar trill [r]."
- Chart: "like a French R (a voiced uvular fricative)".
- "/ɐ/ is often merged into, and hence not distinguished from, [ə], specifically in southern Germany and Austria."

4. Final devoicing (Auslautverhärtung)
- Full-sentence statement on final devoicing: not found in the extraction.
- Related fragment, in a table note on /z/ or /s/: "Predominantly realized as [z̥] (devoiced) or [s] (voiceless) in southern regions" (truncated; continues "(Switzerland, Bavaria, Rhine Palatinate, Baden-Württemberg, Austria).").
- Note: this is about /z/ realization, not a general word-final devoicing statement.

5. Glottal stop
- "The presence or absence of [ʔ] is not phonemic."
- "In most standard varieties of German, all initial vowels are preceded by [ʔ]."
- Table gloss: "the glottal stop in uh-oh!" (English approximation for [ʔ]).

6. Umlauts (ä, ö, ü)
- The term "umlaut" does not appear as a full sentence in the extraction.
- "[ɛː] is often replaced by [eː], chiefly in northern and eastern Germany, and eastern Austria." (on ä)
- Table entries: "hätte" (ä), "göttlich" (ö), "Öl" (approximation "somewhat like hurl; French deux"), "Rübe" (approximation "French rue"), "füllt" (ü), "Parfüm" (ü).

## Access log

- 2026-10-11: WebFetch to all Wiktionary and DWDS URLs listed above. Failures: DWDS `Bücher` (HTTP 404).
- 2026-10-11: Wiktionary `Appendix:German_pronunciation` fetched via WebFetch (twice, different prompts). Raw wikitext and REST HTML attempts returned a Wikimedia error page.
