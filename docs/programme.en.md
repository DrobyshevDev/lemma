# Programme

Twenty-seven modules in seven parts. The order is not arbitrary: parts I–II give the tool of
checking and the baselines that parts III–VI will have to beat, and part VII turns all of it
into the skill of working with someone else's results.

The time estimate is for a person studying about ten hours a week. A module counts as done
when its notebook runs top to bottom without edits and you can answer the "self-check"
questions without looking.

---

## Part I. How claims are checked

Mathematics is introduced here not "just in case" but for a concrete task: to see when one
number means a result and when it means noise.

| | Module | About | Time |
|---|---|---|---|
| 1 | [What "works" means](modules/01-claim-baseline-noise.md) | Claim, baseline, noise. Mean, variance, confidence interval, RNG seeds, IQM and the bootstrap. We check a published claim by hand | 1 wk |
| 2 | [Data and probability](modules/02-data-and-probability.md) | Parameter versus estimate, the law of large numbers and the CLT, a formula for the number of seeds, Bayes' theorem on a rare event. Overfitting as a phenomenon, not a term | 2 wk |
| 3 | [Linear algebra as a language](modules/03-linear-algebra.md) | Vector, matrix as a transformation, projection, eigenvalues. All through regression and PCA, derived from scratch, without abstract exercises | 2 wk |
| 4 | [Derivatives and optimisation](modules/04-derivatives-and-optimisation.md) | Gradient, chain rule, gradient check, step length, ravines, momentum and SGD. We write descent from scratch and watch where it breaks | 2 wk |

## Part II. Classical ML: the lines you have to beat

This part exists because without it there is no way to understand what a neural network's
result means. More than half of the "breakthroughs" lose to properly tuned boosting.

| | Module | About | Time |
|---|---|---|---|
| 5 | [Linear models and metrics](modules/05-linear-models-and-metrics.md) | Linear and logistic regression, regularisation. Why accuracy almost always lies, and what to compute instead | 2 wk |
| 6 | [Trees and ensembles](modules/06-trees-and-ensembles.md) | Decision tree, random forest, gradient boosting. Why it still beats neural networks on tabular data | 2 wk |
| 7 | [Honest comparison](modules/07-honest-comparison.md) | Splits, cross-validation, leaks, peeking at the test set. Run tracking, so a number can be produced again half a year later | 1 wk |

## Part III. Neural networks

| | Module | About | Time |
|---|---|---|---|
| 8 | [Fully connected networks and backprop](modules/08-neural-networks-and-backprop.md) | Forward and backward pass from scratch in NumPy, a gradient check accepted before training. Initialisation, vanishing gradient and an honest comparison with the boosting from Module 6 | 2 wk |
| 9 | [Convolutions and representations](modules/09-convolutions.md) | Convolutional layer and pooling from scratch, equivariance versus invariance, augmentations, transfer learning. What the network learned and how to look at it | 2 wk |
| 10 | [Sequences and attention](modules/10-sequences-and-attention.md) | RNNs and why they were displaced. The attention mechanism and the transformer — we write attention from scratch, and check the division by the square root of the dimension by hand | 3 wk |
| 11 | [Language models](modules/11-language-models.md) | Pre-training as next-token prediction, fine-tuning, temperature, quantisation. Evaluating an LLM and why benchmark contamination is a leak from Module 7 | 3 wk |

## Part IV. Reinforcement learning and psychology

| | Module | About | Time |
|---|---|---|---|
| 12 | [Environment, reward, policy](modules/12-environment-reward-policy.md) | Markov decision process, return and discount, the Bellman equation and value iteration. Thorndike's law of effect and operant conditioning as the same model a hundred years earlier | 2 wk |
| 13 | [TD learning and dopamine](modules/13-td-learning-and-dopamine.md) | The reward prediction error, bootstrapping, TD versus Monte Carlo. Schultz's 1997 experiments, where the firing of dopamine neurons matched the error signal in the algorithm — a rare case of an algorithm predicting neuroscience | 2 wk |
| 14 | [Policy gradient and modern methods](modules/14-policy-gradient.md) | REINFORCE, baseline and advantage, actor-critic, PPO, SAC. Why reproducibility in RL is especially poor and how it is checked with the bootstrap from Module 1 | 3 wk |
| 15 | [RL where a mistake has a cost](modules/15-rl-with-a-cost.md) | Inventory control, the newsvendor baseline, non-stationarity. An honest comparison with a tuned operations-research classic: when learning wins and when the classics are already optimal | 2 wk |
| 16 | [Reward as a specification](modules/16-reward-as-specification.md) | Goodhart's law, reward hacking, RLHF and the KL penalty. What happens when you optimise something other than what you meant — the same mistake as in the feed and on the leaderboard | 2 wk |

## Part V. Recommender systems and the economy of attention

| | Module | About | Time |
|---|---|---|---|
| 17 | [Collaborative filtering](modules/17-collaborative-filtering.md) | Interaction matrix, neighbours, matrix factorisation, the cold start. Popularity bias and the "top popular" baseline from Module 1 | 2 wk |
| 18 | [Neural recommenders and ranking](modules/18-neural-recommenders-and-ranking.md) | Two-tower, sequential models, ranking metrics (NDCG). Why the offline metric on logs is optimistic and blind, and only an A/B test is honest | 2 wk |
| 19 | [Feedback loops and attention](modules/19-feedback-loops-and-attention.md) | A system learns on the data it produced itself. The filter bubble, the Matthew effect, engagement as a proxy and its psychological cost. The two senses of "attention" | 2 wk |
| 20 | [A/B tests and causality](modules/20-ab-tests-and-causality.md) | The confounder and randomisation, peeking at interim results, multiple comparisons. The same arsenal as Module 1, but on live users | 2 wk |

## Part VI. Agents

| | Module | About | Time |
|---|---|---|---|
| 21 | [The agent loop](modules/21-the-agent-loop.md) | Tools, state, memory, planning. We write a loop that fits on one screen, a readable trace, and how eval grows out of it | 2 wk |
| 22 | [Retrieval and verifiability](modules/22-retrieval-and-verifiability.md) | RAG, hybrid search, reranker. Citation checking: how to make an answer that cannot be made up | 2 wk |
| 23 | Evaluating agents | Eval as a test, a golden set, regression as the difference between runs | 1 wk |

## Part VII. Reaching the frontier

The previous six parts were written for this one.

| | Module | About | Time |
|---|---|---|---|
| 24 | How to read a paper | The structure of a paper, what to read first, where to look for the weak spot. We take apart three papers: a strong one, a weak one, and a retracted one | 1 wk |
| 25 | How the field is organised | arXiv, conferences, peer review, benchmarks. Why a leaderboard is a poor source of truth and how to use it anyway | 1 wk |
| 26 | Reproduction | From a paper to working code: what the paper left out, how to ask the authors, what counts as success | 2 wk |
| 27 | How to keep up with the field | The practice of reading: sources, filters, notes, how not to drown in the stream and not fall behind | 1 wk |

## The capstone

Take a paper published after you began, reproduce its central claim, compare it against an
honest baseline, and publish a report: what matched, what did not, and why. The report is an
open repository with code that runs and numbers that can be recomputed.

This is not an exercise. It is exactly the work a researcher does in the first month of a new
job, and the only proof that the course worked.

---

## In total

**About 50 weeks** at ten hours a week — a year at an unhurried pace, or half a year at a
dense one. Parts I–II (8 weeks) make sense on their own: even if you stop there, you will read
papers more carefully than most of the people who write them.
