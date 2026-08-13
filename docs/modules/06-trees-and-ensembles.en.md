# Module 6. Trees and ensembles

!!! abstract "After this module you will be able to"
    - Write a decision tree from scratch and explain what exactly it optimises at each split.
    - Show why averaging independent models reduces the error — by the formula from Module 2.
    - Tell bagging from boosting by what each of them cures.
    - Train gradient boosting by hand and beat a linear model with it on tabular data.
    - Explain why feature importances cannot be trusted under collinearity.

    **Time:** about two weeks. **Prerequisites:** [Module 5](05-linear-models-and-metrics.md).
    **Notebook:** [`notebooks/06-trees-and-ensembles.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/06-trees-and-ensembles.ipynb)

## Why this

Tabular data is the larger part of the tasks people solve for money. Churn, scoring, demand, defects,
risk. And on them, since 2016, gradient boosting wins, not neural networks.

This is not an opinion but a result that survives checking: papers comparing boosting with deep
networks on dozens of tabular datasets with honest tuning of both sides regularly end in boosting's
favour. The reasons are examined below, and they are structural.

Hence a practical consequence for all the rest of the course. **Before training a network on a table,
train boosting.** If the network did not beat it, you built a complex model for the sake of
complexity.

## The decision tree

A tree asks questions about one feature at a time: "age under 35?", "amount over 10,000?". The answer
leads into the left or the right branch, and so on to a leaf, where the prediction lies.

Training is greedy. At each node all features and all thresholds are tried, and the split is chosen
that most reduces the disagreement in the resulting halves.

For regression the measure of disagreement is variance. The quality of a split:

$$\text{gain} = \mathrm{Var}(\text{node}) - \frac{n_L}{n}\mathrm{Var}(L) - \frac{n_R}{n}\mathrm{Var}(R)$$

For classification the same thing with the Gini criterion $\sum_k p_k(1 - p_k)$ or with entropy. The
difference between them is barely visible in practice.

Three properties make the tree convenient on tables specifically.

**Scale does not matter.** A tree compares a feature with a threshold. Multiply a feature by a
thousand — the threshold multiplies by a thousand, the tree does not change. Everything said in
Module 4 about normalisation and the condition number simply does not arise here.

**Monotone transformations do not matter.** The logarithm of a feature gives the same tree. For a
linear model the logarithm changes everything.

**Interactions are caught on their own.** The path from root to leaf is a conjunction of conditions.
A linear model requires the product of features to be handed to it by hand.

The price — **a tree overfits readily**. Depth $d$ gives up to $2^d$ leaves, and at sufficient depth
each leaf will hold a single object. This is exactly the fourteenth-degree polynomial from Module 2,
only in different clothes.

## Bagging: averaging

One deep tree has small bias and huge variance: change a few objects in the training set — get a
different tree.

From Module 2 it is known what to do with variance. Average it.

**Bagging:** train $M$ trees on different bootstrap samples (the same trick as in Module 1) and
average the predictions. If the trees' errors are independent, the variance of the average falls by a
factor of $M$. This is the same formula $\sigma/\sqrt{n}$, applied to models instead of observations.

The word "if" here is load-bearing. Trees trained on overlapping samples correlate, and the gain is
less than promised.

**The random forest** finishes off the correlation: at each split not all features are considered but
a random subset. The trees are forced to look at different sides of the data, their errors diverge,
the averaging works better.

Note the logic: the ensemble's quality is improved by **worsening** each individual tree. This is not
a paradox but a direct consequence of the formula for the variance of the average.

!!! warning "The condition usually kept quiet about"
    Decorrelation has a price: each tree sees fewer features and is therefore worse. The gain
    outweighs the price **only when there are many features and the signal is smeared across them.**

    On five features, three of which carry almost all the signal, a tree with two random features per
    node regularly sees not a single informative one. A forest loses there to plain bagging, and in
    the notebook this is measured: 0.545 against 0.513.

    This is the same story as with momentum in Module 4. The trick cures a specific disease, and on a
    healthy organism it harms.

## Boosting: correcting residuals

Bagging fights variance. Boosting fights bias, and does it differently — not in parallel but
sequentially.

The idea in one line: **train the next model on the errors of the previous ones.**

1. Start with a constant — the mean value of the target.
2. Compute the residuals: what is missing to the right answer.
3. Train a shallow tree to predict these residuals.
4. Add its prediction to the total with a small coefficient.
5. Go back to step 2.

Why it is called **gradient** boosting: for a quadratic loss the residual $y - \hat{y}$ is exactly the
anti-gradient of the loss with respect to the prediction. Each tree takes a step against the gradient
— the same line as in Module 4, only the step is taken in the space of functions, not of weights.

Hence the parameters you will have to tune:

| Parameter | What it does | Which way to turn |
|---|---|---|
| Number of trees | how many descent steps | more — more precise and longer, up to overfitting |
| Learning rate | step length | smaller — more reliable, needs more trees |
| Tree depth | complexity of one step | 3–8 usually; deeper rarely helps |
| Sample fraction per tree | noise, as in SGD | 0.5–1.0 |

The learning rate and the number of trees are inversely related, exactly like $\eta$ and the number
of steps in Module 4. Halved the rate — double the number of trees.

## Why boosting wins on tables

Four structural reasons, and not one is about "it is better".

**A table's features are heterogeneous.** Age, amount, category, flag — different units, different
distributions. A tree takes each separately, a network has to reconcile them.

**The target function is piecewise constant.** Real tabular dependencies often have thresholds: a
discount after an amount, risk after an age. A tree builds thresholds directly, a network approximates
them with smooth functions and spends capacity on it.

**Data is scarce.** A tabular task is thousands or tens of thousands of rows, not millions of images.
A network needs a volume that is not here.

**There is no structure a network extracts value from.** Convolutions win on images because
neighbouring pixels are related. Attention wins on text for the same reason. The columns of a table
can be permuted and nothing changes — there is nothing to extract.

Where boosting loses: images, sound, text, very large data, tasks where embeddings are needed for
transfer.

## Feature importance

Trees give importances almost for free: the sum of gains over all splits on that feature. The number
looks convincing and deceives regularly.

**Collinearity steals importance.** Add a copy of an informative feature, and the tree at the very
first node will choose one of the two twins, and the second turns out almost unneeded. In the notebook
this is measured: the importance drops from 60% to 3%, the copy takes 57%. Not "split in half" —
intercepted almost entirely, and exactly how depends on chance. The same phenomenon as the weights
running apart in Module 3, in different clothes.

**Features with many levels get a head start.** A continuous feature has more possible thresholds,
hence more chances to give a good split by luck.

**Importance does not mean cause.** A feature can be important because it is a consequence of the
target, not its cause. This is a leak, and in Module 7 it is examined separately.

A more honest way is **permutation importance**: shuffle a feature's values in the validation set and
see how much the quality dropped. More expensive, but it measures the contribution to the prediction,
not the participation in the building.

## Practice

### Part 1. The notebook

Open [`notebooks/06-trees-and-ensembles.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/06-trees-and-ensembles.ipynb).

What is inside:

1. A decision tree from scratch, about sixty lines. It is visibly step-like.
2. Depth against overfitting: the same two curves as in Module 2.
3. Bagging: we measure how the spread of predictions falls with the number of trees, and check
   against $1/M$.
4. Gradient boosting from scratch on stumps.
5. Learning rate against the number of trees: the inverse relation on a graph.
6. Boosting against a linear model on tabular data with thresholds and an interaction.
7. Importances under collinear features: how they split in half.

### Part 2. Boosting as a baseline

Take any tabular task of your own.

1. Train the linear model from Module 5. Record the metric.
2. Train boosting. Record the metric.
3. Tune both with **an equal budget of attempts**. From Module 1: tuning asymmetry is the most common
   way to get an improvement that is not there.
4. Compare with confidence intervals over several splits, not by a single number.
5. Write the conclusion in one sentence in the Module 1 format: quantity, conditions, baseline.

This result will be needed in parts III and IV. When a network appears there, it will have something
to be compared against.

## Assignment

1. Add the Gini criterion to your tree and solve a classification task with it.
2. Build the dependence of the bagging error on the number of trees. Does the fall match $1/M$? If
   not — explain through the correlation of the trees.
3. Implement random feature subsets and show that a forest beats bagging on the same data.
4. Take boosting and build the error curves on training and on validation by the number of trees. Find
   the moment where overfitting begins.
5. Build a task on which a linear model beats boosting. Explain how this data differs.

The fifth point matters more than the rest: understanding where your favourite method loses is more
useful than knowing where it wins.

## Self-check

1. What does a tree optimise at each split?
2. Why does a tree not need feature normalisation, while a linear model does?
3. Why does a random forest deliberately worsen each individual tree?
4. How does bagging differ from boosting by what they cure?
5. Why is boosting called gradient?
6. How are the learning rate and the number of trees related?
7. Name two structural reasons boosting wins on tables.
8. Why can feature importances not be trusted under collinearity?

## Next

There are models, there are metrics. In [Module 7](../programme.md) — how to compare them honestly:
splits, cross-validation, leaks and peeking at the test. This is the last module of Part II and the
shortest, but it is the one that decides whether all the numbers obtained earlier mean anything.

> Before a network on a table, train boosting. If the network did not beat it, you built complexity
> for the sake of complexity.
