import re
import time
from collections import Counter

def words(text): return re.findall(r'\w+', text.lower())

WORDS = Counter(words(open('big.txt').read()))

def P(word, N=sum(WORDS.values())): 
    "Probability of `word`."
    return WORDS[word] / N

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
    # NOTE(joe): Two options for returning:
    #return deletes + transposes + replaces + inserts
    return set(deletes + transposes + replaces + inserts)

def edits2(word): 
    # NOTE(joe): Two options for how to return
    #lst = []
    #for e1 in edits1(word):
    #  And several options within the loop (could also do another nested loop with lst.append)
    #  #lst = lst + edits1(e1)
    #  lst += edits1(e1)
    #return lst
    "All edits that are two edits away from `word`."
    return (e2 for e1 in edits1(word) for e2 in edits1(e1))

def testTiming( words, mustCorrect ):
    print "Single word"
    start = time.time()
    correction( words[0] )
    print time.time() - start

    print "10 words"
    start = time.time()
    for wordRange in range( 10 ):
        correction( words[wordRange] )
    print ( time.time() - start )

    print "100 words"
    start = time.time()
    for word in words:
        correction( word )
        # corrected = correction( word )
        # assert ( corrected <> word ) == mustCorrect
        # assert ( corrected in WORDS ) == mustCorrect
    print ( time.time() - start )

testWordsE1 = re.findall( r'\w+', ( open( 'edits1.txt' ).read() ).lower() )
testWordsE2 = re.findall( r'\w+', ( open( 'edits2.txt' ).read() ).lower() )
testWordsW  = re.findall( r'\w+', ( open( 'wrong.txt' ).read() ).lower() )

print "\nEdits1"
testTiming( testWordsE1, True )

print "\nEdits2"
testTiming( testWordsE2, True )

print "\nWrong"
testTiming( testWordsW, False )
print ""
