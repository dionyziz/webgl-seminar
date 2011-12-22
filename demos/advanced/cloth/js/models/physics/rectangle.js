define( function( require, exports, module ) {
    var dian3 = require( 'libs/math' ).dian3;

    exports.rectInterfere = function( rect1, rect2  ) {
        return !( rect1[1] > rect2[3] || //1bottom > 2top 
                  rect2[1] > rect1[3] || //2bottom > 1top
                  rect1[0] > rect2[2] || //1left > 2right
                  rect2[0] > rect1[2] ); // 2left > 1right
    }         

    exports.rectInterferenceArea = function( rect1, rect2 ) {
        if( !rectInterfere( rect1, rect2 ) ) {
            return false;
        }

        var top = Math.min( rect1[3], rect2[3] ),
        left = Math.max( rect1[0], rect2[0] ),
        bottom = Math.max( rect1[1], rect2[1] ),
        right = Math.min( rect1[2], rect2[2] );

        return ( [ [left,bottom], [right, top] ] );
    }

    exports.parallepipedInterfere = function( box1, box2, pos1, pos2 ) {
        var i, p1 = [], p2 = [], 
        ind = [ 0,1,2,
                1,2,3,
                0,1,4,
                1,4,5,
                0,2,4,
                2,4,6,
                2,3,6,
                3,6,7,
                4,5,6,
                5,6,7,
                1,3,5,
                3,5,7 ];//parallepiped indices
        for ( i = 0; i < box1.length; i++ ) {
            p1.push( [ box1[i][0] + pos1[0], box1[i][1] + pos1[1], box1[i][2] + pos1[2] ] );
        }
        for ( i = 0; i < box2.length; i++ ) {
            p2.push( [ box2[i][0] + pos2[0], box2[i][1] + pos2[1], box2[i][2] + pos2[2] ] );
        }
        for ( i = 0; i < ind.length; i += 6 ) {
            if ( isSeperatingPlane( [ p1[ ind[i+0] ], p1[ ind[i+1] ], p1[ ind[i+2] ] ], p1, p2 ) ) {
                return false;
            }
        }
        for ( i = 0; i < ind.length; i += 6 ) {
            if ( isSeperatingPlane( [ p2[ ind[i+0] ], p2[ ind[i+1] ], p2[ ind[i+2] ] ], p1, p2 ) ) {
                return false;
            }
        }
        return true;
    }

    function isSeperatingPlane( tri, points1, points2 ) {
        var normal = dian3.cross( dian3.subtract( tri[0], tri[1] ), dian3.subtract( tri[0], tri[2] ) );
        var proshmo = "und", temp, proshmo2 = "und";
        var i;
        for ( i = 0; i < points1.length; i++ ) {
            temp = dian3.dot( normal, dian3.subtract( points1[i], tri[0] ) );

            if ( temp === 0 ) {
                temp = "und";
                continue;
            }
            if ( proshmo === "und" ) {
                proshmo = temp + 0;
                continue;
            }
            if ( proshmo*temp < 0 ) {
                return false;
            }
        }
        for ( i = 0; i < points2.length; i++ ) {
            temp = dian3.dot( normal, dian3.subtract( points2[i], tri[0] ) );
            
            if ( temp === 0 ) {
                temp = "und";
                continue;
            }
            if ( proshmo2 === "und" ) {
                proshmo2 = temp + 0;
                continue;
            }
            if ( proshmo2*temp < 0 ) {
                return false;
            }
        }
        if ( proshmo === "und" || proshmo2 === "und" ) {
            return false;
        }
        if ( proshmo*proshmo2 > 0 ) {
            return false;
        }
        return true;
    }
} );
