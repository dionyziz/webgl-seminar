define( [ 'libs/extender', 'libs/events', 'libs/math', './constants' ], function( inherits, events, math, constants ) {
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
        var traverse = function ( duration, sceneNode, absPosition, absOrientation, passes ) {
                var entity = sceneNode.entity;

                if ( entity.collisionBehaviour === 'static' ) {
                    return;
                }

                var res = entity.integrate( duration );
                var newPosition = res[ 0 ];
                var newOrientation = res[ 1 ];
                
                var absState = entity.calcAbsoluteState( absPosition, absOrientation, newPosition, newOrientation );
                var newAbsPosition = absState[ 0 ];
                var newAbsOrientation = absState[ 1 ];   
				var oldAbsPosition = entity.calcAbsoluteState( absPosition, absOrientation, 
										entity.getPosition(), entity.getOrientation() )[ 0 ];
                
                //calc move change and orientation change
                var rotChange = 0, moveChange = 0;
                moveChange = dian3.metro2( dian3.subtract( newPosition, entity.getPosition() ) )
                for ( var i = 0; i < 4; i++ ) {
                    rotChange += Math.pow( newOrientation[ i ] - entity.getOrientation()[ i ], 2 );
                } 
				
				//get collision resutls and seperate data
                var collisionResults = entity.isColliding( newAbsPosition, newAbsOrientation, sceneNode );
                var targets = [];
                var tries = [];
				if ( collisionResults.length > 0 ) {
					for ( var i in collisionResults ) {
						targets.push( collisionResults[ i ][ 0 ] );
						tries.push( collisionResults[ i ][ 1 ] );
					}
				}	
                
				//****user sliding, only for humans, TODO move down
				var passLimit = 10;
                if (  entity.collisionBehaviour == "human" && targets.length >= 1 && passes <= passLimit 
					  && dian3.metro2( entity.velocity ) > 0.001 ) {	
					//console.log( "sliding.... " );
					//wall parallel vector
					var wallPar = [], vec;
					wallPar[ 0 ] = dian3.subtract( tries[ 0 ][ 1 ][ 0 ], tries[ 0 ][ 1 ][ 1 ] );
					wallPar[ 1 ] = dian3.subtract( tries[ 0 ][ 1 ][ 0 ], tries[ 0 ][ 1 ][ 2 ] );
					wallPar[ 0 ][ 1 ] = 0;
					if ( dian3.metro( wallPar[ 0 ] ) > 0.006 ) {//todo better
						vec = wallPar[ 0 ];
					}
					else {
						wallPar[ 1 ][ 1 ] = 0;
						vec = wallPar[ 1 ];
					}
					//
					
					var orientNorm = dian3.add( entity.velocity, [ 0, -entity.velocity[ 1 ], 0 ] );
					var angDiff = Math.acos( dian3.dot( vec, orientNorm )/( dian3.metro( orientNorm )*dian3.metro( vec ) ) );
					angDiff = angDiff*180/Math.PI;
					if ( angDiff < 70 || angDiff > 110  ) {
						if ( angDiff > 110 ) {
							vec = dian3.scale( vec, -1 );
						}															
						newSpeed = dian3.scale( dian3.normal( vec ), dian3.metro( entity.velocity )/2 );
						newSpeed[ 1 ] = entity.velocity[ 1 ] + 0;  
						entity.velocity = newSpeed;			
						return traverse( duration, sceneNode, absPosition, absOrientation, passes + 1 );
					}
                }
				//**********
                
                if ( !targets.length ) {
                    var oldPosition = entity.getPosition();
                    entity.moveTo.apply( entity, newPosition );
                    entity.rotateToByQuart( newOrientation );
                    
                    if ( dian3.metro2( dian3.subtract( newPosition, oldPosition ) ) > 0.001 ||
                         rotChange > 0.0001 ) {
                        entity.emit( 'move', newPosition, newOrientation );
                    }
                    
                    if ( sceneNode.type === "GROUP" ) {
                        for ( x in sceneNode.children ) {
                            traverse( duration, sceneNode.children[ x ], newAbsPosition, newAbsOrientation, 0  );
                        }
                    }                    
                }
                else {//manage collision 
                    entity.velocity = entity.angularVelocity = entity.acceleration = entity.angularAcceleration = [ 0, 0, 0 ];
					
                    if ( entity.collisionBehaviour == "human" && rotChange > 0.0001 ) {		
                        var pos0 = oldAbsPosition;
                        var pos1 = targets[ 0 ].getAbsolutePosition( targets[ 0 ].sceneNode );
                        var pos2 = dian3.scale( dian3.normal( dian3.subtract( pos1, pos0 ) ), -1 );
                        pos2[ 1 ] = 0;
                        //console.log( pos0, pos1, pos2 );
                        
                        entity.move( pos2[ 0 ], pos2[ 1 ], pos2[ 2 ], true );
                        entity.rotateToByQuart( newOrientation );
					    entity.emit( 'move', entity.getPosition() , newOrientation );
					}
					//end human collision*******
							
					for ( var i = 0; i < targets.length; i++ ) {
						targets[ i ].velocity = targets.angularVelocity = targets.acceleration = targets.angularAcceleration = [ 0, 0, 0 ];
					}
						
                                                          
                    if ( sceneNode.type === "GROUP" ) {
                        newAbsPosition = entity.getAbsolutePosition( sceneNode );
                        newAbsOrientation = entity.getAbsoluteOrientation( sceneNode );
                        for ( x in sceneNode.children ) {
                            traverse( duration, sceneNode.children[ x ], newAbsPosition, newAbsOrientation, 0 );
                        }
                    }
                }			
        };	
        //public
        this.addEntity = function( entity ) {
            entity.entid = eId++;
            entity.universe = this;
            this.entities.push( entity );
        };
        this.removeEntity = function( entity ) {
            for ( var x in entities ) {
                if ( entities[ x ].entid === entity.entid ) {
                    entities.splice( x, 1 );
                }
            }
        };
        this._updateState = function( duration, sceneGraph ) {
            this.clock += duration;
            for (  var x in sceneGraph.children ) {
                traverse( duration, sceneGraph.children[ x ], [ 0, 0, 0 ], [ 1, 0, 0, 0 ], 0 );//change the positions	
            }
        };
    };

    inherits( Universe, events.EventEmitter );

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
