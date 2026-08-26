# Module 23. Evaluating agents

!!! abstract "After this module you will be able to"
    - Explain eval as an automatic test of an agent: a task, a reference, a score.
    - Assemble a golden set and say why the reference must not leak into tuning.
    - Tell a regression from general progress and explain why the average score hides it.
    - Name the ways to score an answer and the pitfall of each, including a model-as-judge.
    - Close Part VI: the agent, retrieval with citation checking, and evaluation into one development loop.

    **Time:** about one week. **Prerequisites:** [module 21](21-the-agent-loop.md), [module 22](22-retrieval-and-verifiability.md) and [module 1](01-claim-baseline-noise.md).
    **Notebook:** [`notebooks/23-evaluating-agents.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/23-evaluating-agents.ipynb)

## Why this

You have built an agent ([module 21](21-the-agent-loop.md)) and taught it to answer from documents with citation checking ([module 22](22-retrieval-and-verifiability.md)). One question remains, and without it this is not engineering but hope: **how do you know it works — and that it did not break after an edit?**

"I tried a couple of queries, it seems to answer" survives neither a version change nor a second developer. You need an **eval** — an automatic test of the agent: a task with a known good answer, a run, a score. Exactly what module 1 did with a number from a paper, only now the claim under test is "the agent solves this task".

<figure class="lm-inline-fig">
<svg viewBox="0 0 470 96" role="img" aria-label="Eval as a test: a task goes to the agent, the agent returns an answer, the answer is checked against a reference, and out comes a score — pass or fail.">
  <g style="font-family:var(--mono);font-size:9px">
    <rect x="8" y="34" width="60" height="30" rx="7" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.2"/>
    <text x="38" y="52" text-anchor="middle" style="fill:var(--paper-bright)">task</text>
    <rect x="102" y="34" width="60" height="30" rx="7" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.2"/>
    <text x="132" y="52" text-anchor="middle" style="fill:var(--paper-bright)">agent</text>
    <rect x="196" y="34" width="60" height="30" rx="7" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.2"/>
    <text x="226" y="52" text-anchor="middle" style="fill:var(--paper-bright)">answer</text>
    <rect x="290" y="34" width="66" height="30" rx="7" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.2"/>
    <text x="323" y="52" text-anchor="middle" style="fill:var(--paper-bright)">check</text>
    <rect x="384" y="20" width="78" height="26" rx="7" style="fill:var(--ink-raised);stroke:#4a9d7f;stroke-width:1.2"/>
    <text x="423" y="37" text-anchor="middle" style="fill:#8fd3b6">pass</text>
    <rect x="384" y="52" width="78" height="26" rx="7" style="fill:var(--ink-raised);stroke:#d0705f;stroke-width:1.2"/>
    <text x="423" y="69" text-anchor="middle" style="fill:#e39a89">fail</text>
    <rect x="290" y="4" width="66" height="20" rx="6" style="fill:none;stroke:var(--gold);stroke-dasharray:3 2"/>
    <text x="323" y="17" text-anchor="middle" style="fill:var(--gold);font-size:8px">reference</text>
    <path d="M68 49 H100" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#evare)"/>
    <path d="M162 49 H194" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#evare)"/>
    <path d="M256 49 H288" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#evare)"/>
    <path d="M323 24 V32" style="fill:none;stroke:var(--gold)" marker-end="url(#evareg)"/>
    <path d="M356 45 H382" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#evare)"/>
    <path d="M356 53 H382" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#evare)"/>
  </g>
  <defs>
    <marker id="evare" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--paper-faint)"/></marker>
    <marker id="evareg" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--gold)"/></marker>
  </defs>
</svg>
</figure>

## The golden set

One test guarantees nothing: the agent might answer it by luck and fail everything else. You need a **golden set** — a set of tasks with reference answers, curated by hand and frozen. It plays the role of the baseline from [module 1](01-claim-baseline-noise.md) and the holdout from [module 7](07-honest-comparison.md): it is the anchor you compare against.

And it carries the same iron rule as the holdout: **the reference must not leak into tuning**. The moment you start twisting the agent until the golden set turns green, you are optimizing for the test, not the task — and the number rises while quality does not. This is Goodhart from [module 16](16-reward-as-specification.md): a measure that becomes a target stops being a measure.

An answer can be scored in several ways, and each has its price:

- **Exact match** — cheap and strict, but fails a correct answer over one extra space.
- **Key match** (a number, a fact) — more forgiving; the citation check from [module 22](22-retrieval-and-verifiability.md) is exactly this case.
- **A model-as-judge** — scores a free-form answer with another model. Powerful and dangerous: the judge can be talked round by length and a confident tone, and that is Goodhart again. The judge itself has to be checked on a golden set.

## The regression hides in the average

Now the main point of this module. You ship a new version of the agent and run it on the same golden set. The average score went up — progress, it would seem. But the aggregate folds a fix and a break into one number and **hides the regression**: a task that used to be solved and now is not.

<figure class="lm-inline-fig">
<svg viewBox="0 0 430 118" role="img" aria-label="A golden set of three tasks run twice. Task 2 was fixed, task 3 broke. The average score is the same — 2 of 3 — so the regression is invisible in the aggregate, only in the per-task diff.">
  <g style="font-family:var(--mono);font-size:8.5px">
    <text x="118" y="16" text-anchor="middle" style="fill:var(--paper-faint)">v1</text>
    <text x="158" y="16" text-anchor="middle" style="fill:var(--paper-faint)">v2</text>
    <text x="10" y="34" style="fill:var(--paper)">task 1</text>
    <circle cx="118" cy="30" r="6" style="fill:#4a9d7f"/><circle cx="158" cy="30" r="6" style="fill:#4a9d7f"/>
    <text x="10" y="58" style="fill:var(--paper)">task 2</text>
    <circle cx="118" cy="54" r="6" style="fill:#7a7a86"/><circle cx="158" cy="54" r="6" style="fill:#4a9d7f"/>
    <text x="200" y="58" style="fill:#8fd3b6">fixed</text>
    <text x="10" y="82" style="fill:var(--paper)">task 3</text>
    <circle cx="118" cy="78" r="6" style="fill:#4a9d7f"/><circle cx="158" cy="78" r="6" style="fill:#d0705f"/>
    <text x="200" y="82" style="fill:#e39a89">broke — regression</text>
    <line x1="8" y1="94" x2="330" y2="94" style="stroke:var(--ink-line)"/>
    <text x="10" y="110" style="fill:var(--paper-faint)">average</text>
    <text x="118" y="110" text-anchor="middle" style="fill:#8fd3b6">2/3</text>
    <text x="158" y="110" text-anchor="middle" style="fill:#8fd3b6">2/3</text>
    <text x="200" y="110" style="fill:var(--paper-faint)">the same — the regression is invisible</text>
  </g>
</svg>
</figure>

**A regression is a per-task diff, not a diff of averages.** It is the same move as the trace from [module 21](21-the-agent-loop.md): to find the break you compare not total with total, but step with step. Here — task with task.

<div class="lm-fig" data-lm-fig="eval-grid"></div>

Press "run v2". The average rises from 4/6 to 5/6 — two tasks were fixed. But one passing task turned red: v2 started looping on a tool error. The average score does not show it; the per-task diff shows it at once. That is why eval is measured not as one number but as a table: what was fixed, what broke.

<div class="lm-thread" markdown>
**Evaluating an agent is module 1 for a program.** In [module 1](01-claim-baseline-noise.md) you checked a claim from a paper: baseline, noise, repetition. Here the claim under test is "the agent solves the task", the golden set is the baseline and the holdout ([module 7](07-honest-comparison.md)) at once, and checking the answer against the reference is the citation check from [module 22](22-retrieval-and-verifiability.md). And the same trap: the moment eval becomes the target of tuning, Goodhart from [module 16](16-reward-as-specification.md) kicks in, and the diff of runs is read with the same eye as the diff of traces from [module 21](21-the-agent-loop.md).
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/23-evaluating-agents.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/23-evaluating-agents.ipynb). Only `numpy` and `matplotlib`.

What is inside:

1. Golden set and score: we assemble a set of tasks, run the agent, compute `pass@1`. The claim "it works" becomes a number you can rerun.
2. Regression: two runs, a per-task diff. The average rose — and one task broke. We show that the aggregate hides it.
3. Goodhart of the eval: optimize the metric directly — the score rises, quality does not. And `pass@k` versus `pass@1`: more attempts inflate the apparent success.

### Part 2. Your own golden set

Take any task you solve with an agent or a model.

1. Assemble 10 tasks with reference answers. Which are honestly hard, and which did you pick because the agent already solves them?
2. How will you score an answer: exact match, by key, a judge? Where will the judge be wrong?
3. Make an edit, run twice and find the per-task diff. Is there a regression?
4. What happens to the score if you start twisting the agent straight against this golden set?

## Assignment

1. Implement an eval: a function takes a task and a reference, runs the agent, returns `pass/fail`. Compute `pass@1` over the golden set.
2. Make two runs of the agent and compute the per-task diff: fixed, broken, unchanged. Find a case where the average rose but a regression is present.
3. Add a model-as-judge (a stub) and show how it is fooled by answer length while the substance is unchanged.
4. Build `pass@k` for k = 1, 2, 5 and show that growing `k` inflates the apparent success without any gain in quality.
5. Take the golden set into tuning: twist the agent against it and show how the score on it diverges from the score on a held-out set.

## Check yourself

1. What is an eval and which claim does it test?
2. Why a golden set, and why must the reference not leak into tuning?
3. Name three ways to score an answer and the weak spot of each.
4. Why does the average score hide a regression, and how do you see it?
5. Which module does "the reference must not leak into tuning" rhyme with?
6. Why is `pass@k` at a large `k` misleading?
7. Where else in the course did step-by-step diff appear instead of a diff of totals?

## Next

This closes **Part VI**: an agent with a readable trace ([module 21](21-the-agent-loop.md)), retrieval with citation checking ([module 22](22-retrieval-and-verifiability.md)) and an evaluation that catches regressions — this is a development loop, not a one-off run. In [Part VII](../programme.md) the course reaches the frontier: how to read a paper, how the field and its leaderboards are organized, how to reproduce a result and how to keep up. The evaluation from here is exactly the tool with which you read other people's claims.

> Eval turns "seems to work" into a number you can rerun; a golden set is the baseline and the holdout at once; a regression lives in the per-task diff, not in the average score. Evaluation is not a report at the end but a test that catches the break before the user does.

---

!!! quote "Principle"
    The average score folds a fix and a break into one number and hides the regression. Development stands not on the metric having risen, but on your knowing which task, exactly, broke.
