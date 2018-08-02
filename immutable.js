const fs            = require( 'fs' );
const path          = require( 'path' );
const { Map, List } = require( 'immutable' );

words = function( text ) {
  content = text.toLowerCase().split( /\b/ );
  return content.filter( str => str != "" );
};

ALL_WORDS = words( fs.readFileSync( path.join( __dirname, 'big.txt' ), 'utf-8' ) );
WORDS = {};

for ( index = 0; index < ALL_WORDS.length; index++ ) {
  word = ALL_WORDS[index];

  if ( word in WORDS )
    WORDS[word] += 1;
  else
    WORDS[word] = 1;
}

WORDS_MAP = Map( WORDS );
N = ALL_WORDS.length;

P = function( word ) {
  if ( WORDS_MAP.has( word ) )
    return WORDS_MAP.get( word ) / N;
  else
    return 0;
};

selectMax = function( list, key ) {
  maxElm = "";
  maxVal = 0;

  list.forEach( word => {
    if ( key(word) >= maxVal ) {
      maxElm = word;
      maxVal = key(word);
    } }
  )
  
  return maxElm;
};

candidates = function( word ) {
  e0 = known( List( [word] ) );
  e1 = known( edits1( word ) );
  e2 = known( edits2( word ) );

  if ( e0.size > 0 )
    return e0;
  else if ( e1.size > 0 )
    return e1;
  else if ( e2.size > 0 )
    return e2;
  else
    return List( [word] );
};

known = function( words ) {
  return words.filter( str => WORDS_MAP.has( str ) );
};

edits1 = function( word ) {
  letters = List( "abcdefghijklmnopqrstuvwxyz".split('') );
  splits  = List( [] )
  
  for ( index = 0; index <= word.length; index++ )
    if ( word.length - index > 0 )
      splits = splits.push( {L:word.substring( 0, index ), R:word.substring( index, word.length )} )

  deletes = splits.map( split =>
    split.L + split.R.substring( 1, split.R.length ) );

  transposes = splits.filter( split => split.R.length > 1 ).map( split =>
    split.L + split.R[1] + split.R[0] + split.R.substring( 2, split.R.length ) );

  getReplace = function( c ) {
    return splits.map( split => split.L + c + split.R.substring( 1, split.R.length ) );
  };

  replaces = letters.flatMap( getReplace );

  getInsert = function( c ) {
    return splits.map( split => split.L + c + split.R );
  }

  inserts = letters.flatMap( getInsert );

  return deletes.concat( transposes ).concat( replaces ).concat( inserts );
};

edits2 = function( word ) {
  return edits1( word ).reduce( ( lst, newWord ) => lst.concat( edits1( newWord ) ), List( [] ) );
};

correction = function( word ) {
  return selectMax( candidates( word ), P );
};

// CORRECT = fs.readFileSync( path.join( __dirname, 'correct.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' );
// E1 = fs.readFileSync( path.join( __dirname, 'edit1.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' );
E2 = fs.readFileSync( path.join( __dirname, 'edit2.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' );
WRONG = fs.readFileSync( path.join( __dirname, 'wrong.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' );

testTiming = function( words ) {
  console.log( "Single word" );
  start = process.hrtime();
  correction( words[0] );
  console.log( process.hrtime( start ) );

  console.log( "10 words" );
  start = process.hrtime();
  for ( index = 0; index < 10; index++ )
    console.log( index );
    correction( words[index] );
  console.log( process.hrtime( start ) );

  console.log( "100 words" );
  start = process.hrtime();
  for ( word in words )
    correction( word );
  console.log( process.hrtime( start ) );
};

/* console.log( "Correct word corrections" );
testTiming( CORRECT );
console.log( "\n" );

console.log( "Edit 1 corrections" );
testTiming( E1 );
console.log( "\n" ); */

console.log( "Edit 2 corrections" );
testTiming( E2 );
console.log( "\n" );

console.log( "Wrong corrections" );
testTiming( WRONG );
console.log( "\n" );