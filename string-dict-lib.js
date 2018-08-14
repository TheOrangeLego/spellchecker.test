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

    var stringDict = runtime.makeObject({
      'make': F(function(object) { return object; }),
      'make0': F(function() { return {}; }),
      'make1': F(function(e1) { return e1; }),
      'make2': F(function(e1, e2) { return e1; }),
      'make3': F(function(e1, e2, e3) { return e1; }),
      'make4': F(function(e1, e2, e3, e4) { return e1; }),
      'make5': F(function(e1, e2, e3, e4, e5) { return e1; }),
    });

    var count = function( list ) {
      dict = {};

      for ( elm of list ) {
        if ( !dict.hasOwnProperty( elm ) ) {
          dict[elm] = 0;
        }
        
        dict[elm] += 1;
      }

      return dict;
    }

    var apply = function( list, fun ) {
      dict = {};

      for ( elm of list ) {
        dict[elm] = fun.app( elm );
      }

      return dict;
    }

    var insert = function( dict, key, value ) { dict[key] = value; return dict; }
    var size = function( dict ) { return Object.keys( dict ).length; }
    var get = function( dict, elm ) { return dict[elm]; }
    var hasKey = function( dict, elm ) { return dict.hasOwnProperty( elm ); }
    var keys = function( dict ) { return Object.keys( dict ); }
    var values = function( dict ) { return Object.values( dict ); }
    var isDict = function( dict ) { return dict.constructor === 'object'; }
    var toArray = function(dict) { return Objects.keys( dict ).map( key => [key, dict[key]] ); }

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
