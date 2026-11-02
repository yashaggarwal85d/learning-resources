## 6.3.2. What are Variables Control Charts?

URL: https://itl.nist.gov/div898/handbook/pmc/section3/pmc32.htm
Version: NIST/SEMATECH e-Handbook of Statistical Methods, retrieved 2026-10-31

The distinction this topic hangs everything on.

> Control Limits are used to determine if the process is in a state of statistical control (i.e., is producing consistent output).

> Specification Limits are used to determine if the product will function in the intended fashion.

The WECO rules, in the handbook's own list.

> WECO stands for Western Electric Company Rules

The probability reasoning behind them.

> The WECO rules are based on probability. We know that, for a normal
distribution, the probability of encountering a point outside

The price of adding them.

> When following the standard Shewhart "out of control" rule (i.e., signal if and only if you see a point beyond the plus or minus 3 sigma control limits) you will have "false alarms" every 371 points on the average (see the description of Average Run Length or ARL on the next page). Adding the WECO rules increases the frequency of false alarms to about once in every 91.75 points, on the average (see Champ and Woodall, 1987).

Contents: control limits vs. specification limits; Shewhart's rule of thumb for how many samples justify a control-limit estimate; when to recalculate control limits; the eight WECO zone rules and the two trend rules, drawn as a chart; the false-alarm-rate cost of adding them, attributed to Champ and Woodall (1987).

## 6.1.6. What is Process Capability?

URL: https://itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm
Version: NIST/SEMATECH e-Handbook of Statistical Methods, retrieved 2026-10-31

The two capability indices, in the handbook's own notation.

> $$ C_{p} = \frac{\mbox{USL} - \mbox{LSL}} {6\sigma} $$

> $$ \hat{C}_{pk} = \min{\left[ \frac{\mbox{USL} - \bar{x}} {3s}, \frac{\bar{x} - \mbox{LSL}} {3s}\right]} $$

The algebraic identity connecting them.

> From this we see that the \(\hat{C}_{pu}\),

The inequality this topic's "high Cp, low Cpk" trap depends on.

> it follows that \(\hat{C}_{pk} \le \hat{C}_{p}\).

Contents: the Cp, Cpk and Cpm formulas; the Cpk = Cp(1-k) identity; a worked numeric example (Cp = 1.0, Cpk = 0.6667, Cpu and Cpl computed to show which side is off-centre); confidence-interval formulas for Cp and Cpk (not used by this topic).

## Nelson's eight rules (secondary-sourced; the primary paper is paywalled)

URL: https://doi.org/10.1080/00224065.1984.11978921
Version: no full text fetchable (journal paywall); cited here as a bibliographic fact only, with no quote

The original paper — Lloyd S. Nelson, "The Shewhart Control Chart—Tests for Special Causes," *Journal of Quality Technology* 16, no. 4 (October 1984): 238–239, DOI 10.1080/00224065.1984.11978921 — sits behind a journal paywall and could not be fetched and quoted directly, unlike every other source in this file. This topic therefore does **not** assert the exact text of Nelson's eight rules as a verified primary-source quote; it names the rules' existence, their general shape (a superset of the WECO zone-and-trend tests, codified as eight numbered tests), and that WECO's own four-zone tests are the rules this topic actually measures the false-alarm rate of, confirmed from the NIST source above. Where the reel mentions Nelson's rules, it is as a named historical fact (an eight-rule superset exists, attributed by secondary consensus — Wikipedia's "Nelson rules" article and a Thai-language hospital quality-management newsletter both independently describing the same eight numbered rules — to Nelson's 1984 column), not as a verbatim-quoted standard.
