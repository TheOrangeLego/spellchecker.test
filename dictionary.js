"use strict";

const fs = require( 'fs' );
const path = require( 'path' );

const flatMap = (f,xs) =>
  xs.reduce((acc,x) =>
    acc.concat(f(x)), []);

function words( text ) {
  var content = text.toLowerCase().split( /\b/ );
  return content.filter( str => str != "" );
};

var ALL_WORDS = words( fs.readFileSync( path.join( __dirname, 'big.txt' ), 'utf-8' ) );
var WORDS = {};

for ( let index = 0; index < ALL_WORDS.length; index++ ) {
  var word = ALL_WORDS[index];

  if ( word in WORDS )
    WORDS[word] += 1;
  else
    WORDS[word] = 1;
}

var N = ALL_WORDS.length;

function P( word ) {
  if ( word in WORDS )
    return WORDS[word] / N;
  else
    return 0;
};

function selectMax( list, key ) {
  var maxElm = "";
  var maxVal = 0;

  list.forEach( word => {
    if ( key(word) >= maxVal ) {
      maxElm = word;
      maxVal = key(word);
    } }
  )
  
  return maxElm;
};

function candidates( word ) {
  var e0 = known( [word] );
  var e1 = known( edits1( word ) );
  var e2 = known( edits2( word ) );
  
  if ( e0.length > 0 )
    return e0;
  else if ( e1.length > 0 )
    return e1;
  else if ( e2.length > 0 )
    return e2;
  else
    return [word];
};

function known( words ) {
  return words.filter( str => str in WORDS );
};

function edits1( word ) {
  var letters = "abcdefghijklmnopqrstuvwxyz".split('');
  var splits     = [];
  var deletes    = [];
  var transposes = [];
  var replaces   = [];
  var inserts    = [];

  for ( let index = 0; index <= word.length; index++ )
    splits.push( {L:word.substring( 0, index ), R:word.substring( index, word.length )} )

  var splits = splits.filter( split => split.R.length > 0 );

  var deletes = splits.map( split =>
    split.L + split.R.substring( 1, split.R.length ) );

  var transposes = splits.filter( split => split.R.length > 1 ).map( split =>
    split.L + split.R[1] + split.R[0] + split.R.substring( 2, split.R.length ) );

  function getReplace( c ) {
    return splits.map( split => split.L + c + split.R.substring( 1, split.R.length ) );
  };

  var replaces = letters.reduce( ( lst, char ) => 
    lst.concat( getReplace( char ) ),
    [] );

  function getInsert( c ) {
    return splits.map( split => split.L + c + split.R );
  }

  inserts = letters.reduce( ( lst, char ) => 
    lst.concat( getInsert( char ) ),
    [] );

  return deletes.concat( transposes ).concat( replaces ).concat( inserts );
};

function edits2( word ) {
  return edits1( word ).reduce( ( lst, newWord ) => lst.concat( edits1( newWord ) ), [] );
};

function correction( word ) {
  return selectMax( candidates( word ), P );
};

// CORRECT = fs.readFileSync( path.join( __dirname, 'correct.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' );
// E1 = fs.readFileSync( path.join( __dirname, 'edit1.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' );
var E2 = fs.readFileSync( path.join( __dirname, 'edits2.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' ).filter( str => str !== '\n' );
var WRONG = fs.readFileSync( path.join( __dirname, 'wrong.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' ).filter( str => str !== '\n' );

function testTiming( words ) {
  console.log( "Single word" );
  var start = process.hrtime();
  correction( words[0] );
  console.log( process.hrtime( start ) );

  console.log( "10 words" );
  // console.log( words.length );
  var start = process.hrtime();
  for ( let index = 0; index < 10; index = index + 1 ) {
    // console.log( index.toString() );
    // console.log( words[index] );
    // console.log( correction( words[index] ) );
    correction( words[index] );
  }
  console.log( process.hrtime( start ) );

  console.log( "100 words" );
  start = process.hrtime();
  for ( let index = 0; index < 100; index++ ) {
    correction( words[index] );
  }
  console.log( process.hrtime( start ) );
};

/* console.log( "Correct word corrections" );
testTiming( CORRECT );
console.log( "\n" );

console.log( "Edit 1 corrections" );
testTiming( E1 );
console.log( "\n" ); */

/*
console.log( "Edit 2 corrections" );
testTiming( E2 );
console.log( "\n" );
*/

console.log( "Wrong corrections" );
console.log(edits2("informatzzn").length);
testTiming( WRONG );
console.log( "\n" );
