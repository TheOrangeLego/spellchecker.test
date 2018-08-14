const fs     = require( 'fs' );
const path   = require( 'path' );
const assert = require( 'assert' );

var speller = {};
speller.train = function (text) {
  content = text.toLowerCase().split( /\b/ );
  words = content.filter( str => str != "" );

  for ( index = 0; index < words.length; index++ ) {
    word = words[index];
  
    if ( word in speller.nWords )
      speller.nWords[word] += 1;
    else
      speller.nWords[word] = 1;
  }
};
speller.correct = function (word) {
  if (speller.nWords.hasOwnProperty(word)) return word;
  var candidates = {}, list = speller.edits(word);
  list.forEach(function (edit) {
    if (speller.nWords.hasOwnProperty(edit)) candidates[speller.nWords[edit]] = edit;
  });
  if (speller.countKeys(candidates) > 0) return candidates[speller.max(candidates)];
  list.forEach(function (edit) {
    speller.edits(edit).forEach(function (w) {
      if (speller.nWords.hasOwnProperty(w)) candidates[speller.nWords[w]] = w;
    });
  });
  return speller.countKeys(candidates) > 0 ? candidates[speller.max(candidates)] : word;
};
speller.nWords = {};
speller.countKeys = function (object) {
  var attr, count = 0;
  for (attr in object)
    if (object.hasOwnProperty(attr))
      count++;
  return count;
};
speller.max = function (candidates) {
  var candidate, arr = [];
  for (candidate in candidates)
    if (candidates.hasOwnProperty(candidate))
      arr.push(candidate);
  return Math.max.apply(null, arr);
};
speller.letters = "abcdefghijklmnopqrstuvwxyz".split("");
speller.edits = function (word) {
  var i, results = [];
  for (i=0; i < word.length; i++)
    results.push(word.slice(0, i) + word.slice(i+1));
  for (i=0; i < word.length-1; i++)
    results.push(word.slice(0, i) + word.slice(i+1, i+2) + word.slice(i, i+1) + word.slice(i+2));
  for (i=0; i < word.length; i++)
    speller.letters.forEach(function (l) {
      results.push(word.slice(0, i) + l + word.slice(i+1));
    });
  for (i=0; i <= word.length; i++)
    speller.letters.forEach(function (l) {
      results.push(word.slice(0, i) + l + word.slice(i));
    });
  return results;
};

file = fs.readFileSync( path.join( __dirname, 'big.txt' ), 'utf-8' );

speller.train( file );

var testWordsE1 = fs.readFileSync( path.join( __dirname, 'edits1.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' ).filter( str => str !== '\n' );
var testWordsE2 = fs.readFileSync( path.join( __dirname, 'edits2.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' ).filter( str => str !== '\n' );
var testWordsW  = fs.readFileSync( path.join( __dirname, 'wrong.txt' ), 'utf-8' ).toLowerCase().split( /\b/ ).filter( str => str !== '\r\n' ).filter( str => str !== '\n' );

function testTiming( words, mustCorrect ) {
  console.log( "Single word" );
  var start = process.hrtime();
  speller.correct( words[0] );
  console.log( process.hrtime( start ) );

  console.log( "10 words" );
  var start = process.hrtime();
  for ( let index = 0; index < 10; index = index + 1 ) {
    speller.correct( words[index] );
  }
  console.log( process.hrtime( start ) );

  console.log( "100 words" );
  var start = process.hrtime();
  for ( let index = 0; index < 100; index++ ) {
    var word = words[index];
    var correctedWord = speller.correct( word );
    assert.strictEqual( correctedWord !== word, mustCorrect );
    assert.strictEqual( speller.nWords.hasOwnProperty( correctedWord ), mustCorrect );
  }
  console.log( process.hrtime( start ) );
};

console.log( "\nEdits1" );
testTiming( testWordsE1, true );

console.log( "\nEdits2 " );
testTiming( testWordsE2, true );

console.log( "\nWrong" );
testTiming( testWordsW, false );