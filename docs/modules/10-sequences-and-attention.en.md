# Module 10. Sequences and attention

!!! abstract "After this module you will be able to"
    - Explain why a recurrent network handles a long-range dependency poorly: it does not "forget" but carries the signal through as many steps as there are words between them.
    - Derive attention from one sentence — a weighted average of values, where the weights are set by how similar the query is to the keys — and read the formula aloud.
    - Say what the division by $\sqrt{d}$ is for, and show by hand that without it the softmax saturates.
    - Tell self-attention from attention between two sequences, and explain what several heads add.
    - Explain why attention on its own does not know the order of words, and what positional encoding fixes.
    - Say why an attention map is not an explanation of a decision, and which type of mistake from Module 1 that is.

    **Time:** about three weeks. **Prerequisites:** modules [8](08-neural-networks-and-backprop.md) and [9](09-convolutions.md).
    **Notebook:** [`notebooks/10-sequences-and-attention.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/10-sequences-and-attention.ipynb)

## Why this is here

The convolution from [Module 9](09-convolutions.md) looks into a window of a fixed size. For an
image that is right: neighbouring pixels are related, distant ones almost not. For text — no. In
the sentence "the cat, which I saw yesterday at the neighbour's, sat on the mat" the subject and
the predicate are a dozen words apart, and the link between them is no weaker than between
neighbours.

What is needed is a layer for which the distance between words does not turn into a cost.
Attention is that layer. It displaced the recurrent networks on which language used to be modelled,
and it is what all the language models from [Module 11](../programme.md) stand on.

## Recurrence and its ceiling

A recurrent network (RNN) reads a sequence one element at a time and carries a state:

$$h_t = f(h_{t-1}, x_t)$$

The state $h_t$ is a compressed memory of everything that came before step $t$. The idea is honest
and until 2017 was the main one. It has two ceilings, and both are structural, not from a lack of
parameters.

**Path length.** For information from the first word to reach the hundredth, it passes through a
hundred applications of $f$. At each step something is lost and something is mixed in. The gradient
on the backward pass travels the same path and along the way either vanishes or explodes — this is
exactly the vanishing gradient from [Module 8](08-neural-networks-and-backprop.md), only here the
depth equals the length of the sequence, not the number of layers.

**No parallelism.** $h_t$ cannot be computed until $h_{t-1}$ is. A sequence of length $n$ is $n$
steps that cannot be spread across a GPU at once. Training runs up not against the arithmetic but
against its order.

LSTM and GRU — recurrent networks with gates — push back the first ceiling but remove neither it
nor the second. Attention removes both at once: the path between any two words becomes length one,
and all paths are computed in parallel.

## Attention: query, key, value

One sentence, from which everything else follows:

!!! quote ""
    Attention is a weighted average of values, where the weight of each value is larger the more
    the query resembles its key.

Break it into three roles. Each word has three vectors, obtained from its representation by three
learnable matrices:

**The query** $q$ — what this word is looking for. **The key** $k$ — by what others find it.
**The value** $v$ — what it gives up when it is found.

The similarity of a query to a key is the dot product $q \cdot k$: larger when the vectors are
aligned. We stack all $n$ similarities of one query into a vector, run it through softmax — and get
weights, non-negative and summing to one. The answer for this word is the sum of values with these
weights.

For the whole sequence at once, with matrices $Q, K, V$ (a row per word):

$$\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\!\left(\frac{Q K^\top}{\sqrt{d_k}}\right) V$$

Read it aloud, as the [formula-reading rule](../how-to-study.md) requires: "$QK^\top$ is all the
similarities of all queries to all keys; divide by the square root of the dimension; softmax along
the row turns similarities into weights; multiply by $V$ — take the weighted average of values". If
it read out, the formula is understood. If not — go back a paragraph, to the three roles.

The matrix $QK^\top$ of size $n \times n$ is where the path length disappeared: in it stands, at
once, the link of every word to every other, without walking down a chain.

## Click a word

Below is self-attention on a toy sentence. Choose a query word; the second row lights up by the
weights: brighter where that word attends more. The similarities here are set by hand, so the
picture means something — in a real network they are set by learned $Q$ and $K$.

<div class="lm-fig" data-lm-fig="attention"></div>

The scale slider is not decoration. It divides the similarities before softmax, exactly as
$\sqrt{d_k}$ does in the formula. Move it left: attention becomes sharp, the word looks almost at a
single point. Right: it smears out across all words evenly. The next section is about why the right
value of the scale is exactly $\sqrt{d_k}$.

## Why divide by $\sqrt{d}$

A claim worth checking by hand rather than taking on faith.

The dot product of two random vectors of dimension $d$ with independent components of variance 1
itself has variance $d$: it is a sum of $d$ independent terms. So as the dimension grows the
elements of $QK^\top$ swell like $\sqrt{d}$.

What softmax does with this: the larger the spread of the inputs, the closer it is to
"winner-takes-all". On large numbers it outputs almost one-hot — all the mass on one word, zero for
the rest. And where the output is almost constant, the derivative is almost zero: learning stalls.
This is the same saturation as in the sigmoid in [Module 8](08-neural-networks-and-backprop.md), and
the same disease — the vanishing gradient.

Dividing by $\sqrt{d_k}$ returns the variance of the similarities to one, regardless of the
dimension. Attention stays soft, the gradient stays alive.

!!! note "This is not an argument but a measurement"
    In the notebook you will generate random $Q, K$ for growing $d$ and compute the average maximum
    softmax mass with and without the division. Without the division it creeps towards one —
    attention collapses. With the division it holds. The check takes fifteen lines and answers "why
    $\sqrt{d}$" with a number, not with words.

## Self-attention and heads

When $Q$, $K$ and $V$ are obtained from a single sequence, that is **self-attention**: words look at
each other. When $Q$ comes from one sequence and $K$ and $V$ from another — that is **attention
between** them, and translation stands on it: a word of the translation looks for which words of
the original to lean on.

A single attention averages — and in that lies its weakness: one head can hold one kind of link.
**Several heads** compute attention in parallel in different subspaces (their own triple of matrices
per head), the results are concatenated. One head follows the agreement of subject and predicate,
another what a pronoun refers to. Not because they were assigned this: it comes out that way after
training, and this is exactly the case where an after-the-fact explanation is easily taken for the
cause — see the last section.

## Attention does not know order

Take positions out of your head and look at the formula again. Permute the rows of $Q$, $K$, $V$ in
one and the same order — the output permutes the same way but does not change in composition.
Attention is an operation over a **set**, not over a sequence: "the cat sat on the mat" and "the mat
sat on the cat" differ for it only in which values end up in the sum, but not in their order.

This is a direct pair with [Module 9](09-convolutions.md): the convolution is **equivariant** to a
shift — shift the input, the output shifts. Attention is equivariant to any permutation, and that is
already too much: the order of words carries meaning, and the layer does not see it.

It is fixed by adding to each word a vector that depends on the position — a **positional encoding**.
Sinusoids of different frequencies, or a learnable table; what matters is that after this the same
word at different places enters the sum differently, and the order stops being invisible.

## The transformer block

A transformer is a stack of identical blocks. In each are two sublayers: self-attention and a
positional MLP (one and the same small network applied to each word separately). Around each are two
tricks from [Module 8](08-neural-networks-and-backprop.md):

**The residual connection** — the sublayer's output is added to its input rather than replacing it.
The gradient gets a short road bypassing the sublayer, and a deep stack trains.

**Normalisation** keeps the scale of the activations in check from block to block.

That is all. Attention mixes information between words, the MLP processes each word, the residual and
the norm make the stack trainable. The language model from [Module 11](../programme.md) is such a
stack, trained to predict the next word.

## Attention is not an explanation

An attention map is pleasant to present as an explanation: "the model looked at this word, and so it
answered this way". The temptation is large, the picture convincing. The claim, meanwhile, is most
often unchecked.

An attention weight says where a value on the next layer's input came from. It does not say that the
answer depended on that word: the signal passes through the MLP, the residual and a dozen blocks
above, and there it is mixed again. There is work in which attention weights are changed without
touching the output — which means they could not have been the cause of the output. There is the
opposite. The argument is open, and that is the substantive state of the question.

For the course what matters is not the side of the argument but the type of mistake: **a pretty map
is not a proof of a link**. This is the same green pipeline as in Module 1, only instead of "the
notebook ran" it is "the visualisation looks meaningful". And the same after-the-fact reading as with
the attention heads: seeing structure in a trained system is easy, showing that it is the cause is
separate work.

<div class="lm-thread" markdown>
**One word — two different things.** Attention here is a mechanism inside the network. In
[Module 19](../programme.md) attention is a scarce human resource that the feed competes for, and the
recommender system optimises exactly it. The course keeps both senses side by side not for the pun:
in both, "attention" is a distribution of a limited mass over many objects, and the question is one —
who reallocates it, and towards what.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/10-sequences-and-attention.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/10-sequences-and-attention.ipynb).
Only `numpy` and `matplotlib`, runs in seconds, no training — attention is built by hand, so that
each step is visible.

What is inside:

1. Softmax and scaled attention from scratch, in five lines.
2. Softmax saturation: the average maximum mass as a function of dimension, with and without the
   division by $\sqrt{d}$. The answer to "why $\sqrt{d}$" — as a graph.
3. Attention as retrieval: keys-as-positions from which a query pulls out the right value. It is
   visible that attention is a differentiable lookup.
4. Self-attention on a toy sentence and its map — the same as the figure above, but computed, not
   drawn.
5. A permutation check: the same sequence in a different order gives the same set of answers, until a
   positional encoding is added.

Go through it twice, as in the [rules](../how-to-study.md): the first time whole, the second time
breaking it.

### Part 2. Break it

At the end of each section of the notebook it says what to break. At a minimum: remove the division
by $\sqrt{d}$ and look at the attention map at $d = 128$; remove the positional encoding and check
that predicting the order fell apart; leave one head instead of several and find the link it stopped
holding.

## Assignment

Take a short text — three or four sentences — and your own implementation of self-attention from the
notebook.

1. Build the attention map for one layer with one head. Write out the three word pairs with the
   largest weight.
2. For each pair, answer in writing: is this a meaningful link or an artefact? How would you check
   rather than guess?
3. Change the input so that the weights do not change but the "explanation" becomes meaningless. If
   it worked — you have shown by hand why an attention map is not an explanation.
4. Add a positional encoding and show on numbers that now permuting the words changes the output.

The third point is the one that cannot be copied: it is about checking a claim, not about running
code.

## Self-check

Answer aloud, without looking.

1. Why is a long-range dependency hard for a recurrent network? Name both reasons, and which of them
   gates do not fix.
2. Read the attention formula in words, without naming any letter twice.
3. What exactly swells as the dimension grows and why does it break softmax? What does dividing by
   $\sqrt{d}$ fix?
4. How does self-attention differ from attention between two sequences? Where is the second one
   needed?
5. What do several heads add and why can't you make do with one large one?
6. Why does attention without a positional encoding not distinguish the order of words? What is it
   paired with from Module 9?
7. You are given a pretty attention map. What does it prove about the model's decision, and what does
   it not?

## Next

In [Module 11](../programme.md) this stack of blocks becomes a language model: pre-training on
predicting the next word, fine-tuning, inference and quantisation. And there too — why evaluating a
language model is harder than it seems, and how that brings us back to Module 1: a claimed
improvement of an LLM survives a change of seed and an honest baseline about as rarely as everything
else in the field.

---

!!! quote "The principle"
    The distance between words stopped being a cost — but the map of who looked at whom stayed a
    description, not an explanation. A pretty visualisation is checked the same way as a green
    pipeline: not by whether it is convincing, but by whether it survives an attempt to break it.
