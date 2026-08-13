# Module 5. Linear models and metrics

!!! abstract "After this module you will be able to"
    - Assemble logistic regression from parts ready since Module 4, and pass its gradient check.
    - Explain why classification uses log loss rather than MSE — through the gradient, not through tradition.
    - Show on data that accuracy 0.95 can mean "a model worse than nothing".
    - Choose between ROC-AUC and PR-AUC, knowing the fraction of the positive class.
    - Understand the threshold as a decision you make, not as a property of the model.

    **Time:** about two weeks. **Prerequisites:** [Module 4](04-derivatives-and-optimisation.md).
    **Notebook:** [`notebooks/05-linear-models-and-metrics.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/05-linear-models-and-metrics.ipynb)

## Why this

Part I gave the tools. Part II gives the first models, and they have a double role.

They are useful in themselves: a linear model still solves many tasks and remains the only one whose
weights you can show to a lawyer or a doctor. But the second role is more important — **these are
baselines**, against which everything else in the course will be compared. From Module 1 it is known
that a claim without a baseline is empty. Here the baselines appear.

Half the module is about metrics, and this is not an add-on. Choosing a metric is harder than
training a model, and a mistake here costs more.

## Logistic regression

The linear regression from Module 3 predicts a number. For classification a probability is needed: a
quantity between zero and one.

We take a linear combination of features $z = w \cdot x$ and drive it into the segment $[0, 1]$ with
a sigmoid:

$$p = \sigma(z) = \frac{1}{1 + e^{-z}}$$

The loss function is the negative log-likelihood, **log loss**:

$$L = -\frac{1}{n}\sum_i \Big( y_i \ln p_i + (1 - y_i)\ln(1 - p_i) \Big)$$

It reads directly: for a confident correct answer the penalty is near zero, for a confident wrong one
the penalty tends to infinity. The model is punished for confidence in a mistake more than for
uncertainty.

The gradient was derived in Module 4 and turned out to equal $(p - y)\,x$. Everything needed for
training is already written: what remains is to assemble the descent.

!!! note "Why not MSE"
    A quadratic loss for classification formally works and gives wrong behaviour.

    Take an object of class 1 on which the model is confidently wrong: $p = 0.01$. The MSE gradient
    through the sigmoid contains the factor $\sigma'(z) = p(1-p) = 0.0099$ — almost zero. **The more
    the model is wrong, the weaker the signal to correct it.** Training stalls exactly where it is
    most needed.

    In log loss this factor cancels — this was the very cancellation in Module 4. The gradient equals
    $(p - y)x$, and at $p = 0.01$, $y = 1$ it is maximal.

    Log loss is used not by tradition but because MSE smothers the signal on the hard examples.

## Regularisation

Module 3 showed: collinear features inflate the weights. Module 2 showed: a flexible function fits to
noise. Regularisation cures both diseases with one move — a penalty on the magnitude of the weights.

**L2 (ridge):** $\lambda\|w\|^2$ is added to the loss. The weights shrink towards zero but do not
become zero. Collinearity stops throwing them into plus and minus: the penalty makes the symmetric
solution more favourable.

!!! note "The optimiser regularises on its own"
    Gradient descent started from zero arrives at the solution with the smallest norm of all the
    fitting ones. On collinear features this means it **itself** splits the weight between the twins
    equally, without any penalty. The weights running off into plus and minus in Module 3 were
    produced by an exact solver, not by descent.

    This is called implicit regularisation, and the consequence is practical: **the choice of
    optimiser affects which of the many solutions you get.** The task's formula is one, the answers
    differ. In the notebook this is visible on numbers.

**L1 (lasso):** $\lambda\sum|w_i|$ is added. Some of the weights become **exactly zero**. Feature
selection results as a side effect of the optimisation.

The difference is geometric. The L2 level sets are circles, and the point of tangency with them
almost never lands on an axis. The L1 level sets are a diamond with corners on the axes, and the
tangency most often happens exactly at a corner, that is, at zero.

$\lambda$ is chosen on the validation set. Not on the test — why, is examined in Module 7.

## Metrics, and why accuracy lies

Now the main thing.

**Accuracy** — the fraction of correct answers. It seems natural and is almost always useless.

Go back to Module 2: a disease in one person in a thousand. The "always healthy" classifier gives
accuracy 0.999. This is the trivial baseline from Module 1, and it is hard to beat with a meaningful
model. Any accuracy number is meaningless without the fraction of the positive class next to it.

What to compute instead. First, four numbers — the confusion matrix:

| | predicted 1 | predicted 0 |
|---|---|---|
| **actually 1** | TP | FN |
| **actually 0** | FP | TN |

From them two metrics are built, answering different questions.

**Precision** $= \dfrac{TP}{TP + FP}$ — of those the model called positive, how many actually are.
The question: **can the alarm be trusted.**

**Recall** $= \dfrac{TP}{TP + FN}$ — of all the true positives, how many the model found. The
question: **how many did we miss.**

They pull in different directions. Lower the threshold — recall rises, precision falls. Raise it — the
reverse.

**F1** — their harmonic mean. Convenient as a single number and harmful as a goal: it assumes that a
miss and a false alarm cost the same. In medicine, in anti-fraud and in moderation this is not true.

!!! warning "The threshold is your decision"
    The model outputs a probability. Turning a probability into a yes/no answer is a separate step,
    and you make it.

    The threshold 0.5 is neither a property of the model nor a reasonable default. It follows from the
    cost of the errors. Missing a fraudulent transaction costs one thing, wrongly blocking an honest
    one costs another, and the threshold must reflect that ratio.

    Comparing two models by a metric at threshold 0.5 regularly compares not the models but the luck
    of the threshold for each.

## ROC-AUC and PR-AUC

To not depend on the threshold, the metric is computed over all thresholds at once.

**The ROC curve** — recall against the fraction of false alarms among the negatives. The area under
it, **ROC-AUC**, has a direct reading: the probability that a randomly taken positive object gets a
higher score than a randomly taken negative one. A random model gives 0.5, a perfect one — 1.0.

**The PR curve** — precision against recall. The area under it — **PR-AUC**.

The difference surfaces on a rare class. The denominator of the false-alarm fraction is all the
negatives, and there are many. A thousand false alarms per million negatives barely moves the ROC
curve. Precision, though, collapses, because its denominator is only the predicted positives.

**The rule.** Classes roughly equal — ROC-AUC. Positives a few percent — PR-AUC. A ROC-AUC of 0.95 on
a task with a positive fraction of 0.1% can correspond to a precision of a few percent, and this is
not a contradiction but arithmetic.

## Calibration

The last property, usually forgotten.

A model is **calibrated** if among the objects with predicted probability 0.8 there really are about
80% positives.

Ranking and calibration are different things. A model can order objects perfectly (AUC = 1.0) and at
the same time output meaningless probabilities.

Calibration is needed where the probability is used in a computation, not only for sorting: expected
profit, a threshold by the cost of an error, combining with other sources. It is checked by a
reliability diagram: split the predictions into bins and compare the average predicted probability
with the actual fraction of positives.

Logistic regression is fairly well calibrated by construction — this is a consequence of log loss.
Trees and boosting from Module 6 — usually not.

## Practice

### Part 1. The notebook

Open [`notebooks/05-linear-models-and-metrics.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/05-linear-models-and-metrics.ipynb).

What is inside:

1. Logistic regression from scratch, checked by the gradient check from Module 4.
2. MSE against log loss: we look at the gradient on a confidently wrong example.
3. Imbalanced data: accuracy 0.98 for a model that found not a single positive.
4. Precision, recall and the threshold as a knob. The trade-off curve.
5. ROC-AUC against PR-AUC at positive fractions of 50%, 5% and 0.5%.
6. A reliability diagram: calibration and its absence.
7. Ridge on the collinear features from Module 3: the weights stop running apart.

### Part 2. A metric for the task

Choose any binary classification task from your own life: spam, churn, a manufacturing defect, a
suspicious payment.

In writing, before any code:

1. What is the cost of a false alarm. In money, time or trust.
2. What is the cost of a miss. In the same units.
3. From the ratio of these costs — what threshold is reasonable.
4. Which metric reflects your task and why not F1.
5. What fraction of the positive class is expected. Hence — ROC-AUC or PR-AUC.

Five answers on half a page. This is the statement of the task; everything else is technique.

## Assignment

1. Implement logistic regression with an L2 penalty. Check the gradient numerically.
2. Build data with a positive fraction of 1%. Train a model and find the threshold maximising F1.
   Compare with 0.5.
3. Build two models with the same ROC-AUC and noticeably different PR-AUC. Explain how they differ.
4. Take a model's predictions and build a reliability diagram. Calibrate it with isotonic regression
   or simple binning. Did the AUC change?
5. On collinear data compare the weights without regularisation and with L2 at three values of
   $\lambda$. Plot how the weights converge to zero as $\lambda$ grows.

## Self-check

1. Why log loss for classification, not MSE? The answer through the gradient.
2. Accuracy 0.99. What is the first question you ask?
3. How does precision differ from recall in words, without formulas?
4. Why is F1 a bad goal for anti-fraud?
5. Where does the threshold come from, if not 0.5?
6. How is ROC-AUC read in one sentence about two random objects?
7. When is PR-AUC more informative than ROC-AUC and why?
8. A model with AUC 1.0 can be poorly calibrated. How is that possible?

## Next

In [Module 6](../programme.md) trees appear, and with them a family that on tabular data still beats
neural networks. This will be the course's main baseline, and in parts III–VI it will have to be
beaten fairly.

> A metric is chosen from the cost of an error, not from habit. The threshold too.
