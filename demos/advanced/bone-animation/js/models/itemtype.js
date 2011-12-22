define( function() {
    var ItemType = function( data, id ) {
        this.loadData( data || {} );
    };
    
    ItemType.prototype = {
        loadData: function( data ) {
            this.data = data;
        },
        setDeep: function( path, val ) {
            var parts = path.split( '.' );
            if ( parts.length < 1 ) {
                return false;
            }
            var currentLevel = this.data;
            var curPart;
            for ( var i = 0, l = parts.length - 1; i < l; ++i ) {
                curPart = parts[ i ];
                if ( typeof currentLevel[ curPart ] != 'object' ) {
                    currentLevel[ curPart ] = {};
                }
                currentLevel = currentLevel[ curPart ];
            }
            currentLevel[ parts[ parts.length - 1 ] ] = val;
            return true;
        },
        getDeep: function( path ) {
            var parts = path.split( '.' );
            var currentLevel = this.data;
            var curPath;
            curPath = parts.shift();

            try {
                do {
                    currentLevel = currentLevel[ curPath ];
                }
                while ( curPath = parts.shift() )
                return currentLevel;
            }
            catch ( e ) {
            return; //undefined
            }
        },
        hasDeep: function( path ) {
            if ( typeof this.getDeep( path ) != 'undefined' ) {
                return true;
            }
            return false;
        }
    }
    
    return ItemType;
} )