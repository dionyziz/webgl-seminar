define( [ 'libs/events', 'libs/math', './constants' ], function( events, math, constants ) {
    var dian3 = math.dian3;

    var Universe = function() {
        //private
        this.forces = [];
        this.clock = 0;
        this.pId = 0;
        this.fId = 0;
        var eId = 0;
        
        //public
        this.particles = [];
        this.entities = [];
        
        //methods
        //private        
        var traverse = function ( duration, sceneNode, absPosition, absOrientation ) {
                var entity = sceneNode.entity;
                var res = entity.integrate( duration );
                var newPosition = res[ 0 ];
                var newOrientation = res[ 1 ];
                
                if ( entity.collisionBehaviour === 'static' ) {
                    return;
                }
                
                var absState = entity.calcAbsoluteState( absPosition, absOrientation, newPosition, newOrientation );
                var newAbsPosition = absState[ 0 ];
                var newAbsOrientation = absState[ 1 ];   
                
                if ( dian3.metro2( dian3.subtract( newPosition, entity.getPosition() ) ) > 0.001 ) {
                    //console.log( newAbsPosition, newAbsOrientation );
                }             
                
                var targets = entity.isColliding( newAbsPosition, newAbsOrientation, sceneNode );
                if ( targets.length < 1  ) {
                    //console.log( "doesn't collide" );
                    if ( dian3.metro2( dian3.subtract( newPosition, entity.getPosition() ) ) > 0.001 ) {
                        //console.log( "no collision" );
                    }
                    
                    var oldPosition = entity.getPosition();
                    entity.moveTo( newPosition[ 0 ], newPosition[ 1 ], newPosition[ 2 ] );
                    entity.rotateToByQuart( newOrientation );
                    
                    if ( sceneNode.type === "GROUP" ) {
                        for ( x in sceneNode.children ) {
                            traverse( duration, sceneNode.children[ x ], newAbsPosition, newAbsOrientation  );
                        }
                    }                    
                    if ( dian3.metro2( dian3.subtract( newPosition, oldPosition ) ) > constants.MOVE_ERROR ) {
                        //console.log( newAbsPosition );
                        //this.emit( 'changed', 1 );
                    }	
                }
                else {//manage collision 
                    //console.log( "collides..." ); 
                    //console.log( "tried ... ", newAbsPosition, " instead ", entity.getAbsolutePosition( sceneNode ) );
                    
                    if ( dian3.metro2( dian3.subtract( newPosition, entity.getPosition() ) ) > 0.00001 ) {
                        //console.log( "collision" );
                    }
                    
                    entity.velocity = entity.angularVelocity = entity.acceleration = entity.angularAcceleration = [ 0, 0, 0 ];
                    for ( var i = 0; i < targets.length; i++ ) {
                        targets[ i ].velocity = targets.angularVelocity = targets.acceleration = targets.angularAcceleration = [ 0, 0, 0 ];
                    }
                                                          
                    if ( sceneNode.type === "GROUP" ) {
                        newAbsPosition = entity.getAbsolutePosition( sceneNode );
                        newAbsOrientation = entity.getAbsoluteOrientation( sceneNode );
                        for ( x in sceneNode.children ) {
                            traverse( duration, sceneNode.children[ x ], newAbsPosition, newAbsOrientation );
                        }
                    }
                }			
        };	
        //public
        this.addEntity = function( entity ) {
            entity.id = eId++;
            entity.universe = this;
            this.entities.push( entity );
        };
        this.removeEntity = function( entity ) {
            for ( var x in entities ) {
                if ( entities[ x ].id === entity.id ) {
                    entities.splice( x, 1 );
                }
            }
        };
        this._updateState = function( duration, sceneGraph ) {
            this.clock += duration;
            for (  var x in sceneGraph.children ) {
                traverse( duration, sceneGraph.children[ x ], [ 0, 0, 0 ], [ 1, 0, 0, 0 ] );//change the positions	
            }
        };
    }.extend( events.EventEmitter );
    //old
    Universe.prototype.addForce = function( forceCallback, duration, particle ) {//todo
        this.forces[ this.forces.length ] = {
            id : this.fId,
            applyForce : forceCallback,
            initiated : this.clock + 0,
            duration : duration,
            particle : particle
        };
        this.fId++;
        return (this.fId-1);
    };
    Universe.prototype.updateState = function( duration ) {
        this.clock += duration;
        var f,toDelete;
        toDelete = [];
        var i,l;
        for ( i=0,l = this.forces.length; i<l; i++ ) {//apply forces
            f = this.forces[ i ];
            if ( ( this.clock - f.initiated ) <= f.duration ) {
                f.applyForce();
            }    
            else {
                toDelete.push( i );
            }
        }
        for ( i=0,l = toDelete.length; i<l; i++ ) {
            this.forces[ toDelete[i] ] = this.forces[ this.forces.length-1 ];
            this.forces.pop();   
        }
        
        for ( i=0,l = this.particles.length; i<l; i++ ) {
            this.particles[i].updateHull();
        }
        
        var oldpos;
        var p = this.particles;
        for ( i=0,l = this.particles.length; i<l; i++ ) {
            try {
                oldpos = dian3.add( p[i].getPosition(), [ 0, 0, 0 ] );
                oldrot = p[i].rotation + 0;
                p[i].integrate( duration );

                var c = 0.09,c2 = 0.01;// on move event generator
                if ( ( Math.abs( p[i].velocity[0] ) > c && Math.abs( oldpos[0] - p[i].position[0] ) > c2 ) ||  
                     ( Math.abs( p[i].velocity[1] ) > c && Math.abs( oldpos[1] - p[i].position[1] ) > c2 ) || 
                     ( Math.abs( p[i].velocity[2] ) > c && Math.abs( oldpos[2] - p[i].position[2] ) > c2 ) ) {
                        //p[i].emit( 'move', p[i].position[0], p[i].position[1], p[i].position[2], oldpos[0], oldpos[1], oldpos[2] );
                }        
                p[i].force = [ 0, 0, 0 ];      
                p[i].handleCollisions( oldpos, oldrot );
                p[i].emit( 'move', p[i].position[0], p[i].position[1], p[i].position[2], oldpos[0], oldpos[1], oldpos[2] );

            }
            catch( e ) {
                return;
            }
        }
    };
    Universe.prototype.clearForce = function( fid ) {
        for( var i=0;i<this.forces.length;i++ ) {
            if ( this.forces[i].id == fid ) {
                this.forces[i] = this.forces[ this.forces.length - 1 ];
                this.forces.pop();
                break;
            }
        }
    };
    Universe.prototype.setCollisionCallback = function( callback ) {
        this.onCollision = callback;//callback( p1,p2 )
    };

    return Universe;
} );
