# The capstone

The course ends not with an exam but with a piece of work. You take a paper published after you began, reproduce its central claim with your own hands, and write an honest report: what held up, what did not, and why. This is the only proof that the course worked, because there is only one way to check a claim — to check it yourself.

An exam asks whether you remember the definitions. The capstone asks something else: can you take someone else's claim and find out whether it is true. That is exactly what a researcher does in the first month of a new job, and exactly what the whole course was for — from the confidence interval in [module 1](modules/01-claim-baseline-noise.md) to reading the frontier in [module 27](modules/27-how-to-keep-up.md).

## Why it matters

Twenty-seven modules taught one skill in different disguises: to tell signal from noise and not build on noise. As long as that skill lives in your head as a set of rules, it is worth nothing. It becomes yours only when you walk the whole path once, end to end, on a live problem no one made up for you: you chose a paper, understood its claim, restored what was missing, compared it against an honest baseline, and reached a verdict.

There is a second reason, a plain one. The work you produce is a portfolio that speaks for you better than any résumé. Not "took a course", but "took this paper, reproduced this, here is the repository, here are the numbers". Whoever reads that report sees not a list of topics covered but proof: you can do what you claim.

## Which paper to take

Half the outcome rides on the choice of paper, so spend a day on it, not an hour.

Take a **recent** paper — one published after you started. The reason is not fashion: a recent paper has no third-party reproductions, no explainer blog posts, and no cleaned-up code to hide behind. The reproducibility gap from [module 26](modules/26-reproduction.md) is real there, and closing it falls to you, not to a search engine.

Take a **small** paper with one checkable claim. A large paper makes many claims, and trying to reproduce them all at once is a way to finish none. What you need is one central claim you can check on a CPU in reasonable time: "method X gives such-and-such a gain over baseline Y on data Z". If the central claim cannot be stated in one sentence, that is a bad choice for a first project, not depth.

Check three things in advance: the data is available, not locked behind a six-month access form; the computation fits your hardware; the claim has a baseline to compare against honestly. A paper with no baseline cannot be checked at all — there is nothing to compare against.

## How to do it

What follows is the whole course, gathered into one sequence. It is short in words and long in work.

**Read the paper — as in [module 24](modules/24-how-to-read-a-paper.md).** Not top to bottom, but from the checkable to the explanatory: the abstract gives the claim, the main table shows the size of the effect, and only then comes the method. Your goal at this step is not to retell the paper but to find the one number that holds everything up.

**State the central claim in one sentence.** This is the most underrated step. While the claim is vague — "the method is good" — there is nothing to check. The moment it becomes precise — "on such-and-such a set the method gives +N over such-and-such a baseline, and it survives a change of seed" — you have a thing to check and a criterion by which you will know you are done.

**Make a list of the omissions.** Between the method in the paper and working code there is always a gap: the hyperparameters are "tuned on validation", the data is "preprocessed in the standard way", the evaluation is "by the protocol". Write down everything you will have to guess. That list is the map of your work, and it is also what you will ask the authors if a detail cannot be found.

**Implement the minimal core.** Not the whole paper, but the piece that produces the central number. Everything else is decoration you can add later or not at all. The minimal core is faster to write, easier to debug, and more honest to compare.

**Compare against an honest baseline — on your own seeds.** This is where the whole point lives, because the gain hides in the comparison, not in the method ([module 7](modules/07-honest-comparison.md)). Tune the baseline as carefully as the method. Run several times with different seeds and look not at one number but at the spread: do the intervals of method and baseline overlap or separate ([module 1](modules/01-claim-baseline-noise.md)). One lucky seed is not a result.

**Reach a verdict.** It comes in three kinds, and all three are legitimate.

<figure class="lm-inline-fig">
<svg viewBox="0 0 440 96" role="img" aria-label="Three legitimate outcomes of a reproduction: reproduced — the gain sits in the noise band around the claimed number; partial — it holds under some conditions and breaks under others; not reproduced — against an honest baseline there is no gain. All three are knowledge.">
  <g style="font-family:var(--mono);font-size:8.5px">
    <rect x="8" y="34" width="128" height="34" rx="8" style="fill:var(--ink-raised);stroke:#4a9d7f;stroke-width:1.3"/>
    <text x="72" y="49" text-anchor="middle" style="fill:#8fd3b6">reproduced</text>
    <text x="72" y="61" text-anchor="middle" style="fill:var(--paper-faint);font-size:7px">gain in the noise band</text>
    <rect x="156" y="34" width="128" height="34" rx="8" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.3"/>
    <text x="220" y="49" text-anchor="middle" style="fill:var(--paper-bright)">partial</text>
    <text x="220" y="61" text-anchor="middle" style="fill:var(--paper-faint);font-size:7px">holds only sometimes</text>
    <rect x="304" y="34" width="128" height="34" rx="8" style="fill:var(--ink-raised);stroke:#d0705f;stroke-width:1.3"/>
    <text x="368" y="49" text-anchor="middle" style="fill:#e39a89">not reproduced</text>
    <text x="368" y="61" text-anchor="middle" style="fill:var(--paper-faint);font-size:7px">no gain vs honest base</text>
    <text x="220" y="20" text-anchor="middle" style="fill:var(--paper-faint)">all three outcomes are knowledge, not a pass / fail grade</text>
  </g>
</svg>
</figure>

**Reproduced** — the gain holds in the noise band around the claimed number. It need not match to the last digit: your 88.5 against a claimed 89.0 is a success if the difference is smaller than the noise ([module 26](modules/26-reproduction.md)). **Partial** — the claim holds on one dataset and breaks on another, or the gain is real but three times smaller than promised. **Not reproduced** — against an honest baseline there is no gain. That last outcome is not a failure of your work: a checked "no" is knowledge that did not exist before you, and it is worth more than an unchecked "yes".

## The report

The report is not an essay about how hard you tried, but an open repository that can be run. It holds three things: code that produces the numbers top to bottom with no edits; the numbers themselves, which a reader can recompute; and an honest conclusion — what held up, what did not, and why.

Write the conclusion as flatly as you reached the verdict. If the claim reproduced, put your numbers next to the claimed ones and show your spread across seeds. If it did not, show exactly where it diverged: the gain vanished against an honest baseline, or the effect held on one seed, or the data turned out to be different. The reader of your report needs not your confidence but your tie to checkable numbers — exactly as in the citation check from [module 22](modules/22-retrieval-and-verifiability.md).

## Checklist

Walk through it before you call the work done.

- [ ] The paper is recent, small, with one checkable central claim.
- [ ] The data is available, the computation fits your hardware, the claim has a baseline.
- [ ] The central claim is stated in one precise sentence.
- [ ] A list of omissions is written down — what had to be guessed.
- [ ] The minimal core is implemented, not the whole paper.
- [ ] The baseline is tuned as carefully as the method.
- [ ] Several runs, different seeds; the spread is shown, not one number.
- [ ] The verdict is reached honestly: reproduced, partial, or not.
- [ ] The repository is open, the code runs top to bottom, the numbers recompute.
- [ ] The conclusion shows what held up and what did not, tied to the numbers.

If every box is checked, you have done what the course was written for. You did not retell someone else's work — you checked it; you told a result from noise on a live problem where no one handed you the answer. That is the capstone: the whole course, done once with your own hands.

---

!!! quote "Principle"
    A diploma certifies that you sat through the course; the capstone certifies that you command it. The difference between them is exactly the difference between "it passed review" and "I ran it and got the same".
