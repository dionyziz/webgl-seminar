define( [ 'libs/extender', 'libs/math', 'libs/external/glMatrix', 'libs/events' ], function( inherits, math, glMatrix, events ) {
    /**
     * An abstract 3 dimentional object with a location in space
     */

    var mat4 = glMatrix.mat4;
    var tetra = math.tetra;
    var dian3 = math.dian3;

    var Transformable = function() {
        //private
        var cachedMatrix = mat4.create();
        var inverseMatrix = mat4.create();
        var orientation = [ 1, 0, 0, 0 ];
        this._position = [ 0, 0, 0 ];
        this._validMatrix = false;
        var validInverse = false;
        var that = this;
        
        //public	
        this.scaleFactor = 1;// only uniform for the momment

        this.setMatrix = function( mat ){
            mat4.set( mat, cachedMatrix );
            mat4.inverse( cachedMatrix, inverseMatrix );
            this._validMatrix = true;
            validInverse = true;
        };
        
        //functions
        this.getOrientation = function() {
            return orientation;
        };
        this.setOrientation = function( orient ) {
            orientation = orient.slice();
            this._validMatrix = false;
        };
        this.getPosition = function() {
            return this._position.slice();
        };
        this.setPosition = function( pos ) {
            this._position = pos.slice();
            this._validMatrix = false;
        };
        this.rotateTo = function( angle, axis ) { //<--rads
            orientation = tetra.create( axis[ 0 ], axis[ 1 ], axis[ 2 ], angle );
			validMatrix = false;
        };
        this.rotate = function( angle, axis, originWise ) {
            if ( originWise ) {
                var rot = tetra.create( axis[ 0 ], axis[ 1 ], axis[ 2 ], angle );
                this._position = tetra.multiplyVec3( rot, this._position );
            }
            //rotate aroound yourself fool!
            orientation = tetra.rotate( orientation, axis[ 0 ], axis[ 1 ], axis[ 2 ], angle );
            this._validMatrix = false;
        };
        this.rotateToByQuart = function( quart ) {
            orientation = tetra.cross( tetra.create( 0,0,-1, 0 ), quart );
			validMatrix = false;
        };        
        this.move = function( x, y, z, origin ) {
            if ( origin ) { // move against world base
                this._position[ 0 ] += x;
                this._position[ 1 ] += y;
                this._position[ 2 ] += z;
            }
            else {
                var mat = this.getMatrix();
                mat4.translate( mat, [ x, y, z ] );
                this._position[ 0 ] = mat[ 12 ];
                this._position[ 1 ] = mat[ 13 ];
                this._position[ 2 ] = mat[ 14 ];
            }	
            this._validMatrix = false;
        };
        this.moveTo = function( x, y, z ) {
            this._position = [ x, y, z ];
            //that.emit( 'move', this._position, orientation ); //talk to pagio, haz problems
            this._validMatrix = false;
        };
        this.scale = function( scale, originwise ) {
            if ( originwise ) {
                this.moveTo.apply( this, dian3.scale( this.getPosition(), scale ) );
            }
            this.scaleFactor = scale;
            this._validMatrix = false;
        };
        this.getScale = function() {
            return this.scaleFactor;
        };
        this.getMatrix = function() {
                if ( !this._validMatrix ) {
                    cachedMatrix = tetra.rotMatrix( orientation );
					mat4.scale( cachedMatrix, [ this.scaleFactor, this.scaleFactor, this.scaleFactor ] );
                    cachedMatrix[ 12 ] = this._position[ 0 ];
                    cachedMatrix[ 13 ] = this._position[ 1 ];
                    cachedMatrix[ 14 ] = this._position[ 2 ];
                }
                return cachedMatrix;
        };
        this.getInverse = function() {
            if( !validInverse || !this._validMatrix ) {
                var mat = this.getMatrix();
                //Transposed 3x3 matrix
                inverseMatrix[ 0 ] = mat[ 0 ];
                inverseMatrix[ 1 ] = mat[ 4 ];
                inverseMatrix[ 2 ] = mat[ 8 ];
                inverseMatrix[ 4 ] = mat[ 1 ];
                inverseMatrix[ 5 ] = mat[ 5 ];
                inverseMatrix[ 6 ] = mat[ 9 ];
                inverseMatrix[ 8 ] = mat[ 2 ];
                inverseMatrix[ 9 ] = mat[ 6 ];
                inverseMatrix[ 10 ] = mat[ 10 ];
                //Translation part rotated by the transposed 3x3 matrix
                var x = -mat[ 12 ];
                var y = -mat[ 13 ];
                var z = -mat[ 14 ];
                inverseMatrix[ 12 ] = x * inverseMatrix[ 0 ] + y * inverseMatrix[ 4 ] + z * inverseMatrix[ 8 ];
                inverseMatrix[ 13 ] = x * inverseMatrix[ 1 ] + y * inverseMatrix[ 5 ] + z * inverseMatrix[ 9 ];
                inverseMatrix[ 14 ] = x * inverseMatrix[ 2 ] + y * inverseMatrix[ 6 ] + z * inverseMatrix[ 10 ];
                inverseMatrix[ 15 ] = 1;
                validInverse = true;
            }
            return inverseMatrix;
        };
        this.calcAbsoluteState = function( parentAbsPos, parentAbsOrient, childPos, childOrient ) {
            //abs this._position and orientation
            var absOrient = tetra.cross( parentAbsOrient, childOrient );
            var absPos = dian3.add( parentAbsPos,
	                    tetra.multiplyVec3( parentAbsOrient, childPos ) );
            return [ absPos, absOrient ];
        };
        this.lookAt = function( x, y, z ) {
			orientation = tetra.lookAt.apply( null, dian3.subtract( [ x,y,z ], this.getPosition() ) );
            this._validMatrix = false;
        }
    };

    inherits( Transformable, events.EventEmitter );

    return Transformable;
} );
