import file as F
import lists-immutable as L
import string-dict-immutable as D
import string as S
import global as G

fun words( path ):
  S.string-to-lower( F.file-to-string( path ) )
end

all-words = L.filter( L.filter( L.to-list( S.split-pattern( words( "big.txt" ), "\\b" ) ),
  lam(str): str <> " " end ),
  lam(str): str <> "\n" end )

N = L.length( all-words )
vocab = D.count( all-words )

fun P( word ):
  D.get( vocab, word ) / N
end

fun correction( word ) block:
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

fun edits1( word ) block:
  letters = L.to-list( S.split( "abcdefghijklmnopqrstuvwxyz", "" ) )
  word-length  = S.length( word )
  word-indices = L.range( 0, word-length )
  less-indices = L.range( 0, word-length - 1 )
  more-indices = L.range( 0, word-length + 1 )

  # deletes
  deletes = L.map( word-indices,
    lam( index ):
      S.concat( S.substring( word, 0, index ), S.substring( word, index + 1, word-length ) )
    end )

  transposes = L.map( less-indices,
    lam( index ):
      S.concat( S.substring( word, 0, index ),
                S.concat( S.charAt( word, index + 1 ),
                          S.concat( S.charAt( word, index ), S.substring( word, index + 2, word-length ) ) ) )
    end )

  replaces = L.flatMap( letters,
    lam( c ):
      L.map( word-indices,
        lam( index ):
          S.concat( S.substring( word, 0, index ), S.concat( c, S.substring( word, index + 1, word-length ) ) )
        end )
    end )

  inserts = L.flatMap( letters,
    lam( c ):
      L.map( more-indices,
        lam( index ):
          S.concat( S.substring( word, 0, index ), S.concat( c, S.substring( word, index, word-length ) ) )
        end )
    end )
  
  L.concat( deletes, L.concat( transposes, L.concat( replaces, inserts ) ) )
end

fun edits2( word ):
  edits = edits1( word )

  L.flatMap( edits, lam( shadow word ): edits1( word ) end )
end

wrong = L.filter( L.filter( L.to-list( S.split-pattern( words( "wrong.txt" ), "\\b" ) ),
  lam(str): str <> " " end ),
  lam(str): str <> "\n" end )

fun test-wrong-timing( words-list ) block:
  G.print( "Single word\n" )
  start = G.time-now()
  correction( L.at( words-list, 0 ) )
  G.print( G.time-now( start ) )

  G.print( "\n10 words\n" )
  start2 = G.time-now()
  L.map( L.slice( words-list, 0, 10 ), lam( word ): correction( word ) end )
  G.print( G.time-now( start2 ) )

  G.print( "\n100 words\n" )
  start3 = G.time-now()
  L.map( words-list, lam( word ): correction( word ) end )
  G.print( G.time-now( start3 ) )
end

starting = G.time-now()
result = correction( "informatien" )
ending = G.time-now( starting )

test-wrong-timing( wrong )