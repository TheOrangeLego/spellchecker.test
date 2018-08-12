"use strict";

const assert = require( 'assert' );
const fs = require( 'fs' );
const path = require( 'path' );

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
  var wordLength = word.length;

  /* var wordIndices = [];
  var lessIndices = [];
  var moreIndices = [];

  for ( var index = 0; index < word.length + 1; index++ ) {
    if ( index < word.length ) {
      if ( index < word.length - 1 ) {
        lessIndices.push( index );
      }

      wordIndices.push( index );
    }

    moreIndices.push( index );
  }

  var deletes = wordIndices.map( index =>
    word.substring( 0, index ) + word.substring( index + 1 ) );
  
  var transposes = lessIndices.map( index =>
    word.substring( 0, index ) + word.charAt( index + 1 ) + word.charAt( index ) + word.substring( index + 2 ) );
  
  function getReplace( index ) {
    return letters.map( letter =>
      word.substring( 0, index ) + letter + word.substring( index + 1 ) );
  };

  var replaces = wordIndices.reduce( ( list, index ) =>
  getReplace( index ).concat( list ), [] );

  function getInsert( index ) {
    return letters.map( letter =>
      word.substring( 0, index ) + letter + word.substring( index ) );
  };

  var inserts = moreIndices.reduce( ( list, index ) =>
  getInsert( index ).concat( list ), [] ); */

  var splits     = [];
  var deletes    = [];
  var transposes = [];
  var replaces   = [];
  var inserts    = [];
  
  for ( let index = 0; index <= wordLength; index++ )
    splits.push( {L:word.substring( 0, index ), R:word.substring( index )} )

  splits = splits.filter( split => split.R.length > 0 );

  deletes = splits.map( split =>
    split.L + split.R.substring( 1, split.R.length ) );

  transposes = splits.filter( split => split.R.length > 1 ).map( split =>
    split.L + split.R[1] + split.R[0] + split.R.substring( 2, split.R.length ) );

  function getReplace( c ) {
    return splits.map( split => split.L + c + split.R.substring( 1, split.R.length ) );
  };

  letters.map( char =>
    {
      var replacements = getReplace( char );
      for ( var index = 0; index < replacements.length; index++ ) {
        replaces.push( replacements[index] );
      }
    } );

  function getInsert( c ) {
    return splits.map( split => split.L + c + split.R );
  }

  letters.map( char =>
    {
      var insertions = getInsert( char );
      for ( var index = 0; index < insertions.length; index++ ) {
        inserts.push( insertions[index] );
      }
    } );

  /* using concat; slight slowdown */
  /* replaces = letters.reduce( ( lst, char ) => 
    lst.concat( getReplace( char ) ),
    [] ); */

  /* using concat; slight slowdown */
  /* inserts = letters.reduce( ( lst, char ) => 
    lst.concat( getInsert( char ) ),
    [] ); */

  /* old version of returning edits1; slight slowdown */
  /* return deletes.concat( transposes ).concat( replaces ).concat( inserts ); */

  /* using push to concatenate both lists; slightly faster */
  var listA = myConcat( deletes, transposes );
  var listB = myConcat( listA, replaces );

  return myConcat( listB, inserts );
};

function myConcat( listA, listB ) {
  var finalList = listA;

  for ( var index = 0; index < listB.length; index++ ) {
    finalList.push( listB[index] );
  }

  return finalList;
};

function edits2( word ) {
  /* purely push */
  var firstEdits = edits1( word );

  var allEdits = [];

  for ( var index = 0; index < firstEdits.length; index++ ) {
    var innerEdits = edits1( firstEdits[index] );
    for ( var editIndex = 0; editIndex < innerEdits.length; editIndex++ ) {
      allEdits.push( innerEdits[editIndex] );
    }
  }

  return allEdits;

  /* checking if reduce was the cause of slowdown; it wasn't */
  /* function updateEdits( allEdits, word ) {
    var innerEdits = edits1( word );

    for ( var index = 0; index < innerEdits.length; index++ ) {
      allEdits.push( innerEdits[index] );
    }

    return allEdits;
  };

  var edits = edits1( word );
  return edits.reduce( updateEdits, [] ); */

  /* original version; really slow */
  /* var edits = edits1( word );
  return edits.reduce( ( list, editWord ) => list.concat( edits1( editWord ) ), [] ); */
};

function correction( word ) {
  return selectMax( candidates( word ), P );
};

var E2 = fs.readFileSync( path.join( __dirname, 'edits2.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' ).filter( str => str !== '\n' );
var WRONG = fs.readFileSync( path.join( __dirname, 'wrong.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' ).filter( str => str !== '\n' );

function testTiming( words ) {
  console.log( "Single word" );
  var start = process.hrtime();
  correction( words[0] );
  /* assert.deepEqual( correction( words[0] ), words[0] ); */
  console.log( process.hrtime( start ) );

  console.log( "10 words" );
  var start = process.hrtime();
  for ( let index = 0; index < 10; index = index + 1 ) {
    correction( words[index] );
    /* assert.deepEqual( correction( words[index] ), words[index] ); */
  }
  console.log( process.hrtime( start ) );

  console.log( "100 words" );
  start = process.hrtime();
  for ( let index = 0; index < 100; index++ ) {
    correction( words[index] );
    /* assert.deepEqual( correction( words[index] ), words[index] ); */
  }
  console.log( process.hrtime( start ) );
};

console.log( "Wrong corrections" );
testTiming( WRONG );
console.log( "\n" );

/* var trials = [...Array( 10 ).keys()];
var start = process.hrtime();
var totalEdits = trials.reduce( x => x + ( edits2( "something" ) ).length, 0 );
console.log( totalEdits );
console.log( process.hrtime( start ) ); */
