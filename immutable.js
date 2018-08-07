"use strict";

const fs            = require( 'fs' );
const path          = require( 'path' );
const { Map, List } = require( 'immutable' );

function words( text ) {
  var content = text.toLowerCase().split( /\b/ );
  return content.filter( str => str != "" );
};

var ALL_WORDS = words( fs.readFileSync( path.join( __dirname, 'big.txt' ), 'utf-8' ) );
var WORDS = {};

for ( var index = 0; index < ALL_WORDS.length; index++ ) {
  var word = ALL_WORDS[index];

  if ( word in WORDS )
    WORDS[word] += 1;
  else
    WORDS[word] = 1;
}

var WORDS_MAP = Map( WORDS );
var N = ALL_WORDS.length;

function P( word ) {
  if ( WORDS_MAP.has( word ) )
    return WORDS_MAP.get( word ) / N;
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
  var e0 = known( List( [word] ) );
  var e1 = known( edits1( word ) );
  var e2 = known( edits2( word ) );

  if ( e0.size > 0 )
    return e0;
  else if ( e1.size > 0 )
    return e1;
  else if ( e2.size > 0 )
    return e2;
  else
    return List( [word] );
};

function known( words ) {
  return words.filter( str => WORDS_MAP.has( str ) );
};

function edits1( word ) {
  var letters = List( "abcdefghijklmnopqrstuvwxyz".split('') );
  var splits  = List( [] )
  
  for ( var index = 0; index <= word.length; index++ )
    if ( word.length - index > 0 )
      splits = splits.push( {L:word.substring( 0, index ), R:word.substring( index, word.length )} )

  var deletes = splits.map( split =>
    split.L + split.R.substring( 1, split.R.length ) );

  var transposes = splits.filter( split => split.R.length > 1 ).map( split =>
    split.L + split.R[1] + split.R[0] + split.R.substring( 2, split.R.length ) );

  function getReplace( c ) {
    return splits.map( split => split.L + c + split.R.substring( 1, split.R.length ) );
  };

  var replaces = letters.flatMap( getReplace );

  function getInsert( c ) {
    return splits.map( split => split.L + c + split.R );
  }

  var inserts = letters.flatMap( getInsert );

  return deletes.concat( transposes ).concat( replaces ).concat( inserts );
};

function edits2( word ) {
  return edits1( word ).map( newWord => edits1(newWord) ).flatten();
  // return edits1( word ).reduce( ( lst, newWord ) => lst.concat( edits1( newWord ) ), List( [] ) );
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
  start = process.hrtime();
  for ( var index = 0; index < 10; index++ )
    correction( words[index] );
  console.log( process.hrtime( start ) );

  console.log( "100 words" );
  start = process.hrtime();
  for ( var index = 0; index < 100; index++ ) {
    var anotherstart = process.hrtime();
    console.log(words[index], correction(words[index]));
    correction( words[index] );
    console.log("Single word timing:", process.hrtime(anotherstart));
  }
  console.log( process.hrtime( start ) );
};

/* console.log( "Correct word corrections" );
testTiming( CORRECT );
console.log( "\n" );

console.log( "Edit 1 corrections" );
testTiming( E1 );
console.log( "\n" ); */

//console.log( "Edit 2 corrections" );
//testTiming( E2 );
//console.log( "\n" );

console.log( "Wrong corrections" );
testTiming( WRONG );
console.log( "\n" );
