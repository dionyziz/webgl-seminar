define( function( require, exports, module ) {
    var EventEmitter = require( 'libs/events' ).EventEmitter;
    var Mesh = require( 'models/mesh' );
    var Transformable = require( 'models/transformable' );
    var physics = require( 'physics' );
    var dian3 = require( 'libs/math' ).dian3;
    var tetra = require( 'libs/math' ).tetra;

    var Entity = function() {
        EventEmitter.call( this );
        //private
        var minv = 1;
		var absolutePosition = [ 0, 0, 0 ];
		var absoluteOrientation = [ 1, 0, 0, 0 ];
		var validAbsolute = false;

        //public
        this.mesh = new Mesh();
        this.id = 0;
        this.universe = -1;//the Universe it belongsTo
        
        this.velocity = [ 0, 0, 0 ];
        this.acceleration = [ 0, 0, 0 ];
        this.angularVelocity = [ 0, 0, 0 ];
        this.angularAcceleration = [ 0, 0, 0 ];
        this.force = [ 0, 0, 0 ];
        
        this.passable = 0;
        this.collisionBehaviour = physics.collision.FREEZE;
        this.hold = false;
        
        //functions
        //private		
        this.integrate = function( duration ) { //generates new state , doesnt change the current
            this.acceleration = dian3.add( this.acceleration, dian3.scale( this.force, minv ) );
            this.velocity = dian3.add( dian3.scale( this.velocity, 1 ), //traction
                        dian3.scale( this.acceleration, duration ) 
            );// u' = u + F/m*t
            
            var newPosition = dian3.add( this.getPosition(), 
                        dian3.add( 
                            dian3.scale( this.velocity, duration ), dian3.scale( this.acceleration,0.5*duration*duration ) 
                        )
            );// pos' = pos + v*t + 1/2*F/m*t^2 
            
            
            //TODO add torque
            this.angularVelocity = 
                dian3.add( this.angularVelocity, dian3.scale( this.angularAcceleration, duration ) 
            );
            var w = [ 0, this.angularVelocity[ 0 ], this.angularVelocity[ 1 ], this.angularVelocity[ 2 ] ];
            var newOrientation = tetra.normalize( 
                                    tetra.add( this.getOrientation(), 
                                        tetra.cross( tetra.scale( w, 0.5*duration ), this.getOrientation() )   
                                    )
            );// or' = or + w*0.5.duration*or
            return [ newPosition, newOrientation ];
        };
        
        //public
        this.getBoundingBox = function() {
            var box = this.mesh.getBoundingBox();//without entity position and orientation
            //apply position change and orientation change
            var rotbox = [];
            var mat = this.getMatrix();
            for ( var i = 0; i < box.length; i++ ) {
                rotbox[ i ] = [];
                mat4.multiplyVec3( mat, box[ i ], rotbox[ i ] );
            }
            return rotbox;        
        };
        this.getAbsoluteBoundingBox = function( node ) {
            //calculate matrix
            var pos = this.getAbsolutePosition( node );
            var orient = this.getAbsoluteOrientation( node );
            var mat = tetra.rotMatrix( orient );
            mat[ 12 ] = pos[ 0 ];
            mat[ 13 ] = pos[ 1 ];
            mat[ 14 ] = pos[ 2 ];
            //
            
            //transform the points of the box
            var box = this.mesh.getBoundingBox();
            var rotbox = [];
            for ( var i = 0; i < box.length; i++ ) {
                rotbox[ i ] = [];
                mat4.multiplyVec3( mat, box[ i ], rotbox[ i ] );
            }
            return rotbox;
            //  
        };
        this.getBoundingSphere = function() {
            sphere = this.mesh.getBoundingSphere();
            var newsphere = [];
            newsphere[ 0 ] = dian3.add( sphere[ 0 ], this.getPosition() );
            newsphere[ 1 ] = sphere[ 1 ]*this.scaleFactor;
            return newsphere;
        };
        this.getAbsoluteBoundingSphere = function( sceneNode ) {
            var pos = this.getAbsolutePosition( sceneNode );
            sphere = this.mesh.getBoundingSphere();
            var newsphere = [];
            newsphere[ 0 ] = dian3.add( sphere[ 0 ], pos );
            newsphere[ 1 ] = sphere[ 1 ]*this.scaleFactor;
            return newsphere;            
        };
        this.getAbsolutePosition = function ( sceneNode ) {//the scene node this entity belongs to
            var AbsPos, AbsOrient;
            if ( sceneNode.parentNode.entity === null ) {
                return this.getPosition();
            }
            AbsPos = this.calcAbsoluteState( 
                sceneNode.parentNode.entity.getAbsolutePosition( sceneNode.parentNode ),
                sceneNode.parentNode.entity.getAbsoluteOrientation( sceneNode.parentNode ), 
                this.getPosition(), this.getOrientation()    
            )[ 0 ];
            return AbsPos;
        };
        this.getAbsoluteOrientation = function ( sceneNode ) {
            var AbsPos, AbsOrient;
            if ( sceneNode.parentNode.entity === null ) {
                return this.getOrientation();
            }
            AbsOrient = this.calcAbsoluteState( 
                sceneNode.parentNode.entity.getAbsolutePosition( sceneNode.parentNode ),
                sceneNode.parentNode.entity.getAbsoluteOrientation( sceneNode.parentNode ), 
                this.getPosition(), this.getOrientation()    
            )[ 1 ];
            return AbsOrient;
        };
        this.isColliding = function( newAbsPosition, newAbsOrientation, sceneNode ) { 
            //check if this object collides with some other entity
            //new absolute position and orientation given
            var res = physics.collision.findCollisionsEntity( this.universe, sceneNode, newAbsPosition, newAbsOrientation );
            return res;
        };
        this.getMass = function() {
            return 1/minv;        
        };
        this.setMass = function( m ) {
            if ( m === 0 ) {
                return false;
            }
            else {
                minv = 1/m;
            }
        };
        this.clearForce = function() {
            this.force = [ 0, 0, 0 ];
        };
        this.remove = function() {
            //TODO//universe.removeParticle( this );
        };
        
        
    }.extend( Transformable );

    Entity.prototype = new EventEmitter();

    return Entity;
} );
