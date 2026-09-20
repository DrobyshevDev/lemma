# lemma

[Русский](README.md) · **English** · [Read the course](https://drobyshevdev.github.io/lemma/en/)

**A free course in machine learning, neural networks, reinforcement learning and
recommender systems — from nothing to reading and reproducing research.**

[![Site](https://img.shields.io/badge/site-drobyshevdev.github.io/lemma-4f46e5)](https://drobyshevdev.github.io/lemma/en/)
[![CI](https://github.com/DrobyshevDev/lemma/actions/workflows/ci.yml/badge.svg)](https://github.com/DrobyshevDev/lemma/actions/workflows/ci.yml)
[![Modules](https://img.shields.io/badge/modules-27-8A2BE2.svg)](https://drobyshevdev.github.io/lemma/en/programme/)
[![Text: CC BY 4.0](https://img.shields.io/badge/text-CC%20BY%204.0-lightgrey.svg)](LICENSE-CONTENT)
[![Code: MIT](https://img.shields.io/badge/code-MIT-green.svg)](LICENSE)

**[Read the course →](https://drobyshevdev.github.io/lemma/en/)**

## What this is

A roadmap through ML, DL and RL: what to learn, in what order, why, and how to tell that
you have actually learned it. Twenty-seven modules in seven parts, from the arithmetic of
a mean and a variance to reproducing a recent paper as a capstone.

Free and open, in full. No sign-up, no "first module free", no 24-month instalment plan.

A lemma is a statement proved not for its own sake but to prove the next one. The course
is built the same way: no module stands on its own, each one holds up what comes after.

Both languages are complete — twenty-seven modules in Russian and twenty-seven in English,
the same notebook behind each.

## What is different about it

Most courses teach you to train models. This one teaches you to **check claims**.

The field moves through papers, and the overwhelming majority of the improvements claimed
in them do not reproduce, dissolve under an honest comparison, or come from comparing a
tuned method against an untuned baseline. Someone who can train a model but cannot check
a claim cannot tell progress from noise — and builds on noise.

So a module does not end with "we got accuracy 0.93" but with "we checked that the
improvement survives a change of random seed and a comparison against an honest baseline".
Module 1 is about exactly that, before any machine learning at all.

The second difference is the tie to psychology where the tie is real: reinforcement
learning and behavioural psychology describe the same thing twice over, and recommender
systems are applied psychology of attention.

The third is that the course is written by the people who build the tools it uses. Where
run tracking is needed, that is `mlango`; where an agent loop with a readable trace is
needed, `glia`; where a trained policy has to be compared against a classical baseline,
`decisionrl`, which ships that baseline with every problem. None of the libraries is
required: everywhere the course also shows how to do the same thing by hand.

## Layout

```
docs/
  index.en.md              landing page (laid out in overrides/home.en.html)
  programme.en.md          all 27 modules
  capstone.en.md           the capstone: choosing a paper, reproducing it, writing it up
  prerequisites.en.md      what to know before starting
  how-to-study.en.md       how to study so that it works
  modules/                 modules, <name>.md in Russian and <name>.en.md in English
  assets/theme.css         a dark editorial theme over mkdocs-material
overrides/home.en.html     the landing template
notebooks/                 notebooks, one per module, shared by both languages
```

Notebooks run top to bottom with no edits and **on a CPU in reasonable time**. Where a full
run gives a different number, that is said outright. CI executes every notebook on Linux
and Windows: a reader whose notebook does not run does not have the course.

## Running it

From any module page, through the **"open in Colab"** link next to the notebook. There is
nothing to install: the course code imports only NumPy and Matplotlib, and Colab already
has both. A reader who cares about one module should not have to build an environment for it.

Locally, if you would rather keep everything yourself:

```bash
pip install -r requirements.txt
mkdocs serve            # → http://127.0.0.1:8000
jupyter lab notebooks/
```

## State

All twenty-seven modules are done — both language versions, a notebook for each, CI green.
The course can be taken end to end, from the first module to the capstone.

| Part | Modules | State |
|---|---|---|
| I. How claims are checked | 1–4 | **complete** |
| II. Classical ML | 5–7 | **complete** |
| III. Neural networks | 8–11 | **complete** |
| IV. RL and psychology | 12–16 | **complete** |
| V. Recommender systems | 17–20 | **complete** |
| VI. Agents | 21–23 | **complete** |
| VII. Out to the frontier | 24–27 | **complete** |

## Helping

The most useful feedback is **"I got stuck here"**. If an explanation did not work, that is
a defect in the text, not in the reader, and it needs to be known about. Open an
[issue](https://github.com/DrobyshevDev/lemma/issues) naming the module and the place.

Contribution rules — the [organisation's CONTRIBUTING.md](https://github.com/DrobyshevDev/.github/blob/master/CONTRIBUTING.md).

## Licences

Text and illustrations — [CC BY 4.0](LICENSE-CONTENT): take them, translate them, use them
in your own teaching, give credit. Code in the notebooks and scripts — [MIT](LICENSE).
