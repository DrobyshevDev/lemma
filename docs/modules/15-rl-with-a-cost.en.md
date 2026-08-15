# Module 15. RL where a mistake has a cost

!!! abstract "After this module you will be able to"
    - Write the inventory-control task as an MDP and name the two costs it trades off.
    - Find the optimal stock level with the classical newsvendor formula and explain where the quantile in it comes from.
    - Say when a classical operations-research method is already optimal, and when learning pays off.
    - Compare a trained policy with a tuned classical baseline honestly, and admit the case where the baseline is no worse.
    - Explain why, in applied RL, the cost of a mistake raises the bar for checking rather than lowering it.

    **Time:** about two weeks. **Prerequisites:** [Module 14](14-policy-gradient.md) and [Module 1](01-claim-baseline-noise.md).
    **Notebook:** [`notebooks/15-rl-with-a-cost.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/15-rl-with-a-cost.ipynb)

## Why this

Game environments forgive mistakes: lose a match, start again. Applied ones do not. Order too much stock —
you pay for storage; too little — you lose sales and customers. Every action has a cost in money, and this
changes the discipline: the bar for checking goes up, not down.

And here RL meets a field that solved these tasks half a century before it — **operations research**. It has
ready answers: for inventory, queues, schedules. Often these answers are **already optimal**, and then a
trained policy at best repeats them, and at worst loses to them. Admitting this is part of the same honesty
as the whole course.

## The inventory problem

Each period you order stock without knowing the future demand. Demand arrives — random. Then one of two
things:

**Surplus.** You ordered more than was bought. The remainder sits in the warehouse — you pay for
**holding**.

**Shortage.** You ordered less — part of the demand is unmet. You lose the sale, and sometimes the customer
— you pay for **the shortage**.

Usually a shortage costs more than holding: a lost customer costs more than an extra box on the shelf. The
task is to choose a stock level $S$ to replenish up to each period so that the total cost is smallest. This
is a trade-off: raise $S$ — less shortage, more holding; lower it — the reverse.

<figure class="lm-inline-fig">
<svg viewBox="0 0 440 158" role="img" aria-label="The inventory cost trade-off: holding rises with the level, shortage falls, the total cost is U-shaped with a minimum in the middle.">
  <line x1="40" y1="128" x2="420" y2="128" style="stroke:var(--ink-line);stroke-width:1"/>
  <line x1="40" y1="16" x2="40" y2="130" style="stroke:var(--ink-line);stroke-width:1"/>
  <path d="M55 124 L400 40" style="fill:none;stroke:var(--gold);stroke-width:1.6"/>
  <path d="M55 40 L400 124" style="fill:none;stroke:#d0705f;stroke-width:1.6"/>
  <path d="M55 128 Q 225 52 400 128" style="fill:none;stroke:var(--accent);stroke-width:2.2"/>
  <line x1="225" y1="70" x2="225" y2="130" style="stroke:var(--paper-faint);stroke-width:1;stroke-dasharray:3 3"/>
  <circle cx="225" cy="70" r="3" style="fill:var(--accent)"/>
  <text x="360" y="36" style="fill:var(--gold);font-family:var(--mono);font-size:9px">holding</text>
  <text x="360" y="118" style="fill:#d0705f;font-family:var(--mono);font-size:9px">shortage</text>
  <text x="120" y="40" style="fill:var(--accent);font-family:var(--mono);font-size:9px">total</text>
  <text x="225" y="146" text-anchor="middle" style="fill:var(--paper-faint);font-family:var(--mono);font-size:9px">optimum S* (newsvendor)</text>
</svg>
</figure>

## The classical answer: newsvendor

This task has an exact solution, and it is older than any neural method. The optimal stock level is a
**quantile of demand**:

$$S^{*} = F^{-1}\!\left(\frac{c_{\text{short}}}{c_{\text{short}} + c_{\text{hold}}}\right)$$

where $F$ is the demand distribution function. Read it in words: cover demand up to exactly the fraction at
which the shortage cost outweighs the holding cost. A shortage three times as expensive as holding — cover
demand to $3/4$, that is, hold the level at the 75th percentile. No learning: one formula, if the demand
distribution is known.

<div class="lm-fig" data-lm-fig="inventory"></div>

Move $S$ and look for the minimum of the total cost — this is the newsvendor baseline by hand. With steady
demand the minimum is sharp and single: the classics need no learning here. Now press "demand: drifting".
Demand creeps up over time, and no **fixed** $S$ is good any more: a low one gives a shortage at the end, a
high one gives holding at the start. This is the crack RL slips into.

## When learning pays off

Newsvendor is optimal under one condition: demand is stationary and its distribution is known. As soon as
the condition breaks, the formula loses optimality, and room for learning appears.

**Non-stationarity.** Demand drifts, has seasons, responds to price. A fixed level lags; a policy that
depends on the state (recent demand, day of week, price) does not.

**Coupled decisions.** Several warehouses, delivery with a lag, volume discounts, budget limits. Classical
formulas do not exist for all combinations; RL optimises them jointly.

**Unknown distribution.** $F$ is not given, and demand is seen only after the fact. Learning works with
samples, the formula does not.

Where learning does **not** pay off: stationary demand, a known distribution, a single item. There
newsvendor is already optimal, and a trained policy at best converges to it, spending thousands of runs on
what one formula gives.

## An honest comparison

Hence the rule the course is written for — and in applied RL it is stricter than in game RL.

**The baseline for a trained policy must be a tuned classic, not a naive one.** To compare RL with "always
order 10" is self-deception: beating a bad baseline is easy and meaningless. An honest baseline is
newsvendor with the optimal $S$ found by search, or an adaptive base-stock tracking demand. This is exactly
the asymmetry of effort from [Module 1](01-claim-baseline-noise.md): your own method is tuned for a week,
someone else's baseline is taken out of the box.

And the conclusion of the comparison is read by the interval-overlap rule. The trained policy gave a higher
profit — compare interquartile means across many seeds with bootstrap intervals. They overlap — the
improvement is not shown, however much you would like to declare a victory of learning over the "outdated"
classics.

<div class="lm-thread" markdown>
**A claim you have already checked.** In [Module 1](01-claim-baseline-noise.md) you checked by hand a claim
from [decisionrl](https://github.com/DrobyshevDev/decisionrl): on non-stationary demand a trained policy
gives a profit of 274.0 against 240.7 for the **best** fixed base-stock. The key word is "best": the baseline
there is not naive but the optimal one in its class, found by search. Here you understand why this is an
honest comparison and not a stacked deck.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/15-rl-with-a-cost.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/15-rl-with-a-cost.ipynb).
Only `numpy` and `matplotlib`, computes in seconds.

What is inside:

1. The inventory environment as an MDP: holding, shortage, the period cost. Twenty lines.
2. The newsvendor baseline: a sweep over $S$, the U-shaped cost curve, the minimum checked against the
   quantile formula.
3. Non-stationary demand: a fixed $S$ against an adaptive one tracking recent demand. The gap in money.
4. A simple trained policy against a tuned baseline: an honest comparison through IQM and the bootstrap from
   Module 1. On stationary demand the baseline is not beaten; on drifting demand learning wins.

### Part 2. Your own task with a cost of error

Take a task from your work where an error costs money: inventory, scheduling, server capacity, procurement.

1. Write it as an MDP: state, action, the two costs of an error in both directions.
2. Find the classical baseline. Is there a ready formula from operations research for it?
3. Is the task stationary? If yes — learning is probably unnecessary, and that is an honest conclusion.
4. If non-stationary — what should be in the state so that the policy can adapt?

## Assignment

1. Derive the newsvendor formula from the marginal-cost balance: the last unit of stock pays off while the
   expected saving on a shortage has not yet equalled the cost of holding.
2. Implement the inventory environment and plot the U-shaped cost curve over $S$. Does the minimum match the
   quantile?
3. Make demand non-stationary and show that the best fixed $S$ loses to the adaptive one. Give the difference
   in money.
4. Compare a trained policy with a tuned baseline on stationary and on non-stationary demand. Two conclusions
   in the Module 1 format.
5. Build a case where learning loses to the baseline and explain why this is the right result, not a failure.

## Self-check

1. What two costs does the stock level balance?
2. Where does the quantile in the newsvendor formula come from, and why exactly $c_{\text{short}}/(c_{\text{short}}+c_{\text{hold}})$?
3. Under what condition is newsvendor optimal and learning unnecessary?
4. What breaks the optimality of the classics and opens room for RL?
5. Why is comparing a trained policy with a naive baseline self-deception?
6. A trained policy gave a higher profit than the baseline on one run. What will you check before believing it?
7. Why does the cost of an error raise the bar for checking rather than lowering it?

## Next

In [Module 16](../programme.md) — what happens when the reward you set is not the one you meant: reward
hacking, Goodhart's law, learning from human feedback. Here the reward was honest (money), and optimising it
was safe. Next the reward becomes approximate, and optimising it starts to bring not what was wanted.

> Applied RL does not abolish operations research but competes with it. Sometimes learning wins, sometimes the
> classics are already optimal — and admitting the latter matters as much as claiming the former.

---

!!! quote "The principle"
    Beating a naive baseline is easy and meaningless. The only comparison that means anything is with a classic
    tuned as carefully as your own policy.
