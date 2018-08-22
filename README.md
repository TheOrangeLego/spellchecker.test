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
* `js-spell` - implemented by [Panagiotis Astithas](http://blog.astithas.com/2009/08/spell-checking-in-javascript.html), this JS implementation differs from others in how it generates both the 1 and 2 distance edits of words, removing the need of having intermediate lists to hold edited words
* `pyret-immutable` - Pyret-of-today implementation that imports a JS file that uses Facebook's immutables
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

After the concatenation, does `listA` still hold the original list `[1, 2, 3]` or is it updated to now hold the larger list `[1, 2, 3, 4, 5, 6]`? JavaScript's concatenation method and Python's `+` operator create a new list, as well as the (appropriately named) immutable collection. Since `pyret-original`'s lists behave similarly to `racket`'s, and `racket` also returns a new list when concatenating, that leaves `js-spell`, `anchor-jslists`, `js-lists`, and `pyret-jslists` as the only implementations that update the original list, as they use JavaScript's `push` method, which modifies the original list. 

We can further divide the implementations by their choice of data structure for their lists. As mentioned [here](https://docs.racket-lang.org/guide/Lists__Iteration__and_Recursion.html), `racket` and `pyret-original` employ a linked list. Meanwhile, as the immutable collection has a factor of `O(log32 N)` for its gets and sets methods as specified [here](https://facebook.github.io/immutable-js/docs/#/List) and discussed [here](https://hackernoon.com/how-immutable-data-structures-e-g-immutable-js-are-optimized-using-structural-sharing-e4424a866d56), `anchor-immutable`, `js-immutable`, and `pyret-immutable` utilize a trie for its list's data structure. Lastly, both Python and JavaScript utilize a resizable array for their list's data structure. Below is a table that summarizes the categories we have placed for each implementation.

|             | Updates original list                                        | Creates new list                                             |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Linked List | --                                                           | * `racket`<br />* `pyret-original`                           |
| Trie        | --                                                           | * `anchor-immutable`<br />* `js-immutable`<br />* `pyret-immutable` |
| Array List  | * `anchor-jslists`<br />* `js-lists`<br />* `pyret-jslists`<br />* `js-spell` | * `Python`<br />* `anchor-concat`<br />* `js-concat`<br />* `pyret-concat`<br />* `python-concat` |

# Data

![timing results](timing.results.png)

We will be considering the average time when running `correction` on 100 wrong words for two reasons:

* this demonstrates the worst case scenario for a spell checker as it has to check for all possible 1 and 2 distance away edits, which prevents any lazy evaluation in the `correction` function from certain implementations of not generating the 2 distance away edits list if the correct word is 1 edit away
* a larger pool of words to correct will provide a more accurate timing than running a single correction by averaging out any possible outliers

# Discussion

## Implementation Technicalities

Below are some technical observations that significantly affected the overall runtime of certain implementations and are worth discussing

### Immutable's Flattens and Reductions

When generating the `replaces`, `inserts`, and `edits2` lists under all immutable implementations, a choice was given between using one of the three procedures, all of which return the same result. I provide a short definition and how they would be used to generate the `replaces` list of edits.

* `getReplace( c )` - this function takes a character `c` and returns a list of words where each letter of the to be edited word is replaced with `c`

  ```
  function getReplace( c ) {
      return splits
               .filter( split => split.R.length > 0 )
               .map( split => split.L + c  + split.R.substring( 1, split.R.length ) );
  }
  ```

* `.map( f ).flatten()` - this method would first map the function `f` to each element of the list and would then flatten out any inner lists generated by `f` to the outer most list

  ```
  var replaces = letters.map( getReplace ).flatten();
  ```

* `.flatMap( f )` -  this method does the same as above requiring just a single method call

  ```
  var replaces = letters.flatMap( getReplace )
  ```

* `.reduce( f, v )` - given an initial accumulator `v` and a function `f` that must take an accumulator and single value, `reduce` would fold the list, taking a single element from the list each time, doing its necessary computation, and aggregating it to the accumulator, returning a single value in the end

  ```
  var replaces = letters.reduce( 
    ( acc, char ) => acc.concat( getReplace( char ) ), List( [] ) );
  ```

While `.map.flatten()` and `.flatMap()` did not have much performance difference when generating `replaces`, `inserts`, nor `edits2`, `.reduce()` would cause the spellchecker to run at nearly 2 to 3 times as long. A possible reason as to why this is happening is that reduce has to concatenate the accumulator with the list generated by the current value at every step, and concatenation requires creating a new list, causing the garbage collector to be called more often and therefore causing the spellchecker to decrease in speed. Therefore, `flatMap` was chosen for all immutable implementations.

### Racket Sets, Comprehensions, and Folds

Contrary to the Immutable collection above, Racket did not generate much difference in runtime whether it used folds or comprehensions. This contrasts with Python's difference in performance, where using concatenation instead of comprehensions when generating the list of 2 distance away edits for Python increases the overall runtime by 10 times.

### Concatenation Order

One subtle technical detail is the ordering of concatenation for lists. That is, would the line `listA.concat( listB )` be faster, slower, or similar in speed to the line `listB.concat( listA )`? As mentioned before, Racket's data structure for lists is a linked list, which means that during concatenation the first list will be parsed through to its end in order for the last element to link to the first element of the second list. Therefore, it is more efficient to have the shorter list to be first. This is seen in `edits2`, where when folding over the list of 1 distance edits (`new-word`), we append the list generated from calling `edits1( new-word )` to the accumulator `lst`, since `lst` will continuously grow per folding operation. `js-concat` on the other hand, does the opposite at concatenation, where it will create a copy of the first list and then concatenate each element of the second list to the newly created list. Thus, the `edits2` of this implementation concatenates the list generated by calling `edits1( editWord )` to the accumulator.

## Implementation Comparisons

### The Efficiency of `js-spell`

Although `js-spell` performed significantly better than other implementations, twice as fast than Python and five times faster than `js-lists` which also uses JavaScript's builtin arrays and objects, its efficiency lies on how it generates its 1 and 2 distance away edits. All other implementations follow Norvig's original formula of generating 1 distance away edits of the provided word, where a list is constructed that contains all possible deletions of a single character, one for transposing two adjacent letters, and so on. Lastly, all four lists are then merged together. `js-spell` instead stores all possible edits in one single list, removing the need to merge any lists in the function. Furthermore, when checking for 2 distance away edit words, all other implementations merge the lists generated from calling `edits1()` on each 1 distance away words. `js-spell`, on the other hand, calls `edits()` on each 1 distance away edit word without the need to merge the resulting list to later determine if any words are candidates. The lack of merging lists may explain the high efficiency of `js-spell`, accompanied with the fact that `push` is faster than `concat`, as discussed below.

### `concat` vs. `push`

It is interesting to observe that all the `concat` implementations performed significantly worse than their `jslists` counterpart, which instead uses `push` when concatenating two lists. [This online performance test](https://jsperf.com/javascript-array-concat-vs-push/100) likewise demonstrates that pushing when concatenating two lists has a better performance than using the `concat` method. There is a possibility that the garbage collector, similarly to the case mentioned previously with `reduce` vs. `flatten`,  has to be called more often due to `concat` returning a new list, whereas `push` edits the first list to contain the elements of the second list.

### Python vs. Immutables

Although `python` and all three immutable implementations do construct new lists when concatenating lists, it is their performance in reading elements in their lists that creates a stark difference in their runtime. As mentioned before, `python`'s list utilizes an array list as its data structure, where accessing elements in the list will be constant `O(1)`. On the other hand, the immutables collection uses a trie, causing element lookups to be logarithmic `O(log32 N )` . This is difference is significant when generating the list of 2 distance away edits, as the spell checker would first have to look through all elements in the list of 1 distance away edits and then through all the elements of the list of 2 distance away edits.

### Python vs. Concat and JSLists

On the other hand, `python` and all of the `concat` implementations create lists when concatenating and also use array lists, yet all `concat` implementations are at least 10 times slower, with `python-concat` being the fastest amongs them. As explained previously, this is due to the implementation of the `concat` method, where using `push` would significantly improve the overall runtime, and visibly so as all `jslists` implementations have a runtime closer to `python`. One possible cause as to why `jslists` implementations are still slower may be due to how `python` stores its edits in a set, saving the spell checker from having to generate duplicate lists when executing `edits2()`. For example, the word `heqq` is two edits away from `hey`. `edits1( heqq )` would generate duplicates of the word `heqq` when it transposes the last two letters and replaces each `q` with `q` again when running through the alphabet in `getReplace()`. `edits2()` would then have to compute 3 lists for the same word, whereas `python` avoids this by constructing a set of all the words, and thus `edits2()` would only generate one list for the word `heqq`. This is difference is more pronounced when the word to correct is longer.

### Racket vs. Pyret-Original

One fascinating observation is the difference in runtime between `racket` and `pyret-original`. As `pyret-original`'s lists are built with the same underlying data structure as `racket`'s and both do the same the same when generating both 1 and 2 distance away word lists, the fact that `racket` is 10 times faster than `pyret-original` begs to question what is is causing such contrast in performance. I speculate that this is due to how `racket` may be looking up and accessing its list elements, as we saw a similar situation when comparing `python` and the immutable implementations, though that difference was between the underlying data structure. Instead, while its data structure is a linked list, it is possible that `racket` is quickly accessing elements towards the middle of the list, instead of having to traverse through each element, while `pyret-original` may not. This, however, will remain a speculation until it is possible to directly compare their internal implementation of lists.

# Conclusion

Looking at the overall performance of the spell checker under each implementation, it is best for Anchor to provide both the immutables collection and builtin JavaScript array and objects as the underlying data structure for its lists and string dictionaries under two separate modules. The JS module would provide fast performance comparable with Python's lists, while the immutables module would follow the ideology of always generating new lists that Pyret-of-today implements.