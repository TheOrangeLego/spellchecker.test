#lang racket

( require racket/file )
( require racket/dict )

( define ( words text )
   ( filter ( lambda( word ) ( not ( or ( string=? word "\n" ) ( string=? word " " ) ) ) ) ( regexp-split #px"\\b" ( string-downcase text ) ) ) )

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

( define TEST_WORDS_E1 ( list-tail ( words ( file->string "edits1.txt" ) ) 1 ) )
( define TEST_WORDS_E2 ( list-tail ( words ( file->string "edits2.txt" ) ) 1 ) )
( define TEST_WORDS_W  ( list-tail ( words ( file->string "wrong.txt" ) ) 1 ) )

( define ( short-run words )
   ( define start ( current-inexact-milliseconds ) )
   ( correction ( list-ref words 0 ) )
   ( - ( current-inexact-milliseconds ) start ) )

( define ( medium-run words )
   ( define start ( current-inexact-milliseconds ) )
   ( for ([word ( take words 10 )]) ( correction word ) )
   ( - ( current-inexact-milliseconds ) start ) )

( define ( long-run words must-correct )
   ( define start ( current-inexact-milliseconds ) )
   ( for ([word words])
      ( let* ([corrected-word ( correction word )]
              [matches  ( string=? corrected-word word )]
              [in-vocab ( hash-has-key? WORDS corrected-word )])
         ( cond
            #; [( equal? matches must-correct ) ( display ( string-append "Words matching " corrected-word "::" word "\n" ) )]
            #; [( not ( equal? in-vocab must-correct ) ) ( display ( string-append "Word in dictionary " corrected-word "::" word "\n" ) )]
            [else 0]) ) )
   ( - ( current-inexact-milliseconds ) start ) )

( define ( test-timing words must-correct )
  ( display "\n" )
  ( display ( short-run  words ) )
  ( display "\n" )
  ( display ( medium-run words ) )
  ( display "\n" )
  ( display ( long-run   words must-correct ) )
  ( display "\n" ) )

( display "Edits1" )
( test-timing TEST_WORDS_E1 #t )

( display "Edits2" )
( test-timing TEST_WORDS_E2 #t )

( display "Wrong" )
( test-timing TEST_WORDS_W  #f )