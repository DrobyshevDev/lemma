# How to study this course

Two pages that will save you months. Read them before Module 1.

## The rule of one number

Every module has a number you obtain yourself: accuracy, reward, the fraction of confirmed
citations. **Do not go on until you understand where that number came from and what would
change if you changed the RNG seed.**

The temptation is strong: the notebook ran, the metric printed, everything looks right. But
"ran" and "understood" are different states, and the difference surfaces three modules later,
when nothing works any more and why is unclear.

## A notebook is read twice

The first time — top to bottom, whole, changing nothing, to see the result.

The second time — breaking it. Change the seed. Remove the normalisation. Halve the sample.
Make the learning rate ten times larger. Write down what happened. **Understanding lives in
how a system breaks, not in how it works** — a working system looks the same whether you have
understood it or not.

## Log your runs from day one

Not in your head and not in the file name `model_final_v3_norm2.pkl`. Keep a table: what you
changed, which seed, what number came out. By Module 7 you will have a habit you cannot do
without later, and a dozen of your own observations that turn out to be more interesting than
half of the material.

## About the mathematics

Formulas in the course are derived, not presented. If the derivation did not go through, that
is **not** a signal of "I have no aptitude for maths". It is almost always a signal that one
specific step was missed earlier. Find it — usually it is in the previous module — rather than
starting over.

Second: you have to be able to read a formula aloud in words. `E[R] = Σ p(s) V(s)` reads as
"the expected reward is the sum of state values weighted by the probability of being in them".
If you cannot read it out, you have not understood it, however many times you copy it.

## About pace

The time estimates in the [programme](programme.md) are for ten hours a week. Falling behind
them means nothing. Only one thing matters: **do not skip the practice**.

A module without practice is a TV series about machine learning. It gives the feeling of
understanding, not the skill. This is not moralising: the difference between reading and doing
in technical subjects has been measured many times, and it is large.

## About AI assistants

You can and should use them — you will work in a world that has them. But with one rule:

**The assistant explains — you write.** Asking "why does a minus appear here" is excellent.
Asking "write me the solution to the exercise" means you have just paid, in money and time,
for a course whose result you threw away.

The check is simple: if you cannot explain a line of code aloud, it should not be in your
solution.

## About getting stuck

The thirty-minute rule: stuck — try on your own for thirty minutes, then go for help. Not two
days and not two minutes.

Where to go: the [course issues](https://github.com/DrobyshevDev/lemma/issues). "Here is where
I got stuck, here is what I tried" is the most useful feedback an author of a course can get:
it means the explanation did not work, and that is a defect in the text, not in you.

## About order

Parts I–II cannot be skipped, even if you already know something about ML. That is where the
language the rest of the course is written in gets introduced: claim, baseline, honest
comparison. Module 14 on PPO rests on Module 1 not rhetorically but literally — the same
bootstrap on the same seeds is there.

After that the order of parts III–VI can be changed if you have a goal. Part VII is always read
last.
