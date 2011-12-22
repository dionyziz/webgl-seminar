define( function() {
    var inherits = function( c, p ) {
        if ( typeof p == 'object' ) {
            return c.prototype.__proto__ = p;
        }
        c.prototype.__proto__ = p.prototype;
    };

    inherits.override = function( obj, name ) {
        if ( !obj.super_ ) {
            obj.super_ = {};
        }
        obj.super_[ name ] = obj.__proto__.__proto__[ name ].bind( obj );
    };

    return inherits;
} );
