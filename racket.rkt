#lang racket

( require racket/file )
( require racket/dict )

( define ( words text )
   ( string-split ( string-downcase text ) ) )

( define ALL-WORDS ( words ( file->string "big.txt" ) ) )

( define WORDS ( make-hash ) )

( for-each ( lambda ( word )
              ( hash-update! WORDS word ( lambda ( count ) ( + 1 count ) ) 0 ) ) ALL-WORDS )

( define N ( length ALL-WORDS ) )

( define ( P word )
   ( if ( hash-has-key? WORDS word )
        ( / ( hash-ref WORDS word ) N )
        0 ) )

( define ( select-max list key )
   ( car ( sort list > #:key key ) ) )

( define ( candidates word )
   ( let* ([e0 ( known ( list word ) )]
           [e1 ( known ( edits1 word ) )]
           [e2 ( known ( edits2 word ) )])
      ( cond
         [( positive? ( length e0 ) ) e0 ]
         [( positive? ( length e1 ) ) e1 ]
         [( positive? ( length e2 ) ) e2 ]
         [( list word )] ) ) )

( define ( known words )
   ( filter ( lambda ( word ) ( hash-has-key? WORDS word ) ) words ) )

( define ( edits1 word )
   ( let ([letters "abcdefghijklmnopqrstuvwxyz"]
          [word-length ( string-length word )])
      ( append
          ( for/list ([i ( range word-length )]) ( string-append ( substring word 0 i ) ( substring word ( + i 1 ) word-length ) ) )
          ( for/list ([i ( range ( - word-length 1 ) )]) ( string-append ( substring word 0 i ) ( string-append ( string ( string-ref word ( + i 1 ) ) ( string-ref word i ) ) ( substring word ( + i 2 ) word-length ) ) ) )
          ( for/fold ([acc '()]) ([i ( range word-length )] )
             ( append ( for/list ([letter letters]) ( string-append ( substring word 0 i ) ( string-append ( string letter ) ( substring word ( + i 1 ) word-length ) ) ) ) acc ) )
          ( for/fold ([acc '()]) ([i ( range ( + 1 word-length ) )] )
             ( append ( for/list ([letter letters]) ( string-append ( substring word 0 i ) ( string-append ( string letter ) ( substring word i word-length ) ) ) ) acc ) )
          ) ) )

( define ( edits2 word )
   ( foldl ( lambda ( new-word lst ) ( append ( edits1 new-word ) lst ) ) '() ( edits1 word ) ) )

( define ( correction word )
   ( select-max ( candidates word ) P ) )

( define ( make-runs word )
   ( define start ( current-inexact-milliseconds ) )
   ( for ([i ( range 10 )]) ( correction word ) )
   ( - ( current-inexact-milliseconds ) start ) )

#|
( display ( / ( make-runs "spelling" ) 10 ) )
( display "\n" )

( display ( / ( make-runs "spellung" ) 10 ) )
( display "\n" )

( display ( / ( make-runs "spellunz" ) 10 ) )
( display "\n" )
|#

( define EDIT2-WORDS ( words ( file->string "edits2.txt" ) ) )
( define WRONG-WORDS ( words ( file->string "wrong.txt" ) ) )

( define ( long-run words )
   ( define start ( current-inexact-milliseconds ) )
   ( for ([word words]) ( correction word ) )
   ( / ( - ( current-inexact-milliseconds ) start ) 83 ) )

( display "Runtime for 2 edits\n" )
( display ( long-run EDIT2-WORDS ) )
( display "\n" )

( display "Runtime for wrong words\n" )
( display ( long-run WRONG-WORDS ) )
( display "\n" )