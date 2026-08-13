# Prerequisites

The course is written for someone who knows **neither machine learning nor higher
mathematics**. Linear algebra, probability and derivatives are introduced inside the course —
in modules 2–4 — and introduced for a concrete task, not "just in case".

Three things are needed from outside, and all three are about tools, not the subject.

## What you need to be able to do

### Python at the level of "I write and debug it myself"

Variables, lists and dictionaries, loops, functions, classes at the level of "I understand
what this is", reading someone else's code without panic. Virtual environments and
`pip install`.

Not needed: decorators, metaclasses, async, descriptors, type hints.

Check: if you can write, in half an hour, a function that reads a CSV, computes the mean of
a column and draws a histogram, that is enough. If not, the
[official Python tutorial](https://docs.python.org/3/tutorial/) covers what you need in a
couple of weeks.

### The command line

Change into a directory, run a script, look at the output, read an error message to the end
rather than to its first line.

### git

`clone`, `commit`, `push`, a branch, a pull request. Without this you cannot do the capstone
or publish a reproduction — and publishing a result is what the course was written for.
[Pro Git](https://git-scm.com/book/en/v2) is free; the first three chapters are enough.

## What you should **not** do

Do not take a linear algebra course before starting. This is the most common and most
expensive mistake: three months on abstract algebra, more than half of it forgotten by the
end, and a person who arrives at ML already tired. In Module 3 linear algebra is introduced
through regression and PCA — you see at once what every operation is for, and so it sticks.

The same goes for probability and calculus.

!!! tip "About SQL"
    SQL is not needed in the first modules. It will be needed in parts V and VII, when the
    data stops fitting into a single CSV. You can start the course without SQL; you cannot
    finish it without SQL, but you will have half a year to pick it up.

## Hardware

| | Minimum | Comfortable |
|---|---|---|
| Parts I–II | any laptop | — |
| Parts III–IV | Colab with a free GPU | your own GPU from 8 GB |
| Parts V–VI | Colab | 16 GB VRAM for the LLM modules |

Every notebook in the course is built to **run on CPU in a reasonable time** — on reduced
data, with an honest note about the number you would get on a full run. The absence of a GPU
should not stop the learning; it should slow down the experiments.

## Self-check

If the answer to all three questions is "yes", start with
[Module 1](modules/01-claim-baseline-noise.md).

1. I can write and run, from scratch, a Python script that computes something over a file.
2. I understand what a git branch is and what it is for.
3. I am ready for the first four modules to be about how to **check** results rather than how
   to train models — and for this to be not a delay before the interesting part, but the
   condition on which the interesting part has any meaning at all.
