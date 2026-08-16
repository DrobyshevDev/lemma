# Module 20. A/B tests and causality

!!! abstract "After this module you will be able to"
    - Explain why correlation does not prove causation, and name the role of a confounder.
    - Say what exactly randomisation fixes and why an A/B test is a causal experiment.
    - Show on a simulation how peeking at interim results produces false significance.
    - Explain why checking twenty metrics gives a "significant" one by construction.
    - Assemble an honest A/B test and list the traps that spoil it — the same as in Module 1.

    **Time:** about two weeks. **Prerequisites:** [Module 1](01-claim-baseline-noise.md) and [Module 19](19-feedback-loops-and-attention.md).
    **Notebook:** [`notebooks/20-ab-tests-and-causality.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/20-ab-tests-and-causality.ipynb)

## Why this

Modules 18 and 19 ran up against one question: how to know that the new version of the recommender is
**better**, and not just spinning the loop on convenient data. The answer is a causal experiment, and it also
closes the recommendation part. But the methods here are not about recommendation specifically: this is how to
tell "X improved Y" from "X and Y simply travel together" at all.

## Correlation is not causation

"People who have the new feed on spend more time in the app" — and one wants to say the new feed retains
better. Careful. The new feed may have been rolled out first to the active users; then the cause is not the
feed, but who received it.

<figure class="lm-inline-fig">
<svg viewBox="0 0 440 130" role="img" aria-label="A confounder: a hidden variable Z influences both the treatment X and the outcome Y, creating a correlation between X and Y without a causal link from X to Y.">
  <g style="font-family:var(--mono);font-size:10px">
    <circle cx="70" cy="95" r="20" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.4"/>
    <text x="70" y="99" text-anchor="middle" style="fill:var(--paper-bright)">X</text>
    <circle cx="360" cy="95" r="20" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.4"/>
    <text x="360" y="99" text-anchor="middle" style="fill:var(--paper-bright)">Y</text>
    <circle cx="215" cy="30" r="20" style="fill:var(--ink-raised);stroke:#d0705f;stroke-width:1.4"/>
    <text x="215" y="34" text-anchor="middle" style="fill:var(--paper-bright)">Z</text>
    <path d="M198 43 L86 82" style="fill:none;stroke:#d0705f;stroke-width:1.4" marker-end="url(#cfar)"/>
    <path d="M232 43 L344 82" style="fill:none;stroke:#d0705f;stroke-width:1.4" marker-end="url(#cfar)"/>
    <path d="M92 95 H338" style="fill:none;stroke:var(--paper-faint);stroke-width:1.2;stroke-dasharray:4 3"/>
    <text x="215" y="88" text-anchor="middle" style="fill:var(--paper-faint);font-size:9px">observed correlation</text>
    <text x="140" y="52" text-anchor="middle" style="fill:#d0705f;font-size:9px">who got it</text>
    <text x="290" y="52" text-anchor="middle" style="fill:#d0705f;font-size:9px">activity</text>
  </g>
</svg>
</figure>

The hidden variable $Z$ — "the user is active" — influences both the treatment $X$ (who the feed was rolled out
to) and the outcome $Y$ (time in the app). It is what creates the correlation, and there may be no causal arrow
from $X$ to $Y$ at all. $Z$ is called a confounder, and while it is there, causation cannot be pulled out of an
observation.

## Randomisation fixes this

The only reliable way to remove a confounder is not to measure it more cleverly, but to **break the arrow from
it to the treatment**. Assign who gets the new feed **at random** — by a coin flip, without looking at activity
or anything else.

<figure class="lm-inline-fig">
<svg viewBox="0 0 440 130" role="img" aria-label="Randomisation: random assignment of the treatment breaks the confounder's link to the treatment, and the difference in outcome becomes causal.">
  <g style="font-family:var(--mono);font-size:10px">
    <circle cx="70" cy="95" r="20" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.4"/>
    <text x="70" y="99" text-anchor="middle" style="fill:var(--paper-bright)">X</text>
    <circle cx="360" cy="95" r="20" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.4"/>
    <text x="360" y="99" text-anchor="middle" style="fill:var(--paper-bright)">Y</text>
    <circle cx="215" cy="30" r="20" style="fill:var(--ink-raised);stroke:var(--ink-line-lit);stroke-width:1.4"/>
    <text x="215" y="34" text-anchor="middle" style="fill:var(--paper-faint)">Z</text>
    <path d="M198 43 L120 74" style="fill:none;stroke:var(--ink-line-lit);stroke-width:1.2;stroke-dasharray:2 3"/>
    <line x1="150" y1="52" x2="168" y2="70" style="stroke:#d0705f;stroke-width:2"/>
    <line x1="168" y1="52" x2="150" y2="70" style="stroke:#d0705f;stroke-width:2"/>
    <rect x="24" y="34" width="52" height="20" rx="4" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1"/>
    <text x="50" y="48" text-anchor="middle" style="fill:var(--accent);font-size:8px">coin</text>
    <path d="M50 54 L66 78" style="fill:none;stroke:var(--accent);stroke-width:1.4" marker-end="url(#cfar)"/>
    <path d="M92 95 H338" style="fill:none;stroke:var(--gold);stroke-width:1.6" marker-end="url(#cfar)"/>
    <text x="215" y="88" text-anchor="middle" style="fill:var(--gold);font-size:9px">now the difference is causal</text>
  </g>
  <defs><marker id="cfar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--paper-faint)"/></marker></defs>
</svg>
</figure>

After random assignment, groups A and B are the same in everything but the treatment: the active, the newcomers,
the night owls are split evenly between both. So any difference in the outcome can be attributed only to the
treatment. This is the A/B test — a causal experiment, not an observation. Exactly for this reason it, and not a
metric on logs, was named the honest test in Modules 18 and 19.

## Peeking

But randomisation is only half of honesty. The other half is how you **look** at the result. And here the traps
from [Module 1](01-claim-baseline-noise.md) return.

The temptation: to watch the test live and stop as soon as the difference becomes "significant". This is
peeking, and it breaks the statistics. Even when there is no effect at all, the difference between the groups
wanders, and sooner or later it randomly jumps over the significance threshold. Stop at that moment — and you
declare a win that is not there.

<div class="lm-fig" data-lm-fig="ab-peek"></div>

Here A and B are from **one** distribution — there is no true effect at all. The blue line is the observed
difference, the band is the 95-percent interval. Press "new run": in some runs the interval randomly excludes
zero along the way (the red dots). Whoever stopped at the first red dot would have declared a significant effect
— on pure noise. This is "stopping on the result" from Module 1, point five.

The defence is the same: **the number of observations and the moment of the check are fixed in advance.** If you
want to look as you go, there are sequential-analysis methods that raise the threshold for peeking. But you may
not decide from the data when to stop and then pretend you did not.

## Multiple comparisons

The second way to invent significance is to check many things. The new feed did not move one metric — let us
look at twenty: clicks, time, returns, scroll depth… With twenty checks at level 0.05, one false significance is
**expected by construction**, even if nothing changed.

This is the sixth way to be wrong from Module 1. The defence is a correction for multiplicity (Bonferroni and
gentler) or an honest "we checked twenty metrics, here are all of them". A single main metric chosen in advance
is worth twenty chosen after the fact.

<div class="lm-thread" markdown>
**Module 1 returned in full.** Peeking is "stopping on the result", twenty metrics are "multiple comparisons",
and the spread between users is the same noise as between seeds. The A/B test adds just one new word to Module
1's arsenal — randomisation — and the rest is exactly the same: [bootstrap intervals](01-claim-baseline-noise.md),
the overlap rule and honesty about how much you checked in total.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/20-ab-tests-and-causality.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/20-ab-tests-and-causality.ipynb).
Only `numpy` and `matplotlib`, computes in seconds.

What is inside:

1. Correlation versus cause: a confounder gives birth to a link that is not there. The observational estimate is
   biased, the randomised one is not.
2. Peeking: A equals B, but stopping at the first significance gives false positives many times more than five
   percent. We count, not guess.
3. Multiple comparisons: twenty honest metrics, one "significant" by construction. The Bonferroni correction puts
   the level back in place.

### Part 2. Your own experiment

Take any change you would like to test: in a product, a newsletter, your own habit.

1. What here is the treatment $X$, what the outcome $Y$, and what confounder $Z$ could link them without a cause?
2. What would random assignment look like? What prevents doing it?
3. Which **one** metric will you name the main one in advance?
4. How many observations will you collect before you look at the result?

## Assignment

1. Generate data with a confounder and show that the observational estimate of the effect is biased, while the
   randomised one is not.
2. Simulate peeking: A equals B, a check after every hundred observations, stopping at the first significance.
   Measure the fraction of false wins against a fixed $n$.
3. Test twenty independent metrics on data with no effect and count how often at least one is "significant".
   Compare with Bonferroni.
4. Build an A/B test honestly: a fixed $n$, a metric chosen in advance, a bootstrap interval from Module 1. State
   the conclusion by the overlap rule.
5. Come up with a novelty effect: the treatment gives a spike that fades. Show how a short test overestimates it.

## Self-check

1. What is a confounder and why, because of it, does correlation not prove causation?
2. What exactly does randomisation fix and why, after it, is the difference causal?
3. Why does peeking give rise to false significance even without an effect?
4. Why do twenty metrics give a "significant" one by construction?
5. Which three traps from Module 1 repeat in an A/B test?
6. What protects against peeking and against multiple comparisons?
7. Why does a metric on logs not replace an A/B test?

## Next

Part V is finished: from collaborative filtering to the causal experiment that alone tells an improvement from a
spun-up loop. In [Part VI](../programme.md) — agents: a loop with tools and memory, retrieval with citation
checking, and evaluation, where eval is a test from Module 7 and regression is the difference between runs you
already know how to tell from noise.

> An A/B test is a causal experiment: randomisation breaks the confounder, and the difference in outcome becomes
> a consequence of the treatment. But peeking and twenty metrics break it just as they broke any measurement in
> Module 1.

---

!!! quote "The principle"
    Randomisation gives you the right to say "cause", but does not cancel honesty about how you looked. The number
    of observations and the main metric are set before the experiment, not chosen from its result.
