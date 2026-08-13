# Module 8. Fully connected networks and backprop

!!! abstract "After this module you will be able to"
    - Explain why without a nonlinearity between layers a network stays a linear model.
    - Derive the backward-pass formulas for a fully connected layer rather than copy them.
    - Write a network from scratch in NumPy and pass its gradient check from Module 4.
    - Show on numbers why zero initialisation does not work, and why too large a one breaks training.
    - Compare a network with the boosting from Module 6 honestly, and accept the result whatever it is.

    **Time:** about two weeks. **Prerequisites:** [Module 7](07-honest-comparison.md).
    **Notebook:** [`notebooks/08-neural-networks-and-backprop.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/08-neural-networks-and-backprop.ipynb)

## Why this

Part I gave the tools, Part II the models and the procedure of honest comparison. Part III begins what
half the people who come to machine learning come for.

It begins with a disappointment, and that is useful. A neural network is not a new principle. It is a
composition of the linear transformations from Module 3 and the gradient descent from Module 4, glued
together by the chain rule from there too. There is nothing else in it.

The whole module is written in NumPy by hand. PyTorch appears in the next one, when it becomes clear
what exactly it spares you from doing.

## Why one layer is not enough

A linear model draws a hyperplane. Data it cannot separate is built in a minute: four XOR points,
where the class is determined by the disagreement of two features.

A hyperplane separating them does not exist. Not "hard to find" — does not exist.

The natural thought: put two linear layers in a row. It will not help.

$$W_2(W_1 x) = (W_2 W_1)\,x = W x$$

A composition of linear transformations is a linear transformation. From Module 3: a product of
matrices is a matrix. A hundred layers in a row give exactly the same as one.

**Between the layers there must be a nonlinearity.** Not for beauty and not "to learn better" —
without it depth simply does not exist.

## Activation functions

| | Formula | Derivative | The trouble |
|---|---|---|---|
| Sigmoid | $\sigma(z) = \frac{1}{1+e^{-z}}$ | $\sigma(1-\sigma)$ | maximum 0.25, the gradient vanishes |
| Hyperbolic tangent | $\tanh z$ | $1 - \tanh^2 z$ | maximum 1, but saturates at the edges |
| ReLU | $\max(0, z)$ | 0 or 1 | at $z<0$ a neuron can die forever |

The main thing about the sigmoid — its derivative **nowhere exceeds 0.25**. The chain rule multiplies
the derivatives across layers, and in a network of ten sigmoid layers the gradient at the first layer
is multiplied by $0.25^{10} \approx 10^{-6}$. The first layers stop learning.

This is the **vanishing gradient**, and it kept deep networks dead until the late 2000s.

ReLU cures this by having its derivative equal exactly one over the whole positive half. Multiplying
ones vanishes nothing. The price — if a neuron went into the negative region on all examples, its
gradient is zero forever, and it is dead.

## The forward pass

A network of $L$ layers. For layer $l$:

$$z^{(l)} = W^{(l)} a^{(l-1)} + b^{(l)}, \qquad a^{(l)} = f(z^{(l)})$$

where $a^{(0)} = x$ is the input, $f$ is the activation, and on the last layer there is usually no
activation: there is a sigmoid for two classes, softmax for many, nothing for regression.

That is all. The forward pass is a loop of two lines.

## The backward pass

Now the main thing in the module.

We need $\partial L/\partial W^{(l)}$ for each layer. We go by the chain rule from right to left.

Introduce $\delta^{(l)} = \partial L / \partial z^{(l)}$ — how sensitive the loss is to the input of
layer $l$'s activation. Through this quantity everything is expressed briefly.

**The last layer.** For the "sigmoid plus log loss" pair from Module 5 everything cancels:

$$\delta^{(L)} = a^{(L)} - y$$

The same formula $(p - y)$ that was there. The cancellation is not a coincidence: the loss function and
the last activation are matched into a pair exactly for its sake.

**A step back through a layer.** Knowing $\delta^{(l)}$, we get the previous one:

$$\delta^{(l-1)} = \left( W^{(l)\mathsf{T}} \delta^{(l)} \right) \odot f'(z^{(l-1)})$$

It reads in parts. $W^{\mathsf{T}}\delta$ is the error decomposed back onto the neurons of the previous
layer in proportion to the weights by which they influenced it. $\odot f'$ is an element-wise
multiplication by the derivative of the activation: a neuron in saturation barely influences anything,
so it is barely to blame either.

**The parameter gradients.**

$$\frac{\partial L}{\partial W^{(l)}} = \delta^{(l)} a^{(l-1)\mathsf{T}}, \qquad
  \frac{\partial L}{\partial b^{(l)}} = \delta^{(l)}$$

The first formula is the same "error times input" structure that logistic regression had in Module 4.
It has not changed, it is just now applied to each layer.

!!! note "What backprop actually is"
    Backpropagation is not a training algorithm. It is a way to compute the gradient in one pass
    instead of $N$ passes, where $N$ is the number of parameters.

    The training is still done by the gradient descent from Module 4. Backprop only delivers the
    gradient to it, and its sole merit is efficiency: it reuses the already computed $\delta$ instead
    of recomputing the derivative for each weight anew.

    A naive numerical gradient for a network with a million parameters would require two million
    forward passes per step. Backprop gets by with one forward and one backward.

## Initialisation

A question that looks technical and decides whether the network will learn at all.

**Zeros are not allowed.** If all the weights of a layer are equal, all its neurons get the same input,
give the same output and get the same gradient. They stay identical forever. A layer of a hundred
neurons works like one. This is called the symmetry problem, and it is broken only by randomness.

With zeros specifically it is even sharper. The first layer's gradient goes back through the second
layer's weights — the formula $W^{\mathsf{T}}\delta$ above — and they are zero. So it is **identically
zero**, and the first layer does not move at all, not by a single step. In the notebook this is
visible: after three hundred steps all its weights are still exactly zero.

**Too large is not allowed.** The activations grow from layer to layer, the sigmoid goes into
saturation, its derivative falls almost to zero — training stalls.

**Too small is not allowed.** The signal vanishes with depth and noise reaches the last layers.

The working rule is to keep the variance of the signal constant across layers. Hence two standards:

$$\text{Xavier: } \mathrm{Var}(W) = \frac{1}{n_{\text{in}}}, \qquad
  \text{He: } \mathrm{Var}(W) = \frac{2}{n_{\text{in}}}$$

Xavier for symmetric activations (tanh), He for ReLU — the two compensates for the fact that ReLU
zeroes out half the values.

## The gradient check

Module 4 gave a trick, and Module 8 the task it is needed for.

The backward-pass formulas are derived by hand, and it is easy to make a mistake in them: a
transposition swapped, a factor lost, the wrong summation axis. The error does not lead to a crash —
the network simply learns worse than it could, and it is impossible to tell.

**The rule: wrote a layer — check its gradient check before training.** A relative discrepancy less
than $10^{-7}$ means the formula is correct. More than $10^{-4}$ means an error.

This takes a minute. Finding the same error without a gradient check takes a day.

## The network against boosting

The last section of the module, and it is a test of honesty.

In Module 6 boosting beat a linear model on tabular data twofold. Now we have a network. Will it beat
boosting?

We set up the experiment by the rules of Module 7: the same data, an equal tuning budget, five splits,
confidence intervals by the bootstrap from Module 1.

A spoiler, because hiding the result is exactly what the whole course is written against: **on tabular
data the network does not beat boosting.** The reasons are examined in Module 6, and they are
structural.

The useful conclusion is not that networks are bad. It is that **being able to train a network does not
mean it should be trained.** In parts IX–XI tasks will appear where the network wins by a landslide:
images, sequences, text. There is structure there it extracts value from. In a table there is none.

## Practice

### Part 1. The notebook

Open [`notebooks/08-neural-networks-and-backprop.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/08-neural-networks-and-backprop.ipynb).

What is inside:

1. XOR: a linear model cannot, a network with one hidden layer can. The decision boundary is visible.
2. A layer as an object: the forward pass in three lines.
3. The backward pass and its gradient check. Then — a deliberately spoiled formula, to see how the
   check catches it.
4. Initialisation: zeros, too large, He. Three learning curves.
5. The vanishing gradient with depth: sigmoid against ReLU, the first layer's gradient in numbers.
6. The network against boosting on the tabular data of Module 6, with intervals.

### Part 2. Your own network

1. Add one more activation to the notebook's code — tanh or Leaky ReLU.
2. Check its gradient check. Until it agrees — do not train.
3. Build the learning curves for three activations on the same data and seeds.
4. Find the depth at which a sigmoid network stops learning altogether. Compute the first layer's
   gradient and compare with $0.25^{\text{depth}}$.

## Assignment

1. Derive on paper $\delta^{(l-1)}$ through $\delta^{(l)}$. Without looking at the text.
2. Prove that two linear layers without an activation are equivalent to one. Two lines are enough.
3. Implement softmax and cross-entropy for several classes. Show that $\delta^{(L)}$ again equals
   $a - y$.
4. Initialise a network with zeros and show numerically that all the hidden layer's neurons stay
   identical after a hundred steps.
5. Take your own tabular task from Module 6 and repeat the comparison with boosting honestly. Write the
   conclusion in the Module 1 format: quantity, conditions, baseline.

The fifth point is the same as in Module 6, and that is deliberate. Now you have one more model, and
the rules of comparison have not changed.

## Self-check

1. Why does depth give nothing without a nonlinearity?
2. What does the maximum of the sigmoid's derivative equal, and what follows from that for deep
   networks?
3. What is $\delta^{(l)}$ in words?
4. Explain $W^{\mathsf{T}}\delta$ and the element-wise multiplication by $f'$ separately.
5. Is backprop a training algorithm? If not, then what?
6. Why can the weights not be initialised with zeros?
7. Where does the two in He initialisation come from?
8. The network lost to boosting on a table. What conclusion follows from that, and what does not?

## Next

In [Module 9](../programme.md) convolutions appear — the first architecture that uses the structure of
the data rather than just grinding through features. There too the network will win against boosting
for the first time, and win by a wide margin.

> A neural network is a composition of linear layers glued by the chain rule. Being able to train it
> does not mean it should be trained.
