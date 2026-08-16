# Module 18. Neural recommenders and ranking

!!! abstract "After this module you will be able to"
    - Explain the two-tower architecture and why it scales to millions of items.
    - Say how ranking differs from classification and why the metric is computed on the order, not the score.
    - Compute precision@k and NDCG by hand and explain what exactly they reward.
    - Name the reason the offline metric and the online effect diverge.
    - Understand why the only honest test of a recommender is an A/B test, not a metric on logs.

    **Time:** about two weeks. **Prerequisites:** [Module 17](17-collaborative-filtering.md).
    **Notebook:** [`notebooks/18-neural-recommenders-and-ranking.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/18-neural-recommenders-and-ranking.ipynb)

## Why this

The matrix factorisation from Module 17 gives a vector per user and item, but it has two holes: it cannot
do the cold start (there is nothing to build a vector from for a new user) and it does not take features —
age, genre, time of day. Neural recommenders close both, and at the same time sharpen the central question
of applied recommendation: **why a model best on historical data loses in production.**

## Two-tower

The main architecture of industrial recommenders is **two towers**. One network compresses the user's
features into a vector, the other the item's features, and the prediction, as in Module 17, is their dot
product.

<figure class="lm-inline-fig">
<svg viewBox="0 0 440 190" role="img" aria-label="The two-tower architecture: the user tower compresses user features into a vector, the item tower compresses item features, and the score is their dot product.">
  <g style="font-family:var(--mono);font-size:9px">
    <text x="95" y="20" text-anchor="middle" style="fill:var(--paper-dim)">user features</text>
    <text x="345" y="20" text-anchor="middle" style="fill:var(--paper-dim)">item features</text>
    <path d="M55 44 L135 44 L118 96 L72 96 Z" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.4"/>
    <text x="95" y="74" text-anchor="middle" style="fill:var(--accent);font-size:10px">tower U</text>
    <path d="M305 44 L385 44 L368 96 L322 96 Z" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.4"/>
    <text x="345" y="74" text-anchor="middle" style="fill:var(--gold);font-size:10px">tower V</text>
    <rect x="70" y="108" width="50" height="18" rx="3" style="fill:var(--accent);fill-opacity:.5"/>
    <text x="95" y="120" text-anchor="middle" style="fill:var(--paper-bright)">vector u</text>
    <rect x="320" y="108" width="50" height="18" rx="3" style="fill:var(--gold);fill-opacity:.5"/>
    <text x="345" y="120" text-anchor="middle" style="fill:var(--paper-bright)">vector v</text>
    <path d="M120 117 C 190 117, 200 150, 210 150" style="fill:none;stroke:var(--paper-faint);stroke-width:1.2"/>
    <path d="M320 117 C 250 117, 240 150, 230 150" style="fill:none;stroke:var(--paper-faint);stroke-width:1.2"/>
    <circle cx="220" cy="150" r="15" style="fill:var(--ink-raised);stroke:var(--paper-faint);stroke-width:1.2"/>
    <text x="220" y="154" text-anchor="middle" style="fill:var(--paper-bright);font-size:12px">u·v</text>
    <text x="220" y="182" text-anchor="middle" style="fill:var(--paper-dim)">score — the dot product</text>
  </g>
</svg>
</figure>

Why this scales: the item vectors are computed in advance, once, and stored in an index. For a user's request
you only need to compute their vector and find the nearest items by approximate nearest-neighbour search — in
milliseconds among millions. Features in the towers fix the cold start: for a new user a vector is built from
age and device, until there are likes.

**Sequential models** go further: they predict the next item from the history, the way a language model
predicts the next token. This is exactly the transformer from [Module 10](10-sequences-and-attention.md),
only over a sequence of items rather than words.

## Ranking, not classification

A recommender does not answer "yes/no" — it **orders**. The user sees the first few positions, so what
matters is not the score the model gave an item, but **the order** the items ended up in. A classification
metric misses here: accuracy does not distinguish "relevant in first place" from "relevant in tenth".

Ranking metrics look at the order. **Precision@k** — the fraction of relevant items among the first $k$.
**NDCG** — the same but weighted by position: relevant on top is worth more than at the bottom, and the
weight falls logarithmically. The ideal order gives NDCG 1.0.

<div class="lm-fig" data-lm-fig="ranking"></div>

Press "ideal order" and "shuffle". The relevance of each result is shown by dots; the metrics are computed
live. The main thing is visible: the same set of results gives NDCG 1.0 in the ideal order and noticeably
less in a shuffled one — the score did not change, only the order did. This is exactly what a recommender is
optimised on.

## Offline versus online

Now the thing the course is written for — and in recommendation it hurts especially.

A model is trained and checked on logs: what was shown, what was clicked. It seems logical to take the model
with the best offline metric and ship it. It loses. The reason is not the metric itself, but **where the logs
came from**.

<figure class="lm-inline-fig">
<svg viewBox="0 0 440 130" role="img" aria-label="The offline metric is computed on logs biased by the old recommender; the online effect is measured on real users; there is a gap between them.">
  <g style="font-family:var(--mono);font-size:9px">
    <rect x="14" y="34" width="150" height="44" rx="9" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.3"/>
    <text x="89" y="52" text-anchor="middle" style="fill:var(--paper-bright);font-size:11px">offline: logs</text>
    <text x="89" y="68" text-anchor="middle" style="fill:var(--gold)">what the old one showed</text>
    <rect x="276" y="34" width="150" height="44" rx="9" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.3"/>
    <text x="351" y="52" text-anchor="middle" style="fill:var(--paper-bright);font-size:11px">online: A/B test</text>
    <text x="351" y="68" text-anchor="middle" style="fill:var(--accent)">real users</text>
    <text x="220" y="52" text-anchor="middle" style="fill:#d0705f;font-size:18px">&#8800;</text>
    <text x="220" y="100" text-anchor="middle" style="fill:var(--paper-faint)">the logs only saw what the old recommender showed</text>
  </g>
</svg>
</figure>

The logs are not a random sample of the world. They were collected by the **old recommender**: a user clicked
only on what they were **shown**, and the old system showed what it considered good. An item that would have
been excellent, but which the old system did not show, looks unpopular in the logs — not because it is bad,
but because it is invisible. A model trained on such logs inherits its predecessor's blind spots and
confidently reproduces them. This is selection bias, and the offline metric does not see it: it is computed on
the same biased logs.

The only honest test is to show the model to **real users** in an A/B test and measure what changed. How to do
that without deceiving yourself — Module 20.

<div class="lm-thread" markdown>
**Proxy, loop and causality — three modules about one thing.** A click is a proxy for usefulness, and
optimising it to the limit is dangerous exactly as in [Module 16](16-reward-as-specification.md). The bias of
the logs is the start of the feedback loop from [Module 19](../programme.md): a system learns on the data it
itself produced. And telling "the model is better" from "the model got lucky with the sample" is something only
the causal experiment from [Module 20](../programme.md) can do.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/18-neural-recommenders-and-ranking.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/18-neural-recommenders-and-ranking.ipynb).
Only `numpy` and `matplotlib`, computes in seconds.

What is inside:

1. Ranking metrics from scratch: precision@k, recall@k, NDCG, MRR. We show they reward the order, not the
   score.
2. A two-tower on features: the user and item towers, nearest-neighbour search. Features pull out a new user
   where pure factorisation is silent.
3. Offline versus online: logs biased by the old recommender. The model best on the logs does not surface good
   but invisible items. The gap is measured, not told.

### Part 2. Your own log

Take any log of impressions and clicks: your newsletter, a feed, a search result page.

1. What was shown in this log and what was not? Which items could not have got a click at all?
2. If you trained a model on this log, what blind spots would it inherit?
3. What would an honest test on real users look like?
4. Which metric would you watch — and why a click can deceive even it.

## Assignment

1. Implement NDCG@k and precision@k. Plot how NDCG falls as the ideal order is shuffled.
2. Assemble a two-tower from two small networks and show a nearest-item search for a user.
3. Give a new user only features (no history) and show that the two-tower recommends, while the matrix
   factorisation from Module 17 does not.
4. Simulate a biased log: the old recommender showed mostly the popular. Train a model on the log and measure
   how many good invisible items it misses.
5. Compare the offline metric on the log with the "online" metric on the full truth. How much more optimistic
   is offline?

## Self-check

1. What does a two-tower consist of and why can the item vectors be computed in advance?
2. How does ranking differ from classification?
3. What does NDCG reward beyond precision@k?
4. Why can a model with the best offline metric lose in production?
5. What is selection bias in logs and where does it come from?
6. Why is a click a proxy, and which module does that rhyme with?
7. Which test of a recommender is the only honest one and why?

## Next

In [Module 19](../programme.md) the bias of the logs closes into a loop: a recommender learns on the data it
itself produced and begins to optimise engagement — a proxy for attention. The reward hacking from Module 16
reaches billions of people, and acquires a psychological cost.

> A recommender orders rather than classifies, so the metric too is on the order. And the best offline metric
> guarantees nothing: the logs were collected by the previous recommender, and only an A/B test measures
> honestly.

---

!!! quote "The principle"
    The offline metric is computed on data collected by the old recommender, and is therefore optimistic and
    blind in exactly the places it was blind. You can only trust what changed for real users.
