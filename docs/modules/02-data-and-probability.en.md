# Module 2. Data and probability

!!! abstract "After this module you will be able to"
    - Tell a distribution's parameter from its estimate on a sample — and not confuse them in conversation.
    - Explain where the $\sqrt{n}$ in the standard error comes from.
    - Compute how many seeds are needed to see a difference of a given size. By a formula, not by search.
    - Apply Bayes' theorem to a task where intuition gives the wrong answer.
    - Explain overfitting through noise, without saying the word "model".

    **Time:** about two weeks. **Prerequisites:** [Module 1](01-claim-baseline-noise.md).
    **Notebook:** [`notebooks/02-data-and-probability.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/02-data-and-probability.ipynb)

## Why this

Module 1 ended on a claim: a number from a single run is one observation of a random variable.
The words were used but not defined. Here they are defined.

And one debt was left unpaid. In Module 1 the question "how many seeds are needed" was answered by
search: we counted the fraction of wrong conclusions for 1, 3, 5, 10, 20, 50, 100 seeds and looked
with our eyes. That is allowed, but you will not compute it that way every time. By the end of this
module the same question has an answer by a formula.

## The random variable

A die roll gives a number. Before the roll it is unknown which one, after — it is known. A quantity
that behaves this way is called random.

A training run behaves exactly the same. Before the run the accuracy is unknown, after the run it
is a number. Between runs it changes, because the seed, the order of the data and the weight
initialisation change.

**The distribution** answers the question of which values a random variable takes and how readily.
For a die: six values, each with probability $1/6$. For a model's accuracy: a continuous set of
values, and most often the distribution looks normal — a bell around some centre.

!!! note "Why a bell so often"
    A run's accuracy is made up of many small independent influences: this batch turned out a little
    luckier, that weight initialised a little better. The sum of many small independent terms tends
    towards a normal distribution regardless of how each term is distributed. This is the central
    limit theorem, and it explains why a bell crawls out in tasks where nobody put it in.

## Parameter and estimate

Here is the distinction behind the confusion in half of all conversations about statistics.

**The parameter** — a property of the distribution. The true mean $\mu$, the true variance
$\sigma^2$. These are numbers that exist but are unavailable to us: to know them you would need
infinitely many observations.

**The estimate** — what we compute from the sample. The sample mean $\bar{x}$, the sample variance
$s^2$. These are numbers we have.

The estimate is itself a random variable. Take a different sample, get a different $\bar{x}$. That
is exactly why the estimate has a spread of its own, and it is that spread that the standard error
from Module 1 measures.

| | Parameter | Estimate |
|---|---|---|
| Notation | $\mu$, $\sigma^2$ | $\bar{x}$, $s^2$ |
| Where from | property of the distribution | computed from the sample |
| Changes from sample to sample | no | yes |
| Known to us | no | yes |

**Unbiasedness** means that, averaged over many samples, the estimate lands on the parameter. This
is exactly what was checked numerically in the Module 1 notebook: dividing by $n$ gave an
understatement of $1/n$, dividing by $n-1$ did not.

## The law of large numbers and the square root of n

Two statements from which all the practice of measurement grows.

**The law of large numbers.** As $n$ grows the sample mean converges to the true one. This is the
promise that measuring makes sense at all.

**The central limit theorem.** The sample mean $\bar{x}$ is itself distributed approximately
normally around $\mu$ with standard deviation $\sigma/\sqrt{n}$ — regardless of how the original
$x_i$ are distributed.

The second theorem is the source of the $\sqrt{n}$ in the standard-error formula:

$$\mathrm{SE} = \frac{s}{\sqrt{n}} \approx \frac{\sigma}{\sqrt{n}}$$

Read it as an exchange rate. Want a mean twice as precise — pay with four times as many runs. The
rate is unfavourable and not up for discussion: it is a property of arithmetic, not a shortcoming of
the method.

## How many seeds are needed

Now the debt from Module 1.

There are two methods. The true difference between them is $\Delta$, the spread between seeds is
$\sigma$. How many runs of each method are needed for the difference to be visible?

The difference of means $\bar{x}_A - \bar{x}_B$ has a standard error of $\sigma\sqrt{2/n}$. For the
difference to differ confidently from zero, $\Delta$ needs to be noticeably larger than this error.
The standard requirement — detect the effect in 80% of cases at significance level 0.05 — gives

$$n \approx 16\,\frac{\sigma^2}{\Delta^2}$$

One formula, and it changes your attitude to experiments.

!!! example "Plug in the Module 1 numbers"
    There we had $\Delta = 2$, $\sigma = 4$. Compute: $n \approx 16 \cdot 16 / 4 = 64$.

    Sixty-four runs of each method. Papers usually have three.

    Hence a direct consequence for reading: **if the spread between seeds is comparable to the
    claimed improvement, and there are fewer than ten seeds, the paper could not have seen what it
    claims.** This is visible from the abstract, before reading the methods.

Note the squares. An effect half the size — four times as many runs. A spread twice as large — four
times as many runs. Small improvements are expensive not because they are hard to get, but because
they are hard to prove.

## Conditional probability and Bayes

The module's second thread. It will be needed in classification, in citation checking, and
everywhere the phrase "the probability that" appears.

**Conditional probability** $P(A \mid B)$ — the probability of $A$ given a known $B$. Definition:

$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$

From this Bayes' theorem follows in two lines:

$$P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}$$

It flips the condition. Knowing $P(B \mid A)$, we get $P(A \mid B)$. And this is exactly the place
where intuition breaks.

!!! example "A test for a rare disease"
    The disease occurs in one person in a thousand. The test finds the disease in a sick person in
    99% of cases and errs on a healthy one in 5% of cases. The test is positive. What is the
    probability that the person is sick?

    Most answer "about 95%". Compute.

    $P(\text{sick}) = 0.001$. $P(+ \mid \text{sick}) = 0.99$.
    $P(+ \mid \text{healthy}) = 0.05$.

    $$P(+) = 0.99 \cdot 0.001 + 0.05 \cdot 0.999 = 0.0509$$

    $$P(\text{sick} \mid +) = \frac{0.99 \cdot 0.001}{0.0509} \approx 0.019$$

    **Less than two percent.** Out of a thousand people one is sick, and the test will find them.
    There are 999 healthy, and on fifty of them the test will err. Fifty false ones per one true.

    The point is not the quality of the test but the rarity of the disease. A good test for a rare
    event gives mostly false positives — and the same happens with a classifier on imbalanced data,
    with a fraud detector and with any filter looking for a needle.

## Overfitting

Not a word has been said about models yet, and the phenomenon can already be explained in full.

Data is signal plus noise. The signal repeats in new data, the noise does not repeat by definition.

Fitting a sufficiently flexible function to a specific sample fits it to both components at once.
The function memorises both the regularity and the random features of these specific points. On this
data the error falls. On new data the fitted noise is an obstacle, and the error rises.

Hence a rule worth more than any algorithm: **quality is measured on data the model has not seen.**
Not because it is the custom, but because on seen data there is nothing to measure — the answers are
already in the model.

!!! warning "A leak"
    Data counts as unseen only if it took part in nothing. Normalisation computed over the whole
    sample before the split has already smuggled information from the test into the training: the
    mean and variance of the test entered the model through the feature scale.

    A leak usually looks like a pleasant surprise. The metric suddenly got much better — first look
    for the leak, do not rejoice.

## Practice

### Part 1. The notebook

Open [`notebooks/02-data-and-probability.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/02-data-and-probability.ipynb).

What is inside:

1. The CLT numerically: we average samples from a frankly non-normal distribution and watch the mean
   become normal.
2. A check of $\sigma/\sqrt{n}$: the spread of the mean falls exactly as the square root.
3. The formula for $n$ against direct search. Does the prediction match the measurement.
4. Bayes on the rare-disease test: we compute and draw how the answer depends on prevalence.
5. Overfitting without the word "model": we fit a polynomial of increasing degree to fifteen noisy
   points and look at the error on new points.

### Part 2. Reading the abstract

Take three papers on any topic close to you. arXiv works, papers cited by the documentation of a
library you use work.

For each, **without reading the methods section**:

1. What improvement is claimed, in numbers.
2. Is the spread given. Is the number of runs given.
3. If both are given — estimate $n$ by the formula. Did they have enough runs.
4. If the spread is not given — that is a separate observation. Write it down.

Three papers, half an hour. After that it will take five minutes and happen automatically.

## Assignment

Take any dataset with a numerical target. Anything works, down to your own measurements of a
project's build time.

1. Estimate the mean and its standard error. Say in words what each of the two numbers means.
2. Split the data in half at random. Compute the mean on each half. Do they fall into each other's
   intervals.
3. Come up with a question of the form "the probability of $A$ given $B$" that has an answer in this
   data. Compute it directly and via Bayes. The numbers must match.
4. Fit to the data a polynomial of degree equal to the number of points minus one. It will pass
   exactly through every point. Explain in writing why this is the worst possible model.

## Self-check

1. How does a parameter differ from an estimate? Which of them is random?
2. Where does the $\sqrt{n}$ in the standard error come from?
3. The spread between seeds is twice the expected improvement. How many runs are needed?
4. A test for a rare disease is positive. Why is the answer "almost certainly sick" wrong?
5. What exactly does an overfitted function memorise and why does it not help on new data?
6. Why is normalisation before the split a leak?

## Next

In [Module 3](../programme.md) linear algebra appears: vector, matrix, projection. Not as a separate
subject but as the language in which all the rest is written. The very first application will be
linear regression, derived from scratch.

> A number without a spread is not a result. A spread without a number of runs is not a spread.
