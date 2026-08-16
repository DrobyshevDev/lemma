# Module 21. The agent loop

!!! abstract "After this module you will be able to"
    - Write an agent as a loop: the model thinks, calls a tool, gets an observation, thinks again.
    - Explain what a tool is and how the model decides which one to call.
    - Tell the agent's state and memory from its policy.
    - Read a trace as a sequence of thought → action → observation and find the place of an error in it.
    - Say why a readable trace matters more than it seems, and how it links the agent to eval from Part VII.

    **Time:** about two weeks. **Prerequisites:** [Module 11](11-language-models.md).
    **Notebook:** [`notebooks/21-the-agent-loop.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/21-the-agent-loop.ipynb)

## Why this

The language model from Module 11 can continue text, but cannot **act**: look something up, compute, run code.
An agent is a model placed in a loop with tools. There is nothing more to the word "agent" than that, and the
loop fits on one screen.

<figure class="lm-inline-fig">
<svg viewBox="0 0 440 176" role="img" aria-label="The agent loop: the model thinks and chooses an action, the tool executes it and returns an observation, the model thinks again; when the task is solved, the model gives an answer.">
  <rect x="40" y="30" width="150" height="52" rx="10" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.5"/>
  <text x="115" y="60" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--serif);font-size:15px;font-weight:600">Model</text>
  <rect x="270" y="30" width="150" height="52" rx="10" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.5"/>
  <text x="345" y="60" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--serif);font-size:15px;font-weight:600">Tool</text>
  <path d="M190 48 H268" style="fill:none;stroke:var(--paper-faint);stroke-width:1.4" marker-end="url(#atar)"/>
  <text x="229" y="40" text-anchor="middle" style="fill:var(--accent);font-family:var(--mono);font-size:9px">action</text>
  <path d="M270 66 C 210 96, 175 96, 115 84" style="fill:none;stroke:var(--paper-faint);stroke-width:1.4" marker-end="url(#atar)"/>
  <text x="195" y="112" text-anchor="middle" style="fill:var(--gold);font-family:var(--mono);font-size:9px">observation</text>
  <path d="M115 84 V 140 H 250" style="fill:none;stroke:var(--paper-faint);stroke-width:1.4;stroke-dasharray:4 3" marker-end="url(#atar)"/>
  <rect x="256" y="128" width="120" height="30" rx="8" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.2"/>
  <text x="316" y="147" text-anchor="middle" style="fill:var(--paper-bright);font-family:var(--mono);font-size:10px">answer</text>
  <text x="150" y="136" style="fill:var(--paper-faint);font-family:var(--mono);font-size:9px">when solved</text>
  <defs><marker id="atar" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--paper-faint)"/></marker></defs>
</svg>
</figure>

## Tools

A **tool** is a function the agent can call: search, a calculator, a query to a database, running code. The
model does not execute it itself — it **chooses** which tool and with what arguments, and a wrapper around the
model performs the call and returns the result. This is the same language as in Module 11: the model outputs
text, but by format it is read as "call such-and-such a tool", not as an answer to the user.

The important thing is that the model can do nothing itself beyond text. Computing exactly, remembering a fact,
seeing a fresh price — all of this is done by tools. A good agent is a modest model with honest tools, not an
all-knowing model without them.

## State, memory and policy

Three different things that are easy to confuse.

**State** — what the agent sees right now: the task plus the steps already taken. **Memory** — what carries
forward: a brief summary, facts, past decisions; without it a long dialogue does not fit into the context.
**Policy** — how the next action is chosen from the state; in an LLM agent the policy is played by the model
itself.

Planning is a special case of the policy: break the task into steps and follow them rather than grabbing the
first tool. But a plan is no guarantee; after each observation the agent may turn aside.

## The trace

Here is the module's main practical skill. Everything the agent did is a sequence of **thought → action →
observation**, and you have to be able to read it.

<div class="lm-fig" data-lm-fig="agent-trace"></div>

Press "next step". The agent solves the task not in one jump but in a loop: it thought about what was missing,
called a tool, looked at the result, called the next one, and only having gathered everything — answered. The
trace is not a log for show, but **the only place where you can see what the agent actually did.** An answer
can be correct with wrong reasoning and vice versa; telling one from the other is possible only by the steps.

Hence the requirement for the course's tools: **the trace must be readable.** Where an agent loop that can be
traced step by step is needed, that is [glia](https://github.com/DrobyshevDev/glia): the loop fits on a screen,
and every step — thought, call, observation — is recorded so that a week later you can tell where it all went
wrong. An agent without a readable trace is a black box that is sometimes right.

<div class="lm-thread" markdown>
**The trace is a future eval.** Since everything the agent did is recorded step by step, its work can be checked
by the trace: were the tools right, in the right order, is the answer honest? This is a direct road to
[Module 23](../programme.md), where eval is a test from [Module 7](07-honest-comparison.md), and regression is
the difference between the traces of two runs. A readable trace here is the same as a reproducible run in Module
1: without it there is nothing to check.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/21-the-agent-loop.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/21-the-agent-loop.ipynb).
Only `numpy` and `matplotlib`, computes instantly.

What is inside:

1. An agent loop from scratch: a stub model plus honest tools (a calculator, a directory). A loop of twenty
   lines, and it produces a trace.
2. The trace as a debugging artefact: we break one tool and find the point of failure by the trace, not by
   guessing.
3. Regression as a difference of traces: two runs with different tool versions, a diff of traces. This is eval
   from Module 23 in embryo.

### Part 2. Your own agent

Take a task you solve in several steps with external sources.

1. Break it into thought → action → observation. How many steps and which tools?
2. What here is state, what memory, what policy?
3. Where is the agent most likely to turn aside, and how would it be visible in the trace?
4. What would an answer correct with wrong reasoning look like?

## Assignment

1. Implement an agent loop with two tools and stopping on an answer. Fit it on one screen.
2. Run three tasks and print the traces. From the trace, reconstruct what the agent thought at each step.
3. Break one tool (let it return garbage) and show that the trace points to the exact place of failure.
4. Add memory: a summary of past steps so a long task fits into the context. What is lost in the compression?
5. Run one task twice with different tools and build a diff of the traces. This is the regression from Module 23.

## Self-check

1. What does the agent loop consist of and how does it differ from a single answer of the model?
2. What is a tool and why does the model not execute it itself?
3. How do the agent's state, memory and policy differ?
4. Why is the trace the only place where you can see what the agent did?
5. Can an answer be correct with wrong reasoning? How would you notice?
6. Why does a readable trace matter more than it seems?
7. How does the trace link the agent to eval from Module 23?

## Next

In [Module 22](../programme.md) — retrieval with verifiability: RAG, hybrid search, a reranker and, above all,
citation checking — how to make an answer that cannot be made up, by tying every statement to a source. The
"search" tool from this module becomes a full subsystem, and the demand for honesty becomes a mechanism binding
each claim to a source.

> An agent is a model in a loop with tools: it thinks, acts, observes, until it decides. Everything it did is
> recorded in the trace, and the trace is the only thing you can judge by, rather than guess.

---

!!! quote "The principle"
    A good agent is a modest model with honest tools and a readable trace, not an all-knowing model taken at its
    word. A correct answer with wrong steps is luck, not work.
