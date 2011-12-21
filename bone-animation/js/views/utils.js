define( function() {
    var dom = {
        makeTR: function() {
            var newTR = document.createElement( 'tr' );
            var newTD;
            for ( var i = 0; i < arguments.length; ++i ) {
                newTD = document.createElement( 'td' );
                newTD.appendChild( document.createTextNode( arguments[ i ] ) );
                newTR.appendChild( newTD );
            }
            return newTR;
        },
        makeDL: function() {
            var newDL = document.createElement( 'dl' );
            var newDT, newDD;
            for ( var i = 0; i < arguments.length; ++i ) {
                var definition = arguments[ i ];
                newDT = document.createElement( 'dt' );
                newDT.appendChild( document.createTextNode( definition[ 0 ] ) );
                newDL.appendChild( newDT );
                newDD = document.createElement( 'dd' );
                newDD.appendChild( document.createTextNode( definition[ 1 ] ) );
                newDL.appendChild( newDD );
            }
            return newDL;
        }
    };

    var text = {
        max: function( text, count ) {
            if ( text.length > count ) {
                return text.substr( 0, count - 3 ) + '...';
            }
            else {
                return text;
            }
        }
    };
    
    var point = {
        distance: function( pointA, pointB ) {
            var dx, dy, dz;
            dx = pointA[ 0 ] - pointB[ 0 ];
            dy = pointA[ 1 ] - pointB[ 1 ];
            dz = pointA[ 2 ] - pointB[ 2 ];
            
            return Math.sqrt( Math.pow( dx, 2 ) + Math.pow( dy, 2 ) + Math.pow( dz, 2 ) );
        }
    };
    return { text: text, dom: dom };
} );