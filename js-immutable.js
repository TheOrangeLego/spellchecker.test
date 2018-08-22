"use strict";

const assert        = require( 'assert' );
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
    splits = splits.push( {L:word.substring( 0, index ), R:word.substring( index, word.length )} )

  var deletes = splits.filter( split => split.R.length > 0 ).map( split =>
    split.L + split.R.substring( 1, split.R.length ) );

  var transposes = splits.filter( split => split.R.length > 1 ).map( split =>
    split.L + split.R[1] + split.R[0] + split.R.substring( 2, split.R.length ) );

  function getReplace( c ) {
    return splits.filter( split => split.R.length > 0 ).map( split => split.L + c + split.R.substring( 1, split.R.length ) );
  };

  function getInsert( c ) {
    return splits.map( split => split.L + c + split.R );
  }

  var replaces = letters.flatMap( getReplace );
  var inserts = letters.flatMap( getInsert );

  return deletes.concat( transposes ).concat( replaces ).concat( inserts );
};

function edits2( word ) {
  return edits1( word ).flatMap( newWord => edits1(newWord) );
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
