# Module 25. How the field is organised

!!! abstract "After this module you will be able to"
    - Describe a paper's path: idea → arXiv preprint → conference → peer review → proceedings.
    - Say what peer review catches and what it does not, and why it is a filter, not a proof.
    - Explain what a benchmark and a leaderboard are and why they are a poor source of truth.
    - Show how the race for first place overfits the whole community to the public test.
    - Use a leaderboard as a map, not a verdict.

    **Time:** about one week. **Prerequisites:** [module 24](24-how-to-read-a-paper.md), [module 7](07-honest-comparison.md) and [module 16](16-reward-as-specification.md).
    **Notebook:** [`notebooks/25-how-the-field-is-organised.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/25-how-the-field-is-organised.ipynb)

## Why this

In [module 24](24-how-to-read-a-paper.md) you learned to check one paper. But papers do not hang in a vacuum: they have a pipeline that decides what you even see, and benchmarks that decide what counts as progress. To understand this machinery is to understand where, inside it, the truth is lost.

## The path of a paper

<figure class="lm-inline-fig">
<svg viewBox="0 0 470 108" role="img" aria-label="The path of a paper: idea, an arXiv preprint (no review, fast), a conference submission, peer review, the proceedings. A preprint is a claim, not a fact; review is a filter, not a proof.">
  <g style="font-family:var(--mono);font-size:8.5px">
    <rect x="6" y="40" width="56" height="28" rx="6" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.1"/>
    <text x="34" y="57" text-anchor="middle" style="fill:var(--paper-bright)">idea</text>
    <rect x="92" y="40" width="70" height="28" rx="6" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.1"/>
    <text x="127" y="53" text-anchor="middle" style="fill:var(--paper-bright)">preprint</text>
    <text x="127" y="63" text-anchor="middle" style="fill:var(--paper-faint);font-size:7px">arXiv</text>
    <rect x="192" y="40" width="70" height="28" rx="6" style="fill:var(--ink-raised);stroke:var(--ink-line);stroke-width:1.1"/>
    <text x="227" y="57" text-anchor="middle" style="fill:var(--paper-bright)">submit</text>
    <rect x="292" y="40" width="76" height="28" rx="6" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.1"/>
    <text x="330" y="57" text-anchor="middle" style="fill:var(--paper-bright)">review</text>
    <rect x="398" y="40" width="66" height="28" rx="6" style="fill:var(--ink-raised);stroke:#4a9d7f;stroke-width:1.1"/>
    <text x="431" y="57" text-anchor="middle" style="fill:var(--paper-bright)">proceedings</text>
    <path d="M62 54 H90" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#flde)"/>
    <path d="M162 54 H190" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#flde)"/>
    <path d="M262 54 H290" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#flde)"/>
    <path d="M368 54 H396" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#flde)"/>
    <text x="127" y="24" text-anchor="middle" style="fill:var(--paper-faint)">claim, not fact</text>
    <path d="M127 28 V38" style="fill:none;stroke:var(--gold);stroke-dasharray:2 2"/>
    <text x="330" y="88" text-anchor="middle" style="fill:var(--paper-faint)">filter, not proof</text>
    <path d="M330 70 V82" style="fill:none;stroke:var(--gold);stroke-dasharray:2 2"/>
  </g>
  <defs><marker id="flde" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--paper-faint)"/></marker></defs>
</svg>
</figure>

**arXiv** is a preprint server: a paper is posted with no review and instantly. This speeds up exchange, but it means the main thing: **a preprint is a claim, not a verified fact.** Half of the loud results live only on arXiv and go no further.

**Peer review** — two to four people read the paper and decide whether to take it to a conference. It catches obvious holes: a missing baseline, an unwarranted conclusion, a broken setup. But it **almost never reproduces**: a reviewer does not run the code, does not recompute the numbers, does not catch a fitted seed. Review is a filter on the quality of the writing, not a proof of correctness. A paper that passed review still needs the check from [module 24](24-how-to-read-a-paper.md).

## Benchmarks and leaderboards

To compare methods, the field sets up a **benchmark** — a shared test set and a metric. Results are lined up into a **leaderboard** — a ranking. This is convenient, and it is a poor source of truth, for several reasons at once.

<figure class="lm-inline-fig">
<svg viewBox="0 0 440 118" role="img" aria-label="A curve of benchmark scores over time: fast growth at first, then saturation at a ceiling. At the ceiling the number stops telling methods apart — everyone scores almost the same.">
  <g style="font-family:var(--mono);font-size:8.5px">
    <path d="M40 100 H420" style="fill:none;stroke:var(--ink-line)"/>
    <path d="M40 100 V16" style="fill:none;stroke:var(--ink-line)"/>
    <path d="M40 92 C 120 88, 150 40, 230 30 C 300 22, 360 20, 416 19" style="fill:none;stroke:var(--accent);stroke-width:2"/>
    <line x1="40" y1="19" x2="416" y2="19" style="stroke:var(--gold);stroke-dasharray:3 3"/>
    <text x="360" y="15" style="fill:var(--gold);font-size:7.5px">ceiling</text>
    <text x="150" y="70" style="fill:var(--paper-faint)">fast growth</text>
    <text x="300" y="38" style="fill:var(--paper-faint)">saturation</text>
    <text x="230" y="114" text-anchor="middle" style="fill:var(--paper-faint)">time · number of submitted methods</text>
    <text x="20" y="60" text-anchor="middle" transform="rotate(-90 20 60)" style="fill:var(--paper-faint)">score</text>
  </g>
</svg>
</figure>

- **The public test leaks through repeated submissions.** Everyone tunes on the same set, and it gradually stops measuring generalization — this is Goodhart from [module 16](16-reward-as-specification.md): a benchmark that becomes a target stops being a measure.
- **First place is often "the best of many".** The race for SOTA is the selection from [module 24](24-how-to-read-a-paper.md) at the scale of a community: out of a hundred attempts the top goes to the luckiest, not the most reliable.
- **A single number hides per-slice failures.** A leaderboard ranks by the average, and the average hides a regression exactly as in [module 23](23-evaluating-agents.md).
- **Saturation.** When everyone is at the ceiling, the number stops telling methods apart: +0.1% at the top means nothing.

## The order falls apart

The main consequence is in the picture. Take a leaderboard and run the same methods on a **fresh** test that no one has seen.

<div class="lm-fig" data-lm-fig="leaderboard"></div>

On the left is the race for first place on the public benchmark. Press "show the fresh test". On new data the order falls apart: method A, first on the benchmark, drops to fourth, and method C, which was only third, comes out on top. The community overfit the public test — and the leaderboard stopped measuring what it was set up for. You can use it, but as a **map**, not a verdict: it shows where to look, not what is true.

<div class="lm-thread" markdown>
**A leaderboard gathers every trap of the course in one place.** The leak of the public test is the Goodhart of [module 16](16-reward-as-specification.md) and the broken holdout of [module 7](07-honest-comparison.md). The race for SOTA is the "best of N" selection of [module 24](24-how-to-read-a-paper.md). Ranking by the average hides per-slice failures — exactly as the average score hides a regression in [module 23](23-evaluating-agents.md). And the fact that review does not reproduce leads straight to [module 26](../programme.md): a check is not "it passed review" but "I ran it and got the same".
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/25-how-the-field-is-organised.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/25-how-the-field-is-organised.ipynb). Only `numpy` and `matplotlib`.

What is inside:

1. Benchmark leakage: the community submits hundreds of methods to one public test. The leader's score climbs, while the result on a fresh test stays put. The gap is overfitting to the benchmark.
2. The SOTA race: out of many noisy methods, "the best on the public test" is systematically worse on a fresh one — regression to the mean.
3. Saturation: when everyone is at the ceiling, the difference between first and tenth dissolves into noise — the ranking stops discriminating.

### Part 2. Your own field

Take a benchmark from your area (a leaderboard from a site, a table from a survey).

1. How long has it existed and how close are the leaders to the ceiling?
2. Is the test public? How many times a year is it submitted to?
3. Does first place release code? How much bigger than the noise is the gap to second?
4. Is there a fresh version of the benchmark — and do the old leaders fall on it?

## Assignment

1. Model a leaderboard of N methods with a true quality plus noise and a public test on which the best is picked. Plot the leader's score and its own fresh-test result as the number of submissions grows.
2. Show that the gap between the public and the fresh score grows with the number of attempts — that is overfitting to the benchmark.
3. Take a saturated benchmark (everyone at the ceiling) and show that the order of places is almost entirely determined by noise.
4. Compare ranking by the average and by the worst slice, and find a method that leads on the average and fails on a slice.
5. Build an "honest" leaderboard with confidence intervals and show how many top places are statistically indistinguishable.

## Check yourself

1. What is arXiv and why is a preprint not a fact?
2. What does peer review catch, and what does it not?
3. Name four reasons a leaderboard is a poor source of truth.
4. How does the race for first place overfit the community to the public test?
5. Why does +0.1% at the top of a saturated benchmark mean nothing?
6. Which module does benchmark leakage rhyme with, and which one the SOTA race?
7. How do you use a leaderboard after all?

## Next

You understand where the field loses the truth. In [module 26](../programme.md) — what to do about it: reproduction as the only real check. Not "it passed review" and not "it is on top of the leaderboard", but "I took the paper, ran it and got the same result — or did not".

> A preprint is a claim, not a fact; review is a filter on the writing, not a proof of correctness; a leaderboard ranks by a number that the community gradually overfits. You can use a leaderboard, but as a map, not a verdict: it shows where to look, not what is true.

---

!!! quote "Principle"
    The machine that spreads results and the machine that checks them are different machines, and the second is weaker than the first. So a place in a ranking is a reason to look closer, not a conclusion.
