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
      'make1': F(function(v) { return List([v]); }),
      'make2': F(function(v) { return List([v]); }),
      'make3': F(function(v1, v2, v3) { return List([v1, v2, v3]); }),
      'make4': F(function(v) { return List([v]); }),
      'make5': F(function(v) { return List([v]); }),
      // and so on up to 5
    });

    var toList = function(list) { return List(list); };
    var at = function(list, index) { return list.get(index); }
    var toArray = function(list) { console.log(list.toArray()); return list.toArray(); }

    return runtime.makeModuleReturn({
      list: list,
      'to-list': F(toList),
      'at': F(at),
      'to-array': F(toArray)
    }, {}, {});
  }
})
