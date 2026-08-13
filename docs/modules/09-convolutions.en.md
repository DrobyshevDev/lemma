# Module 9. Convolutions and representations

!!! abstract "After this module you will be able to"
    - Name the two assumptions about the data that a convolution builds into the model, and say when they are false.
    - Count the number of parameters of a convolutional and a fully connected layer and explain the hundredfold difference.
    - Write a convolution and pooling from scratch and pass their gradient check.
    - Show on data that a convolutional network survives a shift of the image and a fully connected one does not.
    - Look at what the first layer learned and recognise edge detectors in it.

    **Time:** about two weeks. **Prerequisites:** [Module 8](08-neural-networks-and-backprop.md).
    **Notebook:** [`notebooks/09-convolutions.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/09-convolutions.ipynb)

## Why this

Module 8 ended in a defeat: on tabular data the network lost to boosting. The explanation was
structural — the columns of a table can be permuted and nothing changes, so there is nothing to
extract.

With an image it is not so. Permute the pixels — the picture disappears. Neighbouring pixels are
related, and the same detail can end up in any corner of the frame. This is **structure**, and an
architecture that knows it beats an architecture that ignores it.

A convolutional network is the first case in the course where the gain comes not from optimisation but
from an assumption about the data built into the model.

## What is wrong with a fully connected layer

Take a 28×28 greyscale image. A fully connected layer of 128 neurons:

$$784 \times 128 + 128 = 100\,480 \text{ parameters}$$

A hundred thousand parameters for one layer, and this is still a small picture. But something else is
more expensive.

**A fully connected layer does not know the pixels are neighbours.** For it the input is just a vector
of 784 numbers. Shuffle the pixels the same way in all the images, and the layer will learn exactly as
well. All the information that adjacent pixels are related was thrown away the moment the picture was
stretched into a vector.

**And it does not know a detail can shift.** A cat in the top-left corner and the same cat in the
bottom-right are two completely different inputs to a fully connected layer. It will have to learn a
cat detector separately for each position.

## The two assumptions of a convolution

A convolution fixes both troubles by adding two statements about the world to the model.

**Locality.** Important features are assembled from neighbouring pixels. An edge, a corner, a texture —
all of this is visible in a 3×3 window, and there is no need to look at the whole frame at once. So a
neuron can look only into a small window.

**Weight sharing.** An edge detector is useful at any point of the frame. So one and the same window of
weights is dragged across the whole image, rather than started anew for each position.

From the second follows **translation equivariance**: shift the input — the output shifts the same
way. The feature stays found, just in a different place.

!!! warning "These are assumptions, not truths"
    Both statements can be false, and then the convolution is harmful.

    In tabular data the adjacency of columns means nothing: the feature "age" stands next to "city" by
    chance. A convolution over such a row imposes a link that is not there.

    In a task where the position matters in itself — say, a defect matters only in the corner of a part
    — weight sharing erases exactly the information that is needed.

    The rule is the same as with momentum in Module 4 and the forest in Module 6: the trick introduces
    an assumption, and it works exactly where the assumption is true.

## The convolutional layer

A kernel of size $k \times k$ slides over the image. At each position the dot product of the kernel with
the covered piece is computed — the very dot product from Module 3, and it means the same thing: how
much the piece resembles what the kernel is looking for.

The output size for stride $s$ and padding $p$:

$$n_{\text{out}} = \left\lfloor \frac{n_{\text{in}} + 2p - k}{s} \right\rfloor + 1$$

A layer usually contains several kernels — output **channels**. Each looks for its own: one horizontal
edges, another vertical ones, a third blobs.

The number of parameters:

$$k \times k \times C_{\text{in}} \times C_{\text{out}} + C_{\text{out}}$$

**It does not depend on the image size.** A layer of 8 kernels of 3×3 on a single-channel input is 80
parameters, and there will be just as many on a 28×28 picture and on a 1024×1024 one. Against a hundred
thousand for a fully connected one.

## Pooling

The second brick, and it carries more than it seems.

Max-pooling 2×2 takes the maximum in each window, reducing the map by half along each side. It also
reduces the amount of computation fourfold, which is what allows building deep networks.

But the main thing — it changes the type of symmetry. **A convolution gives equivariance: shifted the
input — the output shifted.** The feature is found, just in a different place. Pooling turns it into
**invariance: shifted the input — the output did not change at all.**

!!! danger "One convolution is not enough for invariance"
    Assemble a network as convolution → 2×2 pooling → `flatten` → fully connected layer, and it will
    **not** be robust to a shift. The 2×2 pooling damps a one-pixel shift, and then `flatten` ties
    everything back to positions again: the fully connected layer sees not "a feature is found" but "a
    feature is found in cell number 37".

    This is not theory. In the notebook such an architecture, on a shift of two pixels, gives 0.75 —
    exactly the same as a plain fully connected network. There is a convolution, there is no invariance.

    It is cured by **global pooling**: the maximum is taken over the whole map at once, and from each
    kernel one number remains — it fired or it did not, no matter where. With it the same network holds
    1.000 on shifts up to three pixels and 0.98 on five.

    The difference between the two variants is one line of code and the whole point of the module.

## What the first layer learns

The trained kernels of the first layer can simply be drawn, and this is one of the few honest chances
to look inside a network.

The same thing is always found there: **edge detectors of different orientations and blobs.** Not
because they were put there, but because this is the optimal first step for almost any vision task.

The coincidence is remarkable: the same thing is found in the primary visual cortex of mammals — cells
responding to an edge of a particular orientation. Two independent optimisation processes, evolution
and gradient descent, arrived at the same solution.

Deeper it gets worse: the second layer — corners and arcs, further on — parts of objects, and at the
top layers the interpretation of the kernels stops working. What is actually there is the subject of a
separate field, and in Module 24 a paper on this topic will be examined.

## Augmentations

A trick that looks like cheating and is not.

We flip, rotate, shift, change the brightness of the training images — and get "more data". But there
is no more data: the new pictures carry no new information about the world.

It works differently. **Augmentation is a way to tell the model an invariance you know and it does
not.** By showing a cat and its reflection with one label, you said: reflection does not change the
class. This is the same as building the property into the architecture, only cheaper.

Hence the rule of choice: apply only those transformations under which the label **really** does not
change. The reflection of the digit 6 does not give a 6. Rotating an X-ray by 180 degrees gives an
image that does not occur. An augmentation that violates the meaning of the task is adding noise under
the guise of data.

## Transfer learning

The first layers learn edges and textures, and they are the same for any vision task. So they can be
not learned anew.

You take a network trained on a large set, freeze its early layers, and retrain the last ones for your
task. On a thousand pictures of yours this works incomparably better than training from scratch —
because a thousand pictures is enough to fine-tune the head, but not enough to learn edge detectors.

This is the most practical trick of all of Part III, and in real work it is applied more often than
training a network from scratch.

## Practice

### Part 1. The notebook

Open [`notebooks/09-convolutions.ipynb`](https://github.com/DrobyshevDev/lemma/blob/main/notebooks/09-convolutions.ipynb).

What is inside:

1. A convolution by hand, checked on a known kernel: the Sobel operator should find edges.
2. A parameter count: a convolutional layer against a fully connected one on the same task.
3. A convolutional network from scratch — convolution, ReLU, pooling, fully connected head. All through
   a gradient check.
4. Training on synthetic images: three classes of shapes.
5. A two-pixel shift of the image: what happens to the fully connected network and what to the
   convolutional one.
6. The learned kernels of the first layer. Look for edges.
7. A comparison on the same data: the convolutional network, the fully connected one and the boosting
   from Module 6.

### Part 2. Augmentations on your own task

Take any set of images — your own photos will do too.

1. Write out the list of transformations under which the label **definitely** does not change.
2. Write out separately those under which it changes or becomes meaningless.
3. Train a model without augmentations and with augmentations from the first list. Compare by the rules
   of Module 7.
4. Now add one transformation from the second list and see what happens to the quality.

The fourth point is rarely done, and it shows that augmentation is a statement about the task, not a
free enlargement of the sample.

## Assignment

1. Compute the output size of a convolution for a 32×32 input, a 5×5 kernel, stride 2, padding 1. Check
   with code.
2. Implement average-pooling and compare with max-pooling on the same data. Explain the difference in
   the result.
3. Build a task where a convolution **loses** to a fully connected network. Hint: make the position of
   the feature important.
4. Take a trained network and feed it an image shifted by 1, 2, 4 and 8 pixels. Plot how the confidence
   falls.
5. Draw the learned kernels under different initialisations. Do edge detectors always come out?

## Self-check

1. What two assumptions about the data does a convolution introduce?
2. Why does the number of parameters of a convolutional layer not depend on the image size?
3. How does equivariance differ from invariance and which of them does pooling give?
4. Why is a convolution harmful on tabular data?
5. What does the first convolutional layer usually learn and why exactly that?
6. Does augmentation add information? If not, what does it do?
7. What transformation cannot be applied to images of digits and why?
8. Why does transfer learning work better than training from scratch on a small sample?

## Next

In [Module 10](../programme.md) — sequences. The structure there is different: not adjacency in space
but order in time, and the architecture for it will be different. The module will end with the attention
mechanism, from which the transformer is assembled, and we will write that from scratch too.

> A convolution wins not because it is more complex. It wins because it knows about the data what a
> fully connected layer does not.
