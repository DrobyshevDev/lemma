# Module 26. Reproduction

!!! abstract "After this module you will be able to"
    - Tell three levels apart: rerunning the code, reimplementing from the paper, replicating on new data.
    - See the "reproducibility gap" — what the method needs and the paper left out.
    - Ask the authors a precise question that can be answered with one line of config.
    - Define success correctly: hitting the claim, not the exact number.
    - Bring it all into one action — checking someone else's result yourself.

    **Time:** about two weeks. **Prerequisites:** [Module 24](24-how-to-read-a-paper.md), [Module 25](25-how-the-field-is-organised.md), [Module 7](07-honest-comparison.md) and [Module 1](01-claim-baseline-noise.md).
    **Notebook:** [`notebooks/26-reproduction.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/26-reproduction.ipynb)

## Why this

[Module 24](24-how-to-read-a-paper.md) taught you to check a paper on paper, [Module 25](25-how-the-field-is-organised.md) showed that neither review nor a leaderboard guarantees correctness. What remains is the only real check — **to reproduce the result yourself**. Not "it passed review", not "it is on top of the leaderboard", but "I took the paper, ran it and got the same — or did not".

This is the course's capstone skill. Everything before it — baseline, noise, honest comparison, reading — comes together here into one action.

## Three levels

<figure class="lm-inline-fig">
<svg viewBox="0 0 460 128" role="img" aria-label="Three levels of reproduction by increasing strength: rerunning the authors' code (repeatability), reimplementing from the paper (reproducibility), replicating on new data or conditions (replicability). Each next one checks more.">
  <g style="font-family:var(--mono);font-size:8.5px">
    <rect x="8" y="86" width="200" height="30" rx="7" style="fill:var(--ink-raised);stroke:var(--ink-line);stroke-width:1.1"/>
    <text x="20" y="99" style="fill:var(--paper-bright)">1 · rerun the authors' code</text>
    <text x="20" y="110" style="fill:var(--paper-faint);font-size:7.5px">repeatability — weakest</text>
    <rect x="8" y="48" width="230" height="30" rx="7" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.2"/>
    <text x="20" y="61" style="fill:var(--paper-bright)">2 · reimplement from the paper</text>
    <text x="20" y="72" style="fill:var(--paper-faint);font-size:7.5px">reproducibility — the real check</text>
    <rect x="8" y="10" width="260" height="30" rx="7" style="fill:var(--ink-raised);stroke:#4a9d7f;stroke-width:1.2"/>
    <text x="20" y="23" style="fill:var(--paper-bright)">3 · replicate on new data</text>
    <text x="20" y="34" style="fill:var(--paper-faint);font-size:7.5px">replicability — strongest</text>
    <path d="M300 116 V10" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#rgue)"/>
    <text x="312" y="112" style="fill:var(--paper-faint)">checks</text>
    <text x="312" y="122" style="fill:var(--paper-faint)">less</text>
    <text x="312" y="20" style="fill:var(--paper)">checks</text>
    <text x="312" y="30" style="fill:var(--paper)">more</text>
  </g>
  <defs><marker id="rgue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--paper-faint)"/></marker></defs>
</svg>
</figure>

**Rerunning the authors' code** is the weakest level, and it fails more often than you would think: the wrong package, a lost data file, an unreachable checkpoint. **Reimplementing from the paper** is the real check: it is here that you find out the method rests not on the idea in the abstract but on a dozen unstated details. **Replicating on new data or conditions** is the strongest: it checks not the number but that the effect exists at all beyond one table.

## The reproducibility gap

Between the "method" in the paper and working code lies a gap: what the method needs and the paper did not write down. The hyperparameters are "tuned on validation" — but which ones is not said. The data is "preprocessed in the standard way" — but how is not said. The evaluation is "by the protocol" — but by which one exactly is not said. Every omission is a step down from the claimed number.

<div class="lm-fig" data-lm-fig="repro-gap"></div>

A bare reimplementation from the paper's text gives 79.0 — far from the claimed 89.0. Add the missing details: preprocessing, hyperparameters, the exact protocol, averaging over seeds. The copy climbs, and at some point enters the green band — **the noise around the claimed number**. That is where success happens.

## What counts as success

Success in reproduction is **not** a match to the last digit. Your 88.5 against a claimed 89.0 is a success: the difference is smaller than the noise from [Module 1](01-claim-baseline-noise.md), the effect is of the same sign and size, the claim held up. But 84.0 is a failure: the gain did not reproduce, and it does not matter how beautifully it was claimed.

Success in reproduction is hitting the **claim**, not the number. So what you reproduce is not "accuracy 89.0" but the central claim: "the method gives a clear gain over an honest baseline that survives a change of seed". If that held up within the noise band, the result reproduced.

**How to ask the authors.** When a detail cannot be found, you ask — briefly and specifically. Not "it doesn't work, help", but "section 4.2 gives the lr but not the schedule; did you use cosine or step?". A question that can be answered with one line of config is answered willingly. This is the same tone as the [organization's contributing guidelines](https://github.com/DrobyshevDev/.github/blob/master/CONTRIBUTING.md): a minimal reproducible question respects the time of whoever answers.

<div class="lm-thread" markdown>
**Reproduction is the citation check of [Module 22](22-retrieval-and-verifiability.md), unfolded onto a whole paper.** There you did not trust a claim until it pointed to a line in a source; here you do not trust a result until its number points to code you ran yourself. And "hit the claim, not the exact figure" is the same thing: what is confirmed is the claim within the noise of [Module 1](01-claim-baseline-noise.md), not the last digit.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/26-reproduction.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/26-reproduction.ipynb). Only `numpy` and `matplotlib`.

What is inside:

1. The reproducibility gap: a bare reimplementation against the claimed number. We add the missing details one by one and watch the copy enter the noise band.
2. The success criterion: two copies — one in the band, one not. We show why "in the band" is success, while "exactly as in the paper" is an unreachable and unnecessary goal.
3. When it does not reproduce: a claim that simply is not there against an honest baseline. No detail closes the gap, because there is nothing to close.

### Part 2. Your own reproduction

Take a small result from a paper, with or without open code.

1. State the central claim in one sentence: what exactly needs reproducing.
2. What in the paper is unstated to the point that you have to guess? Make a list of the omissions.
3. Implement the minimal core, compare against an honest baseline on your own seeds. Did you land in the band?
4. If not — which detail is missing and how would you ask the authors in one line?
5. What would the honest conclusion be: reproduced, partially reproduced, or not reproduced?

## Assignment

1. Model the reproducibility gap: a base quality plus the contributions of several "details". Plot how the copy approaches the claimed number as they are added.
2. Set a success band (± the noise from [Module 1](01-claim-baseline-noise.md)) and show two copies — one that lands and one that does not. Justify the verdict for each.
3. Model a non-reproducible claim (no true effect) and show that adding details does not close the gap.
4. Compare "success as the exact number" with "success as the band" and show why the first criterion rejects even correct reproductions.
5. Write a template for a minimal reproducible question to the authors about a specific missing detail.

## Self-check

1. Why is reproduction the only real check?
2. Name the three levels of reproduction and what each checks.
3. What is the reproducibility gap and what is it made of?
4. What counts as success in reproduction and what does not?
5. Why do you reproduce the claim and not the exact number?
6. How do you ask the authors a question that is easy to answer?
7. Which module does "success is hitting the claim" rhyme with?

## Next

You can check one paper to the end — by reproduction. In [Module 27](../programme.md) — how to do this not once but continually: reading as a practice, sources, filters, notes, how not to drown in the stream and not fall behind. And then the capstone: take a paper published after you began and reproduce its central claim.

> Reproduction is the only check that does not take things on faith: not "it passed review" and not "it is on top of the leaderboard", but "I ran it and got the same". Success is hitting the claim within the noise, not a match to the last digit.

---

!!! quote "Principle"
    Between the method in the paper and working code there is always a gap of omissions, and closing it is the check. A result that does not survive reimplementation from the paper has not reproduced, however confidently it was claimed.
