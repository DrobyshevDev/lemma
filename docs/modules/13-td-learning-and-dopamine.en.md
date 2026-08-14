# Module 13. TD learning and dopamine

!!! abstract "After this module you will be able to"
    - Explain how learning without a model of the environment differs from the value iteration of Module 12.
    - Write the reward prediction error δ and read it as "got minus expected".
    - Understand bootstrapping: learning an estimate from another estimate, not from the outcome.
    - Show by hand how value spreads backward from the reward, and how the error spike moves to the predictive cue.
    - Explain why the firing of dopamine neurons in Schultz's experiments matched the δ signal, and what predicted what here.

    **Time:** about two weeks. **Prerequisites:** [Module 12](12-environment-reward-policy.md).
    **Notebook:** [`notebooks/13-td-learning-and-dopamine.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/13-td-learning-and-dopamine.ipynb)

## Why this

In Module 12 value was computed with a known model of the environment: the transitions and rewards were
given in advance, and value iteration was run over them. In a real task there is no model. The agent does
not know where an action leads or what it will be paid for it — it finds this out by acting.

So value has to be learned **from experience, one transition at a time**. The method that does this is
temporal-difference (TD) learning, and at its heart is one quantity: the difference between what the agent
expected and what it got. This same quantity, it turned out in 1997, is the signal of dopamine neurons.
The module is about how the algorithm and the brain coincided here, and why that coincidence is not an
accident.

## The reward prediction error

The agent in state $s$ expected the value $V(s)$. It took a step, got a reward $r$ and ended up in $s'$,
whose value is $V(s')$. Now it has a refined estimate of the same thing: $r + \gamma V(s')$. The difference
between the refined estimate and the old one is the **reward prediction error**:

$$\delta = \underbrace{r + \gamma V(s')}_{\text{got}} - \underbrace{V(s)}_{\text{expected}}$$

<figure class="lm-inline-fig">
<svg viewBox="0 0 470 120" role="img" aria-label="Prediction error: what it got, the reward plus the discounted value of the next state, minus what it expected, the value of the current state.">
  <rect x="14" y="34" width="250" height="46" rx="9" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.4"/>
  <text x="139" y="55" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--mono);font-size:13px">r + γ·V(s′)</text>
  <text x="139" y="72" text-anchor="middle" style="fill:var(--gold);font-family:var(--mono);font-size:9px">what it got</text>
  <text x="286" y="63" text-anchor="middle" style="fill:var(--paper);font-family:var(--mono);font-size:20px">−</text>
  <rect x="308" y="34" width="148" height="46" rx="9" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.4"/>
  <text x="382" y="55" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--mono);font-size:13px">V(s)</text>
  <text x="382" y="72" text-anchor="middle" style="fill:var(--accent);font-family:var(--mono);font-size:9px">what it expected</text>
  <text x="235" y="20" text-anchor="middle" style="fill:var(--paper-faint);font-family:var(--mono);font-size:11px">δ = reward prediction error</text>
</svg>
</figure>

The sign of $\delta$ reads directly. **Positive** — it turned out better than expected, the state is
underrated, raise its value. **Negative** — worse than expected, overrated, lower it. **Zero** — exactly as
expected, nothing to change.

Hence the learning rule. Shift the estimate towards the error by a small step $\alpha$:

$$V(s) \leftarrow V(s) + \alpha\,\delta$$

The same line as gradient descent in Module 4: a step towards reducing the error. Only the error here is
not the difference with a known correct answer, but the difference with the agent's own refined estimate.

## Bootstrapping

Here is the strangest and most important thing in TD. In the update rule $V(s)$ learns from $V(s')$ — from
another estimate, also imprecise. **The estimate is pulled towards an estimate, not towards the outcome.**
This is called bootstrapping, and it sounds like cheating: how can you learn from what you do not yet know
yourself?

It works because $r$ at each step is real, from the environment. A grain of truth is mixed in at every
transition, and over many transitions the estimates saturate with it and converge to the correct ones. The
alternative — wait for the end of the episode and learn from the full actual return (the Monte Carlo
method) — is more honest, but waits until the end and is therefore noisier and slower. TD learns at every
step, at the cost of learning from a guess.

## Value and dopamine by hand

Let us set up the experiment. A trial is arranged so: at the moment of the **cue** a lamp turns on, several
steps later the **reward** arrives. The agent knows nothing else in advance. We run TD and watch two rows:
how the value $V$ grows over the steps and where the error $\delta$ flares — the very dopamine signal.

<div class="lm-fig" data-lm-fig="td-chain"></div>

Press "Trial". On the first trials the value is zero, and the spike of $\delta$ stands **at the reward**: it
came unexpectedly. With each trial the value ramps up backward from the reward towards the cue, and the
spike creeps along with it. Once learning has saturated, the picture flips: the spike stands **at the cue**,
and at the reward — silence. The reward is no longer a surprise, the cue predicted it. Press "Omit reward"
on the trained model — where the reward was expected, $\delta$ dips below zero.

These three pictures are not an invention of the algorithm. They are exactly what was recorded from the
electrodes.

## The three Schultz cases

In 1997 Wolfram Schultz and colleagues recorded the activity of a monkey's dopamine neurons as it learned
that a cue predicted juice. Three cases came out, and all three are the sign of $\delta$.

<figure class="lm-inline-fig">
<svg viewBox="0 0 470 175" role="img" aria-label="The three Schultz cases: an unexpected reward gives a spike at the reward; a predicted reward — a spike at the cue and silence at the reward; an omitted reward — a dip where the reward was expected.">
  <g style="font-family:var(--mono);font-size:9px">
    <line x1="16" y1="70" x2="150" y2="70" style="stroke:var(--ink-line-lit);stroke-width:1"/>
    <path d="M16 70 H96 V40 H104 V70 H150" style="fill:none;stroke:var(--accent);stroke-width:1.6"/>
    <text x="100" y="86" text-anchor="middle" style="fill:var(--gold)">reward</text>
    <text x="83" y="20" text-anchor="middle" style="fill:var(--paper-dim)">unexpected reward</text>
    <text x="83" y="108" text-anchor="middle" style="fill:var(--paper-faint)">spike at the reward</text>
    <line x1="168" y1="70" x2="302" y2="70" style="stroke:var(--ink-line-lit);stroke-width:1"/>
    <path d="M168 70 H196 V40 H204 V70 H302" style="fill:none;stroke:var(--accent);stroke-width:1.6"/>
    <text x="200" y="86" text-anchor="middle" style="fill:var(--accent)">cue</text>
    <text x="256" y="86" text-anchor="middle" style="fill:var(--gold)">reward</text>
    <text x="235" y="20" text-anchor="middle" style="fill:var(--paper-dim)">predicted reward</text>
    <text x="235" y="108" text-anchor="middle" style="fill:var(--paper-faint)">spike moved to the cue</text>
    <line x1="320" y1="70" x2="454" y2="70" style="stroke:var(--ink-line-lit);stroke-width:1"/>
    <path d="M320 70 H348 V40 H356 V70 H408 V96 H416 V70 H454" style="fill:none;stroke:var(--accent);stroke-width:1.6"/>
    <text x="352" y="86" text-anchor="middle" style="fill:var(--accent)">cue</text>
    <text x="235" y="150" text-anchor="middle" style="fill:var(--paper-faint)">and the dip where the reward failed to come is a negative δ</text>
    <text x="387" y="20" text-anchor="middle" style="fill:var(--paper-dim)">reward omitted</text>
    <text x="412" y="118" text-anchor="middle" style="fill:#d0705f">dip</text>
  </g>
</svg>
</figure>

**An unexpected reward** — dopamine flares at the reward: $\delta = r - 0 > 0$. **A predicted reward** —
it flares at the cue, is silent at the reward: the cue raised the value (the spike), and the reward came
exactly as expected ($\delta = 0$). **An omitted reward** — in its place dopamine dips below baseline:
$\delta = 0 - V < 0$.

<div class="lm-thread" markdown>
**Here the algorithm predicted neuroscience.** Usually mathematics describes what has already been found in
nature. Here it is the other way round: TD learning was derived in RL theory, and a few years later its
signal δ was recognised in the firing of dopamine neurons. This is a continuation of the thread from
[Module 12](12-environment-reward-policy.md): Thorndike's law of effect was psychology, the Bellman equation
was mathematics, and the prediction error turned out to be neurochemistry as well. One model in three
sciences.
</div>

## Where this leads next

TD learns **value**. But the agent needs a **policy** — what, exactly, to do. There are two paths, and both
appear in Module 14.

**Through value.** Learn the value of actions $Q(s,a)$ by the same TD and in each state take the action with
the largest $Q$. This is Q-learning, and its rule is the same error δ, only with a maximum over the next
action.

**Through the gradient.** Turn the policy's parameters directly towards a larger return. Here the gradient
from Module 4 is needed, and the error δ from this module becomes the signal that tells the policy which
action was better than expected.

## Practice

### Part 1. The notebook

Open [`notebooks/13-td-learning-and-dopamine.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/13-td-learning-and-dopamine.ipynb).
Only `numpy` and `matplotlib`, computes instantly.

What is inside:

1. TD(0) on a chain of states with a reward at the end. Value spreads backward — the same picture as in the
   figure.
2. The shift of the δ signal: a heatmap of the error over trials. The spike slides from the reward to the
   cue.
3. The three Schultz cases on numbers: unexpected, predicted and omitted reward. The sign of δ in each.
4. TD against Monte Carlo: which is faster and which is noisier on the same task. Bootstrapping against
   waiting for the end.
5. A check against the truth: the TD estimate of value against the exact one from Module 12, computed from
   the model.

### Part 2. Your own trial

1. Set your own moment of cue and reward and run the learning. After how many trials does the spike move to
   the cue?
2. Make the reward random (sometimes there, sometimes not). What happens to δ and to the value?
3. Remove the reward for good after learning. Trace how the value fades and δ returns to zero. This is
   extinction from behavioural psychology — again the same word from two sciences.

## Assignment

1. Derive the error δ from the Bellman equation of Module 12. Show that on average δ is zero when the value
   is correct.
2. Implement TD(0) on a chain and plot how the value of each state converges to $\gamma^{k}$, where $k$ is
   the number of steps to the reward.
3. Build a heatmap of δ over trials and states and find at which trial the spike finally moves to the cue.
4. Compare TD and Monte Carlo by the number of trials to convergence and by the spread. Draw the conclusion
   in the Module 1 format: quantity, conditions, baseline.
5. Model "the reward was not given" and show the negative δ. Relate it in words to the dopamine dip in
   Schultz.

## Self-check

1. How does TD differ from the value iteration of Module 12 in terms of what the agent knows?
2. Read δ in words, without naming letters. What does its sign mean?
3. What is bootstrapping and why does learning an estimate from an estimate still converge?
4. Why does the δ spike stand at the reward on the first trials, and at the cue after learning?
5. What happens to δ when a predicted reward is not given, and what corresponds to it in Schultz?
6. What do TD and Monte Carlo pay each other: what is TD faster at and what does it pay with?
7. What predicted what here — mathematics predicted neuroscience or the other way round?

## Next

In [Module 14](../programme.md) a way appears to learn the policy itself: policy gradient, actor-critic, PPO.
The error δ from this module becomes the critic's signal there, and the gradient from Module 4 the actor's
engine. And there too — why reproducibility in RL is especially poor, and how exactly the bootstrap on seeds
from Module 1 separates a real improvement from a lucky seed.

> The reward prediction error is "got minus expected". It teaches value one transition at a time, and it is
> what flares in dopamine neurons. One signal in the algorithm and in the brain.

---

!!! quote "The principle"
    Dopamine encodes not the reward, but the surprise of the reward. Predicted pleasure is silent; surprise
    is what drives learning, in the machine and in the head.
