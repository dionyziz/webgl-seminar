define( [ 'libs/extender', './constants', 'libs/math', './bounds', './collision', './universe' ], function( inherits, constants, math, bounds, collision, Universe ) {
    var dian3 = math.dian3;
    var tetra = math.tetra;

    var Particle = function() { 
        //private
        this.position = [ 0, 0, 0 ];
        this.rotation = 0;
        //this.universe
        this.entid = 0;
        this.rotationMatrix = mat4.identity( mat4.create() );
        this.initialBox = [];
        this.rotZ = 0;
        this.rotX = 0;
        this.radius = 0;
        this.obj = new gfx.AbstractObject();
        this.offset = new gfx.AbstractObject();
        this.orientation = new tetra.create( 0,0,-1,0 );
        this._orientation = new tetra.create( 0, 0, -1, 0 );
        
        //public
        this.velocity = [ 0, 0, 0 ];
        this.acceleration = [ 0, 0, 0 ];
        this.force = [ 0, 0, 0 ];
        this.angularVelocity = 0;
        this.angularAcceleration = 0;
        this._angularVelocity = [ 0, 0, 0 ];
        this._angularAcceleration = [ 0, 0, 0 ]; 
        this.minv = 1;//the mass inverted
        this.hull = [ 0, 0, 0, 0 ];
        this.box = [ [0,0,0] , [0,0,0], [0,0,0], [0,0,0] ];
        this.passable = 0;
        this.collisionBehaviour = collision.FREEZE;
        this.hold = false;
    };

    inherits( Particle, Universe );

    Particle.prototype.setMass = function( m ) {
        if ( m === 0 ) {
            return false;
        }
        else {
            this.minv = 1/m;
        }
    };
    Particle.prototype.integrate = function( duration ) {
        if ( this.hold ) {
            return;
        }
        if ( duration < 0 ) {
            duration = 0;
        }
        this.acceleration = dian3.scale( this.force, this.minv );
        this.velocity = dian3.add( dian3.scale( this.velocity, 0.999 ), //traction
                    dian3.scale( this.force, this.minv*duration ) 
        );// u' = u + F/m*t
        
        var oldpos = dian3.add( this.position, [ 0, 0, 0 ] );//old
        this.position = dian3.add( this.position, 
                    dian3.add( 
                        dian3.scale( this.velocity, duration ), dian3.scale( this.acceleration,0.5*duration*duration ) 
                    ) 
        );// pos' = pos + v*t + 1/2*F/m*t^2   
        //this.obj.moveTo( this.position[0], this.position[1], this.position[2] );
            
        //rotational changes
        this.angularVelocity = this.angularAcceleration*duration + this.angularVelocity;
        var oldrot = this.rotation + 0;
        this.rotation = 0.5*this.angularAcceleration*duration*duration + this.angularVelocity*duration + this.rotation;
        this.rotate( this.rotation - oldrot );    
        
        this._angularVelocity = 
            dian3.add( this._angularVelocity, dian3.scale( this._angularAcceleration, duration ) 
        );
        var w = [ 0, this._angularVelocity[0], this._angularVelocity[1], this._angularVelocity[2] ];
        this._orientation = 
            tetra.add( this._orientation, 
                tetra.cross( tetra.scale( w, 0.5*duration ), this._orientation )   
        );
        this._orientation = tetra.normalize( this._orientation );
        
        if ( Math.abs( this.rotation - oldrot ) > constants.ROT_ERROR ) {
            this.emit( 'rotate', this.rotX, this.rotation, this.rotZ );
        }
    };
    Particle.prototype.clearForce = function() {
        this.force = [0,0,0];
    };
    Particle.prototype.moveTo = 
    Particle.prototype.setPosition = function( x, y, z ) {
        if ( typeof x === 'undefined' || typeof y === 'undefined' || typeof z ===  'undefined' ) {
            return false;
        }
        var oldpos = [ this.position[0], this.position[1], this.position[2] ];
        this.position = [ x, y, z ];
        var newpos = this.position;
        //this.obj.moveTo( x, y, z );//<-- absobj
        this.emit( 'move', newpos[0], newpos[1], newpos[2], oldpos[0], oldpos[1], oldpos[2] );
        //this.handleCollisions( oldpos, this.rotation + 0 );

        return [ x, y ,z ]; //should return the final position --chorvus
    };
    Particle.prototype.getPosition = function() {
        return [ this.position[0], this.position[1], this.position[2] ];
    };
    Particle.prototype.rotateTo =
    Particle.prototype.setRotation = function( rads ) {
        var oldrot = this.rotation + 0;
        this.rotation = rads;
        
        this.rotate( this.rotation - oldrot );
        this.obj.rotateTo( 0, this.rotation, 0 );//<-- absobj
        
        this.orientation = tetra.create( 0, 1, 0, rads );
        this._orientation = tetra.create( 0, 1, 0, rads );
        
        if ( Math.abs( this.rotation - oldrot ) > constants.ROT_ERROR ) {
            this.emit( 'rotate', this.rotX, this.rotation, this.rotZ );
        }
        this.handleCollisions( this.position , oldrot );
    };
    Particle.prototype.getRotation = function() {
        return this.rotation;
    };
    Particle.prototype.setHull = function( vertices ) {
        rect = bounds.findBoundingBox( vertices );
        this.box =  [ [ rect[0][0], rect[0][1], rect[0][2] ],
                      [ rect[0][0], rect[0][1], rect[1][2] ],
                      [ rect[0][0], rect[1][1], rect[0][2] ],
                      [ rect[0][0], rect[1][1], rect[1][2] ],
                      [ rect[1][0], rect[0][1], rect[0][2] ],
                      [ rect[1][0], rect[0][1], rect[1][2] ],
                      [ rect[1][0], rect[1][1], rect[0][2] ],
                      [ rect[1][0], rect[1][1], rect[1][2] ]
        ];
        this.initialBox = [ [ rect[0][0], rect[0][1], rect[0][2] ],
                          [ rect[0][0], rect[0][1], rect[1][2] ],
                          [ rect[0][0], rect[1][1], rect[0][2] ],
                          [ rect[0][0], rect[1][1], rect[1][2] ],
                          [ rect[1][0], rect[0][1], rect[0][2] ],
                          [ rect[1][0], rect[0][1], rect[1][2] ],
                          [ rect[1][0], rect[1][1], rect[0][2] ],
                          [ rect[1][0], rect[1][1], rect[1][2] ]
        ];                  
        this.hull = [ rect[ 0 ][ 0 ], rect[ 0 ][ 1 ], rect[ 1 ][ 0 ], rect[ 1 ][ 1 ] ];
        this.radius = bounds.findBoundingSphere( vertices );
    };
    Particle.prototype.rotateX = function ( rads ) {
        var oldrot = this.rotX + 0;
        this.rotX += rads;

        var f = mat4.create();
        mat4.identity( f );
        mat4.rotateX( f, rads );
        mat4.rotateX( this.rotationMatrix, rads );

        this.obj.rotateX( rads );

        this.orientation = tetra.rotateX( this.orientation, rads );
        
        this._orientation = tetra.rotateX( this._orientation, rads );
        
        if ( Math.abs( this.rotX - oldrot ) > constants.ROT_ERROR ) {
            this.emit( 'rotate', this.rotX, this.rotation, this.rotZ );
        }
        this.handleCollisions( this.position , oldrot );
    };
    Particle.prototype.rotate = function( rads ) {
        var f = mat4.create();
        mat4.identity( f );
        mat4.rotateY( this.rotationMatrix, rads );  

        this.obj.rotateY( rads );
        
        this.orientation = tetra.rotateY( this.orientation, rads );
        
        
        for ( var i = 0; i < this.box.length; i++ ) {
            //mat4.multiplyVec3( f, this.box[i], this.box[i] );
            //mat4.multiplyVec3( this.rotationMatrix, this.initialBox[i], this.box[i] );
        }   
    };
    Particle.prototype.rotateY = function ( rads ) {   
        var oldrot = this.rotation + 0;
        this.rotation += rads;
        this.rotate( rads );
        
        this._orientation = tetra.rotateY( this._orientation, rads );
        
        if ( Math.abs( this.rotation - oldrot ) > constants.ROT_ERROR ) {
            this.emit( 'rotate', this.rotX, this.rotation, this.rotZ );
        }
        this.handleCollisions( this.position , oldrot );
    };
    Particle.prototype.rotateZ = function ( rads ) {
        var oldrot = this.rotZ + 0;
        this.rotZ += rads;

        var f = mat4.create();
        mat4.identity( f );
        mat4.rotateZ( this.rotationMatrix, rads );    
        
        this.obj.rotateZ( rads );
        
        this.orientation = tetra.rotateZ( this.orientation, rads );
        
        this._orientation = tetra.rotateZ( this._orientation, rads );
        
        if ( Math.abs( this.rotZ - oldrot ) > constants.ROT_ERROR ) {
            this.emit( 'rotate', this.rotX, tetra.angle( this._orientation ), this.rotZ );
        }
        this.handleCollisions( this.position , oldrot );
    };
    Particle.prototype.offsetRotateTo = function ( pitch, yaw, roll ) {
        this.offset.rotateTo( pitch, yaw, roll );
    };
    Particle.prototype.clearForces = function () {
        if ( typeof this.universe === 'undefined' ) {
            return false;
        }

        var uni = this.universe;
        for( var i=0,l=uni.forces.length;i<l;i++ ) {
            if ( uni.forces[i].particle.id == this.id ) {
                uni.forces[i] = uni.forces[ uni.forces.length - 1 ];
                uni.forces.pop();
            }
        }
    };
    Particle.prototype.updateHull = function() {
        for ( var i = 0; i < this.box.length; i++ ) {
            mat4.multiplyVec3( this.offset.cachedMatrix, this.initialBox[i], this.box[i] );
            //mat4.multiplyVec3( this.obj.cachedMatrix, this.box[i], this.box[i] );
            mat4.multiplyVec3( tetra.rotMatrix( this._orientation ), this.box[i], this.box[i] );
        } 
    };
    Particle.prototype.findCollisions = function () {
        return collision.findCollisions( this.universe, this, this.position );
    };
    Particle.prototype.handleCollisions = function( oldposition, oldrotation ) {
        if ( typeof this.universe === "undefined" ) {
            return;
        }
        
        var collisions = this.findCollisions();
        if ( collisions.length > 0 ) {
            this.emit( 'collision', collisions[ 0 ] );
            if ( typeof this.universe.onCollision === "function" ) { //emit collision event
                this.universe.onCollision( this, collisions[ 0 ] );
            }
            if ( this.collisionBehaviour === collision.FREEZE ) {
                this.position = oldposition;
                this.velocity = [ 0, 0, 0 ];
            }
            if ( this.collisionBehaviour === collision.FREEZEROT ) {
                this.position = oldposition;
                this.velocity = [ 0, 0, 0 ];
                this.rotate( oldrotation - this.rotation );
                this.rotation = oldrotation;
            }
        }
    };
    Particle.prototype.remove = function() {
        this.universe.removeParticle( this );
    };
    Particle.prototype.scale = function( scalar ) {
        this.obj.scale( scalar ); 
    };
    
    return Particle;
} );
