define( function() {
    function typeOf( obj ) {
        if ( obj === null ) {
            return 'null';
        }
        if ( typeof obj == 'object' ) {
            if ( typeof obj.length != 'undefined' ) {
                return 'array';
            }
            return 'object';
        }
        return typeof obj;
    }

    function clone( o ) {
        var i;
        var ret;

        switch ( typeOf( o ) ) {
            case 'array':
                ret = [];
                break;
            case 'object':
                ret = {};
                break;
        }
        
        for ( i in o ) {
            switch ( typeOf( o[ i ] ) ) {
                case 'array':
                case 'object':
                    ret[ i ] = clone( o[ i ] );
                    break;
                default:
                    ret[ i ] = o[ i ];
            }
        }
        
        return ret;
    }

    var sceneElement = {
        entity: null,
        type: 'LEAF',
        parentNode: null
    };

    var sceneGroup = clone( sceneElement );
    sceneGroup.type = 'GROUP';
    sceneGroup.children = [];

    sceneGroup.appendChild = function ( element ) {
        this.children.push( element );
        element.parentNode = this;
    };
    sceneGroup.removeChild = function ( element ) {
        var i;

        for ( i in this.children ) {
            var child = this.children[ i ];

            if ( child == element ) {
                break;
            }
        }
        this.children.splice( i, 1 );
    };

	var world = clone( sceneGroup );
    world.createElement = function () { // factory
        return clone( sceneElement );
    };
    world.createGroupElement = function () { // factory
        return clone( sceneGroup );
    };
    world.parentNode = null;

    return {
        world: world
    };
} );
