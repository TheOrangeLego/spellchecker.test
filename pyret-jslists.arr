import file as F
import global as G
import js-file("list-lib") as L
import js-file("string-dict-lib") as D
import js-file("string-lib") as S

fun words( path ) block:
  split-words = S.split-pattern( S.string-to-lower( F.file-to-string( path ) ), "\\b" )

  L.to-list( split-words )
end

pre-words = words( "big.txt" )
all-words = L.filter( L.filter( pre-words,
  lam(str): str <> " " end ),
  lam(str): str <> "\n" end )

N = L.length( all-words )
vocab = D.count( all-words )

fun P( word ):
  if ( D.has-key( vocab, word ) ):
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
  letters = L.to-list( S.split( "abcdefghijklmnopqrstuvwxyz", "" ) )
  word-length = string-length( word )
  word-indices = L.range( 0, word-length )
  less-indices = L.range( 0, word-length - 1 )
  more-indices = L.range( 0, word-length + 1 )

  # deletes
  deletes = L.map( word-indices,
    lam( index ):
      string-append( string-substring( word, 0, index ), string-substring( word, index + 1, word-length ) )
    end )
  transposes = L.map( less-indices,
    lam( index ):
      string-append( string-substring( word, 0, index ),
                string-append( string-char-at( word, index + 1 ),
                          string-append( string-char-at( word, index ), string-substring( word, index + 2, word-length ) ) ) )
    end )
  replaces = L.reduce( word-indices,
    lam( word-list, index ):
      L.concat( word-list, L.map( letters,
        lam( letter ):
          S.concat( S.substring( word, 0, index ), S.concat( letter, S.substring( word, index + 1, word-length ) ) )
        end ) )
    end,
    L.empty-list() )
  inserts = L.reduce( more-indices,
    lam( word-list, index ):
      L.concat( word-list, L.map( letters,
        lam( letter ):
          S.concat( S.substring( word, 0, index ), S.concat( letter, S.substring( word, index, word-length ) ) )
        end ) )
    end,
    L.empty-list() )
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

wrong = L.filter( L.filter( words( "wrong.txt" ),
  lam(str): str <> " " end ),
  lam(str): str <> "\n" end )

fun test-wrong-timing( words-list ) block:
  print( "Single word\n" )
  start = time-now()
  correction( L.at( words-list, 0 ) )
  print( time-now() - start )

  print( "\n10 words\n" )
  start2 = time-now()
  L.map( L.slice( words-list, 0, 10 ), lam( word ): correction( word ) end )
  print( time-now() - start2 )

  print( "\n100 words\n" )
  start3 = time-now()
  L.map( words-list, lam( word ): correction( word ) end )
  print( time-now() - start3 )
end

test-wrong-timing( wrong )
