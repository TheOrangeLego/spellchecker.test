import file as F
include string-dict
import valueskeleton as VS

fun words(text):
  string-split-all(string-to-lower(text), "\r")
end

fun words2(text):
  string-split-all(string-to-lower(text), "\n")
end

ALL-WORDS = words(F.input-file("big.txt").read-file())

WORDS = make-mutable-string-dict()
for each(word from ALL-WORDS):
  cases(Option) WORDS.get-now(word):
    | none => WORDS.set-now(word, 1)
    | some(n) => WORDS.set-now(word, n + 1)
  end
end

N = ALL-WORDS.length()

fun P(word): WORDS.get-now(word).or-else(0) / N end

fun select-max(lst, key):
  {ans; _} = for fold({cur-elt; cur-max} from {""; 0}, elt from lst):
    if key(elt) >= cur-max:
      {elt; key(elt)}
    else:
      {cur-elt; cur-max}
    end
  end
  ans
end

fun correction(word):
  select-max(candidates(word), P)
end

fun candidates(word):
  known([list: word]) ^
    empty-or(_, known(edits1(word))) ^
    empty-or(_, known(edits2(word))) ^
    empty-or(_, [list: word])
end

fun empty-or(s, next):
  if is-empty(s): next
  else: s
  end
end

fun known(shadow words) block:
  words.filter({(w): WORDS.has-key-now(w)})
end

fun edits1(word):
  letters = 'abcdefghijklmnopqrstuvwxyz'
  word-length = string-length( word )
  splits = for map(i from range(0, string-length(word) + 1)):
    { string-substring(word, 0, i);
      string-substring(word, i, word-length) }
  end.filter({({L;R}): string-length(R) > 0})
  deletes = for map({L; R} from splits):
    L + string-substring(R, 1, string-length(R))
  end
  transposes = for map({L; R} from splits.filter({({_; R}): string-length(R) > 1})):
    L + string-char-at(R, 1) + string-char-at(R, 0) + string-substring(R, 2, string-length(R))
  end
  replaces = 
    for fold(lst from empty, c from string-explode(letters)):
      for map({L; R} from splits):
        L + c + string-substring(R, 1, string-length(R))
      end + lst
    end
  inserts = 
    for fold(lst from empty, c from string-explode(letters)):
      for map({L; R} from splits):
        L + c + R
      end + lst
    end
  deletes + (transposes + (replaces + inserts))
end

fun edits2(word):
  for fold(lst from empty, one-away from edits1(word)) block:
#    print("One-away edits: " + to-repr(one-away))
    edits1(one-away) + lst
  end
end

test-words-e1 = words2(F.input-file("edits1.txt").read-file())
test-words-e2 = words2(F.input-file("edits2.txt").read-file())
test-words-w  = words2(F.input-file("wrong.txt").read-file())

fun test-timing( words-list, must-correct ) block:
  print( "Single word\n" )
  start = time-now()
  correction( words-list.get( 0 ) )
  print( time-now() - start )

  print( "\n10 words\n" )
  start2 = time-now()
  each( lam( word ): correction( word ) end, words-list.take( 10 ) )
  print( time-now() - start2 )

  print( "\n100 words\n" )
  start3 = time-now()
  each( lam( word ) block:
          corrected-word = correction( word )
          # when ( ( corrected-word <> word ) <> must-correct ): print( "Word and correction comparison " + word + "::" + corrected-word + "\n" ) end
          # when ( WORDS.has-key( corrected-word ) <> must-correct ): print( "Correction in vocabulary " + word + "::" + corrected-word + "\n" ) end
          nothing
        end, words-list )
  print( time-now() - start3 )
end

print( "\nEdits1\n" )
test-timing( test-words-e1, true )
print( "\nEdits2\n" )
test-timing( test-words-e2, true )
print( "\nWrong\n" )
test-timing( test-words-w, false )