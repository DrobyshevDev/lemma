# Module 3. Linear algebra as a language

!!! abstract "After this module you will be able to"
    - Read the dot product as similarity, and a matrix as a transformation rather than a table of numbers.
    - Derive linear regression from geometry rather than memorise a formula.
    - Explain why the regression residual is orthogonal to the features, and check it numerically.
    - Compute PCA by hand through the eigenvectors of the covariance.
    - Say, from the condition number, whether a task will have a hard time in Module 4.

    **Time:** about two weeks. **Prerequisites:** [Module 2](02-data-and-probability.md).
    **Notebook:** [`notebooks/03-linear-algebra.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/03-linear-algebra.ipynb)

## Why this

Linear algebra is not a separate subject to get through before machine learning. It is the notation
in which everything ahead is written. A network layer is a multiplication by a matrix. An embedding
is a vector. The similarity of two texts is a dot product. Training is the motion of a point in the
space of weights.

A course that starts with abstract vector spaces spends three months and leaves a person with the
feeling of having studied something. Here every operation is introduced together with the task it
solves.

There will be two tasks: linear regression and PCA. Both are derived, not presented.

## The vector

A vector is an ordered list of numbers. It can be read two ways, and both readings are needed.

**A point.** An object with three features is a point in three-dimensional space. A thousand
features — a point in a thousand-dimensional one. It cannot be pictured, it can be worked with: the
arithmetic is the same.

**A direction and a length.** An arrow from the origin. From this "the distance between objects" and
"the angle between them" acquire meaning.

**The length** (norm):

$$\|x\| = \sqrt{\sum_i x_i^2}$$

**The distance** between objects is the length of the difference $\|x - y\|$.

## The dot product

The main operation of the course. It is also the most underrated.

$$x \cdot y = \sum_i x_i y_i = \|x\|\,\|y\|\cos\theta$$

Two definitions, one number. The left one is computed, the right one is understood.

Everything follows from the right one. Vectors point the same way — the product is large and
positive. Perpendicular — zero. Point in different directions — negative.

**The dot product measures the alignment of directions.** That is why it is used to measure
similarity.

The length gets in the way: a long vector gives a large product simply because it is long. Remove it
and get **cosine similarity**:

$$\cos\theta = \frac{x \cdot y}{\|x\|\,\|y\|}$$

This is the very metric that embedding search stands on — including the hybrid search from Module 22.
There is no other magic there: text turns into a vector, closeness is computed by the cosine.

**The projection** of $x$ onto a direction $u$ (of unit length) equals $(x \cdot u)\,u$. The shadow a
vector casts on a line. Two pages from now regression will be derived from this.

## A matrix as a transformation

A matrix looks like a table of numbers. It works like a function: it takes a vector, returns a
vector.

$$y = Ax$$

The key to understanding is to look at what happens to the columns:

$$Ax = x_1 a_1 + x_2 a_2 + \dots + x_n a_n$$

where $a_i$ are the columns of $A$. **The result is a linear combination of the columns, and the
coordinates of $x$ are the weights in that combination.**

From this two consequences follow at once that are usually learned separately.

All possible $Ax$ fill the **column space** — what can be built from the columns of $A$. If $A$ has
three columns in a ten-dimensional space, you can only reach a three-dimensional plane inside it.

Matrix multiplication $AB$ is: apply $B$, then $A$. Non-commutativity stops being a quirk: to rotate
and stretch is not the same as to stretch and rotate.

## Linear regression from geometry

Now the first real task.

There are $n$ objects, each with $d$ features. A matrix $X$ of size $n \times d$: a row is an object,
a column is a feature. A vector of answers $y$ of length $n$. We seek weights $w$ so that $Xw$ is
close to $y$.

There is usually no exact solution: $y$ lies in an $n$-dimensional space, while $Xw$ ranges over
only the $d$-dimensional column space. When $n > d$ you cannot land exactly.

**So we seek the nearest point.** The nearest point of a plane to a point outside it is the foot of
the perpendicular. That is the projection, and the whole of regression is that one word.

The error $y - Xw$ must be perpendicular to the column space, that is, to every column of $X$:

$$X^{\mathsf{T}}(y - Xw) = 0$$

Expand and get the **normal equation**:

$$X^{\mathsf{T}}Xw = X^{\mathsf{T}}y \quad\Longrightarrow\quad w = (X^{\mathsf{T}}X)^{-1}X^{\mathsf{T}}y$$

The formula usually given to memorise came here from a single geometric sentence: the nearest point
is the foot of the perpendicular.

!!! note "A checkable consequence"
    The regression residual is orthogonal to every feature. This is not theory: compute the dot
    product of the residual with any column of $X$ — you get zero to machine precision. In the
    notebook this is the third exercise.

    If it is not zero — you solved the wrong task or made a mistake in the code. A useful test.

!!! warning "In practice you do not compute the inverse"
    `np.linalg.inv(X.T @ X) @ X.T @ y` will give the right answer on textbook data and lose precision
    on real data. Explicitly inverting a matrix is numerically unstable. Use `np.linalg.lstsq`: it
    solves the same system through a decomposition, without inversion.

    The formula is to be understood. It is not to be implemented literally.

## Eigenvectors and PCA

A matrix rotates and stretches vectors. But almost every matrix has directions it does **not
rotate** — only stretches:

$$Av = \lambda v$$

$v$ is an eigenvector, $\lambda$ is an eigenvalue. These are the transformation's distinguished axes:
along them it is arranged simply, as multiplication by a number.

The second real task — PCA — is entirely about them.

There is a cloud of points. The question: along which direction is it stretched the most?

The spread of the data along a direction $u$ is the variance of the projections, and it equals
$u^{\mathsf{T}} C u$, where $C$ is the covariance matrix. We seek a unit-length $u$ maximising this
quantity.

The answer: **the eigenvector of $C$ with the largest eigenvalue.** The eigenvalue itself equals the
variance along it.

Hence PCA in full:

1. Centre the data.
2. Compute the covariance matrix.
3. Take its eigenvectors and eigenvalues.
4. Sort by descending eigenvalue.
5. The first $k$ vectors are the new axes, the fraction of variance explained is the fraction of the
   sum of their eigenvalues.

Five lines in NumPy, and not a single library function harder than `eigh`.

## Conditioning

The last thread, and it is a bridge into the next module.

**The condition number** of a matrix is the ratio of the largest eigenvalue to the smallest:

$$\kappa = \frac{\lambda_{\max}}{\lambda_{\min}}$$

It says how differently the matrix stretches the space along different axes. $\kappa$ near one — the
cloud is round. $\kappa$ of a thousand — the cloud is stretched a thousandfold, a long narrow ravine.

For regression a large $\kappa$ means that $X^{\mathsf{T}}X$ is almost singular: two features are
almost linearly dependent, and the weights become huge and unstable. Change one object in the data —
the weights jump.

For gradient descent, which begins in Module 4, a large $\kappa$ means the descent will zigzag off
the walls of the ravine instead of moving along its floor. This is the main reason features are
normalised, and it is geometric, not hygienic.

## Practice

### Part 1. The notebook

Open [`notebooks/03-linear-algebra.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/03-linear-algebra.ipynb).

What is inside:

1. Cosine similarity on toy embeddings. Why it does not work without dividing by the length.
2. A matrix as a transformation: we watch what happens to the unit square.
3. Regression through the normal equation by hand, checked against `lstsq`.
4. A check of the residual's orthogonality. A number that should be zero.
5. PCA by hand through `eigh`, checked against a search over directions.
6. The condition number: we make two nearly identical features and watch what happens to the weights.

### Part 2. Regression on your own data

Take any table with a numerical target. Your own, a textbook one, a generated one — it does not
matter.

1. Assemble $X$ and $y$, add a column of ones for the intercept.
2. Solve the normal equation through `lstsq`.
3. Check the residual's orthogonality to every column of $X$.
4. Compute the condition number of $X^{\mathsf{T}}X$.
5. Add a feature equal to the sum of two already present. Recompute the condition number and the
   weights. Explain in writing what happened.

The fifth point is collinearity in its pure form, and seeing it on your own data is more useful than
reading the definition.

## Assignment

1. Prove on paper that if $u$ is of unit length, the projection of $x$ onto $u$ equals $(x \cdot u)u$.
   Two lines are enough.
2. Derive the normal equation yourself, without looking at the text. Start from the sentence "the
   residual is perpendicular to the columns".
3. Take a $2 \times 2$ matrix to your taste. Find its eigenvectors by hand, through the
   characteristic equation. Check with `np.linalg.eig`.
4. Build a dataset whose first principal component explains more than 95% of the variance. Build
   another where the first two explain less than 60%. Describe in words how the clouds differ.
5. Take the regression from the practice and find the feature with the largest weight by magnitude.
   Does that mean it is the most important? Scale the features and recompute. Did the answer change?

## Self-check

1. What does a dot product equal to zero mean? A large positive one?
2. Why is cosine similarity divided by the lengths?
3. What is the column space and why can regression not leave it?
4. From what geometric sentence does the normal equation follow?
5. Why is the residual orthogonal to the features? How do you check it in one line of code?
6. What is an eigenvector in words, without a formula?
7. Why is the first principal component an eigenvector of the covariance matrix?
8. What does a large condition number foretell — for the regression weights and for gradient descent?

## Next

In [Module 4](../programme.md) the derivative appears, and with it a way to search for a minimum when
there is no solution formula. Regression here was solved exactly, by a single equation. From the next
module on there will be no more exact solutions, and everything remaining in the course is motion
towards a minimum in small steps.

> A matrix is a function. The dot product is similarity. Regression is a perpendicular.
