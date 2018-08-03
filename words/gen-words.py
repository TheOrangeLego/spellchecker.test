import re
import random
from collections import Counter

""" read all words in big.txt and generate a set of all unique words """
WORDS = set( re.findall( '[a-zA-Z]+', ( open( 'big.txt' ).read() ).lower() ) )

def P(word, N=sum(Counter( list( WORDS ) ).values())): 
    "Probability of `word`."
    return Counter( list( WORDS ) )[word] / N

def correction(word): 
    "Most probable spelling correction for word."
    return max(candidates(word), key=P)

def candidates(word): 
    "Generate possible spelling corrections for word."
    return (known([word]) or known(edits1(word)) or known(edits2(word)) or [word])

def known(words): 
    "The subset of `words` that appear in the dictionary of WORDS."
    return set(w for w in words if w in WORDS)

def edits1(word):
  "All edits that are one edit away from `word`."
  letters    = 'abcdefghijklmnopqrstuvwxyz'
  splits     = [(word[:i], word[i:])    for i in range(len(word) + 1)]
  deletes    = [L + R[1:]               for L, R in splits if R]
  transposes = [L + R[1] + R[0] + R[2:] for L, R in splits if len(R)>1]
  replaces   = [L + c + R[1:]           for L, R in splits if R for c in letters]
  inserts    = [L + c + R               for L, R in splits for c in letters]
  return set( deletes + transposes + replaces + inserts)

def edits2(word):
  others = WORDS
  e1     = list( edits1( word ) )

  nWord  = random.choice( e1 )

  while nWord in others:
    nWord = random.choice( e1 )
  
  return edits1( nWord )

def edits3(word):
  others = WORDS.union( edits1( word ) )
  e2     = list( edits2( word ) )
  
  nWord  = random.choice( e2 )

  while nWord in others:
    nWord = random.choice( e2 )

  return set( e3 for e3 in edits2( nWord ) )

def generateEdit2( count ):
  for index in range( count ):
    word = random.choice( list( WORDS ) )
    others = WORDS.union( edits1( word ) )
    e2 = list( edits2( word ) )

    nWord = random.choice( e2 )
    
    while nWord in others or correction( nWord ) in WORDS:
      nWord = random.choice( e2 )
    
    assert( nWord not in edits1( word ) ), "Is in edits-1"
    print nWord

def generateWrong( count ):
  for index in range( count ):
    word = random.choice( list( WORDS ) )
    others = WORDS.union( edits1( word ) ).union( edits2( word ) )
    e3 = list( edits3( word ) )

    nWord = random.choice( e3 )
    
    while nWord in others or correction( nWord ) in WORDS:
      nWord = random.choice( e3 )
    
    print nWord + "zzzz"

generateEdit2( 100 )