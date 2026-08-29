# Module 27. How to keep up with the field

!!! abstract "After this module you will be able to"
    - Build a reading funnel: from the daily stream to the few things worth reproducing.
    - Choose sources and tell them from noise that is optimized for engagement.
    - Keep a note as a check on a claim, not a summary, and accumulate it over years.
    - Choose depth over breadth — and see why that is focus, not falling behind.
    - Close the course: reading, context, reproduction and keeping up into one steady cycle.

    **Time:** about one week. **Prerequisites:** [Module 24](24-how-to-read-a-paper.md), [Module 26](26-reproduction.md) and [Module 19](19-feedback-loops-and-attention.md).
    **Notebook:** [`notebooks/27-how-to-keep-up.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/27-how-to-keep-up.ipynb)

## Why this

Hundreds of papers come out in the field every day. You cannot read them, and trying to read everything is exactly what drowning is: attention spreads thin, nothing stays, and the stream does not end. Keeping up with the field is **not reading everything** — it is building a filter that surfaces the few, and reading those few deeply.

This is the last module of the course. It adds no new technique — it puts everything before it onto a routine: the reading of [Module 24](24-how-to-read-a-paper.md), the context of [Module 25](25-how-the-field-is-organised.md), the reproduction of [Module 26](26-reproduction.md).

## The reading funnel

The stream is not read — it is filtered. At each stage most of it dies, and that is correct: the funnel narrows from three hundred papers a day to the one worth reproducing.

<div class="lm-fig" data-lm-fig="reading-funnel"></div>

Out of the daily stream, venue and topic leave dozens, the abstract a few, the three questions for a number from [Module 24](24-how-to-read-a-paper.md) a handful, and only one or two a week are worth taking to reproduction. Switch to the loose filter: five times as much gets through, but with the signal comes noise, and attention goes to sorting it out. The narrow neck of the funnel is not a loss but focus. **Not to drown means deliberately dropping almost everything.**

## Sources and noise

Where to get the stream. arXiv feeds on your topics, the proceedings of a few conferences, two or three curators you trust after checking them. What to avoid: social feeds, where papers surface by engagement, not by correctness. This is the feedback loop from [Module 19](19-feedback-loops-and-attention.md): the feed optimizes attention, and what surfaces is the striking, not the true. The loudness of a claim and its correctness are different axes, and the feed ranks by loudness.

## A note is a check, not a summary

A note about a paper is not a summary. A retelling repeats what the author already wrote and is forgotten within a week. A useful note is a **check on the claim**, folded into four lines.

<figure class="lm-inline-fig">
<svg viewBox="0 0 430 132" role="img" aria-label="A note card of four fields: the claim, the baseline, does it survive a change of seed, is it worth reproducing. This is a check on a claim, not a summary of the paper.">
  <g style="font-family:var(--mono);font-size:8.5px">
    <rect x="8" y="8" width="414" height="116" rx="9" style="fill:var(--ink-raised);stroke:var(--ink-line);stroke-width:1.1"/>
    <text x="22" y="30" style="fill:var(--gold)">claim</text>
    <text x="150" y="30" style="fill:var(--paper)">what exactly is claimed, in one sentence</text>
    <line x1="22" y1="40" x2="408" y2="40" style="stroke:var(--ink-line);stroke-dasharray:2 3"/>
    <text x="22" y="58" style="fill:var(--gold)">baseline</text>
    <text x="150" y="58" style="fill:var(--paper)">compared to what, and is it honestly tuned</text>
    <line x1="22" y1="68" x2="408" y2="68" style="stroke:var(--ink-line);stroke-dasharray:2 3"/>
    <text x="22" y="86" style="fill:var(--gold)">survives?</text>
    <text x="150" y="86" style="fill:var(--paper)">seeds, interval — can it be told from noise</text>
    <line x1="22" y1="96" x2="408" y2="96" style="stroke:var(--ink-line);stroke-dasharray:2 3"/>
    <text x="22" y="114" style="fill:var(--gold)">reproduce?</text>
    <text x="150" y="114" style="fill:var(--paper)">worth taking to code — and why</text>
  </g>
</svg>
</figure>

Such a note answers the questions of the course: the claim, the baseline ([Module 7](07-honest-comparison.md)), does it survive a change of seed ([Module 1](01-claim-baseline-noise.md)), is it worth reproducing ([Module 26](26-reproduction.md)). It is short because a check is shorter than a retelling. And it **accumulates**: a hundred such notes are a personal, checked map of the field that no survey will give you.

## Depth over breadth

The temptation is to read a lot, shallowly, to "stay in the loop". But shallow reading does not accumulate: a month later, nothing remains of a hundred skimmed papers, because none was checked or taken to understanding. Deep reading of a few accumulates: every checked and reproduced paper stays with you and makes the next one faster.

Not to fall behind is **not** to read everything. It is to read a few things deeply and stack up notes, while breadth-by-force stands still.

<div class="lm-thread" markdown>
**Keeping up is the same choice the course began with in [Module 1](01-claim-baseline-noise.md): check rather than consume — only now against the pressure of the stream.** The feed ranks papers by loudness: that is the engagement loop of [Module 19](19-feedback-loops-and-attention.md), aimed at you. Your filter ranks them again, by checkability. Not to drown is to hold your own order against the feed's.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/27-how-to-keep-up.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/27-how-to-keep-up.ipynb). Only `numpy` and `matplotlib`.

What is inside:

1. The reading funnel: the daily stream passes through filters, each keeping a fraction. How many papers a year reach deep reading — and why the narrow neck is the norm.
2. Depth versus breadth: two strategies over a one-year horizon. Deep reading of a few accumulates checked knowledge, shallow breadth evaporates.
3. The cost of a loose filter: how much attention the noise let through the top costs, and why a strict filter pays off.

### Part 2. Your own system

Set up keeping up for yourself.

1. Write down three to five sources of the stream. Which of them rank by correctness and which by engagement?
2. Set up a four-field note template and fill it in on one fresh paper.
3. Estimate honestly: how many papers a week can you really take to reproduction? Tune the filter to that number, not to the stream.
4. What are you reading shallowly now that should either be read deeply or not at all?

## Assignment

1. Model the funnel: a stream of `N` a day and pass-through fractions per stage. Plot how many papers a year reach reproduction under a strict and a loose filter.
2. Model knowledge accumulation: deep reading of `k` papers a week with retention against shallow breadth of `m ≫ k` without retention. Plot both curves over a year.
3. Estimate the cost of a loose filter: the extra noise let through, times the sorting time. At what stream size does a strict filter pay off?
4. Build an "attention" curve: a fixed time budget split between breadth and depth. Where is the maximum of retained knowledge?
5. Assemble your own checklist of sources and filters, and justify each stage with one of the course's modules.

## Self-check

1. Why is "reading everything" drowning, not keeping up?
2. What stages does the reading funnel consist of?
3. Which sources rank by correctness and which by engagement, and why does it matter?
4. How does a check-note differ from a summary and why does it accumulate?
5. Why does depth of a few beat breadth of many over a one-year horizon?
6. Which module does "avoiding hype" rhyme with, and which one "a note as a check"?
7. How do you tune the filter to yourself and not to the stream?

## The course is done

Here the course closes. Twenty-seven modules led to one thing: **the field moves through claims, and your edge is the ability to check them.**

<figure class="lm-inline-fig">
<svg viewBox="0 0 440 132" role="img" aria-label="The frontier cycle: read a paper, in the context of the field, reproduce, keep up with the stream — and read again. The four modules of Part VII form a steady loop.">
  <g style="font-family:var(--mono);font-size:8.5px">
    <rect x="150" y="8" width="140" height="26" rx="7" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.2"/>
    <text x="220" y="25" text-anchor="middle" style="fill:var(--paper-bright)">read (m24)</text>
    <rect x="300" y="53" width="132" height="26" rx="7" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.2"/>
    <text x="366" y="70" text-anchor="middle" style="fill:var(--paper-bright)">in context (m25)</text>
    <rect x="150" y="98" width="140" height="26" rx="7" style="fill:var(--ink-raised);stroke:#4a9d7f;stroke-width:1.2"/>
    <text x="220" y="115" text-anchor="middle" style="fill:var(--paper-bright)">reproduce (m26)</text>
    <rect x="8" y="53" width="132" height="26" rx="7" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.2"/>
    <text x="74" y="70" text-anchor="middle" style="fill:var(--paper-bright)">keep up (m27)</text>
    <path d="M290 24 Q360 30 366 51" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#cyce)"/>
    <path d="M366 79 Q360 100 290 108" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#cyce)"/>
    <path d="M150 111 Q80 100 74 81" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#cyce)"/>
    <path d="M74 53 Q80 30 150 22" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#cyce)"/>
  </g>
  <defs><marker id="cyce" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--paper-faint)"/></marker></defs>
</svg>
</figure>

From the arithmetic of the mean and variance in [Module 1](01-claim-baseline-noise.md) to reading the frontier here. What remains is the **capstone**: take a paper published after you began, reproduce its central claim and compare it against an honest baseline. Not retell it — check it. That is the whole course, done once with your own hands.

> Keeping up with the field is not reading everything but filtering the stream and reading a few things deeply. The funnel narrows to one paper a week not out of poverty but out of focus; a note checks a claim rather than retelling it; depth accumulates, breadth evaporates.

---

!!! quote "Principle"
    The stream is infinite and attention is not, so keeping up with the field means choosing what not to read. The field moves through claims; whoever can check them tells progress from noise — and that is the whole course.
