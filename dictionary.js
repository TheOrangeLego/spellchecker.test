const fs = require( 'fs' );
const path = require( 'path' );

const flatMap = (f,xs) =>
  xs.reduce((acc,x) =>
    acc.concat(f(x)), []);

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

N = ALL_WORDS.length;

P = function( word ) {
  if ( word in WORDS )
    return WORDS[word] / N;
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
  e0 = known( [word] );
  e1 = known( edits1( word ) );
  e2 = known( edits2( word ) );
  
  if ( e0.length > 0 )
    return e0;
  else if ( e1.length > 0 )
    return e1;
  else if ( e2.length > 0 )
    return e2;
  else
    return [word];
};

known = function( words ) {
  return words.filter( str => str in WORDS );
};

edits1 = function( word ) {
  letters = "abcdefghijklmnopqrstuvwxyz".split('');
  splits     = [];
  deletes    = [];
  transposes = [];
  replaces   = [];
  inserts    = [];

  for ( index = 0; index <= word.length; index++ )
    splits.push( {L:word.substring( 0, index ), R:word.substring( index, word.length )} )

  splits = splits.filter( split => split.R.length > 0 );

  deletes = splits.map( split =>
    split.L + split.R.substring( 1, split.R.length ) );

  transposes = splits.filter( split => split.R.length > 1 ).map( split =>
    split.L + split.R[1] + split.R[0] + split.R.substring( 2, split.R.length ) );

  getReplace = function( c ) {
    return splits.map( split => split.L + c + split.R.substring( 1, split.R.length ) );
  };

  replaces = letters.reduce( ( lst, char ) => 
    lst.concat( getReplace( char ) ),
    [] );

  getInsert = function( c ) {
    return splits.map( split => split.L + c + split.R );
  }

  inserts = letters.reduce( ( lst, char ) => 
    lst.concat( getInsert( char ) ),
    [] );

  return deletes.concat( transposes ).concat( replaces ).concat( inserts );
};

edits2 = function( word ) {
  return edits1( word ).reduce( ( lst, newWord ) => lst.concat( edits1( newWord ) ), [] );
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