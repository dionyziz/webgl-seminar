define( [ "require", "js/libs/math" ], function( require, exports, module ) {
    //
	var dian3 = require( 'js/libs/math' ).dian3;
	var tetra = require( 'js/libs/math' ).tetra;
	var Mesh = require( 'js/models/mesh' ).Mesh; 
	var Universe = require( 'js/models/physics/universe' ).Universe;
	var Entity = require( 'js/models/entity' );
	var house = require( 'js/libs/procedural/house' ).house;
    //
   
    
    //initiate graphics
	renderer = new Renderer();
	document.body.appendChild( renderer.init( 400, 300 ) );
	
	var material = renderer.createMaterial( 'solid' );
	material.set( 'v4Color', [ 0.2, 0.2, 0.2, 1 ] );
	material.transparent = true;
	
	var material2 = renderer.createMaterial( 'solid' );
	material2.set( 'v4Color', [ 0.3, 1, 0.4, 0.5 ] );
	material2.transparent = true;
	
    camera = renderer.activeCamera;
	camera.move( 0, 10, 50 );
	//-----
	
	
	//load models
	parts = [], partsN = 0;
	var files = [ 'wallmodel/Wall_01.obj' , 'windowmodel/Window_03.obj', 'balconymodel/Balcony_05.obj', 'doormodel/Door_Thick_04.obj', 'wallmodel/Wall_06.obj', 'wallmodel/Wall_06.obj', 'woman/Woman_Low.obj', 'doormodel/Door_Thick_Out_01.obj', 'doormodel/Door_Thick_09.obj', 'doormodel/Door_Thick_10.obj' ];
	var j = 0;
	
	var loadFile = function( filename, id, renderer, autocenter, angle ) { 
	    renderer.utils.OBJ.loadOBJ(  'resources/' + filename, function( objs ){
	            parts[ id ] = [];
	            var j = 0;
                for( var i in objs ) {
                    console.log( "part " , i, id );
                    var f = new Mesh( objs[ i ].vertices, objs[ i ].indices );
                    f.setHullFromMesh();
                    
                    if ( autocenter ) {
                        var pos = f.getBoundingSphere()[ 0 ];
                        f.move( -pos[ 0 ], -pos[ 1 ], -pos[ 2 ] );
                    }                    
                    if ( typeof angle !== 'undefined' ) {
                        f.rotate( angle, [ 0, 1, 0 ] );
                        f.setHullFromMesh();   
                    }
                    
                    parts[ id ][ j ] = renderer.createDrawable( { 
                        mesh: f,
                        normals: objs[ i ].normals,
                        material: objs[ i ].material, 
                        uvcoords: objs[ i ].uvcoords 
                    } );
                    //renderer.add( parts[ id ][ j ] );
                    //parts[ id ][ j ].moveTo( 10 + Math.random()*20, 20 ,0 );
                    console.log( id );
                    console.log( parts[ id ][ j ] );
                    j++;
                }            
        }, renderer );
    }
    loadFile( files[ 0 ], "wall", renderer, true );
    loadFile( files[ 1 ], "window", renderer, true );
    loadFile( files[ 2 ], "balcony", renderer, true );
    loadFile( files[ 3 ], "door", renderer, true );
    loadFile( files[ 4 ], "wall2", renderer, true );
    loadFile( files[ 5 ], "wall3", renderer, true );
    loadFile( files[ 6 ], "woman", renderer, false );
    loadFile( files[ 7 ], "kasa", renderer, true );
    loadFile( files[ 8 ], "door2", renderer, true );
    loadFile( files[ 9 ], "door3", renderer, true );
    //-----
    
    //initiate physics
    var uni = new Universe();
    //
    
    //house.js
    setTimeout( function() {
        var wallId1= house.addPart( 'wall', parts[ 'wall' ][ 0 ] );
        var wallId2 = house.addPart( 'wall', parts[ 'wall2' ][ 0 ] );
        var windowId = house.addPart( 'window', parts[ 'window' ][ 0 ] );
        var balconyId = house.addPart( 'balcony', parts[ 'balcony' ][ 0 ] );
        var doorId = house.addPart( 'door', parts[ 'door' ][ 0 ] );      
        var balconyDoorId1 = house.addPart( 'door', parts[ 'door2' ][ 0 ] );   
        var balconyDoorId2 = house.addPart( 'door', parts[ 'door3' ][ 0 ] );   
        var kasaId = house.addPart( 'kasa' , parts[ 'kasa' ][ 0 ] );  
        
        
        //house.makeHouse( renderer, uni, [ 0, 0, -25 ], 12, 16, 13, wallId1, windowId, balconyId, doorId, kasaId, balconyDoorId1 );
        house.makeHouses( renderer, uni, 3, [ wallId1, wallId2 ], [ windowId ], [ balconyId ] , [ doorId ] , [ kasaId ], [ balconyDoorId1, balconyDoorId2 ] );
    }, 5000 );
    
    //
        

    
    //house funs
    var addModel = function( renderer, model, absPos, rot, d, offset ) {
        var drawable;
        drawable = model.clone();
        renderer.add( drawable );
        drawable.rotateTo( rot[ 1 ], rot[ 0 ] );
        drawable.moveTo( absPos[ 0 ] + offset[ 0 ], absPos[ 1 ] + offset[ 1 ], absPos[ 2 ] + offset[ 2 ] );
        drawable.move( d[ 0 ], d[ 1 ], d[ 2 ] );	
        return drawable;
    };
    var makeHouseMD = function( width, depth, floors, center ) {
	    var wall = [];
	    var window = [];
	    var balcony = [];
	    var st,  door = [];
	    var pos, absPos, rot, brot;
	    var types = [], choices = [], info = [];
	    types[ 0 ] = "none";
	    types[ 1 ] = "balconies";	
	    var box = parts[ 'wall' ][ 0 ].mesh.getBoundingBox();
	    var wallwidth = box[ 7 ][ 0 ] - box[ 0 ][ 0 ];
	    var wallheight = box[ 7 ][ 1 ] - box[ 0 ][ 1 ];
	    var windowbox = parts[ 'window' ][ 0 ].mesh.getBoundingBox();
	    var windowwidth = windowbox[ 7 ][ 0 ] - windowbox[ 0 ][ 0 ];
	    var doorbox = parts[ 'door' ][ 0 ].mesh.getBoundingBox();
	    var doorwidth = doorbox[ 7 ][ 0 ] - doorbox[ 0 ][ 0 ];
	    var doorheight = doorbox[ 7 ][ 1 ] - doorbox[ 0 ][ 1 ];
	    var balconybox = parts[ 'balcony' ][ 0 ].mesh.getBoundingBox();
	    var balconywidth = balconybox[ 7 ][ 0 ] - balconybox[ 0 ][ 0 ];
	    
	    //random variables
	    if ( Math.random() < 0.4 ) {
	        choices.wall = "wall";
        }
        else {
            choices.wall = "wall2";
        }
	    for ( var i = 0; i < 4; i++ ) {
            info[ i ] = {};
            if (  ( Math.random() + i/12 ) < 0.5 ) {
                choices[ i ] = 0;
                //any more random vars needed ?
            }
            else {
                choices[ i ] = 1;                
                info[ i ].number = ( Math.floor( Math.random()*100 )%2 ) + 1;
            }
            info[ i ].windows = ( Math.floor( Math.random()*100 )%2 ) + 1;
        }	
        //    
	    
	    
	    for ( var i = 0; i < floors; i++ ) {
		    st = 8*i;
		    for ( var u = 0; u < 4; u++ ) {
		    
		        //calculate positions
			    if ( u == 0 ) {
				    pos = [ wallwidth/2 - depth/2, i*wallwidth, 0 ];
				    rot = [ [ 0, 1, 0 ], Math.PI/2  ];
			    }
			    else if ( u == 1 ) {
				    pos = [ -wallwidth/2 + depth/2, i*wallwidth, 0 ];
				    rot = [ [ 0, 1, 0 ], -Math.PI/2 ]
			    }
			    else if ( u == 2 ) {
				    pos = [ 0, i*wallwidth, wallwidth/2 - depth/2 ];
				    rot = [ [ 0, 1, 0 ], 0 ];
			    }
			    else if ( u == 3 ) {
				    pos = [ 0, i*wallwidth, -wallwidth/2 + depth/2 ];
				    rot = [ [ 0, 1, 0 ], Math.PI ];
			    }
			    absPos = dian3.add( pos, center );
			    absPos = dian3.add( absPos, [ 0, wallwidth/2, 0 ] );//ground level
			    //
			    
			    //add roof
			    if ( u == 0 && i == 0 ) {
                    addModel( renderer, parts[ 'wall3' ][ 0 ], absPos, 
                                [ [ 1, 0 , 0 ], 3*Math.PI/2 ], 
                                [ 0, 0, 0 ], 
                                [ -wallwidth/2, wallwidth*( floors - 1 ) + wallwidth/2, 0 ] 
                    );  
                }
			    //			    
			    
			    //add wall
			    wall[ st + u ] = addModel( renderer, parts[ choices.wall ][ 0 ], absPos, rot, 
			                        [ 0, 0, 0 ], 
			                        [ 0, 0, 0 ] );			     
                //
						   
			    if ( i < 1 ) {//first floor
		            if ( Math.random() < 1/3 ) {
	                    door[ st + u ] = addModel( renderer, parts[ "door" ][ 0 ], absPos, rot,
                                        [ 0, 0, 0.1 ],
                                        [ 0, 2*doorheight - wallheight - 1.71 , 0 ] );
                    }
                    else { 
                        window[ st + u ] = addModel( renderer, parts[ "window" ][ 0 ], absPos, rot, 
                                        [ 0, 0, 0.1 ], 
                                        [ 0, 0.5, 0 ] );
                    }
                }
                
                if ( i >= 1 ) {
                    if ( info[ u ].windows === 1 ) {
                        window[ st + u ] = addModel( renderer, parts[ "window" ][ 0 ], absPos, rot, 
                                            [ 0, 0, 0.1 ], 
                                            [ 0, 0.5, 0 ] );	                  
                    }
                    else if ( info[ u ].windows === 2 ) {
                        window[ st + u ] = addModel( renderer, parts[ "window" ][ 0 ], absPos, rot, 
                                            [ -windowwidth/1.5, 0, 0.1 ], 
                                            [ 0, 0.5, 0 ] );	
                        window[ st + 4  + u ] = addModel( renderer, parts[ "window" ][ 0 ], absPos, rot, 
                                            [ windowwidth/1.5, 0, 0.1 ], 
                                            [ 0, 0.5, 0 ] );	
                    }
			    }
			    			    
			    if ( types[ choices[ u ] ] === "balconies" ) {
			        if ( i > 0 ) {
			            if ( info[ u ][ "number" ] === 1 ) {		                    
			                balcony[ st + u ] = addModel( renderer, parts[ "balcony" ][ 0 ], absPos, rot, 
			                            [ 0, 0, 0 ], 
			                            [ 0,  -1, 0 ] );
		                }
		                else if ( info[ u ][ "number" ] === 2 ) {
		                    balcony[ st + u ] = addModel( renderer, parts[ "balcony" ][ 0 ], absPos, rot, 
		                                [ 0, 0, 0 ], 
		                                [ 0,  -1, 0 ] );
		                } 
		            }
	            }   
		    }
		    //merge pieces
		    var f = new MergeGroup();
		    for ( var x in wall ) {
    		    f.add( wall[ x ] );
    		    renderer.remove( wall[ x ] );
	        }
	        var walls = f.merge()[ 0 ];
	        walls.show();
	        
	        //add to uni	        
            var ent = new Entity();
            ent.mesh = walls.mesh;a
            ent.mesh.setHullFromMesh();
            ent.moveTo( walls.getPosition()[ 0 ], walls.getPosition()[ 1 ], walls.getPosition()[ 2 ] );
            ent.collisionBehaviour = "static";
            uni.addEntity( ent );
            var child = world.createElement();
            child.entity = ent;
            world.appendChild( child );            
            //
            
	        
	        if ( window.length > 0 ) {
	            f = new MergeGroup();
	            for ( var x in window ) {
            		    f.add( window[ x ] );
            		    renderer.remove( window[ x ] );
	            }
	            var windows = f.merge()[ 0 ];
	            windows.show();
            }
	        
	        if ( balcony.length > 0 ) {
	            f = new MergeGroup();
	            for ( var x in balcony ) {
        		    f.add( balcony[ x ] );
        		    renderer.remove( balcony[ x ] );
                }
                var balconies = f.merge()[ 0 ];
                balconies.show();
            }
		    //
	    }
    };

	makeHousesMD = function( amount, maxfloors ) {
	    var block = 10;
	    
	    //add floor
	    var item = renderer.utils.makeParallelepiped( -( amount + 1 )/2*block, 0, -( amount + 1 )/2*block,
	                                                 ( amount + 1 )/2*block, 0, ( amount + 1 )/2*block );
	    var mesh = new Mesh( item.vertices, item.indices );
	    var patwma = renderer.createDrawable( { mesh : mesh, material : material } );
	    renderer.add( patwma );	   
	    //
	    
		for ( var i = -amount/2; i< amount/2; i++ ) {
			for( var u = -amount/2; u < amount/2; u++ ) {
				makeHouseMD( 10, 0, ( u + i + Math.floor( Math.random()*100 ) )%maxfloors + 1, [ block*i, 0, block*u ] );
			}
		}
	};	
	//setTimeout( function() { makeHouseMD( 5, 0,3, [0, 0, 0 ] ); } , 1000 );    
	//setTimeout( function() { makeHousesMD( 3, 4 ); }, 1000 );//make the town
	
	//add characer model
	addCharacter = function( id, position ) {
        var woman1 = parts[ id ][ 0 ].clone();
        var woman2 = parts[ id ][ 1 ].clone();
	    renderer.add( woman1 );
        renderer.add( woman2 );
        woman1.moveTo( 0, 0, 0 );
        woman2.moveTo( 0, 0, 0 );
        
        //add to uni
        var ent = new Entity();
        ent.mesh = woman1.mesh;
        ent.moveTo( woman1.getPosition()[ 0 ], woman1.getPosition()[ 1 ], woman1.getPosition()[ 2 ] );
        uni.addEntity( ent );        
        var child1 = world.createElement();
        child1.entity = ent;
        
        var ent2 = new Entity();
        ent2.mesh = woman2.mesh;
        ent2.moveTo( woman2.getPosition()[ 0 ], woman2.getPosition()[ 1 ], woman2.getPosition()[ 2 ] );
        uni.addEntity( ent2 );
        var child2 = world.createElement();
        child2.entity = ent2;
        
        var c = 0.08;
        woman1.scale( c );
        woman2.scale( c );
        ent.scale( c );
        ent2.scale( c );
        
        
        //world.appendChild( child1 );
        //world.appendChild( child2 );
        
        var ent3 = new Entity();
        uni.addEntity( ent3 );
        var group = world.createGroupElement();
        group.entity = ent3;

        group.entity.moveTo( 0, 0 ,50 );
        ent.rotate( Math.PI, [ 0, 1, 0 ] );
        ent2.rotate( Math.PI, [ 0, 1, 0 ] );
        
        group.appendChild( child1 );
        group.appendChild( child2 );
        world.appendChild( group );
        ent3.mesh.setHullFromEntities( group );        
        //ent3.velocity = [ 0.1, 0, 0 ];
        //
	    return [ woman1, woman2, child1, child2, group ];
	}
	
    var registerKey = require( 'js/controllers/input' ).registerHandler;
    var registerKeyUp = require( 'js/controllers/input' ).registerKeyupHandler ;
    var keys = require( 'js/controllers/input' ).keys;
	
	
	var woman;
	var camRot = 0;
	setTimeout( function() { 
	    woman = addCharacter( 'woman' );
        var speed = 0.3;
        registerKey( keys[ 'W' ], function() { 
                    woman[ 4 ].entity.velocity = dian3.scale( [ Math.sin( camRot ), 0, Math.cos( camRot ) ], -speed  ); 
                    }, true  );
        registerKey( keys[ 'S' ], function() { 
                    woman[ 4 ].entity.velocity = dian3.scale( [ -Math.sin( camRot ), 0, -Math.cos( camRot ) ], -speed  ); 
                    }, true );
        registerKey( keys[ 'Q' ], function() { 
                    woman[ 4 ].entity.velocity = dian3.scale( [ Math.cos( camRot ), 0, -Math.sin( camRot ) ], -speed  ); 
                    }, true  );
        registerKey( keys[ 'E' ], function() { 
                    woman[ 4 ].entity.velocity = dian3.scale( [ -Math.cos( camRot ), 0, Math.sin( camRot ) ], -speed  ); 
                    }, true );
        registerKey( keys[ 'A' ], function() {  camRot += 0.1;
                                                //woman[ 4 ].entity.rotate( 0.1, [ 0, 1, 0 ] );
                                                woman[ 4 ].entity.angularVelocity = [ 0, 0.1, 0 ]; }
        , true );
        registerKey( keys[ 'D' ], function() {  camRot += -0.1;
                                                //woman[ 4 ].entity.rotate( -0.1, [ 0, 1, 0 ] ) 
                                                woman[ 4 ].entity.angularVelocity = [ 0, -0.1, 0 ]; }
        , true );
                                                
        registerKeyUp( keys[ 'W' ], function() { 
                    woman[ 4 ].entity.velocity = [ 0, 0, 0 ]; 
        } );
        registerKeyUp( keys[ 'S' ], function() { 
                    woman[ 4 ].entity.velocity = [ 0, 0, 0 ]; 
        } );
        registerKeyUp( keys[ 'Q' ], function() { 
                    woman[ 4 ].entity.velocity = [ 0, 0, 0 ]; 
        } );
        registerKeyUp( keys[ 'E' ], function() { 
                    woman[ 4 ].entity.velocity = [ 0, 0, 0 ]; 
        } );
        registerKeyUp( keys[ 'A' ], function() { 
                    woman[ 4 ].entity.angularVelocity = [ 0, 0, 0 ]; 
        } );
        registerKeyUp( keys[ 'D' ], function() { 
                    woman[ 4 ].entity.angularVelocity = [ 0, 0, 0 ]; 
        } );

    }, 5000 );
    //
    
   
    
    console.log( "universe " ,uni );
	var angle = 0;
	var turnRate = 0.005;
	var dist = 3;
	var camdist = 6;
	var frameN = 0;
	setInterval( function() {
	    var pos, pos1, pos2, orient;
	    if ( typeof woman !== 'undefined' ) {
	        //TODO absolute positioning correct
    	    uni._updateState( 0.5 , world );
    	    pos = woman[ 4 ].entity.getPosition();
    	    orient = woman[ 4 ].entity.getOrientation();
    	    
    	    pos1 = woman[ 2 ].entity.getAbsolutePosition( woman[ 2 ] );
    	    rot1 = woman[ 2 ].entity.getAbsoluteOrientation( woman[ 2 ] );
    	    woman[ 0 ].rotateToByQuart( rot1 );
    	    woman[ 0 ].moveTo( pos1[ 0 ], pos1[ 1 ], pos1[ 2 ] );
    	    
    	    pos2 = woman[ 3 ].entity.getAbsolutePosition( woman[ 3 ] );
    	    rot2 = woman[ 3 ].entity.getAbsoluteOrientation( woman[ 3 ] );
    	    woman[ 1 ].moveTo( pos2[ 0 ], pos2[ 1 ], pos2[ 2 ] );
    	    woman[ 1 ].rotateToByQuart( rot2 );

	        camera.moveTo( pos[ 0 ] + camdist*Math.sin( camRot ), 3, pos[ 2 ] + camdist*Math.cos( camRot ) );
	        camera.lookAt( pos[ 0 ], 2, pos[ 2 ] );
    	    
    	    if ( frameN === 5 ) console.log( "uni" ,uni );
    	    
    	    frameN++;
	    }
	    
		//angle += 2*turnRate;
		//camera.rotate( turnRate, [ 0, 1, 0 ] );
		//camera.moveTo( 10,  Math.sin( 2*angle ) , 0 );
		//camera.lookAt( 0, 0, 0 );
		//camera.moveTo( Math.sin( angle )*dist, 0 + Math.sin( angle ), Math.cos( angle )*dist ) 
		
		
		renderer.render();
	}, 17 );
	window.addEventListener( 'resize', function() { renderer.resize( $( window ).width(), $( window ).height() ) }, false ); 
	renderer.resize( window.innerWidth, window.innerHeight );
} );
