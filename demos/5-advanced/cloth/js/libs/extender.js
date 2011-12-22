/*
    Implementation of classical inheritance. I use the defineProperty method on the
    Object.prototype in order to make it non-enumerable. If set directly it breaks all
    the "for( i in obj )" loops
*/
Object.defineProperty( Function.prototype, "extend", {
    value: function( base ) {
        if ( !base ) {
            throw new Error( 'Base constructor is undefined' );
        }
        
        var child = this;
        
        return function () {
            base.apply( this );
            
            this.parent = {};
            for ( var i in this ) {
                if( typeof this[ i ] === "function" ) {
                    this.parent[ i ] = this[ i ].bind( this );
                }
            }
            
            child.apply( this, arguments );
        };
    } 
} );
