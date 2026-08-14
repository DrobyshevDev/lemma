# Module 14. Policy gradient and modern methods

!!! abstract "After this module you will be able to"
    - Explain how learning a policy directly differs from learning through value.
    - Read the policy gradient in words: raise the probability of actions that returned more than expected.
    - Say what the baseline is for, and connect it to the error δ and the critic from Module 13.
    - Explain what PPO clips and why, without clipping, a policy step breaks the policy.
    - Show on numbers why reproducibility in RL is especially poor, and check a claimed improvement with the bootstrap from Module 1.

    **Time:** about three weeks. **Prerequisites:** [Module 4](04-derivatives-and-optimisation.md) (the gradient) and [Module 13](13-td-learning-and-dopamine.md) (the error δ).
    **Notebook:** [`notebooks/14-policy-gradient.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/14-policy-gradient.ipynb)

## Why this

Modules 12 and 13 learned **value** — how good a state is. From value you can extract a policy by taking,
in each state, the action with the largest $Q$. But this path has two limits: it requires a search over
actions (and there can be infinitely many, like the angle of a steering wheel), and it gives only a hard,
deterministic choice.

The other path is to learn **the policy itself**: parametrise $\pi_\theta(a \mid s)$ and turn the
parameters $\theta$ directly towards a larger return. This is policy gradient, and here two earlier modules
meet: the gradient from Module 4 moves the parameters, and the error δ from Module 13 says which way.

## The policy gradient

The goal is the expected return $J(\theta) = \mathbb{E}[G]$. We want to maximise it, so we go **with** the
gradient, not against it (Module 4, only with a plus sign). The problem: the return depends on θ through the
choice of actions, and the choice is random. How do you take a gradient through randomness?

The answer is the policy gradient theorem. One result, and it is simpler than it looks:

$$\nabla_\theta J = \mathbb{E}\big[\, \nabla_\theta \log \pi_\theta(a \mid s)\cdot G \,\big]$$

Read it in words: **shift the parameters so as to raise the probability of the actions after which a large
return came, and lower the probability of those after which a small one came.** The factor $\nabla \log \pi$
is the direction "make this action more probable", and $G$ is by how much, with its sign. An action brought
a lot — strengthen it; brought little — weaken it. This is REINFORCE.

<div class="lm-fig" data-lm-fig="policy-grad"></div>

Press "Learning step". The policy starts uniform, but action $a_2$ pays more on average, and its bar grows:
every trial where the reward turned out higher than expected raises the probability of the chosen action a
little. "×25" speeds it up. After a hundred steps the policy confidently prefers the best action — not
because it was told which is best, but because it turned it out from the rewards.

## The baseline and the critic

Now the "baseline" toggle. Turn it off and run for a while — learning becomes noticeably jerkier. Here is why.

The formula has $G$ — the raw return. But you can subtract from it any quantity $b$ that does not depend on
the action, and **the gradient does not change on average** (the subtracted term is zero in expectation).
But the spread of the estimate does change, and a lot. A good baseline is the expected return from this
state, that is, the value $V(s)$:

$$\nabla_\theta J = \mathbb{E}\big[\, \nabla_\theta \log \pi_\theta(a \mid s)\cdot \underbrace{(G - V(s))}_{\text{advantage } A} \,\big]$$

The difference $A = G - V(s)$ is the **advantage**: how much this action is better than the average in this
state. And it is exactly the error δ from Module 13. Now the method has two parts:

<figure class="lm-inline-fig">
<svg viewBox="0 0 470 172" role="img" aria-label="Actor-critic: the actor chooses an action, the environment returns a reward, the critic computes the error delta, which refines both the critic and the actor.">
  <rect x="16" y="30" width="120" height="48" rx="9" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.5"/>
  <text x="76" y="52" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--serif);font-size:15px;font-weight:600">Actor</text>
  <text x="76" y="68" text-anchor="middle" style="fill:var(--accent);font-family:var(--mono);font-size:8px">policy π</text>
  <rect x="176" y="30" width="120" height="48" rx="9" style="fill:var(--ink-raised);stroke:var(--paper-faint);stroke-width:1.5"/>
  <text x="236" y="58" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--serif);font-size:15px;font-weight:600">Environment</text>
  <rect x="336" y="30" width="120" height="48" rx="9" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.5"/>
  <text x="396" y="52" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--serif);font-size:15px;font-weight:600">Critic</text>
  <text x="396" y="68" text-anchor="middle" style="fill:var(--gold);font-family:var(--mono);font-size:8px">value V</text>
  <path d="M136 46 H174" style="fill:none;stroke:var(--paper-faint);stroke-width:1.4" marker-end="url(#pgar)"/>
  <text x="155" y="40" text-anchor="middle" style="fill:var(--accent);font-family:var(--mono);font-size:8px">action</text>
  <path d="M296 62 H334" style="fill:none;stroke:var(--paper-faint);stroke-width:1.4" marker-end="url(#pgar)"/>
  <text x="315" y="76" text-anchor="middle" style="fill:var(--gold);font-family:var(--mono);font-size:8px">reward</text>
  <path d="M396 78 V116 H76 V80" style="fill:none;stroke:var(--accent);stroke-width:1.4" marker-end="url(#pgar)"/>
  <text x="236" y="132" text-anchor="middle" style="fill:var(--paper-dim);font-family:var(--mono);font-size:10px">δ = advantage: the critic judges, the actor shifts the probability</text>
  <defs><marker id="pgar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--paper-faint)"/></marker></defs>
</svg>
</figure>

**The actor** is the policy that acts. **The critic** is the value that judges. The critic computes δ, the
actor moves the probabilities by it, and δ also refines the critic itself. The dopamine error from Module 13
has become the engine of two learnings at once.

## PPO: a step that does not break the policy

Policy gradient has an unpleasant property: one step that is too large can drive the policy into a region
where it collects garbage data, and learning does not recover. Unlike supervised learning, here the data is
produced by the policy itself — spoil it, and you spoil what you learn from next.

**PPO** (proximal policy optimization) fixes this by forbidding the policy to change too abruptly in one
step. It looks at the ratio of the new action probability to the old one and **clips** it: if the step pulls
the ratio beyond $[1-\varepsilon,\ 1+\varepsilon]$, the gain past that is zeroed out.

<figure class="lm-inline-fig">
<svg viewBox="0 0 440 150" role="img" aria-label="PPO clipping: while the probability ratio is near one, the objective grows with the advantage; beyond the clip bounds it flattens onto a shelf and stops growing.">
  <line x1="40" y1="118" x2="420" y2="118" style="stroke:var(--ink-line);stroke-width:1"/>
  <line x1="40" y1="20" x2="40" y2="122" style="stroke:var(--ink-line);stroke-width:1"/>
  <path d="M70 108 L200 60 L340 30 L410 30" style="fill:none;stroke:var(--paper-faint);stroke-width:1.2;stroke-dasharray:4 3"/>
  <path d="M70 108 L200 60 L300 40 L300 40 L410 40" style="fill:none;stroke:var(--accent);stroke-width:2"/>
  <line x1="200" y1="24" x2="200" y2="122" style="stroke:var(--gold);stroke-width:1;stroke-dasharray:3 3;opacity:.6"/>
  <line x1="300" y1="24" x2="300" y2="122" style="stroke:var(--gold);stroke-width:1;stroke-dasharray:3 3;opacity:.6"/>
  <text x="200" y="136" text-anchor="middle" style="fill:var(--gold);font-family:var(--mono);font-size:9px">1</text>
  <text x="300" y="136" text-anchor="middle" style="fill:var(--gold);font-family:var(--mono);font-size:9px">1+ε</text>
  <text x="360" y="52" style="fill:var(--accent);font-family:var(--mono);font-size:9px">shelf</text>
  <text x="42" y="16" style="fill:var(--paper-dim);font-family:var(--mono);font-size:9px">objective (for A&gt;0)</text>
  <text x="330" y="136" text-anchor="middle" style="fill:var(--paper-faint);font-family:var(--mono);font-size:9px">ratio π_new/π_old</text>
</svg>
</figure>

The point of the shelf: for moving the policy too far there is no more reward, and the incentive to take a
destructively large step disappears. SAC solves the same stability problem differently — it adds entropy to
the objective, encouraging the policy not to collapse into a single point too early. Different recipes for
one and the same caution.

## Reproducibility in RL

Now the thing the whole course is written for — and in RL it hurts more than anywhere else.

Reinforcement learning is notoriously irreproducible. The spread between RNG seeds here is regularly larger
than the difference between methods: the same algorithm with a different seed can converge to an excellent
policy or not converge at all. There are more sources of randomness than in supervised learning:
initialisation, the order of data collection, the stochastic policy, the environment itself.

<div class="lm-fig" data-lm-fig="dist-overlap"></div>

The picture is the same one that opened the course, only now it is two RL methods. Their intervals overlap —
and "our method is better" is not shown. By Module 14 you have exactly the tool you need: from Module 1 the
IQM and the bootstrap on fixed seeds, and from this module an understanding of where such a spread comes
from.

<div class="lm-thread" markdown>
**The bootstrap from Module 1 returns here literally.** A claimed improvement of an RL method is checked not
by looking at one learning curve, but by comparing interquartile means across many seeds with bootstrap
intervals — the same eleven-line code as in [Module 1](01-claim-baseline-noise.md). In the
[decisionrl](https://github.com/DrobyshevDev/decisionrl) library a trained policy is compared with a tuned
classical baseline exactly this way; in Module 15 this becomes a topic of its own.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/14-policy-gradient.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/14-policy-gradient.ipynb).
Only `numpy` and `matplotlib`, computes in seconds.

What is inside:

1. REINFORCE from scratch on a bandit and a short chain. The policy converges to the best action.
2. Baseline versus its absence: two learning curves on the same seeds. The spread with a baseline is
   noticeably smaller — the same benefit as in the figure.
3. Actor-critic: δ as the advantage. Faster and smoother than plain REINFORCE.
4. Reproducibility: twenty seeds of one method. The curves fan apart, and one number from one run means
   nothing.
5. An honest comparison of two methods: IQM and bootstrap intervals from Module 1. Do they overlap.

### Part 2. Your own claim

Take two settings of one algorithm (for example, two learning-rate values) as "method" and "baseline".

1. Run each on ten seeds chosen in advance.
2. Build the IQM and the bootstrap intervals of both.
3. Do they overlap. State the conclusion in the Module 1 format: quantity, conditions, baseline.
4. Show the best and worst curve of each method side by side. How tempting would it be to show only the best?

## Assignment

1. Derive why subtracting a baseline that does not depend on the action does not change the policy gradient
   on average. One line with $\mathbb{E}[\nabla \log \pi] = 0$.
2. Implement REINFORCE on a bandit and plot how the probability of the best action grows with updates.
3. Add a baseline and show on numbers by how much the spread of the gradient estimate fell.
4. Replace the return with the advantage through a learned value (actor-critic) and compare the convergence
   speed.
5. Run one method on twenty seeds and plot the fan of curves. Mark where the IQM passes and where the mean,
   spoiled by diverging runs.

## Self-check

1. How does learning a policy directly differ from extracting a policy from value? Where does the second
   fail?
2. Read the policy gradient in words, without naming letters.
3. What is the baseline for and why does it not bias the gradient?
4. What is the advantage and how is it related to the error δ from Module 13?
5. Who are the actor and the critic and what role does δ play in both?
6. What does PPO clip and what happens to the policy without clipping?
7. Why is reproducibility in RL especially poor and how is a claimed improvement checked?

## Next

In [Module 15](../programme.md) reinforcement learning meets tasks where an error has a cost in money:
inventory, pricing, queues, energy. And there too — an honest comparison with operations-research methods:
sometimes a trained policy wins, and sometimes the classics are already optimal, and admitting the latter is
part of the same discipline of checking.

> Policy gradient raises the probability of actions that returned more than expected. The baseline subtracted
> from the return is the critic, and the critic is the error δ from Module 13. Everything comes together.

---

!!! quote "The principle"
    One learning curve in RL is not a result, but one observation of an especially noisy random variable.
    Before believing a method is better, look at the spread between seeds: here it is usually larger than the
    improvement itself.
