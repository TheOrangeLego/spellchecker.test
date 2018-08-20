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
    const F = runtime.makeFunction;

    var list = runtime.makeObject({
      'make': F(function(list) { return List(list); }),
      'make0': F(function() { return []; }),
      'make1': F(function(e1) { return [e1]; }),
      'make2': F(function(e1, e2) { return [e1, e2]; }),
      'make3': F(function(e1, e2, e3) { return [e1, e2, e3]; }),
      'make4': F(function(e1, e2, e3, e4) { return [e1, e2, e3, e4]; }),
      'make5': F(function(e1, e2, e3, e4, e5) { return [e1, e2, e3, e4, e5]; }),
    });

    var toList = function(list) { return list };
    var at = function(list, index) { return list[index]; }
    var length = function( list ) { return list.length; }
    var contains = function( list, elm ) { return list.some( cur => cur === elm ); }
    var map = function( list, fun ) {
      return list.map( ( e, i, a ) => fun.app( e ) );
    }
    var slice = function( list, start, end = list.length ) { return list.slice( start, end ); }
    var push = function( list, elm ) { list.push( elm ); return list; }
    var filter = function( list, fun ) {
      return list.filter( ( e, i, a ) => fun.app( e ) );
    }
    var reduce = function( list, fun, val ) {
      return list.reduce( ( t, e, i, a ) => fun.app( t, e ), val );
    }
    var sum = function( list ) { return list.reduce( ( x, y ) => x + y, 0 ); }
    var max = function( list ) { return list.reduce( ( x, y ) => Math.max( x, y ), list.get( 0 ) ); }
    var range = function( start, end ) {
      list = [];

      for ( var i = start; i < end; i++ ) {
        list.push( i );
      }

      return list;
    }
    var emptyList = function() { return []; }
    var concat = function( listA, listB ) { return listA.concat( listB ); }
    var concatPush = function( listA, listB ) {
      for ( var index = 0; index < listB.length; index++ ) {
        listA.push( listB[index] );
      }
      
      return listA;
    }
    var isList = function( list ) { return list.constructor === 'array'; }
    var toArray = function(list) { return list; }

    return runtime.makeModuleReturn({
      list: list,
      'to-list': F(toList),
      'at': F(at),
      'length': F(length),
      'contains': F(contains),
      'map': F(map),
      'slice': F(slice),
      'push': F(push),
      'filter': F(filter),
      'reduce': F(reduce),
      'sum': F(sum),
      'max': F(max),
      'range': F(range),
      'empty-list': F(emptyList),
      'concat': F(concat),
      'concat-push': F(concatPush),
      'is-list': F(isList),
      'to-array': F(toArray)
    }, {}, {});
  }
})
