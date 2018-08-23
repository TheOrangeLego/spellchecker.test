module.exports = {
  'string-dict': {
    'make': function( dict ) {
      return dict[0];
    }
  },
  'make-string-dict': function() {
    return {};
  },
  'count': function( list ) {
    dict = {};

    for ( elm of list ) {
      if ( !dict.hasOwnProperty( elm ) ) {
        dict[elm] = 0;
      }
      
      dict[elm] += 1;
    }

    return dict;
  },
  'apply': function( list, fun ) {
    dict = {};

    for ( elm of list ) {
      dict[elm] = fun( elm );
    }

    return dict;
  },
  'insert': function( dict, key, value ) {
    dict[key] = value;
    return dict;
  },
  'size': function( dict ) {
    return Object.keys( dict ).length;
  },
  'get': function( dict, elm ) {
    return dict[elm];
  },
  'has-key': function( dict, elm ) {
    return dict.hasOwnProperty( elm );
  },
  'keys': function( dict ) {
    return Object.keys( dict );
  },
  'values': function( dict ) {
    return Object.values( dict );
  },
  'is-dict': function( dict ) {
    return dict.constructor === 'object';
  }
};