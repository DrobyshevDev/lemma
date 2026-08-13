# Module 1. What "works" means

!!! abstract "After this module you will be able to"
    - Break a claim from a paper into three parts: what was measured, on what, compared against what.
    - Explain why one number without a spread is not a result.
    - Compute the mean, variance, standard error and confidence interval, and say what each of them means.
    - Build a bootstrap interval and the IQM by hand, without libraries.
    - Check a published claim and get your own answer to the question "is it true".

    **Time:** about a week. **Prerequisites:** Python, [check yourself](../prerequisites.md).
    **Notebook:** [`notebooks/01-claim-baseline-noise.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/01-claim-baseline-noise.ipynb)

## Why this comes first

An ordinary course starts like this: take the data, train a model, get accuracy 0.93. This
looks like a result. It is not a result.

Here is a sentence from a paper:

> Our method reaches accuracy 0.93 on this dataset, surpassing the previous result of 0.91.

Before believing it, you have to ask four things.

Accuracy **of what**. "Accuracy" is a family of quantities, not a quantity.

**On what**. Is it the same sample on which 0.91 was measured.

How many times it was run and what the **spread** was. If with the second RNG seed the method
gives 0.90, then 0.93 was luck, not an improvement.

What it is **compared against**. Was the previous method tuned as carefully as the new one — or
taken from a three-year-old paper with default settings.

None of the four questions requires knowing any machine learning. All four require a habit and
a little arithmetic.

The module comes first not because it is easy but because without it the next twenty-six are
meaningless. A model you cannot say works is no different from a model that does not.

## The three parts of a claim

Any claim about a result breaks down into three parts. Not two — three.

**The quantity.** What was measured. "Accuracy" is the fraction of correct answers, F1, AUC, or
accuracy on a rare class. In reinforcement learning "reward" is a sum over an episode, a
per-step average, discounted or not. Half of the incomparable comparisons in the literature are
comparisons of different quantities under one word.

**The conditions.** On what data, in what setting, with what budget. A model trained for ten
epochs and one trained for a hundred are different conditions. A method with twenty tuned
hyperparameters and a method out of the box are too.

**The baseline.** What exactly "better" is measured against. The most important part and the
most often spoiled.

!!! example "Let us take one apart"
    > On an inventory-control task with non-stationary demand a trained policy yields a profit
    > of 274.0 against 240.7 for the best fixed base-stock policy. The numbers are the
    > interquartile mean over five seeds with a 95-percent bootstrap interval [247.3, 280.4].

    **Quantity:** profit per episode, summarised by the interquartile mean.
    **Conditions:** non-stationary demand, five seeds.
    **Baseline:** the best fixed base-stock — not a naive one but the best in its class, found
    by search.

    Now, what is not here: the baseline has no interval. This is not a deception, the baseline is
    deterministic. But that does not follow from the text, and a good reader will stumble. Did
    you stumble?

## The baseline

"Our method gives 0.93" is an empty claim. What matters is the difference from what there would
be without the method.

Three levels of baseline, from useless to honest.

**Trivial.** What a constant answer gives. If 95% of emails are not spam, the "everything is not
spam" classifier gives accuracy 0.95. A method with accuracy 0.93 is **worse than nothing**, and
in the paper it will be written as "reaches 0.93". The check takes a minute and screens out
surprisingly many cases.

**Simple.** What the most boring reasonable method gives: logistic regression, boosting out of
the box, a moving average for a time series, the textbook formula for the inventory task. In the
tables of ML papers this row is absent more often than present.

**Tuned.** The same boring method, given as many tuning attempts as your own. This is the honest
comparison. It is rare, because it regularly shows that there is no improvement.

!!! warning "The asymmetry of effort"
    The most common way to get an improvement that is not there is not faking the data. It is
    unequal care. Your own method is tuned for a week, the baseline is taken from someone else's
    repository with default settings. Formally everything is honest: the numbers are real, the
    code is open. In substance you are comparing not the methods but the amount of work put in.

    When reading a paper, look for the sentence about how the baseline was tuned. Its absence is
    a signal.

## Noise

Now the main thing. Run the training twice, changing only the seed of the random number
generator. The numbers will be different. Not in the sixth digit: in reinforcement learning the
spread between seeds is regularly larger than the difference between methods.

Where the randomness comes from: weight initialisation, the order of data shuffling, the
train/test split, dropout, the environment itself.

From which follows something unpleasant:

> **A number from a single run is not a property of the method. It is one observation of a random
> variable.**

Comparing two such numbers is the same as rolling a die twice and concluding from 5 against 3
that the first die is better.

### What to compute instead

Run $n$ times with different seeds and work with the distribution of results.

Let $x_1, \dots, x_n$ be the results of $n$ runs.

**The mean** — the centre:

$$\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$$

**The sample variance** — how spread out the results are around the centre:

$$s^2 = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2$$

!!! question "Why $n-1$ and not $n$"
    Because $\bar{x}$ was computed from these same data. Deviations from one's own mean are
    systematically smaller than deviations from the true mean, and dividing by $n-1$ compensates
    for exactly this: the estimate becomes unbiased. It is checked numerically in eight lines —
    this is the first exercise in the notebook.

**The standard deviation** $s = \sqrt{s^2}$ — the spread in the same units as the quantity.

**The standard error of the mean** — how precisely we know the *centre*:

$$\mathrm{SE} = \frac{s}{\sqrt{n}}$$

These are different things, and they are confused constantly. $s$ is how spread out the runs are.
$\mathrm{SE}$ is how spread out the *mean* would be if the whole experiment of $n$ runs were
repeated. Look at the $\sqrt{n}$: to halve the uncertainty in the mean you need four times as
many runs. Because of this, papers so often have $n = 3$.

**The confidence interval** of roughly 95%:

$$\bar{x} \pm 1.96 \cdot \mathrm{SE}$$

Read it this way: if the whole experiment is repeated many times, in about 95% of cases the
interval built will cover the true value. It does **not** mean "the true value lies here with
probability 0.95". The true value is not random — the interval is.

### The overlap rule

A practical rule: **the intervals of two methods overlap — the difference is not shown.**

Not "the methods are the same". Not shown. There may be a difference, but there is too little
data.

The rule is crude and conservative. It cuts off most cases where an improvement is declared on
noise, and it is the first filter when reading a paper.

Here it is as an instrument. A method and a baseline with a true difference of 0.023 — small but
real. Move the number of seeds and press "Reseed": at small $n$ the intervals overlap and the
observed "better one" jumps between the method and the baseline. There is a difference — but
there is nothing to show it with.

<div class="lm-fig" data-lm-fig="ci-overlap" data-n="6"></div>

Watch at what $n$ the intervals separate reliably. That is the answer to the question "how many
seeds are needed" — not by a formula but by hand. The formula comes in [Module 2](../programme.md).

<div class="lm-thread" markdown>
**The same move returns three times.** The bootstrap on fixed seeds is not the topic of one
module but a tool of the whole course. In [Module 14](../programme.md) it compares PPO against a
baseline, in [Module 20](../programme.md) two branches of an A/B test, in [Module 26](../programme.md)
your own number against the published one. One eleven-line piece of code, four different tasks.
</div>

## When the mean lies

The mean has an unpleasant property: a single outlier drags the whole thing. In reinforcement
learning this happens constantly — some runs diverge, some fall into a lucky regime.

Five runs: `10, 11, 9, 10, 60`. The mean is 20. No single run showed such a result.

Hence two robust summaries.

**The median** — the middle value of the ordered list. Robust, but throws away almost all the
information: at $n = 5$ it rests on a single observation.

**The interquartile mean (IQM)** — drop the worst and the best quarter, average the middle. More
robust than the mean, more informative than the median. The standard in modern RL work, and
exactly what you saw in the example above.

$$\mathrm{IQM} = \text{mean over } x_{(i)}, \quad i \in \left[\left\lceil n/4 \right\rceil + 1,\ \left\lfloor 3n/4 \right\rfloor\right]$$

The formula is scarier than the thing: sort, cut a quarter off each end, average the rest. Three
lines in NumPy.

Drag the outlier and watch the markers. The mean drives off after it, the IQM stays put — because
the mean holds every point in its hands, and the IQM threw out the best and worst quarter before
computing anything.

<div class="lm-fig" data-lm-fig="mean-vs-iqm"></div>

### The bootstrap

For the IQM there is no simple standard-error formula. And none is needed.

**The bootstrap:** many times draw a sample of size $n$ from our $n$ results **with replacement**,
compute the statistic on each, take the 2.5th and 97.5th percentiles of the resulting
distribution.

This works because our sample is the best approximation of where the data came from. Resampling
from it, we imitate repeating the experiment.

```python
def bootstrap_ci(values, statistic, n_resamples=10_000, seed=0):
    """95% confidence interval for any statistic.

    Resampling with replacement imitates repeating the experiment:
    the sample is our best approximation of where the data came from.
    """
    rng = np.random.default_rng(seed)
    values = np.asarray(values)
    draws = rng.choice(values, size=(n_resamples, len(values)), replace=True)
    stats = np.array([statistic(row) for row in draws])
    return np.percentile(stats, [2.5, 97.5])
```

Eleven lines. Works for the mean, the median, the IQM, a proportion — for anything. The most
useful piece of code in the course.

!!! note "An honest limitation"
    The bootstrap does not create information. At $n = 3$ it will give an interval, and that
    interval will be meaningless, because three numbers say little about the distribution. Five
    seeds and wide intervals in a paper are not a flaw but honesty. The flaw is three seeds and no
    intervals at all.

## Practice

### Part 1. The notebook

Open [`notebooks/01-claim-baseline-noise.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/01-claim-baseline-noise.ipynb).

It walks the whole path on a simulated experiment where **the true answer is known in advance**.
On real data the truth is invisible, and it is impossible to see where the estimate lies. Here —
it is visible.

What is inside:

1. A numerical check of why the $n-1$ in the variance.
2. Two "methods" with a known true difference. How many seeds are needed to see it.
3. How often, at $n = 3$, the worse method is declared better. We count, not guess.
4. The mean versus the IQM on a distribution with outliers.
5. Bootstrap intervals written from scratch.

Go through it twice, as described in the [study rules](../how-to-study.md): the first time whole,
the second time breaking it.

### Part 2. A real claim

Theory without application does not stick. We take a published claim and check it ourselves.

In the [decisionrl](https://github.com/DrobyshevDev/decisionrl) library it is claimed: on an
inventory-control task with non-stationary demand a trained policy yields 274.0 profit against
240.7 for the best fixed base-stock. The numbers are produced by the script
[`examples/verify_applied_claims.py`](https://github.com/DrobyshevDev/decisionrl/blob/main/examples/verify_applied_claims.py)
from the same repository. This is a rare and correct case: the claim comes attached with the way
to check it.

```bash
pip install "decisionrl[gym]"
git clone https://github.com/DrobyshevDev/decisionrl
cd decisionrl
python examples/verify_applied_claims.py
```

The run takes patience, not a graphics card. While it computes, answer in writing:

1. Which quantity is being compared and over how many seeds.
2. What "the best fixed base-stock" is and why it is a stronger baseline than just a base-stock.
3. Do the intervals of the trained policy and the baseline overlap.
4. The baseline has no interval. Is that justified here? In what case would it not be?

Once it has computed — compare with the published number. **A discrepancy is a normal result, not
a failure.** A different PyTorch version, different hardware, different seeds. The question is not
"did it match" but "does your number fall inside the published interval, and if not, by how much
does it miss".

This is exactly the work you will do in Module 26 with a real paper. Here it is training on a task
where the code is guaranteed to run.

## Six ways to be wrong

Not by fraud. All six happen regularly to conscientious people, including you in the next six
months.

**1. Seed selection.** Ran five times, showed the best. Formally the number is real. Defence: the
set of seeds is fixed *before* the experiment, all are shown.

**2. Tuning asymmetry.** Your method was tuned for a week, the baseline out of the box. Defence:
equal tuning budget, and write down what it was.

**3. Peeking at the test set.** Looked at the test metric, changed the model, looked again. After
twenty iterations the test stopped being a test: you tuned to it through yourself. Defence:
decisions are made on the validation set, the test is opened once.

**4. A leak.** A feature that did not exist at the moment of prediction. Normalisation computed
over all the data before the split. Duplicates that ended up in both train and test. Defence: for
every feature ask — would it have been known at the moment the prediction is actually needed?

**5. Stopping on the result.** Watched the metric as you went and stopped when it got good. This is
seed selection in time. Defence: the stopping criterion is fixed in advance.

**6. Multiple comparisons.** Checked twenty variants, one gave an improvement with $p < 0.05$. With
twenty checks one false result is expected by construction. Defence: a correction for multiplicity,
or an honest "we checked twenty".

!!! tip "How to use this"
    This is not a list for reading someone else's papers but a checklist for your own work. Your
    method showed an improvement — go through the six points before rejoicing. In about half the
    cases there will be nothing to rejoice about, and it is better to find out yourself.

## Assignment

Take any task with a numerical result: from the notebook, from decisionrl, from your own project.

1. State the claim in writing, split into three parts: quantity, conditions, baseline.
2. Choose a baseline and justify why it is honest. Compute the trivial one without fail.
3. Run at least ten seeds. Choose the seeds **before** running and write them down.
4. Compute the mean, the IQM and the bootstrap intervals for both.
5. Write the conclusion in one sentence — one you are prepared to defend.
6. In a separate paragraph: which of the six ways to be wrong is most likely here specifically,
   and what you did to rule it out.

The sixth point is the most important. It is also the only one that cannot be copied.

## Self-check

Answer aloud, without looking. If you cannot, that is the address of what to reread.

1. How does the standard deviation differ from the standard error of the mean? What happens to
   each if you increase the number of runs fourfold?
2. Why the $n-1$ in the variance formula?
3. What does a 95-percent confidence interval mean? State it so as not to say "the true value lies
   here with probability 0.95".
4. The intervals of two methods overlap. What can be asserted? What cannot?
5. Why is the IQM needed if there are the mean and the median?
6. Explain the bootstrap to someone who knows only the arithmetic mean.
7. A method gives accuracy 0.95. What is the first question you ask?
8. Why is comparing a tuned method against an untuned baseline not fraud, but also not a result?

## Next

In [Module 2](../programme.md) a language appears in which all of this is described precisely:
random variable, distribution, parameter estimate. The question "how many seeds are needed" gets an
answer by a formula, not by search.

And start the habit now and do not drop it until the end of the course:

> When you see a number, ask what it is compared against and how many times it was run.

That is two-thirds of critical reading of papers. The remaining third is the subject of part VII.

---

!!! quote "The principle"
    A green pipeline on one machine is not a proof. Every number you publish is measured on the run
    you describe.
