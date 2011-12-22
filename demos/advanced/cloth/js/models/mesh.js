define( function( require, exports, module ) {
    var Transformable = require( 'models/transformable' );
    var physics = require( 'physics' );
    var dian3 = require( 'libs/math' ).dian3;
    var tetra = require( 'libs/math' ).tetra;

    var Mesh = function( vertices, indices ) {
        //private
        var box = [];//without the transformations
        var sphereRadius = 1;
        var sphereCenter = [ 0, 0, 0 ];
        var validBox = false;


        //public
        this._vertices = [];
        this.__defineSetter__( "vertices", function( val ) {
                this._vertices = [];
                for ( var i = 0; i < val.length; i++ ) {
                    this._vertices[ i ] = parseFloat( val[ i ] );
                }
                validBox = false;
            }
        );
        this.__defineGetter__( "vertices", function() { return this._vertices; } );
        
        
        if( vertices !== undefined ) {
            if( vertices instanceof Array ){
                this.vertices = vertices;
            }
            else {
                throw 'Vertices supplied was not an Array'
            }
        }
        else {
            this.vertices = [];
        }
        
        if( indices !== undefined ) {
            if( indices instanceof Array ){
                this.indices = indices;
            }
            else {
                throw 'Indices supplied was not an Array'
            }
        }
        else {
            this.indices = [];
        }
        
        //functions
        //private
        
        //public
        //trans stuff
        this.move = function( x, y, z ) {
            for ( var i = 0, l = this.vertices.length; i < l; i+=3 ) {
                this.vertices[ i ] += x;
                this.vertices[ i + 1 ] += y;
                this.vertices[ i + 2 ] += z;
            }
            validBox = false;
        }
        this.rotate = function( angle, axis ) {
            //rotate aroound yourself fool!
            var rotMatrix = tetra.rotMatrix( 
                                tetra.rotate( [ 1, 0, 0, 0 ], axis[ 0 ], axis[ 1 ], axis[ 2 ], angle ) 
            );
            var res = [];
            for ( var i = 0, l = this.vertices.length; i < l; i+=3 ) {
                res = [];
                mat4.multiplyVec3( rotMatrix, 
                                [ this.vertices[ i ], this.vertices[ i + 1 ], this.vertices[ i + 2 ] ],
                                res );
                this.vertices[ i ] = res[ 0 ];
                this.vertices[ i + 1 ] = res[ 1 ];
                this.vertices[ i + 2 ] = res[ 2 ];
            }
            validBox = false;
        };
        //
        //collision stuff , should bein another class 
        this.setHullFromMesh = function() {
            rect = physics.bounds.findBoundingBox( this.vertices );
            box =  [ [ rect[0][0], rect[0][1], rect[0][2] ],
                          [ rect[0][0], rect[0][1], rect[1][2] ],
                          [ rect[0][0], rect[1][1], rect[0][2] ],
                          [ rect[0][0], rect[1][1], rect[1][2] ],
                          [ rect[1][0], rect[0][1], rect[0][2] ],
                          [ rect[1][0], rect[0][1], rect[1][2] ],
                          [ rect[1][0], rect[1][1], rect[0][2] ],
                          [ rect[1][0], rect[1][1], rect[1][2] ]
            ];
            sphereCenter = dian3.add( rect[0], 
                            dian3.scale( dian3.subtract( rect[ 1 ], rect[ 0 ] ), 0.5 ) 
            );
            sphereRadius = 0.5*dian3.metro( dian3.subtract( rect[ 1 ], rect[ 0 ] ) );//<-- needs unit testing
            validBox = true;
        };
        this.setHullFromEntities = function( sceneNode ) {
            var maxCorn = [], minCorn = [];
            for ( var i = 0; i < 3; i++ ) {
                maxCorn[ i ] = -9999999999;
                minCorn[ i ] = 99999999999;
            }
            
            for ( var x in sceneNode.children ) {
                //do stuff
                //console.log( sceneNode.children[ x ] );                
                var rotbox = sceneNode.children[ x ].entity.getBoundingBox();
                if ( typeof rotbox[ 7 ] === 'undefined' ) {
                    sceneNode.children[ x ].entity.mesh.setHullFromMesh();
                    rotbox = sceneNode.children[ x ].entity.getBoundingBox();
                }
                for ( var u = 0; u < 8; u++ ) {
                    for ( var i = 0; i < 3 ; i++ ) {
                        if ( maxCorn[ i ] < rotbox[ u ][ i ] ) {
                            maxCorn[ i ] = rotbox[ u ][ i ];
                        }
                        if ( minCorn[ i ]  > rotbox[ u ][ i ] ) {
                            minCorn[ i ] = rotbox[ u ][ i ];
                        }       
                    }
                }
            }
            
            if ( dian3.metro ( dian3.subtract( minCorn, 
                    [ this.vertices[ 0 ], this.vertices[ 1 ], this.vertices[ 2 ] ] ) ) +
                dian3.metro ( dian3.subtract( maxCorn, 
                    [ this.vertices[ 21 ], this.vertices[ 22 ], this.vertices[ 23 ] ] ) )
                 < 0.1 ) { // no change
                    return false;
            }
			this.vertices = [ minCorn[ 0 ], minCorn[ 1 ], minCorn[ 2 ],
							  minCorn[ 0 ], minCorn[ 1 ], maxCorn[ 2 ],
							  minCorn[ 0 ], maxCorn[ 1 ], minCorn[ 2 ],
							  maxCorn[ 0 ], minCorn[ 1 ], minCorn[ 2 ],
							  maxCorn[ 0 ], maxCorn[ 1 ], minCorn[ 2 ],
							  maxCorn[ 0 ], minCorn[ 1 ], maxCorn[ 2 ],
							  minCorn[ 0 ], maxCorn[ 1 ], maxCorn[ 2 ],
							  maxCorn[ 0 ], maxCorn[ 1 ], maxCorn[ 2 ] ];
							  
			this.indices = [ 0, 1, 2,
							 1, 6, 2,
							 0, 3, 1,
							 1, 3, 5,
							 1, 5, 6,
							 5, 7, 6,
							 2, 6, 4,
							 4, 6, 7,
							 2, 4, 3,
							 0, 2, 3,
							 3, 4, 5,
							 4, 7, 5 ];//a paralillepid			  			
            this.setHullFromMesh();
            return true;
        }
        this.getBoundingBox = function() {
            if ( !validBox ) {
                this.setHullFromMesh();
                validBox = true;
            }
            var rotbox = [];
            var mat = this.getMatrix();
            for ( var i = 0; i < box.length; i++ ) {
                rotbox[ i ] = [];
                mat4.multiplyVec3( mat, box[ i ], rotbox[ i ] );
            }
            return rotbox;
        };
        this.getBoundingSphere = function() {
            if ( !validBox ) {
                this.setHullFromMesh();
                validBox = true;
            }
            return [ dian3.add( sphereCenter, this.getPosition() ), sphereRadius*this.scaleFactor ];
        };
        //
        this.sharedCopy = function() {
            return this;  
        };
    }.extend( Transformable );
    
    return Mesh;
} );
