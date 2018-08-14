import file as F
import list as L
import string-dict as D
import string as S
import global as G

fun words( path ):
  S.string-to-lower( F.file-to-string( path ) )
end

all-words = L.filter( L.filter( S.split-pattern( words( "big.txt" ), "\\b" ),
  lam(str): str <> " " end ),
  lam(str): str <> "\n" end )

N = L.length( all-words )
vocab = D.count( all-words )

fun P( word ):
  if D.has-key( vocab, word ):
    D.get( vocab, word ) / N
  else:
    0
  end
end

fun correction( word ):
  candidate-list = candidates( word )
  word-to-probability = D.apply( candidate-list, P )

  L.reduce( candidate-list,
    lam( max-word, shadow word ):
      if D.get( word-to-probability, max-word ) < D.get( word-to-probability, word ):
        word
      else:
        max-word
      end
    end,
    L.at( candidate-list, 0 ) )
end

fun candidates( word ):
  e0 = known( [L.list: word] )
  e1 = known( edits1( word ) )
  e2 = known( edits2( word ) )

  if L.length( e0 ) > 0:
    e0
  else if L.length( e1 ) > 0:
    e1
  else if L.length( e2 ) > 0:
    e2
  else:
    [L.list: word]
  end
end

fun known( shadow words ):
  L.filter( words, lam( word ): D.has-key( vocab, word ) end )
end

fun edits1( word ):
  letters = S.split( "abcdefghijklmnopqrstuvwxyz", "" )
  word-indices = L.range( 0, S.length( word ) )
  less-indices = L.range( 0, S.length( word ) - 1 )
  more-indices = L.range( 0, S.length( word ) + 1 )

  # deletes
  deletes = L.map( word-indices,
    lam( index ):
      S.concat( S.substring( word, 0, index ), S.substring( word, index + 1, S.length( word ) ) )
    end )
  transposes = L.map( less-indices,
    lam( index ):
      S.concat( S.substring( word, 0, index ),
                S.concat( S.charAt( word, index + 1 ),
                          S.concat( S.charAt( word, index ), S.substring( word, index + 2, S.length( word ) ) ) ) )
    end )
  replaces = L.reduce( word-indices,
    lam( list, index ):
      L.concat( list, L.map( letters,
        lam( letter ):
          S.concat( S.substring( word, 0, index ), S.concat( letter, S.substring( word, index + 1, S.length( word ) ) ) )
        end ) )
    end,
    L.empty-list() )
  inserts = L.reduce( more-indices,
    lam( list, index ):
      L.concat( list, L.map( letters,
        lam( letter ):
          S.concat( S.substring( word, 0, index ), S.concat( letter, S.substring( word, index, S.length( word ) ) ) )
        end ) )
    end,
    L.empty-list() )
  # L.concat( deletes, L.concat( transposes, L.concat( replaces, inserts ) ) )
  L.concat( L.concat( L.concat( deletes, transposes), replaces), inserts )
end

fun edits2( word ):
  edits = edits1( word )
  L.reduce( edits,
    lam( all-edits, shadow word ):
      L.concat( all-edits, edits1( word ) )
    end,
    L.empty-list() )
end

test-words-e1 = L.filter( L.filter( S.split-pattern( words( "edits1.txt" ), "\\b" ),
  lam(str): str <> " " end ),
  lam(str): str <> "\n" end )
test-words-e2 = L.filter( L.filter( S.split-pattern( words( "edits2.txt" ), "\\b" ),
  lam(str): str <> " " end ),
  lam(str): str <> "\n" end )
test-words-w  = L.filter( L.filter( S.split-pattern( words( "wrong.txt" ), "\\b" ),
  lam(str): str <> " " end ),
  lam(str): str <> "\n" end )

fun test-timing( words-list, must-correct ) block:
  G.print( "Single word\n" )
  start = G.time-now() 
  G.console-log( G.time-now( start ) )

  G.print( "10 words\n" )
  start2 = G.time-now()
  L.map( L.slice( words-list, 0, 10 ), lam( word ): correction( word ) end )
  G.console-log( G.time-now( start2 ) )

  G.print( "100 words\n" )
  start3 = G.time-now()
  L.map( words-list, lam( word ) block:
    corrected-word = correction( word )
    G.assert( corrected-word <> word, must-correct, "Word and correction comparison " + word + "::" + corrected-word )
    G.assert( D.has-key( vocab, corrected-word ), must-correct, "Correction in vocabulary " + word + "::" + corrected-word )
    nothing
  end )
  G.console-log( G.time-now( start3 ) )
end

G.print( "\nEdits1  " )
test-timing( test-words-e1, true )
G.print( "\nEdits2  " )
test-timing( test-words-e2, true )
G.print( "\nWrong  " )
test-timing( test-words-w, false )