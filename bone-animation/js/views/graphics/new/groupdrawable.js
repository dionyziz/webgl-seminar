define( [ 'models/transformable', 'models/mesh', './drawable', 'libs/math', 'libs/extender' ], function( Transformable, Mesh, Drawable, math, inherits ) {
    tetra = math.tetra;    
    dian3 = math.dian3;
    
    var groupDrawable = function() {
        Transformable.call( this );

        var list = [];
        this.add = function( drawable, pos, orient ) {
            list.push( { 
                        drawable : drawable,
                        position : pos,
                        orientation : orient 
                        }
            );
        };
        this.update = function() {
            var state, pos, orient;
            pos = this.getPosition();
            orient = this.getOrientation();
            for ( var x in list ) {
                state = tetra.calcAbsoluteState( pos, orient, dian3.scale( list[ x ].position, this.getScale() ), list[ x ].orientation );                
                list[ x ].drawable.moveTo.apply( list[ x ].drawable, state[ 0 ] );
                list[ x ].drawable.rotateToByQuart( state[ 1 ] );
                list[ x ].drawable.scale( this.getScale() );
                //console.log( state[ 0 ], state[ 1 ] );
                //list[ x ].drawable.scale( this.getScale(), true );
            }
        };
        this.show = function() {
            for ( var x in list ) {
                list[ x ].drawable.show();
            }
        };
        this.clone = function() {
            var a = new groupDrawable();
            for ( var x in list ) {
                a.add( list[ x ].drawable.clone(), list[ x ].position, list[ x ].orientation );
            }
            a.moveTo.apply( a, this.getPosition() );
            a.rotateToByQuart( this.getOrientation() );
            a.scale( this.getScale() );
            return a;
        };
        this.getBoundingBox = function() {
            var box, state1, state2, pMin = [ 99999,99999,99999], pMax = [-10000,-99999,-999999];
            for ( var x in list ) {
                box = list[ x ].drawable.mesh.getBoundingBox();
                state1 = tetra.calcAbsoluteState( list[ x ].position, list[ x ].orientation, box[ 0 ], [ 1, 0, 0, 0 ] )[ 0 ];   
                state2 = tetra.calcAbsoluteState( list[ x ].position, list[ x ].orientation, box[ 7 ], [ 1, 0, 0, 0 ] )[ 0 ]; 
                for ( var i in state1 ) {
                    pMin[ i ] = Math.min( pMin[ i ], state1[ i ] );
                    pMax[ i ] = Math.max( pMax[ i ], state2[ i ] );
                }
            }
            return [ pMin, [1],[2],[3],[4],[5],[6],pMax ];//TODO right
        }
        this.moveToLevel = function( y ) {// move to 0 for now
            var box = [];
            var miny = 9999999999999;
            var actualy = 0;
            var temp;
            for ( var x in list ) {
                box = list[ x ].drawable.mesh.getBoundingBox();
                temp =  ( list[ x ].position[ 1 ] + box[ 0 ][ 1 ] )*this.getScale();
                
                //console.log( "level", list[ x ].position[ 1 ], box[ 0 ][ 1 ], box[ 7 ][ 1 ], this.getScale() );
                
                if ( temp < miny ) {
                    miny = temp;
                    actual = ( list[ x ].position[ 1 ] ) + ( box[ 0 ][ 1 ] )*this.getScale();           
                }
                delete( box );
                delete( temp );
            }
            //console.log( actual );
            for ( var x in list ) {
                list[ x ].position[ 1 ] -= actual; 
            }
            this.update();
        };
        this.remove = function() {
            for ( var x in list ) {
                list[ x ].drawable.remove();
            }
        };
    };

    inherits( groupDrawable, Transformable );
    
    return groupDrawable;
} );
