define( [ 'libs/math', 'models/scene', './rectangle' ], function( math, scene, rectangle ) {
    var dian3 = math.dian3;
    var tetra = math.tetra;

    function sphereInterfere( r1, r2, p1, p2 ) { //radius and position
        return ( dian3.metro2( dian3.subtract( p1, p2 ) ) <= Math.pow( r1 + r2, 2 ) ); 
    };

    function recurseSceneGraph( targetNode, absPosition, absOrientation, sceneNode, dontCheck ) {
        var n = sceneNode;
        var collisions = [],sphere,sphere2;
        var newAbsPosition, newAbsOrientation;
        
        //absolute position of obj that is compared to target
        newAbsPosition = sceneNode.entity.getAbsolutePosition( sceneNode );
        newAbsOrientation = sceneNode.entity.getAbsoluteOrientation( sceneNode ); 		
        //***********
        
        if ( sceneNode.entity.id === targetNode.entity.id ) { 
            return []; 
        }	
		
		if ( 0 && sceneNode.entity.collisionBehaviour == "human"  && targetNode.entity.collisionBehaviour == "human" ) { 
			return [];
		}

        //get bounding spheres
        var sphere = targetNode.entity.mesh.getBoundingSphere();
        var sphere2 = sceneNode.entity.getAbsoluteBoundingSphere( sceneNode );
        //correct the spheres radius 
        sphere[ 1 ] *= targetNode.entity.scaleFactor;
        //********
        
        
        //get bounding boxes
        var box = targetNode.entity.mesh.getBoundingBox();
        var box2 = sceneNode.entity.getAbsoluteBoundingBox( sceneNode );
        
        //find the bounding box in absolute coordinates
        var pos = absPosition;//TODO why ? , add scale factor , todo
        var orient = absOrientation;
        var mat = tetra.rotMatrix( absOrientation );
        mat[ 12 ] = pos[ 0 ];
        mat[ 13 ] = pos[ 1 ];
        mat[ 14 ] = pos[ 2 ];
        //mat4.scale( mat, [ this.scaleFactor, this.scaleFactor, this.scaleFactor ] ); //maybe needed, TODO

        var box1 = [];
        for ( var i = 0; i < box.length; i++ ) {
            box1[ i ] = [];
            mat4.multiplyVec3( mat, box[ i ], box1[ i ] );
        }
        //*********
        

        
        //check if collides or not
        if ( typeof dontCheck[ sceneNode.entity.id ] === 'undefined'  //is not in the set of dontCheck nodes
             && ( 
                  sphereInterfere( sphere[ 1 ], sphere2[ 1 ], dian3.add( absPosition, sphere[ 0 ] ), sphere2[ 0 ] ) 
                  && rectangle.parallepipedInterfere( box1, box2, [ 0, 0, 0 ], [ 0, 0, 0 ] )
                )//and collides
            ) {
				var res = rectangle.parallepipedInterfereArea( box1, box2, [ 0, 0, 0 ], [ 0, 0, 0 ] );
				if ( res === false ) {
					res = [ [ box1[ 0 ], box1[ 1 ], box1[ 2 ] ] ,
							[ box2[ 0 ], box2[ 1 ], box2[ 2 ] ]
					];
						
					if ( targetNode.entity.collisionBehaviour == "human" ) {
						console.log( "TRIANGE FAULT", box1, box2 );
						console.log( box1.join("\n") );
						console.log( box2.join("\n") );
					}
					
				}
                collisions.push( [ sceneNode.entity, res ] );//add to collisions
        }  
        else if ( sceneNode.type === "GROUP" && typeof dontCheck[ sceneNode.entity.id ] !== 'undefined' ) {
            //is of type group and is not on the dont check list
            for ( var x in sceneNode.children ) {
                var res = recurseSceneGraph( targetNode, absPosition, absOrientation, sceneNode.children[ x ], dontCheck );
                collisions = collisions.concat( res );
                for ( var y in res ) {
                    collisions.push( res[ y ] );
                }
            }
        }
        else {
            //didnt check.No children or didnt collide so its children dont
        }
        //************
        
        return collisions;    
    };
    
    function findPathToRoot( sceneNode ) {
        var nodes = {};
        var next, prev;
        next = sceneNode.parentNode;
        while ( ( next.parentNode !== null ) ) { 
            nodes[ next.entity.id ] = true;
            delete( prev );
            prev = next;
            delete( next );
            next = prev.parentNode;
        }
        //returns a node list
        return nodes;
    }

    return {
        findCollisionsEntity: function( uni, sceneNode, newAbsPosition, newAbsOrientation ) {    
            var dontCheck = findPathToRoot( sceneNode );//this nodes should not be checked                 
            //calculate collisions   
            var collisions,res;
            collisions = [];
            for ( var x in scene.world.children ) {
                //do collision checking recursivly
                res = recurseSceneGraph( sceneNode, newAbsPosition, newAbsOrientation, scene.world.children[ x ], dontCheck );
                collisions = collisions.concat( res );
            }    	
            //********
            return collisions;
        }
    };
} );
