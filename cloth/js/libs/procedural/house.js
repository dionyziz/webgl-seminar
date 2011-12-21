define( function( require, exports, module ) {
    var dian3 = require( 'libs/math' ).dian3;
    var Entity = require( 'models/entity' );
    var Mesh = require( 'models/mesh' );
    var MergeGroup = require( 'graphics' ).MergeGroup;
    var utils = require( 'graphics' ).utils;
    var world = require( 'models/scene' ).world;

    var part = {
        'wall' : [],
        'window' : [],
        'balcony' : [],
        'door' : [],
        'kasa' : []
    };
    
    var getRandom = function( from, to ) {
        var n = to - from;
        if ( n === 0 ) return from;
        var res = parseInt( Math.random()/( 1 / (n+1) ) );
        return ( res + from );
    };
    var getSymmetryGroup = function( start, end, n ) {
        pieces = [];
        for ( var i = 0; i < n + 1; i++ ) {// 0, 1, 2, external points too
            pieces.push( start + i*( end-start )/n );
        }
        return pieces;
    };

    var house = {
        addModel :  function( renderer, model, absPos, rot, dist, offset ) {
            var drawable;
            drawable = model.clone();
            renderer.add( drawable );
            drawable.rotateTo( rot[ 1 ], rot[ 0 ] );
            drawable.moveTo( absPos[ 0 ] + offset[ 0 ], absPos[ 1 ] + offset[ 1 ], absPos[ 2 ] + offset[ 2 ] );
            drawable.move( dist[ 0 ], dist[ 1 ], dist[ 2 ] );	
            return drawable;
        },
        addPart : function( id, model ) {
            var n = part[ id ].length;
            part[ id ].push( model );
            return n;
        },
        getModelMeasures : function( model ) {
            var box = model.mesh.getBoundingBox();
            var width = Math.abs( box[ 7 ][ 0 ] - box[ 0 ][ 0 ] );
            var height = Math.abs( box[ 7 ][ 1 ] - box[ 0 ][ 1 ] );
            var depth = Math.abs( box[ 7 ][ 2 ] - box[ 0 ][ 2 ] );
            return { width : width, height : height, depth : depth };
        },
        addWalls : function( renderer, center, wWidth, wHeight, wDepth, wall, universe ) {
            var walls = []; 
            var pos = [], rot = [];
            for ( var i = 0; i < wHeight; i++ ) {
                for ( var u = 0; u < wDepth; u++ ) {
                    pos[ 0 ] = [ wWidth*wall.measures.width, wall.measures.width/2 + i*wall.measures.height,
                                 ( u + 1/2 )*wall.measures.width ];
		            rot[ 0 ] = [ [ 0, 1, 0 ], Math.PI/2  ];
		            
		            pos[ 1 ] = [ 0, wall.measures.width/2 + i*wall.measures.height, 
		                        ( u + 1/2 )*wall.measures.width ];
	                rot[ 1 ] = [ [ 0, 1, 0 ], -Math.PI/2 ];
	                
	                pos[ 0 ] = dian3.add( pos[ 0 ], center );
	                pos[ 1 ] = dian3.add( pos[ 1 ], center );
	                
	                walls.push(
	                    house.addModel( renderer, part[ 'wall' ][ wall.id ], pos[ 0 ], rot[ 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ] )
                    );
                    walls.push(
    	                house.addModel( renderer, part[ 'wall' ][ wall.id ], pos[ 1 ], rot[ 1 ], [ 0, 0, 0 ], [ 0, 0, 0 ] )
	                );
                }                
                for ( var u = 0; u < wWidth; u++ ) {
                    pos[ 2 ] = [ ( u + 1/2 )*wall.measures.width , wall.measures.width/2 + i*wall.measures.height, wDepth*wall.measures.width ];
		            rot[ 2 ] = [ [ 0, 1, 0 ], 0 ];
		            
		            pos[ 3 ] = [ ( u + 1/2 )*wall.measures.width, wall.measures.width/2 + i*wall.measures.height, 0 ];
		            rot[ 3 ] = [ [ 0, 1, 0 ], Math.PI ];
		            
		            pos[ 2 ] = dian3.add( pos[ 2 ], center );
	                pos[ 3 ] = dian3.add( pos[ 3 ], center );
	                
	                walls.push(
	                    house.addModel( renderer, part[ 'wall' ][ wall.id ], pos[ 2 ], rot[ 2 ], [ 0, 0, 0 ], [ 0, 0, 0 ] )
                    );
	                walls.push(
	                    house.addModel( renderer, part[ 'wall' ][ wall.id ], pos[ 3 ], rot[ 3 ], [ 0, 0, 0 ], [ 0, 0, 0 ] )
                    );
                }
            }
            //merge walls
            
            var f = new MergeGroup();
		    for ( var x in walls ) {
    		    f.add( walls[ x ] );
    		    renderer.remove( walls[ x ] );
	        }
	        var mergedWalls = f.merge()[ 0 ];
	        mergedWalls.show();
            //return mergedWalls;//TODO merge walls*/
            
             return mergedWalls;
        },
        decorateUpperFloors : function( renderer, center, wWidth, wHeight, wDepth, wall, window, balcony, door, kasa ) {
            var windows = [], doors = [], balconies = [], kases = [];
            var pos = [], rot = [];
            var startPos, startRot, totalWidth;
            
            var w,b;
            for ( var u = 0; u < 4; u++ ) {
                //start state
                if  ( u == 0 ) {
                    startPos = [ wWidth*wall.measures.width, wall.measures.width/2, 0 ];
                    startRot = [ [ 0, 1, 0 ], Math.PI/2  ];
                    totalWidth =  wDepth*wall.measures.width;
                }
                else if ( u == 1 ) {
                    startPos = [ 0, wall.measures.width/2, 0 ];
	                startRot = [ [ 0, 1, 0 ], -Math.PI/2 ];
                    totalWidth =  wDepth*wall.measures.width;
                }
                else if ( u == 2 ) {
                    startPos = [ 0, wall.measures.width/2, wDepth*wall.measures.width ];
		            startRot = [ [ 0, 1, 0 ], 0 ];
                    totalWidth =  wWidth*wall.measures.width;
                }
                else if ( u == 3 ) {
                    startPos = [ 0, wall.measures.width/2, 0 ];
		            startRot = [ [ 0, 1, 0 ], Math.PI ];
		            totalWidth =  wWidth*wall.measures.width;
                }
                startPos = dian3.add( startPos, center );
                //
                
                //random picks
                w = getRandom( 0, 3 );
                b = getRandom( 0, 2 );           
                
                while ( ( b*balcony.measures.width + ( w + 2 )*window.measures.width ) > totalWidth ) {
                    b--;
                    w--;
                }
                //
                var marks = getSymmetryGroup( 0, totalWidth, b + w + 1 );
                var tempD, tempW, x, offset;
                if ( b > w ) { 
                    offset = 0;
                }
                else { 
                    offset = 1;
                }
                
                
                for ( var i = 1; i < wHeight; i++ ) {
                    //add balconies and doors
                    tempB = b;
                    tempW = w;
                    for ( var k = 0; k < b + w; k++ ) {
                        if ( u < 2 ) {
                            pos[ 0 ] = dian3.add( startPos, [ 0, i*wall.measures.height, marks[ k+1 ] ] );
                            pos[ 1 ] = dian3.add( startPos, [ 0, i*wall.measures.height, marks[ k+1 ] ] );
                        }
                        else {
                            pos[ 0 ] = dian3.add( startPos, [ marks[ k+1 ], i*wall.measures.height, 0 ] );
                            pos[ 1 ] = dian3.add( startPos, [ marks[ k+1 ], i*wall.measures.height, 0 ] );
                        }
                        rot[ 0 ] = startRot;
                        
                        
                        x = ( k + offset ) % 2;
                        if ( ( x == 0 && tempB > 0 ) || ( x == 1 && tempW == 0 ) ) {     
                            balconies.push( 
                                house.addModel( renderer, part[ 'balcony' ][ balcony.id ], pos[ 0 ], rot[ 0 ], 
                                        [ 0, 0, 0 ], [ 0,  -1, 0 ] )
                            );
                            kases.push( 
                                house.addModel( renderer, part[ 'kasa' ][ kasa.id ], pos[ 0 ], rot[ 0 ], [ 0, 0, 0.1 ],
                                        [ 0, 0, 0 ] )
                            );
                            doors.push( 
                                house.addModel( renderer, part[ 'door' ][ door.id ], pos[ 0 ], rot[ 0 ], [ 0, 0, 0.1 ],
                                        [ 0, 0, 0 ] )
                            );
                        }
                        else if ( ( x == 1 && tempW > 0 ) || ( x == 0 && tempB == 0 ) ) {
                             windows.push( 
                                house.addModel( renderer, part[ 'window' ][ window.id ], pos[ 0 ], rot[ 0 ], 
                                    [ 0, 0, 0.1 ],[ 0, 0.7, 0 ] )
                            );
                        
                        }
                    }
                }                
            }
            
            if ( windows.length > 0 ) {
	            f = new MergeGroup();
	            for ( var x in windows ) {
            		    f.add( windows[ x ] );
            		    renderer.remove( windows[ x ] );
	            }
	            var mergedWindows = f.merge()[ 0 ];
	            mergedWindows.show();
            }            
            if ( balconies.length > 0 ) {
	            f = new MergeGroup();
	            for ( var x in balconies ) {
        		    f.add( balconies[ x ] );
        		    renderer.remove( balconies[ x ] );
                }
                var mergedBalconies = f.merge()[ 0 ];
                mergedBalconies.show();
            }
        },
        decorateFirstFloor : function( renderer, center, wWidth, wHeight, wDepth, wall, window, door, kasa ) {
            var windows = [], doors = [], kases = [];
            var pos = [], rot = [];
            
            var doorsN = 0;
            var d,w;
            var totalWidth, startPos, startRot;
            var maxItems;//TODO
            for ( var u = 0; u < 4; u++ ) {
                //start state
                if  ( u == 0 ) {
                    startPos = [ wWidth*wall.measures.width, wall.measures.width/2, 0 ];
                    startRot = [ [ 0, 1, 0 ], Math.PI/2  ];
                    totalWidth =  wDepth*wall.measures.width;
                }
                else if ( u == 1 ) {
                    startPos = [ 0, wall.measures.width/2, 0 ];
	                startRot = [ [ 0, 1, 0 ], -Math.PI/2 ];
                    totalWidth =  wDepth*wall.measures.width;
                }
                else if ( u == 2 ) {
                    startPos = [ 0, wall.measures.width/2, wDepth*wall.measures.width ];
		            startRot = [ [ 0, 1, 0 ], 0 ];
                    totalWidth =  wWidth*wall.measures.width;
                }
                else if ( u == 3 ) {
                    startPos = [ 0, wall.measures.width/2, 0 ];
		            startRot = [ [ 0, 1, 0 ], Math.PI ];
		            totalWidth =  wWidth*wall.measures.width;
                }
                //
                
                //random picks
                d = Math.max( getRandom( 0, 1 ), 3 - doorsN - 1*( 3 - u ) );
                w = getRandom( 0, 2 );                
                if ( doorsN + d > 3 ) {
                    d = 3 - doorsN;
                }                
                doorsN += d;
                
                while ( ( d*door.measures.width + ( w + 2 )*window.measures.width ) > totalWidth ) {
                    d--;
                    w--;
                }
                //
                
                
                startPos = dian3.add( startPos, center );  
                
                //addDoors and windows
                var marks = getSymmetryGroup( 0, totalWidth, d + w + 1 );
                var tempD, tempW, x, offset;
                if ( d > w ) { 
                    offset = 0;
                }
                else { 
                    offset = 1;
                }
                tempD = d;
                tempW = w;
                for ( var i = 0; i < d + w; i++ ) {
                    if ( u < 2 ) {
                        pos[ 0 ] = dian3.add( startPos, [ 0, 0, marks[ 1 + i ] ] );
                        pos[ 1 ] = dian3.add( startPos, [ 0, 0, marks[ 1 + i ] ] );
                    }
                    else {
                        pos[ 0 ] = dian3.add( startPos, [ marks[ 1 + i ], 0, 0 ] );
                        pos[ 1 ] = dian3.add( startPos, [ marks[ 1 + i ], 0, 0 ] );
                    }
                    rot[ 0 ] = startRot; 
                            
                    x = ( i + offset ) % 2;//getRandom( 0, 1 );
                    if ( ( x == 0 && tempD > 0 ) || ( x == 1 && tempW == 0 ) ) {     
                        tempD--;                                                              
                        doors.push( 
                            house.addModel( renderer, part[ 'door' ][ door.id ], pos[ 0 ], rot[ 0 ], [ 0, 0, 0.1 ],
                                    [ 0, 2*door.measures.height - wall.measures.height - 1.71 , 0 ] )
                        );
                        kases.push( 
                            house.addModel( renderer, part[ 'kasa' ][ kasa.id ], pos[ 0 ], rot[ 0 ], [ 0, 0, 0.1 ],
                                    [ 0, 2*door.measures.height - wall.measures.height - 1.71 , 0 ] )
                        );
                    }
                    else if ( ( x == 1 && tempW > 0 ) || ( x == 0 && tempD == 0 ) ) {
                        windows.push( 
                            house.addModel( renderer, part[ 'window' ][ window.id ], pos[ 0 ], rot[ 0 ], 
                                    [ 0, 0, 0.1 ],[ 0, 0.5, 0 ] )
                        );  
                        tempW--;
                    };
                }                
            }
            if ( windows.length > 0 ) {
	            f = new MergeGroup();
	            for ( var x in windows ) {
            		    f.add( windows[ x ] );
            		    renderer.remove( windows[ x ] );
	            }
	            var mergedWindows = f.merge()[ 0 ];
	            mergedWindows.show();
            }
        },
        makeHouse : function( renderer, universe, center, w, h, d, wallId, windowId, balconyId, doorId, kasaId, balconyDoorId ) {
            var wall = {}, window = {}, balcony = {}, door = {}, kasa = {}, balconyDoor = {};
            wall.measures = house.getModelMeasures( part[ 'wall' ][ wallId ] );
            window.measures = house.getModelMeasures( part[ 'window' ][ windowId ] );
            balcony.measures = house.getModelMeasures( part[ 'balcony' ][ balconyId ] );
            door.measures = house.getModelMeasures( part[ 'door' ][ doorId ] );
            kasa.measures = house.getModelMeasures( part[ 'kasa' ][ kasaId ] );
            balconyDoor.measures = house.getModelMeasures( part[ 'door' ][ balconyDoorId ] );
            

            wall.id = wallId;
            window.id = windowId;
            balcony.id = balconyId;
            door.id = doorId;
            kasa.id = kasaId;
            balconyDoor.id = balconyDoorId;
            
            var wWidth, wHeight, wDepth;
            wWidth = parseInt( w/wall.measures.width );
            wHeight = parseInt( h/wall.measures.height );
            wDepth = parseInt( d/wall.measures.width );
            
            
            var mergedWalls = house.addWalls( renderer, center, wWidth, wHeight, wDepth, wall, universe );            
	        //add to uni
	        if ( typeof universe !== 'undefined' ) {
	            var ent = new Entity();
                ent.mesh = mergedWalls.mesh;
                ent.mesh.setHullFromMesh();
                ent.moveTo( mergedWalls.getPosition()[ 0 ], mergedWalls.getPosition()[ 1 ], mergedWalls.getPosition()[ 2 ] );
                ent.collisionBehaviour = "static";
                universe.addEntity( ent );
                var child = world.createElement();
                child.entity = ent;
                world.appendChild( child );   
            }  
            //
            
            
            house.decorateFirstFloor( renderer, center, wWidth, wHeight, wDepth, wall, window, door, kasa );
            house.decorateUpperFloors( renderer, center, wWidth, wHeight, wDepth, wall, window, balcony, balconyDoor, kasa );
        } ,
	    makeHouses : function( renderer, universe, amount, walls, windows, balconies, doors, kases, balconiesDoors ) {
	        var block = 20;
	        
	        //add floor
	        var material = renderer.createMaterial( 'solid' );
        	material.set( 'v4Color', [ 0.2, 0.2, 0.2, 1 ] );
        	material.transparent = true;
	        var item = utils.makeParallelepiped( -( amount + 1 )/2*block, 0, -( amount + 1 )/2*block,
	                                                     ( amount + 1 )/2*block, 0, ( amount + 1 )/2*block );
	        var mesh = new Mesh( item.vertices, item.indices );
	        var patwma = renderer.createDrawable( { mesh : mesh, material : material } );
	        renderer.add( patwma );	   
	        //
	        
		    for ( var i = -amount/2; i< amount/2; i++ ) {
			    for( var u = -amount/2; u < amount/2; u++ ) {
				    house.makeHouse( renderer, universe, [ block*i, 0, block*u ], 
				            ( 1.5 + 2*Math.random() )*block/4, ( 1.5 + 2*Math.random() )*block/4, ( 1.5 + 2*Math.random() )*block/4, 
			                walls[ getRandom( 0, walls.length - 1 ) ], 
			                windows[ getRandom( 0, windows.length - 1 ) ], 
			                balconies[ getRandom( 0, balconies.length - 1 ) ],
			                doors[ getRandom( 0, doors.length - 1 ) ],
			                kases[ getRandom( 0, kases.length - 1 ) ],
			                balconiesDoors[ getRandom( 0, balconiesDoors.length - 1 ) ] );
			    }
		    }
	    }
    };
    
    return house;
} );
