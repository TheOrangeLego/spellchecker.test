# Purpose
The purpose of this repo is to study the differences in runtime between varying implementations of [Norvig's spell corrector](https://norvig.com/spell-correct.html)

# Implementations

Below are all the implementations that were compared for this study along with a short description of each
* `anchor-immutable` - experimental CLI implementation of Pyret that uses [Facebook's immutables collection](https://facebook.github.io/immutable-js/) as the underlying structure for lists and string dictionaries
* `anchor-jslists` - similar to anchor-immutable, this implementation instead uses JavaScript's builtin arrays and objects instead and pushes elements when concatenating lists
* `anchor-concat` - similar to `anchor-jslists` but instead uses the `concat` method of arrays when concatenating lists
* `js-immutable` - JS implementation that uses Facebook's immutables
* `js-lists `- JS implementation that uses the builtin arrays and objects, and pushes when concatenating lists
* `js-concat` - similar to `js-lists` but uses the `concat` method when concatenating lists
* `js-spell` - implemented by [Panagiotis Astithas](http://blog.astithas.com/2009/08/spell-checking-in-javascript.html)
* `pyret-immutable` - Pyret implementation that imports a JS file that uses Facebook's immutables
* `pyret-jslists` - similar to `pyret-immutable` but instead uses JavaScript's builtin arrays and objects, pushing elements when concatenating lists
* `pyret-concat` - similar to `pyret-jslists` but instead uses the `concat` method to concatenate lists
* `pyret-original` - Pyret implementation that uses Pyret's builtin list and string dictionary
* `python` - Norvig's implementation which all other implementations model after
* `python-concat` - similar to Norvig's implementation but uses list concatenation instead of comprehension
* `racket` - Racket implementation

## Underlying Data Structures

One convenient metric of organizing all implementations is by their list's underlying behavior when concatenating: does concatenating two lists updates the first list or does it create a new list? Take the short program below:

```
listA = [1, 2, 3]
listB = [4, 5, 6]
listA.concat( listB )
```

After the concatenation, does `listA` still hold the original list `[1, 2, 3]` or is it updated to now hold the larger list `[1, 2, 3, 4, 5, 6]`? JavaScript's concatenation method and Python's `+` operator create a new list, as well as the (appropriately named) immutable collection. Since `pyret-original`'s lists behave similarly to `racket`'s, and `racket` also returns a new list when concatenating, that leaves `anchor-jslists`, `js-lists`, and `pyret-jslists` as the only implementations that update the original list, as they use JavaScript's `push` method, which modifies the original list.

We can further divide the implementations by their choice of data structure for their lists. As mentioned [here](https://docs.racket-lang.org/guide/Lists__Iteration__and_Recursion.html), `racket` and `pyret-original` employ a linked list. Meanwhile, as the immutable collection has a factor of `O(log32 N)` for its gets and sets as specified [here](https://facebook.github.io/immutable-js/docs/#/List), it is safe to assume that `anchor-immutable`, `js-immutable`, and `pyret-immutable` utilize a tree for its data structure. Lastly, both Python and JavaScript utilize an array for their list's data structure. Below is a table that summarizes the categories we have placed for each implementation.

|             | Updates original list                                       | Creates new list                                             |
| ----------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| Linked List | --                                                          | * `racket`<br />* `pyret-original`                           |
| Tree        | --                                                          | * `anchor-immutable`<br />* `js-immutable`<br />* `pyret-immutable` |
| Array List  | * `anchor-jslists`<br />* `js-lists`<br />* `pyret-jslists` | * `Python`<br />* `anchor-concat`<br />* `js-concat`<br />* `pyret-concat`<br />* `python-concat` |

# Data

# Discussion

## Implementation Technicalities

### Edits2 is the most expensive
### Racket sets, comprehensions, foldl comparison
### \*-immutable flatten, flatMap, fold/concat comparison, reduce
### Ordering of concatenation (Racket and js-concat)

## Implementation Comparison

### js-spell vs all others (why was it significantly faster?)
### concat vs push

### Python vs immutables
### Python vs concat-lists
### Racket vs Pyret-orig (they use the same underlying structure, why is it different by that much?)

# Conclusion