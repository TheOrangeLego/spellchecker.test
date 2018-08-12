import re
import random
from collections import Counter

""" read all words in big.txt and generate a set of all unique words """
WORDS = [word for word in set( re.findall( '[a-zA-Z]+', ( open( 'big.txt' ).read() ).lower() ) ) if len( word ) > 3]

def edits1(word):
  return word[:len(word) - 1] + "q"

def edits2(word):
  return word[:len(word) - 2] + "qq"

def wrong(word):
  return word[:len(word) - 3] + "qqq"

def generateWords():
  for i in range( 100 ):
    rWord = random.choice( WORDS )
    # print edits2( rWord )
    print wrong( rWord )

generateWords()
