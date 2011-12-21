define( [ 'libs/math', 'models/scene', './rectangle' ], function( math, scene, rectangle ) {
    var dian3 = math.dian3;

    function sphereInterfere( r1, r2, p1, p2 ) { //radius and position
        return ( dian3.metro2( dian3.subtract( p1, p2 ) ) <= Math.pow( r1 + r2, 2 ) ); 
    };

    function recurseSceneGraph( targetNode, absPosition, absOrientation, sceneNode, dontCheck ) {
        var n = sceneNode;
        var collisions = [],sphere,sphere2;
        var newAbsPosition, newAbsOrientation;
        
        //get absolute positions, maybe not needed
        newAbsPosition = sceneNode.entity.getAbsolutePosition( sceneNode );
        newAbsOrientation = sceneNode.entity.getAbsoluteOrientation( sceneNode ); 		
        
        //same id
        if ( sceneNode.entity.id === targetNode.entity.id ) { 
            return []; 
        }			

        var sphere = targetNode.entity.mesh.getBoundingSphere();
        var sphere2 = sceneNode.entity.getAbsoluteBoundingSphere( sceneNode );
        
        var box = targetNode.entity.mesh.getBoundingBox();
        var box2 = sceneNode.entity.getAbsoluteBoundingBox( sceneNode );
        
        //find the bounding box in absolute coordinates
        var box1 = [];
        var pos = absPosition;//targetNode.entity.getAbsolutePosition( targetNode );
        var orient = absOrientation;//targetNode.entity.getAbsoluteOrientation( targetNode );
        for ( var i = 0; i < box.length; i++ ) {
            box1[ i ] = targetNode.entity.calcAbsoluteState( pos, orient, box[ i ], [ 1, 0, 0, 0 ] )[ 0 ];
        }
        //
        
        //console.log( sphere, sphere2 );
        if ( ( typeof dontCheck[ sceneNode.entity.id ] === 'undefined' ) && 
                ( sphereInterfere( sphere[ 1 ], sphere2[ 1 ], dian3.add( absPosition, sphere[ 0 ] ), sphere2[ 0 ] ) 
                && rectangle.parallepipedInterfere( box1, box2, [ 0, 0, 0 ], [ 0, 0, 0 ] )
                )
            ) {
                //console.log( "Collides..." );
                collisions.push( sceneNode.entity );
        }  
        else if ( sceneNode.type === "GROUP" && ( typeof dontCheck[ sceneNode.entity.id ] !== 'undefined' ) ) {
            //console.log( "didnt check." );
            for ( var x in sceneNode.children ) {
                var res = recurseSceneGraph( targetNode, absPosition, absOrientation, sceneNode.children[ x ], dontCheck );
                collisions = collisions.concat( res );
                for ( var y in res ) {
                    collisions.push( res[ y ] );
                }
            }
        }
        else {
            //console.log( "didnt check.No children or didnt collide so its children" );
        }
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
            //this nodes should not be checked
            var dontCheck = findPathToRoot( sceneNode );
                    
            var collisions,res;
            collisions = [];
            for ( var x in scene.world.children ) {
                //do collision checking recursivly
                res = recurseSceneGraph( sceneNode, newAbsPosition, newAbsOrientation, scene.world.children[ x ], dontCheck );
                collisions = collisions.concat( res );
            }    	
            return collisions;
        },
        findCollisions: function( uni, particle, newposition ) {
            var collisions = [];
            var np = newposition;
            var p = particle;
            var p2 = uni.particles;
            for ( var i=0,l=uni.particles.length; i<l;i++ ) {
                try {
                    if ( p2[i].id == p.id ) { 
                        continue; 
                    }				
                    if ( sphereInterfere( p.radius, p2[i].radius, np, p2[i].getPosition() ) &&
                         rectangle.parallepipedInterfere( p.box, p2[i].box, np, p2[i].getPosition() ) ) {
                        collisions.push( p2[i] );
                    }
                }
                catch ( e ) {
                    continue;
                }          
            }
            return collisions;
        }
    };
} );
