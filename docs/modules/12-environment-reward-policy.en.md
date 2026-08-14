# Module 12. Environment, reward, policy

!!! abstract "After this module you will be able to"
    - Write a task as a Markov decision process: states, actions, reward, transitions.
    - Read the return formula and explain what the discount γ does and why it is less than one.
    - Tell a state's value from the reward and state the Bellman equation in words.
    - Run value iteration by hand and see how value spreads out from the goal, and how the policy folds out of it.
    - Explain why Thorndike's law of effect and operant conditioning are the same Markov process a hundred years earlier.

    **Time:** about two weeks. **Prerequisites:** [Module 4](04-derivatives-and-optimisation.md) (the gradient and the step will be needed in Module 14).
    **Notebook:** [`notebooks/12-environment-reward-policy.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/12-environment-reward-policy.ipynb)

## Why this

Parts I–III taught prediction: from input, an answer; from text, the next token. Reinforcement
learning is about something else — **acting**. The agent gets no correct answers, it gets a reward for
consequences and has to work out for itself what to do.

And here the course touches psychology where it is real. The formalism we are about to write down was
discovered twice: by mathematicians in the 1950s as the Markov process and by psychologists half a
century earlier as the law of effect. This is not an analogy for effect — it is the same model, and by
the end of the module that will be visible literally.

## The agent–environment loop

All of reinforcement learning is one loop. The agent, in a state, chooses an action; the environment
answers with a new state and a reward; the agent chooses again.

<figure class="lm-inline-fig">
<svg viewBox="0 0 480 165" role="img" aria-label="The agent-environment loop: the agent chooses an action, the environment returns a new state and a reward.">
  <rect x="28" y="52" width="150" height="60" rx="10" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.5"/>
  <text x="103" y="88" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--serif);font-size:17px;font-weight:600">Agent</text>
  <rect x="302" y="52" width="150" height="60" rx="10" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.5"/>
  <text x="377" y="88" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--serif);font-size:17px;font-weight:600">Environment</text>
  <path d="M178 72 H298" style="fill:none;stroke:var(--paper-faint);stroke-width:1.5" marker-end="url(#lmar)"/>
  <text x="238" y="42" text-anchor="middle" style="fill:var(--accent);font-family:var(--mono);font-size:12px">action aₜ</text>
  <path d="M302 96 H182" style="fill:none;stroke:var(--paper-faint);stroke-width:1.5" marker-end="url(#lmar)"/>
  <text x="238" y="132" text-anchor="middle" style="fill:var(--gold);font-family:var(--mono);font-size:12px">state sₜ₊₁, reward rₜ₊₁</text>
  <defs><marker id="lmar" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--paper-faint)"/></marker></defs>
</svg>
</figure>

The four letters that describe this precisely are the **Markov decision process (MDP)**:

**State** $s$ — where the agent is now. **Action** $a$ — what it can do. **Reward** $r$ — the number the
environment gives out for a transition. **Transition** — how from $s$, by action $a$, a new state $s'$
is obtained.

The word "Markov" carries one requirement: **the future depends only on the current state, not on how
you got into it.** If a decision needs history, then history is part of the state, and it has to be
included there.

## Return and discount

A reward for one step is a short-sighted goal. An agent chasing only $r_{t+1}$ will eat the sweet now
and miss dinner. The right goal is the **return**, the sum of future rewards:

$$G_t = r_{t+1} + \gamma\, r_{t+2} + \gamma^2 r_{t+3} + \dots = \sum_{k=0}^{\infty} \gamma^k\, r_{t+k+1}$$

The coefficient $\gamma \in [0, 1)$ is the **discount**. It weights the future: a reward $k$ steps away
enters the goal with weight $\gamma^k$. Here are those weights at $\gamma = 0.9$:

<figure class="lm-inline-fig">
<svg viewBox="0 0 460 130" role="img" aria-label="The weights of future rewards at discount 0.9: each next step enters the goal by a factor of 0.9 to the power of the step number.">
  <line x1="20" y1="104" x2="440" y2="104" style="stroke:var(--ink-line);stroke-width:1"/>
  <g style="font-family:var(--mono);font-size:9px">
    <rect x="30"  y="16"  width="34" height="88"   rx="3" style="fill:var(--accent);fill-opacity:.85"/><text x="47"  y="118" text-anchor="middle" style="fill:var(--paper-faint)">t+1</text>
    <rect x="80"  y="25"  width="34" height="79"   rx="3" style="fill:var(--accent);fill-opacity:.72"/><text x="97"  y="118" text-anchor="middle" style="fill:var(--paper-faint)">t+2</text>
    <rect x="130" y="33"  width="34" height="71"   rx="3" style="fill:var(--accent);fill-opacity:.6"/><text x="147" y="118" text-anchor="middle" style="fill:var(--paper-faint)">t+3</text>
    <rect x="180" y="40"  width="34" height="64"   rx="3" style="fill:var(--accent);fill-opacity:.5"/><text x="197" y="118" text-anchor="middle" style="fill:var(--paper-faint)">t+4</text>
    <rect x="230" y="46"  width="34" height="58"   rx="3" style="fill:var(--accent);fill-opacity:.42"/><text x="247" y="118" text-anchor="middle" style="fill:var(--paper-faint)">t+5</text>
    <rect x="280" y="51"  width="34" height="53"   rx="3" style="fill:var(--accent);fill-opacity:.35"/><text x="297" y="118" text-anchor="middle" style="fill:var(--paper-faint)">t+6</text>
    <rect x="330" y="56"  width="34" height="48"   rx="3" style="fill:var(--accent);fill-opacity:.29"/><text x="347" y="118" text-anchor="middle" style="fill:var(--paper-faint)">t+7</text>
    <rect x="380" y="60"  width="34" height="44"   rx="3" style="fill:var(--accent);fill-opacity:.24"/><text x="397" y="118" text-anchor="middle" style="fill:var(--paper-faint)">t+8</text>
  </g>
  <text x="47" y="12" text-anchor="middle" style="fill:var(--paper-dim);font-family:var(--mono);font-size:9px">γ⁰=1</text>
  <text x="397" y="54" text-anchor="middle" style="fill:var(--paper-dim);font-family:var(--mono);font-size:9px">γ⁷</text>
</svg>
</figure>

Why $\gamma < 1$. First, without it the sum would diverge over an infinite horizon — the goal would be
infinite for everyone, and there would be nothing to compare. Second, the discount encodes impatience: a
reward now is worth more than the same reward later. $\gamma$ near one — a far-sighted agent; $\gamma$
near zero — living one step at a time.

## Value and the Bellman equation

Reward is about one transition. **Value** is about the whole future from a state.

**The value of a state** $V(s)$ is the expected return if you start from $s$ and then act according to
the policy. This is exactly the difference between "how much was given now" and "how good this state is".

The key property of value is that it is recursive. The value of a state is the reward for the next step
plus the discounted value of where you end up. For optimal behaviour this is the **Bellman equation**:

$$V(s) = \max_a \Big[ r(s, a) + \gamma\, V(s') \Big]$$

Read it in words: the value of a cell is the best you can get in one step plus the discounted value of
the neighbouring cell that step leads to. The equation links the value of a state to the value of its
neighbours, and everything ahead rests on that link.

## Value and policy by hand

The Bellman equation can simply be applied as an update rule until the values stop changing. This is
**value iteration**: each sweep updates the value of each cell from its neighbours.

Below is a world of cells: a goal $+1$ at the top-right, a pit $-1$ below it, two walls. For each step
the agent pays $-0.03$, so as not to wander for nothing. Press "Step" and watch the value spread out
from the goal, and the arrows of the greedy policy fold into a route — around the pit and the walls.

<div class="lm-fig" data-lm-fig="gridworld"></div>

Note two things. The value does not appear everywhere at once: the first sweep touches only the goal's
neighbours, the second the neighbours of the neighbours, and the wave goes outward. And the policy is not
a separate object: the arrow in a cell simply points to the neighbour with the highest value. **The
policy is a shadow of the value.**

Now move γ towards zero. The value of distant cells compresses into almost a single number: the far
$+1$, discounted by $\gamma^k$, does not reach them, and only the step cost remains. The gradient towards
the goal is visible only near the goal — the agent becomes short-sighted. Far-sightedness is one number.

## Thorndike and the law of effect

Now the promised thing: the same formalism a hundred years before it.

In 1898 Edward Thorndike put a cat in a box with a lever. At first the cat thrashed around at random;
sooner or later it caught the lever, the door opened, the cat got food. Each time it reached the lever
faster. Thorndike formulated the **law of effect**: an action followed by satisfaction is strengthened in
that situation; an action followed by failure weakens.

Translate it into the module's language. The situation is a state. Pressing the lever or bolting into a
corner are actions. Food is a reward. "Is strengthened" — the value of the action in that state rises.
This is Skinner's operant conditioning, and it is the same as the value update in an MDP. Psychology
described the process in words, mathematics in a formula, and they described one thing.

<div class="lm-thread" markdown>
**One model, two sciences.** Thorndike's law of effect is the Bellman equation before any mathematics.
In [Module 13](../programme.md) the coincidence gets sharper still: the reward prediction error signal we
will derive as an algorithm turns out to be what was measured in 1997 in dopamine neurons. A rare case of
an algorithm predicting neuroscience, not the other way round.
</div>

The difference matters too, and it is worth naming honestly. Thorndike has no discount and no model of
transitions — the cat does not plan five steps ahead. Operant conditioning is model-free RL, closer to the
methods coming in Module 14 than to the value iteration of this one. What coincides is the essence —
learning to act from consequences — not every detail.

## Practice

### Part 1. The notebook

Open [`notebooks/12-environment-reward-policy.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/12-environment-reward-policy.ipynb).
Only `numpy` and `matplotlib`, computes instantly.

What is inside:

1. Gridworld as an object: states, actions, transitions, reward — in twenty lines.
2. Value iteration from scratch. The value map and the policy arrows — the same as in the figure above,
   but computed.
3. How γ changes the decision: an agent between a small near reward and a big far one. Below a threshold
   it grabs the near one. We find the threshold and it matches the theory.
4. The law of effect on numbers: an agent in one state with two actions, the action value updated by
   reward. Behaviour shifts towards the rewarded one — Thorndike in five lines.
5. A convergence check: value iteration converges because the Bellman operator is a contraction. We watch
   the change between sweeps fall.

### Part 2. Your own environment

Come up with a small task from your own life as an MDP.

1. Write out the states, actions, reward and transitions. What here is Markov, and what needs history?
2. What did you take as the reward — and does it not optimise something other than what you meant? Write
   down the worry: in Module 16 it becomes the topic.
3. Set γ and explain in words whether your agent is far-sighted or short-sighted.
4. If there are few states — run the value iteration from the notebook on your own task.

## Assignment

1. Derive why, with $\gamma < 1$ and bounded rewards, the return is finite. One line with the sum of a
   geometric series.
2. Implement value iteration and plot how the maximum change in value falls with sweeps. This is the
   contraction from point 5 of the notebook.
3. Sweep γ from 0.3 to 0.99 and plot from what value the agent switches from the near small reward to the
   far big one. Explain the threshold.
4. Change the step cost from $-0.03$ to $0$ and to $-0.2$. What happened to the route and why?
5. Formulate Thorndike's episode as an MDP and show that the action-value update reproduces the
   "strengthening" without a single word from psychology.

## Self-check

1. Name the four parts of an MDP. What does "Markov" mean?
2. How does reward differ from value?
3. What does the discount γ do and what happens to the goal at γ equal to one?
4. Read the Bellman equation in words, without naming a single letter.
5. Why does value in value iteration appear at the goal first, not everywhere at once?
6. Why is the policy "a shadow of the value"?
7. How does Thorndike's law of effect correspond to an MDP and where does it diverge from it?

## Next

In [Module 13](../programme.md) a way appears to learn value **without a model of the environment** — one
transition at a time. The central quantity there is the reward prediction error, the difference between
what the agent expected and what it got. And that is exactly the signal found in 1997 in dopamine
neurons: the chapter where the algorithm and the brain coincided.

> Reinforcement learning is one loop: state, action, reward, new state. Value is about the whole future,
> reward about one step, and the policy is a shadow of the value.

---

!!! quote "The principle"
    The agent gets no correct answers, only a reward for consequences. Whatever you named the reward is
    what it will pursue, including the case where that is not what you meant.
