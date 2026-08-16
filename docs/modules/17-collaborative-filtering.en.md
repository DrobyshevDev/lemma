# Module 17. Collaborative filtering

!!! abstract "After this module you will be able to"
    - Write the recommendation task as filling in a sparse interaction matrix.
    - Explain collaborative filtering: similarity is computed from shared likes, not from a description.
    - Derive matrix factorisation and read the dot product of the factors as a predicted preference.
    - Name the cold-start problem and say what it is usually patched with.
    - Show why recommending the popular looks good offline and is almost useless.

    **Time:** about two weeks. **Prerequisites:** [Module 3](03-linear-algebra.md) (the dot product and matrices).
    **Notebook:** [`notebooks/17-collaborative-filtering.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/17-collaborative-filtering.ipynb)

## Why this

Recommender systems are the most mass-scale application of machine learning: a feed, a shop, a streaming
service decide what to show billions of times a day. And it is applied psychology of attention: the system
optimises not what you wanted to find, but what you will react to. We return to it from that angle in
Module 19; for now — the mechanics.

The whole task fits in one picture: there is an **interaction matrix**. Rows are users, columns are items,
the cells hold likes, ratings, purchases. The matrix is almost empty: everyone has seen a negligible
fraction of the items. To recommend is to **guess the empty cells**: what a user would rate highly if they
got to it.

## Collaborative filtering

The first and most durable approach does not look at the content of an item at all. It does not care what a
film is about or what colour a jumper is. It looks only at **shared likes**.

The idea in one line: **whoever likes the same things you do also likes what you have not yet seen.**
"Collaborative" — because the recommendation is assembled from the behaviour of many, not from the
properties of a single item.

There are two mirror-image variants. **By users:** find people similar to you and offer what they like.
**By items:** for an item you like, find items that the same people like. Similarity in both cases is the
cosine similarity from [Module 3](03-linear-algebra.md): turn a column (or a row) of the matrix into a
vector and measure the angle.

<div class="lm-fig" data-lm-fig="cf-recommender"></div>

Choose a user. A heart marks what they already like; a star, what the system recommends; the background of
the rest is the predicted score. The recommendation comes not from a description of the item, but from the
fact that the same people like it as the ones already liked. The system does not know that "action" is
action; it knows it is liked together with thrillers.

## Matrix factorisation

Neighbours work but scale poorly: a million users means a million comparisons per recommendation. The better
idea is to compress everyone into short vectors.

**Matrix factorisation:** approximate the huge sparse matrix $R$ by a product of two narrow ones:

$$R \approx U V^{\mathsf{T}}$$

<figure class="lm-inline-fig">
<svg viewBox="0 0 460 150" role="img" aria-label="Matrix factorisation: the large sparse interaction matrix is approximated by a product of a narrow user-factor matrix and a narrow item-factor matrix.">
  <g style="font-family:var(--mono);font-size:9px">
    <rect x="20" y="30" width="96" height="90" rx="4" style="fill:none;stroke:var(--ink-line-lit);stroke-width:1"/>
    <g style="fill:var(--accent);fill-opacity:.7">
      <rect x="26" y="36" width="12" height="12"/><rect x="42" y="36" width="12" height="12"/>
      <rect x="74" y="52" width="12" height="12"/><rect x="26" y="68" width="12" height="12"/>
      <rect x="90" y="84" width="12" height="12"/><rect x="58" y="100" width="12" height="12"/>
    </g>
    <text x="68" y="136" text-anchor="middle" style="fill:var(--paper-dim)">R: likes</text>
    <text x="128" y="80" text-anchor="middle" style="fill:var(--paper);font-size:16px">&#8776;</text>
    <rect x="146" y="30" width="34" height="90" rx="4" style="fill:var(--accent);fill-opacity:.55;stroke:var(--accent);stroke-width:1"/>
    <text x="163" y="136" text-anchor="middle" style="fill:var(--accent)">U</text>
    <text x="190" y="80" text-anchor="middle" style="fill:var(--paper);font-size:14px">&#215;</text>
    <rect x="204" y="30" width="96" height="34" rx="4" style="fill:var(--gold);fill-opacity:.5;stroke:var(--gold);stroke-width:1"/>
    <text x="252" y="80" text-anchor="middle" style="fill:var(--gold)">V&#7488;</text>
    <text x="360" y="52" style="fill:var(--paper-dim)">factors</text>
    <text x="360" y="66" style="fill:var(--accent)">U — user taste</text>
    <text x="360" y="80" style="fill:var(--gold)">V — item traits</text>
    <text x="360" y="98" style="fill:var(--paper-dim)">score = U·V (Module 3)</text>
  </g>
</svg>
</figure>

Each row of $U$ is a short user vector, each row of $V$ an item vector, both in one latent space of $k$
numbers. The predicted preference of a user for an item is their **dot product**: the very one from Module 3,
which measures the alignment of directions. Taste and traits align — a high score.

Remarkably, no one sets these $k$ numbers by hand. They are found by the gradient descent from
[Module 4](04-derivatives-and-optimisation.md), minimising the error on the known cells. And after training
the axes of the latent space often turn out meaningful: one stands for "serious versus light", another for
genre. These are exactly the embeddings from [Module 9](09-convolutions.md), only learned from behaviour
rather than from images.

## Cold start

Collaborative filtering has a built-in blind spot. There is nothing to recommend to a new user: they have
liked nothing yet, their vector is empty. A new item is invisible: no one has rated it, its column is empty.
This is **cold start**, and pure CF is helpless on it.

It is patched with the very thing CF fundamentally ignores — **content**. While there is no behaviour, you
recommend by properties: genre, author, price. Once likes accumulate, the floor passes to CF. Hence the
hybrid systems you will build in Module 18.

## What it gets wrong

The first honest limitation is **popularity bias**. A popular item is liked by everyone, so it resembles
everything and pushes into everyone's recommendations. A recommender that simply advises the most popular
will score a decent offline metric — and be useless: it tells the user nothing they would not have seen
anyway.

Hence the baseline from [Module 1](01-claim-baseline-noise.md) that any recommender must beat: **"recommend
the top popular".** This is a trivial baseline, and, as in Module 1, beating it meaningfully is harder than
it seems. A model that does not beat it does not recommend — it retells the ranking.

<div class="lm-thread" markdown>
**The dot product is a through-thread.** In [Module 3](03-linear-algebra.md) it measured the similarity of
vectors, in [Module 10](10-sequences-and-attention.md) the similarity of a query and a key in attention, here
the alignment of a taste and an item's traits. The same move — the angle between vectors — carries
regression, attention and recommendation. And popularity bias leads straight to [Module 19](../programme.md):
what the system shows more often is liked more often, and the loop closes.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/17-collaborative-filtering.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/17-collaborative-filtering.ipynb).
Only `numpy` and `matplotlib`, computes in seconds.

What is inside:

1. The interaction matrix and item-item CF from scratch: cosine similarity by columns, a recommendation for a
   user.
2. Matrix factorisation by gradient descent: we decompose $R$ into $U$ and $V$, restore the empty cells. The
   latent factors catch the taste clusters.
3. Cold start: CF gives garbage for a new user, a fallback to popularity saves it.
4. Popularity bias: the "top popular" baseline against CF on an honest metric. Beating popularity is harder
   than it seems.

### Part 2. Your own matrix

Take any source of shared preferences: your and your friends' film ratings, purchases, repository stars.

1. Assemble the interaction matrix. How sparse is it?
2. Compute item-item recommendations for yourself. Do they make sense?
3. Build the "top popular" baseline. Does your CF beat it?
4. Find an item with a cold start and explain what you would recommend instead of the emptiness.

## Assignment

1. Implement item-item CF on cosine similarity and show recommendations for three users.
2. Decompose the matrix into $U$ and $V$ by gradient descent. Plot the reconstruction error against the
   number of factors $k$.
3. Build the "recommend top popular" baseline and compare with CF by a metric on held-out cells. Does CF beat
   it honestly?
4. Introduce a new user with no likes and show what CF outputs, and then what the fallback to popularity
   gives.
5. Take two latent factors and draw the items as points in that space. Do they form meaningful clusters?

## Self-check

1. What is the interaction matrix and why is it sparse?
2. How does collaborative filtering differ from content-based recommendation?
3. How is the dot product of the user and item vectors read?
4. Who does not set the latent factors by hand and what finds them?
5. What is cold start and what is it patched with?
6. Why is "recommend the popular" a strong baseline and a weak recommender at once?
7. Where else in the course did the same dot product appear?

## Next

In [Module 18](../programme.md) — neural recommenders and ranking: two-tower, sequential models, ranking
metrics. And the central question of applied recommendation: why the offline metric and the online effect
diverge — a model best on historical data loses in production, because it changes the data itself.

> A recommendation is filling in the empty cells of a matrix. Collaborative filtering does it by shared
> likes, matrix factorisation by the dot product of short vectors, and the baseline for it all is the boring
> "recommend the popular".

---

!!! quote "The principle"
    A recommender that does not beat "the top popular" recommends nothing — it retells the ranking. As in
    Module 1, the trivial baseline must be computed first.
