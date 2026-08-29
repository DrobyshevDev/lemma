# Module 24. How to read a paper

!!! abstract "After this module you will be able to"
    - Read a paper not top to bottom, but in the order that reaches the point faster.
    - Find the main claimed number in a paper and ask it the three questions from Module 1.
    - See where the weak spot hides: the comparison, the seeds, the intervals, test leakage.
    - Tell a strong paper from a weak and a retracted one by what backs the number.
    - Turn reading from taking claims on faith into checking — the same eye as the whole course.

    **Time:** about one week. **Prerequisites:** [Module 1](01-claim-baseline-noise.md), [Module 7](07-honest-comparison.md) and [Module 20](20-ab-tests-and-causality.md).
    **Notebook:** [`notebooks/24-how-to-read-a-paper.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/24-how-to-read-a-paper.ipynb)

## Why this

The previous twenty-three modules were written for this one. The field moves through papers, and most of the improvements claimed in them do not survive an honest check: they dissolve under a change of seed, come from comparing a tuned method with an untuned baseline, or rest on one lucky run. Someone who reads papers on faith builds on noise.

Reading a paper is not retelling it — it is **checking a claim**. Exactly what [Module 1](01-claim-baseline-noise.md) did, only now the claim is someone else's and is delivered persuasively.

## The reading order

You do not read a paper top to bottom. The introduction and related work are written to persuade; the tables and the figure are there to show. You go first to what can be checked, and only then to what explains it.

<figure class="lm-inline-fig">
<svg viewBox="0 0 470 132" role="img" aria-label="The reading order of a paper by number: 1 — abstract and claim, 2 — the main results table, 3 — what is compared against and how many seeds, 4 — the method, 5 — limitations. The path runs not top to bottom, but from the checkable to the explanatory.">
  <g style="font-family:var(--mono);font-size:8.5px">
    <rect x="8" y="10" width="150" height="22" rx="6" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.2"/>
    <text x="20" y="24" style="fill:var(--paper-bright)">abstract · claim</text>
    <circle cx="150" cy="21" r="8" style="fill:var(--accent)"/><text x="150" y="24" text-anchor="middle" style="fill:var(--ink);font-size:8px">1</text>
    <rect x="8" y="38" width="150" height="22" rx="6" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.2"/>
    <text x="20" y="52" style="fill:var(--paper-bright)">main results table</text>
    <circle cx="150" cy="49" r="8" style="fill:var(--gold)"/><text x="150" y="52" text-anchor="middle" style="fill:var(--ink);font-size:8px">2</text>
    <rect x="8" y="66" width="150" height="22" rx="6" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.2"/>
    <text x="20" y="80" style="fill:var(--paper-bright)">baseline · seeds · interval</text>
    <circle cx="150" cy="77" r="8" style="fill:var(--gold)"/><text x="150" y="80" text-anchor="middle" style="fill:var(--ink);font-size:8px">3</text>
    <rect x="8" y="94" width="150" height="22" rx="6" style="fill:var(--ink-raised);stroke:var(--ink-line);stroke-width:1.2"/>
    <text x="20" y="108" style="fill:var(--paper-faint)">method</text>
    <circle cx="150" cy="105" r="8" style="fill:var(--paper-faint)"/><text x="150" y="108" text-anchor="middle" style="fill:var(--ink);font-size:8px">4</text>
    <path d="M250 21 h-70" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#porde)"/>
    <path d="M250 49 h-70" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#porde)"/>
    <path d="M250 77 h-70" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#porde)"/>
    <path d="M250 105 h-70" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#porde)"/>
    <text x="262" y="24" style="fill:var(--paper)">what is claimed</text>
    <text x="262" y="52" style="fill:var(--paper)">how much, on what</text>
    <text x="262" y="80" style="fill:var(--paper)">will it survive noise</text>
    <text x="262" y="108" style="fill:var(--paper)">how it works</text>
    <text x="8" y="128" style="fill:var(--paper-faint)">read from the checkable (1–3) to the explanatory (4) — not top to bottom</text>
  </g>
  <defs><marker id="porde" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--paper-faint)"/></marker></defs>
</svg>
</figure>

The abstract gives the claim. The main table shows how much. And only the third step is the important one: **what is compared against, how many times it was run, is the spread shown.** If it is empty here, you can stop: the method does not matter if the gain cannot be told from noise.

## Three questions for a number

Any claimed "+3.2%" is not a fact but a claim, and it has three questions from [Module 1](01-claim-baseline-noise.md).

<figure class="lm-inline-fig">
<svg viewBox="0 0 440 96" role="img" aria-label="A claimed number +3.2% and three questions for it: what was it compared against (baseline), how many times was it run (repetition), is the spread shown (noise). Without answers to all three the number means nothing.">
  <g style="font-family:var(--mono);font-size:9px">
    <rect x="170" y="8" width="100" height="26" rx="7" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.4"/>
    <text x="220" y="25" text-anchor="middle" style="fill:var(--paper-bright);font-size:11px">+3.2%</text>
    <rect x="16" y="60" width="122" height="26" rx="7" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1"/>
    <text x="77" y="77" text-anchor="middle" style="fill:var(--paper)">compared to what?</text>
    <rect x="159" y="60" width="122" height="26" rx="7" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1"/>
    <text x="220" y="77" text-anchor="middle" style="fill:var(--paper)">how many runs?</text>
    <rect x="302" y="60" width="122" height="26" rx="7" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1"/>
    <text x="363" y="77" text-anchor="middle" style="fill:var(--paper)">what is the spread?</text>
    <path d="M200 34 L90 58" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#pqe)"/>
    <path d="M220 34 V58" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#pqe)"/>
    <path d="M240 34 L350 58" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#pqe)"/>
  </g>
  <defs><marker id="pqe" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--paper-faint)"/></marker></defs>
</svg>
</figure>

**Compared to what** — is the baseline honest or deliberately weak ([Module 7](07-honest-comparison.md))? **How many runs** — one lucky seed or five ([Module 1](01-claim-baseline-noise.md))? **What is the spread** — do the intervals of method and baseline separate or overlap? That is the weak spot: not in the method, but in the comparison. A tuned method against an untuned baseline gives a "gain" out of thin air.

## Three papers

The same claim by form — "a gain over baseline" — lives differently depending on what backs it. Let us take apart three papers: a strong one, a weak one, and a retracted one.

<div class="lm-fig" data-lm-fig="paper-audit"></div>

Press "audit the papers". The strong paper has, under its number, an honest baseline, five seeds, an interval, a held-out test and open code: the gain survives the check. The weak one has only the test and the code, no baseline, no seeds, no interval: +1.1% drowns in the noise. The retracted one, under the largest number +9.0%, has nothing at all. Notice: **the largest gain turned out to be the emptiest** — a big number with no evidence is more suspicious than a modest one with it.

<div class="lm-thread" markdown>
**The three questions you put to someone else's number are [Module 1](01-claim-baseline-noise.md), turned outward.** There you asked them of your own result: what it was compared against, how many times it was run, what the spread was. Here the same three go to someone else's paper — and the weak spot is the same every time, the comparison: a tuned method against an untuned baseline ([Module 7](07-honest-comparison.md)) gives a gain out of thin air. To read a paper is to withhold trust from its number until it answers the questions you asked of your own.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/24-how-to-read-a-paper.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/24-how-to-read-a-paper.ipynb). Only `numpy` and `matplotlib`.

What is inside:

1. We simulate three papers with the same claim "+3% over baseline": one with an honest baseline and five seeds, one with a single lucky seed, and one whose result is fitted by the choice of seed. We show what survives a change of seed and what falls apart.
2. A tuned method against an untuned baseline: how a "gain" appears out of an unequal comparison alone, with no method at all.
3. Seed cherry-picking: why out of ten runs there is always a pretty one, and why `pass@1` is more honest than "the best result".

### Part 2. Your own paper

Take any paper with a claimed improvement — one you read for work or study.

1. Find the main number in a minute, without reading the method. Where is it?
2. What is compared against? Is the baseline tuned as carefully as the method?
3. How many runs, is the spread shown? Would the gain survive a change of seed?
4. Is there a limitations section — and is it honest, or there for show?
5. Is the code released? What in the paper is left unsaid to the point that it could not be repeated?

## Assignment

1. Implement an "honest" and a "dishonest" claim: in the first the baseline is tuned, there are five runs, an interval is shown; in the second an untuned baseline and one seed. Plot both and show which survives the check.
2. Model seed cherry-picking: make 10 runs of a noisy method and show that "the best of 10" systematically overstates the result.
3. Take a table with overlapping intervals of method and baseline and show that the claimed gap cannot be told from noise.
4. Assemble your own five-point reading checklist and run three real papers through it. Which passes?
5. Find, in a real paper, a comparison that cannot be called honest, and state exactly what is unequal.

## Self-check

1. Why is a paper not read top to bottom, and where do you start?
2. What three questions do you ask any claimed number?
3. Where does the weak spot most often hide — in the method or in the comparison?
4. Why is a large gain without evidence more suspicious than a modest one with it?
5. What is seed cherry-picking and why does "the best of N" overstate the result?
6. Which module does "an honest baseline" rhyme with, and which one "the gain cannot be told from noise"?
7. What makes a paper reproducible, besides open code?

## Next

You can check one paper. In [Module 25](../programme.md) — how the field these papers come from is organized: arXiv, conferences, peer review and benchmarks, and why a leaderboard is a poor source of truth that you nonetheless have to use. And in [Module 26](../programme.md) reading turns into action: reproducing a paper from the claim to working code.

> A paper is read not top to bottom but from the checkable to the explanatory; any claimed number is checked with three questions — compared to what, how many runs, what is the spread; the weak spot hides in the comparison, not the method. A large number with no evidence is more suspicious than a modest one with it.

---

!!! quote "Principle"
    A paper's persuasiveness and its correctness are different things, so what you can trust is not how the result is claimed but what backs it. The largest gain with nothing behind it is not a finding but a reason to check.
