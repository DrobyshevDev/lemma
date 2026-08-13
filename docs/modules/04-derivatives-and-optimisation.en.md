# Module 4. Derivatives and optimisation

!!! abstract "After this module you will be able to"
    - Read the gradient as the direction of steepest increase and explain why descent goes against it.
    - Apply the chain rule by hand — the very operation from which backprop is assembled in Module 8.
    - Check an analytic gradient against a numerical one. This is the main trick for debugging training.
    - Show on a graph what too large a step does and what too small a step does.
    - Explain the zigzag of descent through the condition number from Module 3.

    **Time:** about two weeks. **Prerequisites:** [Module 3](03-linear-algebra.md).
    **Notebook:** [`notebooks/04-derivatives-and-optimisation.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/04-derivatives-and-optimisation.ipynb)

## Why this

Regression in Module 3 was solved exactly: one equation, an answer. That is a rare piece of luck.
Almost all the other tasks in the course have no exact solution — neither a neural network, nor a
policy in RL, nor a recommender model.

One trick remains, and it is also the last: start with a bad answer and improve it in small steps
until there is nothing left to improve. All training in this course is that. The difference between
methods comes down to how to compute the direction of the step and how long to make it.

## The derivative

The derivative is the rate of change of a function. By how much $f$ grows if you increase $x$ a
little.

$$f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}$$

The definition through a limit matters for one thing: **the derivative can always be computed
numerically**, by substituting a small $h$ for the limit. This is slow and imprecise, but it does
not require deriving a formula, and so it is the ideal way to check a formula you derived.

The trick is called a gradient check, and in Module 8 it will save you more than one day. The
analytic formula and the numerical estimate must agree to several digits. They did not agree — the
error is in the derivation, not in the data.

What you will need from the table of derivatives:

| $f(x)$ | $f'(x)$ |
|---|---|
| $x^n$ | $nx^{n-1}$ |
| $e^x$ | $e^x$ |
| $\ln x$ | $1/x$ |
| $\sigma(x) = \frac{1}{1+e^{-x}}$ | $\sigma(x)(1 - \sigma(x))$ |

The last row is the sigmoid. Its derivative is expressed through itself, and this is one of the
reasons it was the favourite activation function for so long.

## The gradient

For a function of many variables the derivative is taken with respect to each separately. Gathered
into a vector, the partial derivatives form the **gradient**:

$$\nabla f = \left(\frac{\partial f}{\partial x_1}, \dots, \frac{\partial f}{\partial x_n}\right)$$

One property makes it useful: **the gradient points in the direction of steepest increase**, and its
length equals the rate of increase in that direction.

Hence the whole method. Want a minimum — go against the gradient:

$$x_{t+1} = x_t - \eta \nabla f(x_t)$$

$\eta$ is the step length, the learning rate. All training in the course is this line, repeated
millions of times.

!!! note "Why steepest increase specifically"
    The change in $f$ under a small step $\delta$ equals $\nabla f \cdot \delta$ — the dot product
    from Module 3. For a fixed step length it is maximal when $\delta$ is aligned with $\nabla f$.
    Maximum increase — along the gradient, maximum decrease — against it.

    Here the dot product from the previous module works not as a metaphor but as a proof.

## The chain rule

A function of a function. The derivative is the product of derivatives:

$$\frac{d}{dx}f(g(x)) = f'(g(x)) \cdot g'(x)$$

This is the most important rule in the course. A neural network is a composition: a layer of a layer
of a layer. Backpropagation is the chain rule applied along this composition from right to left, and
there is nothing more to it.

!!! example "Take it apart on the loss function"
    Logistic regression: $z = w \cdot x$, prediction $p = \sigma(z)$, loss
    $L = -\big(y\ln p + (1-y)\ln(1-p)\big)$.

    We need $\partial L/\partial w$. We go along the chain from right to left:

    $$\frac{\partial L}{\partial p} = \frac{p - y}{p(1-p)}, \qquad
      \frac{\partial p}{\partial z} = p(1-p), \qquad
      \frac{\partial z}{\partial w} = x$$

    Multiply:

    $$\frac{\partial L}{\partial w} = \frac{p-y}{p(1-p)} \cdot p(1-p) \cdot x = (p - y)\,x$$

    Everything cancelled. The gradient is the prediction error times the input. The same form comes
    out for linear regression and for the last layer of a network with softmax: this is not a
    coincidence but a property of a correctly matched pair of "activation function plus loss
    function".

## Gradient descent and the step length

The direction is known. What remains is the step length, and it decides everything.

**Too small an $\eta$.** Descent converges, but slowly. Thousands of steps where dozens would have
been enough. Annoying, but not fatal.

**Too large an $\eta$.** The step overshoots the minimum and lands higher than it was. The next one
overshoots more. The loss grows, then becomes `nan`. This is not "the model does not learn" — it is
the arithmetic of a diverging sequence.

**The right $\eta$** is found by trial, and it is chosen by the loss graph: the loss should fall
monotonically and fast. The graph is not a decoration of the report but a working instrument.

!!! tip "The first thing to do when training will not go"
    Reduce the step tenfold and run again. In most cases this is the diagnosis: it went — it was too
    large; it did not go — look for an error in the gradient, and look for it through a gradient
    check.

## The ravine

Now why one step is not enough.

Take a function whose minimum lies at the bottom of a long narrow ravine. The gradient on the slope
points across the ravine, not along it. The descent bangs from wall to wall and advances towards the
minimum slowly.

The steepness of the walls relative to the flatness of the floor is the **condition number** from
Module 3. The larger it is, the narrower the ravine and the stronger the zigzag.

Hence two remedies, and both will appear later in the course.

**Feature normalisation.** Brings the cloud to a round shape, reduces $\kappa$, straightens the
trajectory. This is what scaling the data is for. Not "it is the custom", but because otherwise the
descent goes in a zigzag.

**Momentum.** The step accumulates inertia:

$$v_{t+1} = \beta v_t + \nabla f(x_t), \qquad x_{t+1} = x_t - \eta\, v_{t+1}$$

Oscillations across the ravine cancel each other, motion along the floor accumulates. One extra line,
and convergence on ill-conditioned tasks speeds up several times over.

## Stochastic descent

The last piece. Computing the gradient over the whole dataset is expensive: a million objects — a
million terms per step.

**SGD** computes the gradient over a random subset — a batch. The estimate comes out noisy, but the
number of steps per second is orders of magnitude larger.

The noise here is not only a cost but also a benefit. An exact gradient gets stuck in the very first
local minimum. A noisy one is shaken out of a shallow minimum and moves on.

The batch size is a trade between the quality of the gradient estimate and the number of steps. From
Module 2 the rate is known: the estimate's noise falls as $\sqrt{\text{batch size}}$. A batch four
times larger gives a gradient half as noisy and a step four times as expensive.

## Practice

### Part 1. The notebook

Open [`notebooks/04-derivatives-and-optimisation.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/04-derivatives-and-optimisation.ipynb).

What is inside:

1. The numerical derivative against the analytic one. We tune $h$: too large — approximation error,
   too small — rounding error.
2. A gradient check on the logistic loss. The very trick for Module 8.
3. Descent on a quadratic function, the trajectory on the level lines.
4. A sweep over the step: convergence, slow convergence, divergence into `nan`.
5. The ravine: the same task with condition number 50. The zigzag is visible to the eye.
6. Momentum on the same task. We count by how many times fewer the steps are.
7. SGD against full descent on regression: steps per second against smoothness.

### Part 2. Your own regression, but by descent

Take the regression from Module 3, where the answer is already known exactly.

1. Solve it by gradient descent from scratch, without `lstsq`.
2. Compare the weights with the exact solution. How close and in how many steps.
3. Scale the features and repeat. How many steps now.
4. Compute the condition number before and after scaling. Relate it to the number of steps.

The point of the exercise is that the right answer is known in advance. Later in the course it never
will be, and the experience of "the descent converged where it should" is worth getting now.

## Assignment

1. Derive the sigmoid's derivative from the definition. Confirm that you get $\sigma(1-\sigma)$.
2. Derive $\partial L/\partial w$ for linear regression with a quadratic loss. Compare with the
   logistic one from the text.
3. Implement a gradient check as a function: it takes a function, an analytic gradient and a point,
   returns the relative discrepancy. It will come in handy in Module 8.
4. Find the largest step at which descent on $f(x) = x^2$ still converges. The answer should be an
   exact number, not a tuned one.
5. Build a task with a condition number of about 1000 and show by how many times momentum cuts the
   number of steps.

## Self-check

1. Why does descent go against the gradient, not along it?
2. What happens with too large a step and how does it look on the loss graph?
3. State the chain rule and explain why without it there is no training of networks.
4. Why does everything in the logistic regression gradient cancel down to $(p-y)x$?
5. What is a gradient check and why is it the first thing to do when you suspect an error?
6. How is the condition number related to the zigzag of descent?
7. Why are features normalised — the geometric answer, not "it is the custom".
8. How is the noise of SGD useful, not only harmful?

## Next

Part I is finished. Now there is a language: claim and baseline, parameter and estimate, vector and
matrix, gradient and step. Next it gets applied.

In [Part II](../programme.md) the first real models appear — linear, trees, boosting. They will also
be the baselines for everything that comes after. Half of the claimed breakthroughs are beaten by
properly tuned boosting, and you need to see that with your own hands before the neural networks
begin.

> Training is one line: a step against the gradient. Everything else in the course is how to compute
> the direction and how long to make the step.
