# Module 11. Language models

!!! abstract "After this module you will be able to"
    - Explain that a language model is a distribution over the next token, and why training on it needs no labels.
    - Read perplexity as "how many options the model wavers between at each step".
    - Say what temperature does at generation time and connect it to the softmax scale from Module 10.
    - Explain why quantisation to 8 and 4 bits barely drops quality, and where it does drop it.
    - Show on numbers why a benchmark that leaked into training is a leak from Module 7, and what it does to evaluation.

    **Time:** about three weeks. **Prerequisites:** [Module 10](10-sequences-and-attention.md).
    **Notebook:** [`notebooks/11-language-models.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/11-language-models.ipynb)

## Why this

Module 10 ended with a stack of transformer blocks. Train it to predict the next token and you get a
language model. Everything that separates GPT from a textbook example is the scale of data, parameters
and money, but not the principle. The principle fits in one sentence, and it is below.

This module is the last in Part III, and it closes it back onto Module 1. Language models compete on
leaderboards, and a leaderboard is a shop window of claimed improvements, almost every one checked as
poorly as everything in the field. Half the module is about how they are trained. The other half is
about why evaluating them honestly is harder than training them.

## Pre-training

One task from which everything grows: **predict the next token from the previous ones.**

$$P(\text{text}) = \prod_t P(x_t \mid x_1, \dots, x_{t-1})$$

The model outputs a distribution over the vocabulary, the correct answer is the actually-next token,
the loss is the cross-entropy from Module 5, the same $-\ln p$ for the correct class. Nothing new: the
transformer's last layer is a softmax classifier over $|V|$ classes, where $|V|$ is the vocabulary
size.

The key property — **no labels are needed.** The correct answer is already in the text: it is the next
word. Terabytes of text label themselves. This is why pre-training is called self-supervised: the label
is not set by a human, it is cut out of the data by a shift of one token.

!!! note "Tokenisation: why not words and not letters"
    A vocabulary of words does not hold typos, rare names and new terms. A vocabulary of letters makes
    the sequences long and the links distant — exactly the trouble attention fixed in Module 10. The
    compromise is **subwords**: frequent pieces ("work", "-ing", "tion") get their own token, rare ones
    are assembled from letters. The BPE algorithm builds such a vocabulary by greedily merging the most
    frequent pairs. Hence a quirk: the length in tokens is not the length in words, and on a rare
    language it takes more tokens for "the same meaning".

## Perplexity

How to measure how good a model is, before any generation.

**Perplexity** is the exponential of the average cross-entropy:

$$\mathrm{PPL} = \exp\!\left(-\frac{1}{n}\sum_t \ln P(x_t \mid x_{<t})\right)$$

It reads in human terms: **how many equally likely options the model wavers between at each step.** A
perplexity of 1 — the model knows the next token for certain. A perplexity of 100 — it wavers as if
between a hundred equally likely ones. Perfect text on an honest test gives low perplexity, random text
gives about the vocabulary size.

Perplexity is convenient and deceptive. It measures how well the model predicts text, not how useful it
is. A model can predict the next token excellently and be useless in conversation — and this is the
first gap we will return to in the section on evaluation.

## Fine-tuning

A pre-trained model can continue text. Answering a question like an assistant is a separate skill, and
it is added by fine-tuning.

**Supervised fine-tuning (SFT).** We show pairs of "instruction — good answer" and continue the same
next-token prediction, but now on them. The model picks up the format: to a question, answer with an
answer, not with another question.

**Preference training.** Next, pairs of answers "this one is better than that" are shown and the model
is shifted towards the preferred ones. Here the course first touches reinforcement learning: "better"
is a reward, and as soon as there is a reward, there is also its hacking.

<div class="lm-thread" markdown>
**Reward as a specification — ahead.** To optimise "an answer a human liked" is to optimise the human's
rating, not the usefulness. The model learns to sound convincing, including where it is wrong. This is
[Module 16](../programme.md): reward hacking and Goodhart's law. Here is the source: as soon as "good"
became a number, people start padding it.
</div>

## Inference and temperature

A trained model outputs a distribution at each step. How to get text from a distribution is a separate
decision, and it changes the answer more than it seems.

**Greedily** — take the most likely token. Safe and boring: the text repeats and goes in circles.

**By sampling** — draw a token at random by the distribution. Livelier, but with the full distribution
an absurdity sometimes falls out.

The sharpness of the distribution is governed by **temperature** — it divides the logits before
softmax:

$$P_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$

This is exactly the same knob that scaled attention in Module 10. A low $T$ makes the choice almost
greedy, a high one smears the distribution towards uniform.

<div class="lm-fig" data-lm-fig="next-token"></div>

Move the slider. At $T$ near zero the model is almost deterministic and repeats the most likely token.
At $T$ near two the distribution flattens, sampling becomes random, the text falls apart. The working
range is between them, and it is tuned to the task: code — low temperature, free text — higher.

<div class="lm-thread" markdown>
**One knob, two chapters.** In [Module 10](10-sequences-and-attention.md) dividing the logits by
$\sqrt{d}$ kept attention soft. Here dividing the logits by $T$ keeps generation controllable. The same
softmax, the same sharpness of a distribution — only applied to different places in the network.
</div>

In practice the full distribution is truncated: **top-k** keeps the $k$ most likely tokens, **top-p**
(nucleus) the smallest set covering probability $p$. The tail of absurd but non-zero options is cut off
before sampling.

!!! note "The KV cache: why inference is cheaper than it seems"
    Naively, each new token would require recomputing attention over the whole history from scratch. But
    the keys and values of the already-computed tokens do not change — they are held in a **KV cache**
    and reused. Hence a practical consequence: the memory for inference grows with the context length,
    and on long dialogues it is the cache, not the weights, that becomes the bottleneck.

## Quantisation

A trained model is gigabytes of weights in float32. Most of it is redundant: precision to the seventh
decimal in a weight that is already approximate decides nothing.

**Quantisation** stores the weights in 8 or 4 bits instead of 32. The memory falls fourfold to
eightfold, and with it the demand on the graphics card: a model that needed a card costing thousands
fits into a consumer one.

Why the quality barely suffers: the rounding error of one weight is small and averages out over many
weights, and the network is robust to small noise in the weights — the same robustness that let SGD be
noisy in Module 4. Where it suffers: the bits go unevenly, a few "outlier" weights carry
disproportionately much, and coarse rounding of exactly those drops the quality noticeably. This is why
good quantisation schemes store the outliers more precisely than the rest.

In the notebook this is measured on a bigram: perplexity against the number of bits. Down to a few bits
the curve barely moves, below that it slowly rises. On a toy model the effect is weak, because the
predictions are already almost certain; real weights have less slack, and so 8 and 4 bits are in use.

## Evaluation, and why it is harder than it seems

The main section of the module, and it brings us back to Module 1.

Training a language model has become routine. Saying honestly that one is better than another is still
hard, and harder than in any task so far.

**Perplexity measures the wrong thing.** Low perplexity means the model predicts text well, not that it
is useful, truthful or safe. Two models with the same perplexity behave differently in conversation.

**An open-ended answer cannot be measured automatically.** Classification has a correct class,
translation a reference. "Write an essay" has no correct answer. Hence the fashion for a **judge
model**: one LLM rates the answers of another. The trick works and drags its own troubles — the judge is
biased towards its own style, towards length, towards a confident tone. It is an evaluation that itself
needs evaluating, and the circle does not always close.

**A benchmark leaks into training.** Here is the direct link with Module 7. If the test's questions
ended up in the training corpus — and it is assembled from the whole internet, where these tests lie —
the model has seen them. A high score means it memorised them, not that it solves them. This is a leak
from Module 7, only harder to spot: the training corpus is closed, and there is no way to check what is
in it.

<div class="lm-fig" data-lm-fig="dist-overlap"></div>

The picture is the same one that opened the course. Two numbers on a leaderboard whose intervals overlap
are not "model A is better" but "the difference is not shown". For language models this holds doubly:
they are run on three prompts instead of thirty seeds, and the result is sensitive to the wording of the
prompt no less than to the model itself.

<div class="lm-thread" markdown>
**A leaderboard is a poor source of truth.** A claimed superiority of an LLM survives a change of
prompt, an honest baseline and a check for test leakage about as rarely as everything in the field. How
to use it without believing blindly is [Module 25](../programme.md). And how to check a claim by hand
you already know from [Module 1](01-claim-baseline-noise.md): quantity, conditions, baseline.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/11-language-models.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/11-language-models.ipynb).
Only `numpy` and `matplotlib`, no gradient training — the model is character-level and built by counting,
so that each step is visible and computed instantly.

What is inside:

1. A character model from counts: bigrams and trigrams on a small corpus. The next-character
   distribution — by hand.
2. Perplexity: we compute it on held-out text, compare the bigram with the trigram. More context — lower
   perplexity.
3. Generation with temperature: the same text at $T = 0.3$, $1.0$, $1.6$. It is visible how greed
   smothers and high temperature scatters.
4. Quantisation of the logit table: perplexity against the number of bits. Where the curve moves.
5. Benchmark leakage: perplexity on text the model has seen against unseen. The gap is the cost of test
   contamination, computed rather than told.

### Part 2. The prompt as a seed

Take any open model through a ready interface and one question with a checkable answer.

1. Ask it five ways: different wording, the same in meaning.
2. Record the five answers. Did they agree in substance.
3. Change the temperature and repeat one prompt three times.
4. Write a conclusion: what here is a property of the model, and what a property of the prompt and the
   seed.

The point is the same as in Module 1: one observation is not a property. The prompt here plays the role
of the seed.

## Assignment

1. Derive why the cross-entropy of next-token prediction is the negative log-likelihood of the text.
2. Implement perplexity and show on your own text that a trigram's is lower than a bigram's. Explain why
   this does not mean the trigram is "better".
3. Implement top-p sampling and show at what $p$ the absurdities disappear but the text has not yet
   collapsed into greed.
4. Take your model's probability table, coarsen it to 4 and 2 bits, plot perplexity against bits. Find
   where it moves.
5. Deliberately mix a chunk of the test into the training and measure how much the perplexity on it
   dropped. This is your own demonstration of benchmark contamination.

The fifth point is the one that cannot be copied, and it is also the most useful: with your own hands you
will get an inflated score from a leak and see how easily it happens.

## Self-check

1. What does a language model predict and why does it need no labels for it?
2. Read perplexity in words. What does a perplexity equal to the vocabulary size mean?
3. What does temperature do and which knob from Module 10 does it coincide with?
4. How does SFT differ from preference training? Where does the reward appear here?
5. Why does quantisation to 8 bits barely drop quality, while a few weights drop it?
6. Why does low perplexity not mean the model is useful?
7. How is benchmark contamination related to the leak from Module 7 and why is it harder to catch?

## Next

Part III is finished: from a fully connected network to a language model, and all of it in NumPy by
hand, with an honest comparison at every step. In [Part IV](../programme.md) reinforcement learning
appears, and with it the environment, the reward and the policy. The bridge is already thrown: the
preference training from this module is RL, and the reward hacking we touched on becomes a topic of its
own there.

> A language model is a distribution over the next token, trained on text that labels itself. Training
> it has become easy. Saying honestly that it is better than another has not.

---

!!! quote "The principle"
    A high score on a benchmark that was lying on the internet is memory, not ability. Before believing a
    number from a leaderboard, ask the same as in Module 1: what it is compared against, how many times it
    was run, and whether the model saw the answer in advance.
