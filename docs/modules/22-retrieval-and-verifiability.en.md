# Module 22. Retrieval and verifiability

!!! abstract "After this module you will be able to"
    - Explain RAG: why an answer is built on retrieved documents, not on the model's memory.
    - Compute semantic search as a dot product of embeddings and say where it loses to an exact word.
    - Explain why hybrid search exists and what a reranker adds on top of cheap retrieval.
    - Check citations: tie every claim in an answer to its source and catch the fabrication.
    - Say why verifiability turns fluent text into an answer you can trust.

    **Time:** about two weeks. **Prerequisites:** [module 21](21-the-agent-loop.md) and [module 11](11-language-models.md).
    **Notebook:** [`notebooks/22-retrieval-and-verifiability.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/22-retrieval-and-verifiability.ipynb)

## Why this

The language model from module 11 knows only what was in training: it does not see anything fresh, it confuses details, it confidently makes up what is missing. The "search" tool from module 21 fixes this — but only for real if you turn it into a subsystem and tie every word of the answer to a source.

**RAG** (retrieval-augmented generation) — generation that leans on what was retrieved. The scheme is simple: for a question, find relevant documents, put them in the context, and the model answers **from them**, not from memory.

<figure class="lm-inline-fig">
<svg viewBox="0 0 460 118" role="img" aria-label="RAG chain: the query goes to search, search returns documents, documents go into the model's context, the model produces an answer with citations.">
  <g style="font-family:var(--mono);font-size:9px">
    <rect x="10" y="42" width="66" height="34" rx="7" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.2"/>
    <text x="43" y="62" text-anchor="middle" style="fill:var(--paper-bright)">query</text>
    <rect x="110" y="42" width="66" height="34" rx="7" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.2"/>
    <text x="143" y="62" text-anchor="middle" style="fill:var(--paper-bright)">search</text>
    <rect x="210" y="42" width="72" height="34" rx="7" style="fill:var(--ink-raised);stroke:var(--gold);stroke-width:1.2"/>
    <text x="246" y="62" text-anchor="middle" style="fill:var(--paper-bright)">documents</text>
    <rect x="316" y="42" width="66" height="34" rx="7" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.2"/>
    <text x="349" y="62" text-anchor="middle" style="fill:var(--paper-bright)">model</text>
    <rect x="410" y="42" width="44" height="34" rx="7" style="fill:var(--ink-raised);stroke:var(--accent);stroke-width:1.2"/>
    <text x="432" y="58" text-anchor="middle" style="fill:var(--paper-bright)">answer</text>
    <text x="432" y="70" text-anchor="middle" style="fill:var(--accent);font-size:7px">+ cites</text>
    <path d="M76 59 H108" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#rgare)"/>
    <path d="M176 59 H208" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#rgare)"/>
    <path d="M282 59 H314" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#rgare)"/>
    <path d="M382 59 H408" style="fill:none;stroke:var(--paper-faint)" marker-end="url(#rgare)"/>
    <text x="246" y="30" text-anchor="middle" style="fill:var(--paper-faint)">put in context</text>
  </g>
  <defs><marker id="rgare" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" style="fill:var(--paper-faint)"/></marker></defs>
</svg>
</figure>

RAG fixes two of the model's troubles at once: freshness (documents can be updated without retraining) and fabrication (the answer is forced to lean on text that sits right next to it).

## How search works

**Semantic search.** The query and the documents are turned into embeddings — the vectors from [module 17](17-collaborative-filtering.md) — and closeness is measured by the dot product from [module 3](03-linear-algebra.md). It finds by meaning: "how to shrink a model" will pull up a document about quantization even if the word "shrink" is not in it.

But semantics has a blind spot — the **exact word**. A product code, a function name, a rare term: the embedding blurs it and an exact match loses it. Here the old **lexical** keyword search wins.

Hence **hybrid search**: semantics and lexicon are added together, and each covers the other's blind spot. Meaning is caught by semantics, the exact word by the lexicon.

**The reranker** comes next. Cheap retrieval pulls fifty candidates with high recall; then a slow but precise model reorders the top of the list. This is exactly the ranking from [module 18](18-neural-recommenders-and-ranking.md): what matters is not "did it turn up" but "is it at the top".

## Checking citations

Now the main thing, the point of all of it. RAG puts documents in the context, but the model can still make something up — slip into a fluent answer a claim that is not in the sources. Fluency hides this: a falsehood sounds just as smooth as the truth.

The cure is to **tie every claim to a source and check it**. An answer that cannot be made up is not an answer in a confident tone — it is an answer where every word points to a line in a document, and that line can be opened.

<div class="lm-fig" data-lm-fig="citation-check"></div>

Press "check citations". Three claims are supported by their sources, one is not: the model wrote "98%", the source says "91%". Without the check that claim would pass as part of the smooth text; with the check it turns red. Verifiability is not a decoration on the answer — it is the difference between "sounds plausible" and "true".

<div class="lm-thread" markdown>
**Checking a claim — module 1 again.** In [module 1](01-claim-baseline-noise.md) you checked a number from a paper: what it is compared against, how many times it was run. Here it is the same thing, but for an agent's answer: is every claim supported by a source. And the dot product that search stands on is the same one from [module 3](03-linear-algebra.md), [module 17](17-collaborative-filtering.md) and the attention of [module 10](10-sequences-and-attention.md). One trick measures similarity everywhere — from regression to a citation.
</div>

## Practice

### Part 1. The notebook

Open [`notebooks/22-retrieval-and-verifiability.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/22-retrieval-and-verifiability.ipynb). Only `numpy` and `matplotlib`, runs in seconds.

What is inside:

1. Semantic search as a dot product and its blind spot on the exact word. Hybrid with a lexicon covers both: recall higher than either alone.
2. The reranker: cheap retrieval gives recall, reordering the top gives precision. Precision@k goes up.
3. Checking citations: we compare every claim in an answer against its source and catch the made-up one. Fluency does not survive the check.

### Part 2. Your own search

Take a set of documents you answer questions from: your wiki, a knowledge base, a folder of notes.

1. Which query will semantics find but the exact word lose, and the other way round?
2. Where do you need a reranker, and where is cheap retrieval enough?
3. Take any model answer over these documents and check every claim against its source. How many held up?
4. Which claim sounded the most convincing — and did it hold up?

## Assignment

1. Implement semantic search on the cosine of embeddings and find a query where it loses to keyword search.
2. Build a hybrid: add normalized semantic and lexical scores. Show that hybrid recall is no lower than either.
3. Add a reranker: cheap retrieval to the top 20, precise re-scoring of the top. Plot precision@k before and after.
4. Implement citation checking: a claim is supported if its anchor is present in the source. Run it on an answer with one fabrication and catch it.
5. Build an answer where the fabricated claim sounds more convincing than the supported ones. Show that the check does not follow persuasiveness.

## Check yourself

1. What is RAG and which two troubles of the model does it fix?
2. How is semantic search computed and where is its blind spot?
3. Why hybrid search and what does the lexicon cover?
4. What does the reranker do and which module does it rhyme with?
5. Why does RAG alone not guarantee the truth?
6. What does "tie a claim to a source" mean and how do you check it?
7. Where else in the course did the same dot product appear?

## Next

In [module 23](../programme.md) checking a single answer grows into systematic evaluation of an agent: eval as a test, a golden set as the reference, a regression as the difference between runs. The citation check from here becomes one of the automatic tests, and the trace from module 21 becomes what that test reads.

> RAG builds the answer on retrieved documents, not on the model's memory; hybrid search catches both meaning and the exact word; the reranker lifts the right thing to the top. But what makes the answer true is only the citation check — tying every claim to a source.

---

!!! quote "Principle"
    Fluency and truth sound the same, so what you can trust is not the tone of the answer but its link to the source. An answer that cannot be made up is an answer whose every word points to a line you can open.
