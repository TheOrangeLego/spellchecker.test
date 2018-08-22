"use strict";

const assert = require( 'assert' );
const fs = require( 'fs' );
const path = require( 'path' );

function words( text ) {
  var content = text.toLowerCase().split( RegExp( "\\b" ) );
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
  var wordLength = word.length;

  var splits     = [];
  var deletes    = [];
  var transposes = [];
  var replaces   = [];
  var inserts    = [];
  
  for ( let index = 0; index <= wordLength; index++ )
    splits.push( {L:word.substring( 0, index ), R:word.substring( index )} )

  deletes = splits.filter( split => split.R.length > 0 ).map( split =>
    split.L + split.R.substring( 1, split.R.length ) );

  transposes = splits.filter( split => split.R.length > 1 ).map( split =>
    split.L + split.R[1] + split.R[0] + split.R.substring( 2, split.R.length ) );

  function getReplace( c ) {
    return splits.filter( split => split.R.length > 0 ).map( split => split.L + c + split.R.substring( 1, split.R.length ) );
  };

  function getInsert( c ) {
    return splits.map( split => split.L + c + split.R );
  }

  replaces = letters.reduce( ( lst, char ) => 
    myConcat( lst, getReplace( char ) ),
    [] );

  inserts = letters.reduce( ( lst, char ) => 
    myConcat( lst, getInsert( char ) ),
    [] );

  var listA = myConcat( deletes, transposes );
  listA = myConcat( listA, replaces );

  return myConcat( listA, inserts );
};

function myConcat( listA, listB ) {
  for ( var index = 0; index < listB.length; index++ ) {
    listA.push( listB[index] );
  }

  return listA;
};

function edits2( word ) {
  /* purely push */
  var firstEdits = edits1( word );

  var allEdits = [];

  for ( var index = 0; index < firstEdits.length; index++ ) {
    var innerEdits = edits1( firstEdits[index] );
    for ( var innerIndex = 0; innerIndex < innerEdits.length; innerIndex++ ) {
      allEdits.push( innerEdits[innerIndex] );
    }
  }

  return allEdits;
};

function correction( word ) {
  return selectMax( candidates( word ), P );
};

var testWordsE1 = fs.readFileSync( path.join( __dirname, 'edits1.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' ).filter( str => str !== '\n' );
var testWordsE2 = fs.readFileSync( path.join( __dirname, 'edits2.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' ).filter( str => str !== '\n' );
var testWordsW  = fs.readFileSync( path.join( __dirname, 'wrong.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' ).filter( str => str !== '\n' );

function testTiming( words, mustCorrect ) {
  console.log( "Single word" );
  var start = process.hrtime();
  correction( words[0] );
  console.log( process.hrtime( start ) );

  console.log( "10 words" );
  var start = process.hrtime();
  for ( let index = 0; index < 10; index = index + 1 ) {
    correction( words[index] );
  }
  console.log( process.hrtime( start ) );

  console.log( "100 words" );
  var start = process.hrtime();
  for ( let index = 0; index < 100; index++ ) {
    var word = words[index];
    var correctedWord = correction( word );
    // assert.strictEqual( correctedWord !== word, mustCorrect );
    // assert.strictEqual( WORDS.hasOwnProperty( correctedWord ), mustCorrect );
  }
  console.log( process.hrtime( start ) );
};

console.log( "\nEdits1" );
testTiming( testWordsE1, true );

console.log( "\nEdits2 " );
testTiming( testWordsE2, true );

console.log( "\nWrong" );
testTiming( testWordsW, false );
