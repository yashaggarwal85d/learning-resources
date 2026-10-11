"""The German sound system: every claim the reel shows, derived by a small rule and asserted.

Run with `python3 examples.py` (no network, no packages). The rules are the ones the reel teaches; each asserts
against transcriptions copied from the sources named in SOURCES.md (DWDS, de.wiktionary, the ADS and AV articles).
Two conventions: the reel writes the ach-Laut as [x] and the uvular r as [ʁ] (DWDS writes [χ] and [ʀ]); and it
draws [ɐ̯] and the syllabic [n̩] without their combining marks (`display`), because the self-hosted fonts lack them.
"""
import re

# ---------------------------------------------------------------------------------------------------------------
# Step labels: "Prove it · 1 of 2" and "2 of 2".
PROVE_IT = 2
assert PROVE_IT == 2 and 1 < PROVE_IT

VOWEL_CHARS = set('aeiouyɛɪʊʏœɔəɐøɑäöü')
NON_SYLLABIC = '̯'  # the little arch under ɐ̯ and ʊ̯
SYLLABIC = '̩'  # the little bar under n̩


def display(ipa):
    """What the drawings show: the weak e in place of the syllabic mark, and no non-syllabic arch."""
    return ipa.replace('n' + SYLLABIC, 'ən').replace(NON_SYLLABIC, '')


# ---------------------------------------------------------------------------------------------------------------
# 1. The vowels (ADS table "Monophthonge", C17): height, backness, rounding, length.
VOWELS = {
    'iː': ('close', 'front', 'unrounded', 'long'),
    'yː': ('close', 'front', 'rounded', 'long'),
    'uː': ('close', 'back', 'rounded', 'long'),
    'eː': ('close-mid', 'front', 'unrounded', 'long'),
    'øː': ('close-mid', 'front', 'rounded', 'long'),
    'oː': ('close-mid', 'back', 'rounded', 'long'),
    'ɛː': ('open-mid', 'front', 'unrounded', 'long'),
    'ɪ': ('near-close', 'near-front', 'unrounded', 'short'),
    'ʏ': ('near-close', 'near-front', 'rounded', 'short'),
    'ʊ': ('near-close', 'near-back', 'rounded', 'short'),
    'ɛ': ('open-mid', 'front', 'unrounded', 'short'),
    'œ': ('open-mid', 'front', 'rounded', 'short'),
    'ɔ': ('open-mid', 'back', 'rounded', 'short'),
    'a': ('open', 'front-to-back', 'unrounded', 'short'),
    'aː': ('open', 'front-to-back', 'unrounded', 'long'),
}
assert len(VOWELS) == 15  # ADS: "rund 15" monophthong phonemes (schwa excluded)
VOWEL_LETTERS = 'aeiouäöü'
assert len(VOWEL_LETTERS) == 8  # written with eight letters (C68)


def umlaut(v):
    """Umlaut is fronting: the vowel keeps its height and rounding and moves to the front."""
    height, _, rounding, length = VOWELS[v]
    for w, (h, b, r, ln) in VOWELS.items():
        if h == height and b == 'front' and r == rounding and ln == length:
            return w
    raise KeyError(v)


assert umlaut('uː') == 'yː' and umlaut('oː') == 'øː'
# ü has i's tongue and u's lips; ö has e's tongue and o's lips.
assert VOWELS['yː'][:2] == VOWELS['iː'][:2] and VOWELS['yː'][2] == VOWELS['uː'][2]
assert VOWELS['øː'][:2] == VOWELS['eː'][:2] and VOWELS['øː'][2] == VOWELS['oː'][2]
# The short ones come as pairs: a different vowel, except a, which differs (almost) only in length.
assert VOWELS['ɪ'][:3] != VOWELS['iː'][:3]
assert VOWELS['a'][:3] == VOWELS['aː'][:3] and VOWELS['a'][3] != VOWELS['aː'][3]
assert VOWELS['ɛ'][:3] == VOWELS['ɛː'][:3]
# Short ä is exactly short e: [ɛ] in Männer and in Bett (C18).
SHORT_E_SOUND = {'Männer': 'ɛ', 'Bett': 'ɛ'}
assert SHORT_E_SOUND['Männer'] == SHORT_E_SOUND['Bett']

# Citation IPA (DWDS and de.wiktionary; stress mark ˈ).
IPA = {
    'Miete': 'ˈmiːtə', 'Mitte': 'ˈmɪtə', 'Höhle': 'ˈhøːlə', 'Hölle': 'ˈhœlə', 'Ofen': 'ˈoːfn̩', 'offen': 'ˈɔfn̩',
    'kam': 'kaːm', 'Kamm': 'kam', 'Mühle': 'ˈmyːlə',
    'Küche': 'ˈkʏçə', 'Kuchen': 'ˈkuːxn̩', 'Buch': 'buːx', 'Bücher': 'ˈbyːçɐ', 'Koch': 'kɔx', 'Köche': 'ˈkœçə',
    'ich': 'ɪç', 'ach': 'ax', 'mich': 'mɪç', 'nicht': 'nɪçt', 'Furcht': 'fʊʁçt', 'doch': 'dɔx', 'hoch': 'hoːx',
    'rauchen': 'ˈʁaʊ̯xn̩', 'Frauchen': 'ˈfʁaʊ̯çən', 'euch': 'ɔɪ̯ç', 'leicht': 'laɪ̯çt',
    'Lehrer': 'ˈleːʁɐ', 'rot': 'ʁoːt', 'der': 'deːɐ̯', 'wir': 'viːɐ̯', 'besser': 'ˈbɛsɐ', 'bitte': 'ˈbɪtə',
    'Oper': 'ˈoːpɐ', 'Opa': 'ˈoːpa',
    'Rad': 'ʁaːt', 'Rat': 'ʁaːt', 'Räder': 'ˈʁɛːdɐ', 'Tag': 'taːk', 'Tage': 'ˈtaːɡə', 'brav': 'bʁaːf', 'brave': 'ˈbʁaːvə',
    'Bad': 'baːt', 'Bäder': 'ˈbɛːdɐ', 'lieblich': 'ˈliːplɪç', 'lieben': 'ˈliːbn̩', 'wichtig': 'ˈvɪçtɪç',
    'Acht': 'ˈʔaxt', 'beachten': 'bəˈʔaxtn̩', 'Theater': 'teˈʔaːtɐ', 'Oase': 'ʔoˈʔaːzə', 'Achtung': 'ˈʔaxtʊŋ',
    'Hund': 'hʊnt', 'Hündchen': 'ˈhʏntçən',
}
# Length goes with quality: the short partner is a different vowel (Miete iː, Mitte ɪ; Höhle øː, Hölle œ).
assert IPA['Miete'] == 'ˈmiːtə' and IPA['Mitte'] == 'ˈmɪtə'
assert IPA['Miete'].replace('iː', 'ɪ') == IPA['Mitte']  # one vowel is the whole difference
assert IPA['Miete'].count('t') == IPA['Mitte'].count('t') == 1  # the doubled tt is one sound
assert len('mɪtə') == 4  # four sounds in [ˈmɪtə]: m, ɪ, t, ə (Prerequisites self-check)
assert IPA['Mühle'][1:3] == 'my'
MULLER_VOWEL = 'ʏ'  # Müller [ʏ] (ADS table, ORTH): the short partner of Mühle's yː
assert VOWELS[MULLER_VOWEL][3] == 'short' and umlaut('uː') == 'yː'
assert IPA['kam'] == 'kaːm' and IPA['Kamm'] == 'kam'


# ---------------------------------------------------------------------------------------------------------------
# 2. Length from spelling: only the cues step 3 teaches.
def length_from_spelling(word):
    w = word.lower()
    i = next(k for k, c in enumerate(w) if c in 'aeiouäöüy')
    rest = w[i + 1:]
    if w[i:i + 2] in ('ie', 'aa', 'ee', 'oo'):
        return 'long'
    if rest.startswith('h'):  # a silent h after the vowel (Zahn, Höhle)
        return 'long'
    if rest.startswith('ch') or rest.startswith('sch'):  # nothing marks length before ch
        return 'unknown'
    if rest.startswith('ck') or rest.startswith('tz'):
        return 'short'
    if len(rest) >= 2 and rest[0] == rest[1] and rest[0] not in 'aeiouäöü':  # a doubled consonant
        return 'short'
    if rest == '':
        return 'long'
    if len(rest) == 1 or rest[1] in 'aeiouäöüy':  # one consonant: at the end, or before a vowel
        return 'long'
    return 'short'  # two different consonants


for word, expect in [('Miete', 'long'), ('Mitte', 'short'), ('Höhle', 'long'), ('Hölle', 'short'), ('Ofen', 'long'),
                     ('offen', 'short'), ('kam', 'long'), ('Kamm', 'short'), ('Saat', 'long'), ('See', 'long'),
                     ('Moor', 'long'), ('Zahn', 'long'), ('Liebe', 'long'), ('Sonne', 'short'),
                     ('Drache', 'unknown'), ('Sprache', 'unknown')]:
    assert length_from_spelling(word) == expect, word
# Cues, not guarantees (C11): Mond is long although two consonants follow, and a, das, es, in, mit, von are short.
EXCEPTIONS = {'Mond': 'long'}
assert length_from_spelling('Mond') == 'short' and EXCEPTIONS['Mond'] == 'long'
assert length_from_spelling('Drache') == length_from_spelling('Sprache') == 'unknown'  # a short, aː long, same spelling


# ---------------------------------------------------------------------------------------------------------------
# 3. The two ch sounds: the vowel before decides, and -chen always takes the front one.
def ch_sound(stem, suffix=''):
    if suffix == 'chen':
        return 'ç'
    s = stem.lower()
    i = s.index('ch')
    if i == 0:  # northern onset in loanwords: Chemie
        return 'ç'
    before = s[:i]
    if before.endswith(('eu', 'äu', 'ei', 'ai')):  # the sound ends in a front glide although the letter is u or i
        return 'ç'
    if before.endswith('au'):
        return 'x'
    return 'x' if before[-1] in 'aou' else 'ç'


FRONT = ['ich', 'mich', 'nicht', 'Furcht', 'manchmal', 'Molch', 'Küche', 'Bücher', 'Köche', 'euch', 'leicht']
BACK = ['ach', 'Buch', 'Bach', 'doch', 'hoch', 'Koch', 'Kuchen', 'Drache', 'Sprache']
for w in FRONT:
    assert ch_sound(w) == 'ç', w
for w in BACK:
    assert ch_sound(w) == 'x', w
assert ch_sound('rauchen') == 'x' and ch_sound('Frau', 'chen') == 'ç' and ch_sound('Hünd', 'chen') == 'ç'
# Kuchen is the test that the rule is about the cut in the word, not the spelled letters c-h-e-n.
assert ch_sound('Kuchen') == 'x' and ch_sound('Fräu', 'chen') == 'ç'
# Umlaut moves the ch (C76): Buch -> Bücher, Koch -> Köche.
assert (ch_sound('Buch'), ch_sound('Bücher')) == ('x', 'ç') and (ch_sound('Koch'), ch_sound('Köche')) == ('x', 'ç')
# The sourced transcriptions agree.
for w in ['ich', 'mich', 'nicht', 'Küche', 'Bücher', 'Köche', 'euch', 'leicht']:
    assert 'ç' in IPA.get(w, 'ç'), w
for w in ['ach', 'Buch', 'Koch', 'doch', 'hoch', 'Kuchen', 'rauchen']:
    assert 'x' in IPA[w], w
assert 'ç' in IPA['Frauchen'] and 'x' not in IPA['Frauchen']
CH_FRONT_COUNT = len(['ich', 'mich', 'Furcht', 'nicht'])
CH_BACK_COUNT = len(['ach', 'Buch', 'doch', 'hoch'])
assert CH_FRONT_COUNT == CH_BACK_COUNT == 4  # the two lists in step 6


# ---------------------------------------------------------------------------------------------------------------
# 4. Final devoicing: in the coda of every syllable. Input is a syllabified phonemic form.
DEVOICE = {'b': 'p', 'd': 't', 'ɡ': 'k', 'v': 'f', 'z': 's', 'ʒ': 'ʃ'}


def devoice(syllables, region='north'):
    if region != 'north':  # Austrian and Swiss standard German have no devoicing
        return ''.join(syllables)
    out = []
    for n, syl in enumerate(syllables):
        if n == len(syllables) - 1 and syl.endswith('ɪɡ'):  # the northern -ig -> [ɪç]
            syl = syl[:-1] + 'ç'
        j = len(syl)
        while j > 0 and syl[j - 1] not in VOWEL_CHARS | {'ː'}:
            j -= 1
        out.append(syl[:j] + ''.join(DEVOICE.get(c, c) for c in syl[j:]))
    return ''.join(out)


assert devoice(['ʁaːd']) == 'ʁaːt' == devoice(['ʁaːt']) == IPA['Rad'] == IPA['Rat']  # Rad = Rat
assert devoice(['ʁɛː', 'dɐ']) == 'ʁɛːdɐ'  # Räder keeps its voice: the d starts a syllable
assert devoice(['taːɡ']) == 'taːk' == IPA['Tag'] and devoice(['taː', 'ɡə']) == 'taːɡə'
assert devoice(['baːd']) == IPA['Bad'] and devoice(['bɛː', 'dɐ']) == 'bɛːdɐ'
assert devoice(['bʁaːv']) == IPA['brav'] and devoice(['bʁaː', 'və']) == 'bʁaːvə'
assert devoice(['liːb', 'lɪç']) == 'liːplɪç' and devoice(['liː', 'bən']) == 'liːbən'
assert devoice(['ɛnd', 'lɪç']) == 'ɛntlɪç' and devoice(['ɛn', 'də']) == 'ɛndə'  # endlich, Ende
assert devoice(['tsuːɡ']) == 'tsuːk' and devoice(['loːz']) == 'loːs' and devoice(['ʁiːb']) == 'ʁiːp'
assert devoice(['vɪç', 'tɪɡ']) == 'vɪçtɪç' == IPA['wichtig'].replace('ˈ', '')  # northern -ig
assert devoice(['ʁaːd'], 'AT') == 'ʁaːd' and devoice(['ʁaːd'], 'CH') == 'ʁaːd'
# What is on screen is the sourced transcription (the dictionary forms, with the stress mark).
assert IPA['Räder'] == 'ˈʁɛːdɐ' and IPA['Tage'] == 'ˈtaːɡə' and IPA['brave'] == 'ˈbʁaːvə'
assert IPA['Bäder'] == 'ˈbɛːdɐ' and IPA['lieblich'] == 'ˈliːplɪç' and IPA['lieben'] == 'ˈliːbn̩'
# A twist, not an exception: [ɪç] is voiceless too. Before -lich the g stays a stop: königlich [ˈkøːnɪklɪç].
assert devoice(['køː', 'nɪɡ', 'lɪç']).replace('ɡ', 'k') == 'køːnɪklɪç'


# ---------------------------------------------------------------------------------------------------------------
# 5. The two r's: a consonant before a vowel, a vowel after one.
def r_surface(phonemic):
    s = re.sub('ər$', 'ɐ', phonemic)  # -er is the vowel [ɐ]
    s = re.sub('r(?=ˈ?[' + ''.join(VOWEL_CHARS) + '])', 'ʁ', s)  # before a vowel: the uvular consonant
    return re.sub('(?<=[' + ''.join(VOWEL_CHARS) + 'ː])r', 'ɐ' + NON_SYLLABIC, s)  # after a vowel: the glide


assert r_surface('ˈleːrər') == IPA['Lehrer'] == 'ˈleːʁɐ'  # both r's in one word
assert r_surface('roːt') == IPA['rot'] and r_surface('deːr') == IPA['der'] and r_surface('viːr') == IPA['wir']
assert r_surface('fyːr') == 'fyːɐ̯' and r_surface('zeːr') == 'zeːɐ̯'
assert r_surface('ˈbɛsər') == IPA['besser'] == 'ˈbɛsɐ'
assert r_surface('ˈoːpər') == IPA['Oper'] == 'ˈoːpɐ'
# -er [ɐ] is not -e [ə]: besser is not bitte.
assert IPA['besser'][-1] == 'ɐ' and IPA['bitte'][-1] == 'ə' and 'ɐ' != 'ə'
# Oper and Opa: the dictionaries keep [ɐ] and [a] apart; a 2020 study of six northern speakers found them merged.
DICTIONARY = {'Oper': 'ˈoːpɐ', 'Opa': 'ˈoːpa'}
NORTHERN_SPEECH_2020 = {'Oper': 'ˈoːpa', 'Opa': 'ˈoːpa'}
assert DICTIONARY['Oper'] != DICTIONARY['Opa'] and NORTHERN_SPEECH_2020['Oper'] == NORTHERN_SPEECH_2020['Opa']
assert DICTIONARY['Oper'] == IPA['Oper'] and DICTIONARY['Opa'] == IPA['Opa']
assert r_surface('ˈoːpər').replace('ɐ', 'a') == DICTIONARY['Opa']  # ɐ is just a little higher than a
SPEAKERS_2020 = 6  # Rathcke and Mooshammer (2020): six northern speakers


# ---------------------------------------------------------------------------------------------------------------
# 6. The glottal catch before a vowel at the start of a word or stem. A word is a list of pieces
#    (ipa, kind, stressed): kind 'stem' starts a word or a stem, 'syll' is a syllable inside a stem, 'suffix' is an ending.
def glottal(words, region='north'):
    if region != 'north':
        return ' '.join(''.join(p[0] for p in w) for w in words)
    out = []
    for w in words:
        s = ''
        for k, piece in enumerate(w):
            ipa, kind = piece[0], piece[1]
            stressed = piece[2] if len(piece) > 2 else False
            start_vowel = ipa[0] in VOWEL_CHARS
            prev_vowel = k > 0 and w[k - 1][0][-1] in VOWEL_CHARS | {'ː'}
            if start_vowel and (kind == 'stem' or (kind == 'syll' and prev_vowel and stressed)):
                s += 'ʔ'
            s += ipa
        out.append(s)
    return ' '.join(out)


assert glottal([[('maɪ̯n', 'stem')], [('aʊ̯to', 'stem')]]) == 'maɪ̯n ʔaʊ̯to'
assert glottal([[('maɪ̯n', 'stem')], [('aʊ̯to', 'stem')]], 'AT') == 'maɪ̯n aʊ̯to'
assert glottal([[('axt', 'stem')]]) == 'ʔaxt' == IPA['Acht'].replace('ˈ', '')
assert glottal([[('bə', 'stem'), ('axtən', 'stem')]]) == 'bəʔaxtən'
assert glottal([[('te', 'stem'), ('aː', 'syll', True), ('tɐ', 'syll')]]) == 'teʔaːtɐ' == IPA['Theater'].replace('ˈ', '')
assert glottal([[('teː', 'stem'), ('a', 'syll', False)]]) == 'teːa'  # Thea: the second vowel is weaker, no catch
assert glottal([[('o', 'stem'), ('aː', 'syll', True), ('zə', 'syll')]]) == 'ʔoʔaːzə' == IPA['Oase'].replace('ˈ', '')
assert glottal([[('axt', 'stem'), ('ʊŋ', 'suffix')]]) == 'ʔaxtʊŋ'  # the suffix gets none: one catch only
assert glottal([[('faːʁ', 'stem'), ('ɐ', 'suffix')]]) == 'faːʁɐ'  # Fahrer: -er is a suffix, no catch
assert glottal([[('fɛɐ̯', 'stem'), ('aɪ̯nən', 'stem')]]) == 'fɛɐ̯ʔaɪ̯nən'  # vereinen
ODE = glottal([[('diː', 'stem')], [('oːdə', 'stem')]])
DIODE = glottal([[('di', 'stem'), ('oː', 'syll', True), ('də', 'syll')]])
assert ODE == 'diː ʔoːdə' and DIODE == 'diʔoːdə' and 'ʔ' in ODE and 'ʔ' in DIODE  # both have a catch: not a catch pair
assert glottal([[('te', 'stem'), ('aː', 'syll', True), ('tɐ', 'syll')]]).count('ʔ') == 1
assert glottal([[('o', 'stem'), ('aː', 'syll', True), ('zə', 'syll')]]).count('ʔ') == 2  # twice in one word
ROWS_OF_CATCH_BARS = 5
assert ROWS_OF_CATCH_BARS == len(['Acht', 'beachten', 'Theater', 'Oase', 'Achtung and Fahrer'])


# ---------------------------------------------------------------------------------------------------------------
# 7. The opening problem: both lines of the viewing, built from citation forms plus the rules above.
QUESTION = [('ist', 'ɪst'), ('die', 'diː'), ('Küche', 'ˈkʏçə'), ('in', 'ɪn'), ('der', 'deːɐ̯'), ('Miete', 'ˈmiːtə'),
            ('enthalten', 'ɛntˈhaltn̩')]
ANSWER = [('richtig', 'ˈʁɪçtɪç'), ('das', 'das'), ('Bad', 'baːt'), ('und', 'ʊnt'), ('der', 'deːɐ̯'), ('Keller', 'ˈkɛlɐ'),
          ('auch', 'aʊ̯x')]


def with_catches(line):
    """A catch before every word that starts with a vowel (after the stress mark, if any)."""
    out = []
    for _, ipa in line:
        mark = 'ˈ' if ipa.startswith('ˈ') else ''
        bare = ipa[len(mark):]
        out.append(mark + ('ʔ' if bare[0] in VOWEL_CHARS else '') + bare)
    return out


QUESTION_IPA = ' '.join(with_catches(QUESTION))
ANSWER_IPA = ' '.join(with_catches(ANSWER[:1])) + ' | ' + ' '.join(with_catches(ANSWER[1:]))
assert QUESTION_IPA == 'ʔɪst diː ˈkʏçə ʔɪn deːɐ̯ ˈmiːtə ʔɛntˈhaltn̩'
assert ANSWER_IPA == 'ˈʁɪçtɪç | das baːt ʔʊnt deːɐ̯ ˈkɛlɐ ʔaʊ̯x'
# Every mark is derived by a rule from this topic.
assert ch_sound('Küche') == 'ç' and ch_sound('richtig') == 'ç' and ch_sound('auch') == 'x'  # ich-Laut twice, ach-Laut once
assert r_surface('deːr') == 'deːɐ̯' and r_surface('ˈkɛlər') == 'ˈkɛlɐ' and r_surface('ˈrɪçtɪç') == 'ˈʁɪçtɪç'
assert devoice(['baːd']) == 'baːt' and devoice(['ʊnd']) == 'ʊnt'
assert devoice(['ˈrɪç', 'tɪɡ']) == 'ˈrɪçtɪç'  # -ig -> [ɪç]
assert IPA['Miete'].replace('iː', 'ɪ') == IPA['Mitte']  # shorten one vowel and rent turns into middle
catches_q = QUESTION_IPA.count('ʔ')
catches_a = ANSWER_IPA.count('ʔ')
assert (catches_q, catches_a) == (3, 2)  # ist, in, enthalten; und, auch
FEATURES = {
    'length': 'iː' in QUESTION_IPA and 'ɪ' in QUESTION_IPA,
    'umlaut': 'ʏ' in QUESTION_IPA,
    'ch': 'ç' in QUESTION_IPA and 'x' in ANSWER_IPA,
    'r': 'ʁ' in ANSWER_IPA and 'ɐ' in ANSWER_IPA,
    'devoicing': 'baːt' in ANSWER_IPA and 'ʊnt' in ANSWER_IPA,
    'glottal': 'ʔ' in QUESTION_IPA and 'ʔ' in ANSWER_IPA,
}
assert all(FEATURES.values()) and len(FEATURES) == 6  # the six rules
# What the drawings show.
assert display(QUESTION_IPA) == 'ʔɪst diː ˈkʏçə ʔɪn deːɐ ˈmiːtə ʔɛntˈhaltən'
assert display(ANSWER_IPA) == 'ˈʁɪçtɪç | das baːt ʔʊnt deːɐ ˈkɛlɐ ʔaʊx'


# ---------------------------------------------------------------------------------------------------------------
# 8. Hündchen: umlaut, final devoicing and -chen at once.
def hundchen():
    stem = 'hʊnd'
    stem = stem.replace('ʊ', 'ʏ')  # the diminutive fronts the vowel (umlaut), still short
    form = devoice(['ˈ' + stem, 'çən'])  # d ends the syllable Hünd-; -chen is always [çən]
    return form


assert devoice(['hʊnd']) == IPA['Hund'] == 'hʊnt'
assert hundchen() == IPA['Hündchen'] == 'ˈhʏntçən'
fast = hundchen()[:-2] + 'n' + SYLLABIC  # in quick speech the weak e drops: a syllabic n (SGP's form)
assert fast == 'ˈhʏntçn̩'
WRONG = {'no rule applied': 'ˈhʊndxən', 'no devoicing': 'ˈhʏndçən', 'no umlaut': 'ˈhʊntçən'}
assert all(v != hundchen() for v in WRONG.values()) and len(WRONG) == 3
assert ch_sound('Hünd', 'chen') == 'ç' and ch_sound('Frau', 'chen') == 'ç' and ch_sound('rauchen') == 'x'
# Austrian standard German has neither the devoicing nor the catch (Prove it 2).
assert devoice(['ʁaːd'], 'AT') == 'ʁaːd' and glottal([[('maɪ̯n', 'stem')], [('aʊ̯to', 'stem')]], 'AT') == 'maɪ̯n aʊ̯to'

print('ok')
