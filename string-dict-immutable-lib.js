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
    const { Map, List } = require('immutable');

    const F = runtime.makeFunction;

    var stringDict = runtime.makeObject({
      'make': F(function(list) { return Map(list[0]); }),
      'make0': F(function() { return Map(); }),
      'make1': F(function(e1) { return Map(e1); }),
      'make2': F(function(e1, e2) { return Map(e1); }),
      'make3': F(function(e1, e2, e3) { return Map(e1); }),
      'make4': F(function(e1, e2, e3, e4) { return Map(e1); }),
      'make5': F(function(e1, e2, e3, e4, e5) { return Map(e1); }),
    });

    var count = function( list ) {
      var dict = Map();

      for ( var index = 0; index < list.size; index++ ) {
        var elm = list.get( index );

        if ( dict.has( elm ) ) {
          dict = dict.set( elm, dict.get( elm ) + 1 );
        } else {
          dict = dict.set( elm, 1 );
        }
      }

      return dict;
    }

    var apply = function( list, fun ) {
      var dict = Map();

      for ( var index = 0; index < list.size; index++ ) {
        var elm = list.get( index );

        dict = dict.set( elm, fun.app( elm ) );
      }

      return dict;
    }

    var insert = function( dict, key, value ) { return dict.set( key, valye ); }
    var size = function( dict ) { return dict.size; }
    var get = function( dict, elm ) { return dict.get( elm ); }
    var hasKey = function( dict, elm ) { return dict.has( elm ); }
    var keys = function( dict ) { return List( dict ).map( lst => lst[0] ); }
    var values = function( dict ) { return dict.toList(); }
    var isDict = function( dict ) { return Map.isMap( dict ); }
    var toArray = function(dict) { return dict.toArray(); }

    return runtime.makeModuleReturn({
      'string-dict': stringDict,
      'count': F(count),
      'apply': F(apply),
      'insert': F(insert),
      'size': F(size),
      'get': F(get),
      'has-key': F(hasKey),
      'keys': F(keys),
      'values': F(values),
      'is-dict': F(isDict),
      'to-array': F(toArray)
    }, {}, {});
  }
})
