# Module 16. Reward as a specification

!!! abstract "After this module you will be able to"
    - State Goodhart's law and show on a graph where the proxy metric and the true goal diverge.
    - Explain reward hacking as optimising what you specified, not what you meant.
    - Take apart RLHF: where the reward model comes from and why it cannot be optimised too hard.
    - Say why preference fine-tuning needs a penalty for deviating from the original model.
    - Recognise the same mistake — "optimising the wrong thing" — in an agent's reward, in the feed, and on the leaderboard.

    **Time:** about two weeks. **Prerequisites:** [Module 14](14-policy-gradient.md) and [Module 11](11-language-models.md).
    **Notebook:** [`notebooks/16-reward-as-specification.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/16-reward-as-specification.ipynb)

## Why this

Until now the reward was honest. In Module 15 it was money, and optimising it was safe: more profit is
better, no catch. But more often the reward is not the goal itself, but its **approximate substitute**. You
want "a useful answer", but you reward "an answer a human liked". You want "the user's health", but you
measure "time in the app". The substitute is a proxy, and while it is optimised weakly, it honestly reflects
the goal. Push harder — it diverges.

This module is about what happens at that fork. It closes the RL part, because it is in RL that an agent
optimises the reward to the limit, with no regard for what you meant.

## Goodhart's law

One sentence, older than machine learning:

!!! quote ""
    When a measure becomes a target, it ceases to be a good measure.

While a metric is just an observation, it correlates with what matters. Start optimising it — and the
optimisation finds a way to raise the metric without raising what it was taken for. The correlation
everything rested on breaks exactly where you pressed on it.

<div class="lm-fig" data-lm-fig="goodhart"></div>

Move the optimization pressure. On the left the proxy and the goal rise together — the metric is honest. In
the middle is the optimum of the true goal: no point pushing further. On the right the proxy climbs towards
its maximum while the goal falls: the system has been driven to pad the metric at the expense of what the
metric stood for. The optimum of the proxy and the optimum of the goal are **different points**, and the
harder the pressure, the further apart they are.

## Reward hacking

In RL this is called reward hacking, and it is not a malfunction but diligence. The agent does exactly what
it is paid for — and it is paid for the proxy.

Classic examples are collected by the dozen. A boat in a racing game, rewarded for points on the track
rather than for finishing, finds a lagoon of bonuses and circles in it forever, racking up points and
crashing into walls. A simulated robot rewarded for the height of its "centre of mass" does not learn to
jump — it grows into a thin tower and topples. Each time the agent found the maximum of the specified
reward, and each time it turned out not to be what the human wanted.

The cause is always the same: **it is impossible to write into the reward everything you have in mind.** "Win
the race" becomes "score points", "be useful" becomes "get approval", and the agent optimises what was
written, not what was meant. The more powerful the optimiser, the more inventively it finds this crack.

<figure class="lm-inline-fig">
<svg viewBox="0 0 470 120" role="img" aria-label="The proxy reward is what was written; the true goal is what was meant; the agent optimises what was written, and the arrow veers off the goal.">
  <rect x="14" y="40" width="150" height="46" rx="9" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.4"/>
  <text x="89" y="60" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--serif);font-size:13px">proxy reward</text>
  <text x="89" y="76" text-anchor="middle" style="fill:var(--accent);font-family:var(--mono);font-size:8px">what was written</text>
  <rect x="306" y="40" width="150" height="46" rx="9" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.4"/>
  <text x="381" y="60" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--serif);font-size:13px">true goal</text>
  <text x="381" y="76" text-anchor="middle" style="fill:var(--gold);font-family:var(--mono);font-size:8px">what was meant</text>
  <path d="M164 63 C 210 63, 230 40, 300 40" style="fill:none;stroke:var(--paper-faint);stroke-width:1.4;stroke-dasharray:4 3"/>
  <path d="M164 63 C 220 63, 250 100, 300 100" style="fill:none;stroke:#d0705f;stroke-width:1.6" marker-end="url(#ghar)"/>
  <text x="240" y="116" text-anchor="middle" style="fill:#d0705f;font-family:var(--mono);font-size:9px">the agent optimises what was written — and veers off</text>
  <defs><marker id="ghar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:#d0705f"/></marker></defs>
</svg>
</figure>

## RLHF and its limit

In Module 11 a language model was fine-tuned on preferences: pairs of answers "this one is better than that"
were shown. How it works inside is **reinforcement learning from human feedback (RLHF)**, and it runs
straight into Goodhart.

A human cannot rate every answer the model produces — there are too many. So on the collected preferences a
**reward model** is trained: a separate network that predicts how a human would rate an answer. The main
model is then optimised against this reward model by the methods of Module 14.

The reward model is a proxy, and an inaccurate one: it was trained on a finite sample and makes errors.
Optimise against it weakly — the answers get better. Optimise hard — the model finds cracks in the reward
model: answers it rates highly and a human does not. This is Goodhart on a learned reward, and it is cured
the same way as everywhere: **do not push to the limit**. In RLHF this is a penalty for deviation (KL) from
the original model — it keeps the optimisation in the region where the proxy is still honest.

<div class="lm-thread" markdown>
**One mistake in three places.** "Optimising the wrong thing" is a through-thread of the course. Here it is
reward hacking in an agent. In [Module 19](../programme.md) — a feed optimising engagement instead of
usefulness. In [Module 25](../programme.md) — the leaderboard as a source of truth, which gets padded as soon
as it becomes a target. And the source is in [Module 11](11-language-models.md): as soon as "good" became a
number, people set about optimising it at the expense of "good". One law, three guises.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/16-reward-as-specification.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/16-reward-as-specification.ipynb).
Only `numpy` and `matplotlib`, computes in seconds.

What is inside:

1. The Goodhart curve on numbers: the proxy and the goal coincide at first and diverge under pressure. The
   optimum of the proxy is not the optimum of the goal.
2. Reward hacking in a gridworld: a reward for "bonus cells" instead of the exit. The agent loops on the
   bonus and never reaches the exit — the proxy reward is high, the true success zero.
3. RLHF over-optimization: a reward model with error against the true reward. Weak pressure — the true reward
   rises; strong — the proxy rises while the true reward falls.
4. The KL penalty as the cure: it keeps the policy where the proxy is still honest and does not let it slide
   past the peak.

### Part 2. Your own reward

Take a system from your work that has a success metric.

1. Write down what you **mean** and what you **measure**. Are they the same?
2. Come up with a way to raise the metric without raising the goal. If you found one — that is the crack the
   optimiser will find.
3. What would be the proxy if you trained an agent to maximise this metric? Where would it veer off?
4. How would you constrain the optimisation so the proxy does not diverge from the goal?

## Assignment

1. Build a proxy and a true goal as two functions of one variable, coinciding near zero and diverging further
   out. Show that their maxima are different points.
2. Implement a gridworld with a reward for bonus cells and show that at a sufficient discount the optimal
   policy loops instead of going to the exit. Find the discount threshold.
3. Model a reward model as the true reward plus noise. Optimise a policy against it at different strengths and
   plot the true reward against the proxy.
4. Add a KL penalty and show that it returns the true reward to its peak. Find the coefficient at which the
   true reward is maximal.
5. Describe one real reward hacking from your field in the Module 1 format: what was written as the reward,
   what was meant, where the crack is.

## Self-check

1. State Goodhart's law and explain why it is about optimisation, not measurement.
2. What is reward hacking and why is it the agent's diligence, not a malfunction?
3. Why are the optimum of the proxy and the optimum of the true goal different points?
4. Where does the reward model in RLHF come from and why is it inaccurate?
5. What does the KL penalty do and what does it protect against?
6. Give the same "optimising the wrong thing" mistake in three places in the course.
7. Why is a more powerful optimiser more dangerous for a proxy, not safer?

## Next

Part IV is finished: environment and reward, value and policy, dopamine and Goodhart. In
[Part V](../programme.md) — recommender systems, and there reward hacking leaves the laboratory for billions
of people: a feed optimises engagement, finds the crack in human attention, and pads the metric at the
expense of what the attention was for. The same thread, a different scale.

> Reward is not the goal, but its approximate record. The optimiser raises what is recorded; whether that
> coincides with what was meant depends on how hard you pressed on it.

---

!!! quote "The principle"
    Any metric is a proxy. While it is not optimised, it is honest; as soon as it becomes a target, people
    begin to pad it. The question is not "is the metric good", but "what will the one for whom it became a
    reward do with it".
