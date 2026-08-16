# Module 19. Feedback loops and attention

!!! abstract "After this module you will be able to"
    - Explain the feedback loop: a system learns on the data it itself produced.
    - Show how engagement optimisation builds a filter bubble, and what breaks it open.
    - Say why engagement is a proxy, and connect it to Goodhart's law from Module 16.
    - Distinguish the two senses of "attention": a mechanism inside a network and a scarce human resource.
    - Name the psychological cost of optimising engagement and who pays it.

    **Time:** about two weeks. **Prerequisites:** [Module 18](18-neural-recommenders-and-ranking.md) and [Module 16](16-reward-as-specification.md).
    **Notebook:** [`notebooks/19-feedback-loops-and-attention.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/19-feedback-loops-and-attention.ipynb)

## Why this

In Module 18 the bias of the logs was a measurement problem. Here it closes into a **loop** and becomes a
problem of the world. The recommender shows what it considers good; the user interacts only with what was
shown; on those interactions the recommender learns again — and shows even more of the same. The system
learns on the data it itself produced, and with each turn confirms its own decisions ever more strongly.

<figure class="lm-inline-fig">
<svg viewBox="0 0 440 150" role="img" aria-label="The feedback loop: the recommender shows a feed, the user interacts, and the interaction data trains the recommender again.">
  <rect x="30" y="52" width="140" height="48" rx="10" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.5"/>
  <text x="100" y="80" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--serif);font-size:14px;font-weight:600">Recommender</text>
  <rect x="270" y="52" width="140" height="48" rx="10" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.5"/>
  <text x="340" y="80" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--serif);font-size:14px;font-weight:600">User</text>
  <path d="M170 66 H268" style="fill:none;stroke:var(--paper-faint);stroke-width:1.4" marker-end="url(#flar)"/>
  <text x="219" y="58" text-anchor="middle" style="fill:var(--accent);font-family:var(--mono);font-size:9px">shows</text>
  <path d="M270 88 C 210 120, 160 120, 100 102" style="fill:none;stroke:var(--paper-faint);stroke-width:1.4" marker-end="url(#flar)"/>
  <text x="185" y="134" text-anchor="middle" style="fill:var(--gold);font-family:var(--mono);font-size:9px">clicks retrain it</text>
  <defs><marker id="flar" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--paper-faint)"/></marker></defs>
</svg>
</figure>

## The filter bubble

The loop has an inevitable consequence. What is shown more is interacted with more; what is interacted with
more is shown even more. The slightest skew amplifies itself, and the feed, having started diverse, slides
towards a narrow set of the most gripping topics. This is the **filter bubble**, and it is not anyone's evil
design but a direct property of the loop.

<div class="lm-fig" data-lm-fig="feedback-loop"></div>

Press "next round". The feed starts even, but topics #1 and #2 grip a little more, so they are shown a little
more, so they are interacted with a little more often — and after a few rounds they take up almost all the
space, and diversity collapses. Turn on "exploration": the system mixes in the random, and the bubble does not
collapse. The loop is broken open by the same thing with which SGD did not get stuck in the first minimum in
Module 4 — a pinch of randomness.

## Engagement is a proxy

Why does the system amplify the gripping rather than the useful at all? Because it optimises what it can
measure: **engagement** — clicks, time, completions. Engagement is easy to count, and "usefulness" or "user
wellbeing" is not. And here [Module 16](16-reward-as-specification.md) returns: engagement is a proxy, and
optimising it to the limit is dangerous.

An optimiser given engagement finds the same cracks in a human that an agent finds in a reward. Autoplay, the
infinite feed, sensation and outrage hold attention better than what a person would choose for themselves with
a clear head. The system does not "want harm" — it found the maximum of the specified metric, and the maximum
turned out not to be where the usefulness is. This is the reward hacking from Module 16, only the victim is not
a simulated robot but billions of people.

## Two senses of attention

Here the course brings together two "attentions" it spoke of separately.

In [Module 10](10-sequences-and-attention.md) attention is a **mechanism** inside a network: a distribution of
a limited mass of weights over words. Here attention is a human **resource**: limited, scarce, and the feed
competes for it. The coincidence is not accidental: in both, "attention" is a distribution of a limited mass
over many objects, and the question is one — who reallocates it and towards what. The difference is whom it
belongs to and who profits from it.

Hence the psychological cost. Attention is finite; an hour spent in a feed optimised for retention does not
come back. A system trained to maximise engagement works, by construction, **against** the user's intention to
close the app. This is not a side effect but literally its objective function.

<div class="lm-thread" markdown>
**Optimising the wrong thing — for the third time.** In [Module 16](16-reward-as-specification.md) an agent
hacked a reward in the laboratory. Here the feed hacks engagement on people. In [Module 25](../programme.md)
researchers will hack the leaderboard. One Goodhart's law, three scales: the simulator, society, science. And
the bias of the logs from [Module 18](18-neural-recommenders-and-ranking.md) is the first turn of the loop that
here has spun up into a bubble.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/19-feedback-loops-and-attention.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/19-feedback-loops-and-attention.ipynb).
Only `numpy` and `matplotlib`, computes in seconds.

What is inside:

1. The filter bubble: the loop amplifies the gripping, diversity (entropy) collapses over rounds. Exploration
   holds it open.
2. The rich get richer: a small random advantage of an item compounds into dominance. Concentration rises — the
   Matthew effect.
3. Engagement versus usefulness: the loop maximises engagement (the proxy), while the coverage of the user's
   real interests peaks and falls — Goodhart inside the loop.

### Part 2. Your own feed

Take any feed you use.

1. What does it optimise — and how did you tell from what it shows?
2. Is the bubble noticeable: has your stream narrowed over the months?
3. Where in the feed is it visible that engagement is a proxy, not usefulness?
4. What would break the loop open without breaking recommendation entirely?

## Assignment

1. Simulate the loop: shown → engagement → recompute what is shown. Plot the feed's entropy over rounds with
   and without exploration. Find the ε at which the bubble stops collapsing.
2. Simulate the Matthew effect: items start nearly equal, engagement amplifies the leaders. Plot the Gini
   coefficient over rounds.
3. Separate engagement and the user's real interest as two quantities. Show that the loop grows the first and
   drops the second.
4. Add diversity to the objective and show what engagement pays to break the bubble open.
5. Describe one real consequence of the loop in the Module 1 format: what was optimised, what was meant, where
   the crack is.

## Self-check

1. What is a feedback loop and why does it confirm its own decisions?
2. How does a filter bubble form from the loop and what breaks it open?
3. Why is engagement a proxy, and which module does that rhyme with?
4. Name the two senses of "attention" in the course and what they have in common.
5. What is the psychological cost of optimising engagement and who pays it?
6. What is the Matthew effect in recommendation?
7. Why does a system maximising engagement work against the user's intention?

## Next

In [Module 20](../programme.md) — how to find out at all that a recommender improved something rather than just
spinning up the loop: A/B tests and causality. Correlation versus cause, randomisation, peeking at interim
results and multiple comparisons — the same arsenal as Module 1, but now about an experiment on live users.

> A feedback loop teaches a system on the data it itself created, and turns engagement — a proxy for attention —
> into a bubble. A person's attention is finite, and a feed optimised for retention works against them by
> construction.

---

!!! quote "The principle"
    A system given engagement as a reward will find the same cracks in a human that an agent finds in a
    simulation. The difference is that the cost of the error here is measured not in points, but in hours of
    someone else's life.
