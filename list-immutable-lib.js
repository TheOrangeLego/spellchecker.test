({
  requires: [],
  nativeRequires: [],
  provides: {
    shorthands: {
    },
    values: {
    },
    aliases: {
    },
    datatypes: {
    }
  },
  theModule: function(runtime, namespace, uri){
    const { List } = require('immutable');

    const F = runtime.makeFunction;

    var list = runtime.makeObject({
      'make': F(function(list) { return List(list); }),
      'make0': F(function() { return List([]); }),
      'make1': F(function(e1) { return List([e1]); }),
      'make2': F(function(e1, e2) { return List([e1, e2]); }),
      'make3': F(function(e1, e2, e3) { return List([e1, e2, e3]); }),
      'make4': F(function(e1, e2, e3, e4) { return List([e1, e2, e3, e4]); }),
      'make5': F(function(e1, e2, e3, e4, e5) { return List([e1, e2, e3, e4, e5]); }),
    });

    var toList = function(list) { return List(list); };
    var at = function(list, index) { return list.get(index); }
    var length = function( list ) { return list.size; }
    var contains = function( list, elm ) { return list.includes( elm ); }
    var map = function( list, fun ) { return list.map( fun ); }
    var flatMap = function( list, fun ) { return list.flatMap( fun ); }
    var slice = function( list, start, end = list.length ) { return list.slice( start, end ); }
    var push = function( list, elm ) { return list.push( elm ); }
    var filter = function( list, fun ) { return list.filter( fun ); }
    var reduce = function( list, fun, val ) { return list.reduce( fun, val ); }
    var sum = function( list ) { return list.reduce( ( x, y ) => x + y, 0 ); }
    var max = function( list ) { return list.reduce( ( x, y ) => Math.max( x, y ), list.get( 0 ) ); }
    var range = function( start, end ) {
      list = List( [] );

      for ( var i = start; i < end; i++ ) {
        list = list.push( i );
      }

      return list;
    }
    var emptyList = function() { return List( [] ); }
    var concat = function( listA, listB ) {
      var newList = List( listA );

      for ( var index = 0; index < listB.size; index++ ) {
        newList = newList.push( listB.get( index ) );
      }

      return newList;
    }
    var isList = function( list ) { return List.isList( list ); }
    var toArray = function(list) { return list.toArray(); }

    return runtime.makeModuleReturn({
      list: list,
      'to-list': F(toList),
      'at': F(at),
      'length': F(length),
      'contains': F(contains),
      'map': F(map),
      'flat-map': F(flatMap),
      'slice': F(slice),
      'push': F(push),
      'filter': F(filter),
      'reduce': F(reduce),
      'sum': F(sum),
      'max': F(max),
      'range': F(range),
      'empty-list': F(emptyList),
      'concat': F(concat),
      'is-list': F(isList),
      'to-array': F(toArray)
    }, {}, {});
  }
})
