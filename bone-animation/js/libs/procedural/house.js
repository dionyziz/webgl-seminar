define( [ 'libs/math', 'libs/procedural/map', 'models/entity', 'models/mesh', 'graphics', 'models/scene' ], function( math, map, Entity, Mesh, graphics, scene ) {
    var dian3 = math.dian3;
    var MergeGroup = graphics.MergeGroup;
    var utils = graphics.utils;
    var world = scene.world;
    var groupDrawable = graphics.groupDrawable;

    var part = {
        'wall' : [],
        'window' : [],
        'balcony' : [],
        'door' : [],
        'kasa' : [],
        'asset' : [],
    };
    var town = {
        block : 40,
        road : 8,
        sidewalk : 4
    }
    
    //instead of store, should be deleted
    var randomList = [0.507, 0.363, 0.123, 0.253, 0.268, 0.289, 0.323, 0.232, 0.612, 0.422, 0.437, 0.073, 0.526, 0.412, 0.491, 0.297, 0.654, 0.125, 0.571, 0.03, 0.629, 0.129, 0.479, 0.445, 0.951, 0.534, 0.087, 0.888, 0.641, 0.946, 0.312, 0.115, 0.198, 0.931, 0.78, 0.915, 0.365, 0.02, 0.821, 0.785, 0.468, 0.277, 0.667, 0.934, 0.762, 0.25, 0.526, 0.794, 0.866, 0.913, 0.567, 0.013, 0.73, 0.245, 0.226, 0.696, 0.776, 0.911, 0.773, 0.673, 0.752, 0.258, 0.853, 0.098, 0.786, 0.727, 0.143, 0.56, 0.502, 0.739, 0.777, 0.832, 0.211, 0.72, 0.434, 0.267, 0.622, 0.545, 0.645, 0.598, 0.656, 0.551, 0.227, 0.356, 0.76, 0.104, 0.426, 0.253, 0.772, 0.558, 0.626, 0.786, 0.615, 0.299, 0.621, 0.922, 0.506, 0.379, 0.84, 0.73, 0.891, 0.594, 0.487, 0.322, 0.112, 0.589, 0.022, 0.921, 0.04, 0.339, 0.347, 0.054, 0.963, 0.236, 0.896, 0.341, 0.779, 0.121, 0.359, 0.623, 0.648, 0.924, 0.085, 0.57, 0.161, 0.753, 0.354, 0.159, 0.964, 0.398, 0.277, 0.063, 0.18, 0.313, 0.016, 0.766, 0.579, 0.981, 0.25, 0.983, 0.116, 0.808, 0.967, 0.892, 0.446, 0.286, 0.5, 0.738, 0.725, 0.859, 0.361, 0.86, 0.284, 0.401, 0.586, 0.006, 0.407, 0.71, 0.878, 0.737, 0.681, 0.86, 0.567, 0.829, 0.427, 0.687, 0.146, 0.256, 0.152, 0.576, 0.045, 0.888, 0.336, 0.261, 0.029, 0.403, 0.416, 0.011, 0.644, 0.528, 0.042, 0.886, 0.385, 0.951, 0.039, 0.048, 0.892, 0.081, 0.501, 0.956, 0.309, 0.428, 0.958, 0.14, 0.973, 0.746, 0.375, 0.514, 0.814, 0.91, 0.897, 0.439, 0.674, 0.384, 0.601, 0.739, 0.704, 0.681, 0.995, 0.666, 0.416, 0.211, 0.998, 0.914, 0.488, 0.631, 0.131, 0.634, 0.544, 0.574, 0.984, 0.119, 0.296, 0.162, 0.47, 0.002, 0.291, 0.122, 0.622, 0.001, 0.966, 0.924, 0.47, 0.894, 0.165, 0.807, 0.175, 0.22, 0.375, 0.832, 0.395, 0.613, 0.258, 0.749, 0.485, 0.538, 0.08, 0.583, 0.722, 0.413, 0.935, 0.722, 0.15, 0.249, 0.104, 0.625, 0.965, 0.815, 0.446, 0.012, 0.123, 0.234, 0.268, 0.484, 0.267, 0.727, 0.773, 0.16, 0.739, 0.327, 0.639, 0.912, 0.875, 0.671, 0.502, 0.955, 0.002, 0.744, 0.7, 0.888, 0.551, 0.307, 0.072, 0.043, 0.68, 0.263, 0.992, 0.943, 0.587, 0.235, 0.094, 0.54, 0.372, 0.5, 0.761, 0.365, 0.292, 0.865, 0.706, 0.495, 0.001, 0.664, 0.676, 0.229, 0.375, 0.427, 0.329, 0.54, 0.479, 0.959, 0.168, 0.716, 0.923, 0.764, 0.09, 0.531, 0.447, 0.262, 0.912, 0.842, 0.134, 0.189, 0.019, 0.722, 0.761, 0.951, 0.687, 0.519, 0.041, 0.856, 0.59, 0.595, 0.779, 0.008, 0.516, 0.299, 0.334, 0.339, 0.231, 0.313, 0.276, 0.323, 0.532, 0.066, 0.965, 0.32, 0.125, 0.972, 0.61, 0.122, 0.469, 0.595, 0.864, 0.518, 0.474, 0.87, 0.399, 0.096, 0.376, 0.095, 0.774, 0.957, 0.95, 0.848, 0.488, 0.927, 0.892, 0.346, 0.905, 0.48, 0.164, 0.087, 0.424, 0.833, 0.653, 0.991, 0.804, 0.949, 0.224, 0.991, 0.819, 0.076, 0.998, 0.273, 0.017, 0.589, 0.584, 0.035, 0.585, 0.415, 0.011, 0.413, 0.739, 0.521, 0.788, 0.146, 0.902, 0.289, 0.27, 0.361, 0.451, 0.397, 0.193, 0.809, 0.626, 0.876, 0.92, 0.547, 0.454, 0.861, 0.823, 0.233, 0.971, 0.517, 0.868, 0.192, 0.279, 0.845, 0.392, 0.748, 0.022, 0.806, 0.12, 0.964, 0.914, 0.674, 0.652, 0.722, 0.067, 0.816, 0.991, 0.947, 0.329, 0.423, 0.918, 0.215, 0.948, 0.045, 0.354, 0.247, 0.757, 0.325, 0.213, 0.024, 0.786, 0.121, 0.594, 0.181, 0.715, 0.212, 0.757, 0.484, 0.722, 0.178, 0.172, 0.172, 0.323, 0.807, 0.879, 0.509, 0.329, 0.74, 0.577, 0.505, 0.158, 0.947, 0.731, 0.131, 0.819, 0.335, 0.582, 0.302, 0.756, 0.099, 0.347, 0.329, 0.29, 0.947, 0.729, 0.644, 0.163, 0.641, 0.665, 0.831, 0.713, 0.168, 0.321, 0.933, 0.977, 0.809, 0.248, 0.321, 0.491, 0.989, 0.918, 0.226, 0.717, 0.571, 0.748, 0.713];
    var randomIndex = 18;
    var getRandom = function( from, to ) {
        var n = to - from;
        if ( n === 0 ) return from;
        //var x = Math.random();
        x = randomList[ randomIndex++ ];
        if ( randomIndex == randomList.length ) randomIndex = 0;
        var res = parseInt( x/( 1 / (n+1) ) );
        return ( res + from );
    };
	/*
	var getRandom = function ( from, to, randomId ) {
		var ind = randomId % randomList.length;
		var n = to - from;
        if ( n === 0 ) return from;
        //var x = Math.random();
        x = randomList[ ind++ ];
        if ( ind == randomList.length ) randomIndex = 0;
        var res = parseInt( x/( 1 / (n+1) ) );
        return ( res + from );	
	};*/
    
    var getSymmetryGroup = function( start, end, n ) {
        var pieces = [], l;
		l = end - start;
        for ( var i = 0; i < n; i++ ) {
            pieces.push( start + l/n/2 + l/n*i );
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
			if ( typeof model === 'undefined' ) {
				console.log( "measures", model );				
				return;
			}
		
            if ( typeof model.mesh === 'undefined' ) {
                var box = model.getBoundingBox();     
            }
            else {
                var box = model.mesh.getBoundingBox();
            }
            var width = Math.abs( box[ 7 ][ 0 ] - box[ 0 ][ 0 ] );
            var height = Math.abs( box[ 7 ][ 1 ] - box[ 0 ][ 1 ] );
            var depth = Math.abs( box[ 7 ][ 2 ] - box[ 0 ][ 2 ] );
            return { width : width, height : height, depth : depth };
        },
        addWalls : function( renderer, center, wWidth, wHeight, wDepth, wall, universe ) {
			var repo = {};
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
	                
	                //pos[ 0 ] = dian3.add( pos[ 0 ], center );
	                //pos[ 1 ] = dian3.add( pos[ 1 ], center );
	                
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
		            
		            //pos[ 2 ] = dian3.add( pos[ 2 ], center );
	                //pos[ 3 ] = dian3.add( pos[ 3 ], center );
	                
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
    		    renderer.remove( walls[ x ] );//maybe remove
	        }   
	        var mergedWalls = f.merge()[ 0 ];
            for ( var x in walls ) {
				//walls[ x ].delete();
	        }
	        mergedWalls.show();
            mergedWalls.move.apply( mergedWalls, center );
	                    
			repo[ "walls" ] = mergedWalls;
            return repo;
        },
        decorateUpperFloors : function( renderer, center, wWidth, wHeight, wDepth, wall, window, balcony, door, kasa ) {
			var repo = {};
            var windows = [], doors = [], balconies = [], kases = [];
            var pos = [], rot = [];
            var startPos, startRot, totalWidth;
			var pieces;
            
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
                //startPos = dian3.add( startPos, center );
				pieces = totalWidth/wall.measures.width;
                //
                
                //random picks
                w = pieces;
                b = parseInt( getRandom( 0, 1 )*pieces );           
                
                while ( w+b > pieces ) {
                    if ( getRandom( 0, 5 ) == 0 ) {
						b--;
					}
					else {
						w--;
					}
                }
                //
                var marks = getSymmetryGroup( 0, totalWidth, b + w );
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
                            pos[ 0 ] = dian3.add( startPos, [ 0, i*wall.measures.height, marks[ k ] ] );
                            pos[ 1 ] = dian3.add( startPos, [ 0, i*wall.measures.height, marks[ k ] ] );
                        }
                        else {
                            pos[ 0 ] = dian3.add( startPos, [ marks[ k ], i*wall.measures.height, 0 ] );
                            pos[ 1 ] = dian3.add( startPos, [ marks[ k ], i*wall.measures.height, 0 ] );
                        }
                        rot[ 0 ] = startRot;
                        
                        
                        x = ( k + offset ) % 2;
                        if ( ( x == 0 && tempB > 0 ) || ( x == 1 && tempW == 0 ) ) {     
                            balconies.push( 
                                house.addModel( renderer, part[ 'balcony' ][ balcony.id ], pos[ 0 ], rot[ 0 ], 
                                        [ 0, 0, 0.6 ], [ 0,  -1, 0 ] )
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
                                    [ 0, 0, 0.05 ],[ 0, 0.4, 0 ] )
                            );
                        
                        }
                    }
                }                
            }
            
			if ( kases.length > 0 ) {
	            f = new MergeGroup();
	            for ( var x in kases ) {
            		    f.add( kases[ x ] );
            		    renderer.remove( kases[ x ] );//maybe remove
						//windows[ x ].delete();
	            }
	            var mergedKases = f.merge()[ 0 ];
	            mergedKases.show();
                mergedKases.move.apply( mergedKases, center );
				repo[ "kases" ] = mergedKases;
            }      
			if ( doors.length > 0 ) {
	            f = new MergeGroup();
	            for ( var x in doors ) {
            		    f.add( doors[ x ] );
            		    renderer.remove( doors[ x ] );//maybe remove
						//windows[ x ].delete();
	            }
	            var mergedDoors = f.merge()[ 0 ];
	            mergedDoors.show();
                mergedDoors.move.apply( mergedDoors, center );
				repo[ "doors" ] = mergedDoors;
            }      
            if ( windows.length > 0 ) {
	            f = new MergeGroup();
	            for ( var x in windows ) {
            		    f.add( windows[ x ] );
            		    renderer.remove( windows[ x ] );//maybe remove
						//windows[ x ].delete();
	            }
	            var mergedWindows = f.merge()[ 0 ];
	            mergedWindows.show();
                mergedWindows.move.apply( mergedWindows, center );
				repo[ "windows" ] = mergedWindows;
            }            
            if ( balconies.length > 0 ) {
				for ( var i in balconies ) {
					repo[ i ] = ( balconies[ i ] );
					balconies[ i ].move( center[ 0 ], center[ 1 ], center[ 2 ] ,true );
				}
				/* todo with worker
	            f = new MergeGroup();
	            for ( var x in balconies ) {
        		    f.add( balconies[ x ] );
        		    renderer.remove( balconies[ x ] );//maybe remove
					//balconies[ x ].delete();
                }
                var mergedBalconies = f.merge()[ 0 ];
                mergedBalconies.show();
                mergedBalconies.move.apply( mergedBalconies, center );
				repo[ "balconies" ] = mergedBalconies;
				*/            
			}
			return repo;
        },
        decorateRoof : function( renderer, center, wWidth, wHeight, wDepth, wall, assets ) {
			var repo = {};
            //add roof walls
            var rooftop = [];
            var offset = dian3.scale( [ 0.5, 0, 0.5 ], wall.measures.width );
            for ( var i = 0; i < wWidth; i++ ) {
                for ( var u = 0; u < wDepth; u++ ) {
                    var pos = [ i*wall.measures.width, wHeight*wall.measures.height, u*wall.measures.width ]; 
                    pos = dian3.add( pos, offset );   
                    rooftop.push( house.addModel( renderer, part[ 'wall' ][ wall.id ], pos, [ [ 1 , 0, 0 ], 3*Math.PI/2  ], [ 0, 0, 0 ], [ 0, 0, 0 ] ) );  
                }
            }
			
			if ( rooftop.length > 0 ) {
	            f = new MergeGroup();
	            for ( var x in rooftop ) {
        		    f.add( rooftop[ x ] );
        		    renderer.remove( rooftop[ x ] );//maybe remove
                }
                var mergedRooftop = f.merge()[ 0 ];
                mergedRooftop.show();
                mergedRooftop.move.apply( mergedRooftop, center );
            }
			repo[ "rooftop" ] = mergedRooftop;
            //
            
            //add assets
            var roofAssets = [];
            
            var satMeasures = house.getModelMeasures( part[ 'asset' ][ assets.sat1 ] );
            var satScale = 1;
            var satOffset = dian3.scale( [ 0.5*satMeasures.width, 0.5*satMeasures.height, 0.5*satMeasures.depth ], satScale );
            
            var tvMeasures = house.getModelMeasures( part[ 'asset' ][ assets.tv ] );
            var tvScale = 1;
            var tvOffset = dian3.scale( [ 0.5*tvMeasures.width, 0.5*tvMeasures.height, 0.5*tvMeasures.depth ], tvScale );
            
            for ( var i = 0; i < wWidth; i++ ) {
                for ( var u = 0; u < wDepth; u++ ) {
                    var choice = getRandom( 0, 10 );
                    var pos = dian3.add( center, [ i*wall.measures.width, wHeight*wall.measures.height, u*wall.measures.width ] ); 
                    if ( choice == 0 ) {                    
                        pos = dian3.add( pos, satOffset );
                        var sat = house.addModel( renderer, part[ 'asset' ][ assets.sat1 ], pos, [ [ 0 , 1, 0 ], getRandom( 0, 360 )*Math.PI/180 ], [ 0, 0, 0 ], [ 0, 0, 0 ] );
                        sat.scale( satScale );
                        roofAssets.push( sat );
                    }  
                    else if ( choice == 1 ) {                    
                        pos = dian3.add( pos, tvOffset );
                        var tv = house.addModel( renderer, part[ 'asset' ][ assets.tv ], pos, [ [ 0 , 1, 0 ], getRandom( 0, 360 )*Math.PI/180 ], [ 0, 0, 0 ], [ 0, 0, 0 ] );
                        tv.scale( tvScale );
                        roofAssets.push( tv );
                    }
                }
            }
			repo[ "roofAssets" ] = roofAssets;
            //
			return [].concat( repo[ "rooftop" ], repo[ "roofAssets" ] );
        },
        decorateFirstFloor : function( renderer, center, wWidth, wHeight, wDepth, wall, window, door, kasa ) {
			var repo = {};
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
				pieces = totalWidth/wall.measures.width;                
                //
                
                //random picks
                d = Math.max( getRandom( 0, 1 ), 3 - doorsN - 1*( 3 - u ) );
                w = pieces;
                if ( doorsN + d > 3 ) {
                    d = 3 - doorsN;
                }                
                doorsN += d;
				w = w - d;
                
                while ( w+d > pieces ) {
                    d--;
                    w--;
                }
                //
                
                
                //startPos = dian3.add( startPos, center );  
                
                //addDoors and windows
                var marks = getSymmetryGroup( 0, totalWidth, pieces );
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
                        pos[ 0 ] = dian3.add( startPos, [ 0, 0, marks[ i ] ] );
                        pos[ 1 ] = dian3.add( startPos, [ 0, 0, marks[ i ] ] );
                    }
                    else {
                        pos[ 0 ] = dian3.add( startPos, [ marks[ i ], 0, 0 ] );
                        pos[ 1 ] = dian3.add( startPos, [ marks[ i ], 0, 0 ] );
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
                                    [ 0, 0, 0.05 ],[ 0, 0.4, 0 ] )
                        );  
                        tempW--;
                    };
                }                
            }
			if ( doors.length > 0 ) {
	            f = new MergeGroup();
	            for ( var x in doors ) {
        		    f.add( doors[ x ] );
        		    renderer.remove( doors[ x ] );//maybe remove
					//doors[ x ].delete();
                }
                var mergedDoors = f.merge()[ 0 ];
                mergedDoors.show();
                mergedDoors.move.apply( mergedDoors, center );
				repo[ "ffdoors" ] = mergedDoors;
            }
			if ( kases.length > 0 ) {
	            f = new MergeGroup();
	            for ( var x in kases ) {
        		    f.add( kases[ x ] );
        		    renderer.remove( kases[ x ] );//maybe remove
					//kases[ x ].delete();
                }
                var mergedKases = f.merge()[ 0 ];
                mergedKases.show();
                mergedKases.move.apply( mergedKases, center );
				repo[ "ffkases" ] = mergedKases;
            }
            if ( windows.length > 0 ) {
	            f = new MergeGroup();
	            for ( var x in windows ) {
            		    f.add( windows[ x ] );//maybe delete
            		    renderer.remove( windows[ x ] );
						//windows[ x ].delete();
	            }
	            var mergedWindows = f.merge()[ 0 ];
	            mergedWindows.show();
                mergedWindows.move.apply( mergedWindows, center );
				repo[ "ffwindows" ] = mergedWindows;
            }
			return repo;
        },
        makeHouse : function( renderer, universe, center, w, h, d, wallId, windowId, balconyId, doorId, kasaId, balconyDoorId, assets ) {
			var repo = {};
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
            
            var res = house.addWalls( renderer, center, wWidth, wHeight, wDepth, wall, universe );  
			var mergedWalls = res[ "walls" ];			
			
	        //add to uni
	        if ( typeof universe !== 'undefined' ) {
	            var ent = new Entity();
                ent.mesh = mergedWalls.mesh;
                ent.mesh.setHullFromMesh();
                ent.moveTo( mergedWalls.getPosition()[ 0 ], mergedWalls.getPosition()[ 1 ], mergedWalls.getPosition()[ 2 ] );
                ent.collisionBehaviour = "static";
                universe.addEntity( ent );
                var child = world.createElement();
                child.setEntity( ent );
                world.appendChild( child );   
            }  
            //
            var res1 = house.decorateFirstFloor( renderer, center, wWidth, wHeight, wDepth, wall, window, door, kasa );
            var res2 = house.decorateUpperFloors( renderer, center, wWidth, wHeight, wDepth, wall, window, balcony, balconyDoor, kasa );
            var res3 = house.decorateRoof( renderer, center, wWidth, wHeight, wDepth, wall, assets );
			
			var ret = [];
			var k = [ res, res1, res2, res3 ];
			for ( x in k ) {
			    for ( i in k[ x ] ) {
    			    ret.push( k[ x ][ i ] );
			    }
			}
			return ret;
        } ,
        initTown : function ( map, universe ) {
            house.makeRoads( 0, 0, map.size[ 0 ], map.size[ 1 ] );
        },
	    makeTown : function( map, universe, walls, windows, balconies, doors, kases, balconiesDoors, assets ) {
	        house.makeRoads( 0, 0, map.size[ 0 ], map.size[ 1 ] );            
	        for ( var i in map.blocks ) {
	            var res = house.makeBlock( i, map.blocks[ i ], universe, walls, windows, balconies, doors, kases, balconiesDoors, assets );
	            //res containts all drawables to be removed
	            //todo , remove physics
	        }
	    },
	    makeBlock : function( blockId, shape, universe, walls, windows, balconies, doors, kases, balconiesDoors, assets ) {
	        var data = [];
	        data.push.apply( data, house.makeSidewalk( shape ) );
	        data.push.apply( data, house.makeSidewalkDecoration( universe, shape, assets ) );
	        
	        var p = [];
	        // find corner points inside the block
            for ( var i = 0 ; i < 4; i++ ) { 
                var p1, p2, pk1, pk2, l, diff;
                p1 = dian3.subtract( shape[ ( 4 + i + 1 )%4 ], shape[ i ] );
                p2 = dian3.subtract( shape[ ( 4 + i - 1 )%4 ], shape[ i ] );
                pk1 = dian3.scale( dian3.normal( dian3.cross( p1, [ 0, 1, 0 ] ) ), town.sidewalk );
                pk2 = dian3.scale( dian3.normal( dian3.cross( p2, [ 0, -1, 0 ] ) ), town.sidewalk );                
                
                diff = dian3.subtract( p1, p2 );
                for ( var k in diff ) {
                    if ( diff[ k ] != 0 ) {
                         l = dian3.subtract( pk2, pk1 )[ k ]/ diff[ k ];
                         break;
                    }
                }
                p[ i ] = dian3.add( pk1, dian3.add( shape[ i ], dian3.scale( p1, l ) ) );
            }
            
            //generate seperation points, TODO own function
            var hPieces = [ 0 ], h = 0;
	        var wPieces = [ 0 ], w = 0;
	        var cur = 0;
	        
	        var p1, p2, pk1, pk2, l, diff;
            p1 = dian3.normal( dian3.subtract( shape[ 1 ], shape[ 0 ] ) );
            p2 = dian3.normal( dian3.subtract( shape[ 3 ], shape[ 0 ] ) );
            
            var hLen =  dian3.metro( dian3.subtract( p[ 3 ], p[ 0 ] ) );
            for ( var i = 0; i < 999; i+=  getRandom( 2, 6 )  ) {
                if ( dian3.add( p[ 0 ], dian3.scale( p2, i ) )[ 2 ] > p[ 3 ][ 2 ] ) {
                    break;
                }
                if ( dian3.metro( dian3.subtract( dian3.scale( p2, hPieces[ h ] ), dian3.scale( p2, i ) ) ) < 11 ) {
                    continue;
                }
                else {
                    hPieces.push( i );
                    h++;    
                }
                
                if ( i - hPieces[ h ] < 11*2 ) {
	                hPieces.pop();
	                hPieces.push( ( hPieces[ hPieces.length - 1 ] +  hLen )/2  );
	                hPieces.push( hLen );
	                h++;
                    break;
	            }
            }
            
            var wLen =  dian3.metro( dian3.subtract( p[ 1 ], p[ 0 ] ) );
            for ( var i = 0; i < 999; i +=  getRandom( 3, 4 ) ) {
                if ( dian3.add( p[ 0 ], dian3.scale( p1, i ) )[ 0 ] > p[ 1 ][ 0 ] ) {
                    break;
                }
                if ( dian3.metro( dian3.subtract( dian3.scale( p1, wPieces[ w ] ), dian3.scale( p1, i ) ) ) < 11 ) {
                    continue;
                }
                else {
                    wPieces.push( i );
                    w++;    
                }
                
                 if ( i - wPieces[ w ] < 11*2 ) {
	                wPieces.pop();
	                wPieces.push( ( wPieces[ wPieces.length - 1 ] +  wLen )/2  );
	                wPieces.push( wLen );
	                w++;
                    break;
	            }
            }
            
            //****add buildings
	        var picks = {};
			var houseN = 0;
            for ( var i = 0; i < wPieces.length - 1; i++ ) {
	            for ( var u = 0; u < hPieces.length - 1; u++ ) {
	                //pick wall
	                wallPick = getRandom( 0, walls.length - 1 );
                    if ( typeof picks[ wallPick ] !== 'undefined' ) {
                        wallPick = 0;
                        while( typeof picks[ wallPick ] !== 'undefined' && wallPick < walls.length - 1 ) {
                            wallPick++;
                        }
                    }
                    picks[ wallPick ] = 1;
                    //
                    
                    var x0,z0,x1,z2;
                    x0 = p[ 0 ][ 0 ] + 
                        Math.max( 
                            dian3.add( dian3.scale( p1, wPieces[ i ] ), dian3.scale( p2, hPieces[ u ] ) )[ 0 ],
                            dian3.add( dian3.scale( p1, wPieces[ i ] ), dian3.scale( p2, hPieces[ u + 1 ] ) )[ 0 ]
                        );
                    x1 = p[ 0 ][ 0 ] + 
                        Math.min( 
                            dian3.add( dian3.scale( p1, wPieces[ i + 1 ] ), dian3.scale( p2, hPieces[ u ] ) )[ 0 ],
                            dian3.add( dian3.scale( p1, wPieces[ i + 1 ] ), dian3.scale( p2, hPieces[ u + 1 ] ) )[ 0 ]
                        );
                    z0 = p[ 0 ][ 2 ] + 
                        Math.max( 
                            dian3.add( dian3.scale( p1, wPieces[ i ] ), dian3.scale( p2, hPieces[ u ] ) )[ 2 ],
                            dian3.add( dian3.scale( p1, wPieces[ i + 1 ] ), dian3.scale( p2, hPieces[ u ] ) )[ 2 ]
                        );
                    z1 = p[ 0 ][ 2 ] + 
                        Math.min( 
                            dian3.add( dian3.scale( p1, wPieces[ i ] ), dian3.scale( p2, hPieces[ u + 1 ] ) )[ 2 ],
                            dian3.add( dian3.scale( p1, wPieces[ i + 1 ] ), dian3.scale( p2, hPieces[ u + 1 ] ) )[ 2 ]
                        );
					//console.log( i, u, "going in", shape[ 0 ] );
                    setTimeout( ( function( x0, x1, z0, z1, i, u , wallPick ) {
						return function() {
							data.push.apply( data,
								house.makeHouse( renderer, universe, [ x0 , 0, z0 ],
									x1 - x0 - 2.5, getRandom( 9, 20 ), z1 - z0 - 3, 
									walls[ wallPick + 0 ], 
									windows[ getRandom( 0, windows.length - 1 ) ], 
									balconies[ getRandom( 0, balconies.length - 1 ) ],
									doors[ getRandom( 0, doors.length - 1 ) ],
									kases[ wallPick + 0 ],
									balconiesDoors[ getRandom( 0, balconiesDoors.length - 1 ) ],
									assets )
							);
							//console.log( i, u, "complete", shape[ 0 ] );
							houseN++;
							
							if ( houseN === ( wPieces.length -1 )*( hPieces.length - 1 ) ) {
							    map.blockComplete( blockId );// report that the block is completed
							}
						}
					})( x0, x1, z0, z1, i, u, wallPick ), 800*( u + 1 + i*( wPieces.length - 1 ) ) );
					//console.log( "wait time", i, u, 800*( u + 1 + i*( wPieces.length - 1 ) ) );
				}
	        }
	        return data;  
	    },
		makeRoads : function ( x1, y1, x2, y2 ) {
			var item = utils.makeSquare( x1, y1, x2, y2 );
	        var mesh1 = new Mesh( item.vertices, item.indices );
			//scale choords
			var c = ( x2 - x1 );
			for ( var i = 0; i < item.uvcoords.length; i++ ) {
				item.uvcoords[ i ] *= c;
			}			
			//
	        var roadPiece = renderer.createDrawable( { mesh : mesh1, uvcoords : item.uvcoords, normals : item.normals } );
	        roadPiece.material = renderer.createMaterial( 'textured' );
	        roadPiece.material.set( 's2texture', 'resources/AsphaltCloseups0030_9_S.jpg' );
			roadPiece.show();
			
			roadPiece.rotateTo( -Math.PI/2, [ 1, 0, 0 ] );
			roadPiece.move( 0, 0, y2 - y1, true );
			return [ roadPiece ]; 
		},
		makeSidewalkDecoration : function ( universe, shape, assets ) {
			var light1Measures = house.getModelMeasures( part[ 'asset' ][ assets.light1 ] );
	        var light1 = part[ 'asset' ][ assets.light1 ];
	                    
            var parteriMeasures = house.getModelMeasures( part[ 'asset' ][ assets.parteri ] );
	        var parteri = part[ 'asset' ][ assets.parteri ];
	      
            var fullTree = part[ 'asset' ][ assets.tree ].clone();
            var treeMeasures = house.getModelMeasures( part[ 'asset' ][ assets.tree ] );//bot part 
            
            var binMeasures = house.getModelMeasures( part[ 'asset' ][ assets.bin ] );
            var bin = part[ 'asset' ][ assets.bin ];
            
            var krounosMeasures = house.getModelMeasures( part[ 'asset' ][ assets.krounos ] );
            var krounos = part[ 'asset' ][ assets.krounos ];

			var dec = [], ret = [];
            var startPos = [];
            var pos = [];
            var rot = [];
            var cornerChoice = getRandom( 0, 3 );
            rot = [ Math.PI, Math.PI/2, 0, -Math.PI/2 ];			
			for( var  i = 0; i < 4; i++ ) {
				var dir = dian3.subtract( shape[ ( i + 1 )%4 ], shape[ i ] );
				var sideL = dian3.metro( dir );
				var dirM = dian3.normal( dir );// monadiaio kateythhnshs
				var step = town.block/6;				
				startPos = dian3.add( shape[ i ], [ 0, 0, 0 ] ); 
				dec[ i ] = [];
				
				for ( var u = 0; u < sideL/step; u++ ) {
					var pos = dian3.add( startPos, dian3.scale( dirM, step*u ) );
				
					if ( u == 0 ) { 
					    // add corner decoration	
    				    if ( cornerChoice != i ) {
    				        continue;
    				    }
						else if ( cornerChoice == i ) { //add it
                            var type = getRandom( 0, 1 ); 
                            var endpos = [];                           
                            if ( type == 0 ) { //add bin
                                dec[ i ][ u ] = bin.clone();
                                dec[ i ][ u ].rotateTo( rot[ i ], [ 0, 1, 0 ] );
                                dec[ i ][ u ].moveTo.apply( dec[ i ][ u ], 
                                        dian3.add( [ 0, binMeasures.height/2, 0 ], pos ) );
                                dec[ i ][ u ].move( -town.sidewalk/3, 0 , -town.sidewalk/3 );                
                                dec[ i ][ u ].show();
                            }
                            else { //add krouno
                                dec[ i ][ u ] = krounos.clone();
                                dec[ i ][ u ].rotateTo( rot[ i ], [ 0, 1, 0 ] );
                                dec[ i ][ u ].moveTo.apply( dec[ i ][ u ],
                                         dian3.add( [ 0, krounosMeasures.height/2, 0 ], pos ) );
                                dec[ i ][ u ].move( -town.sidewalk/3, 0 , -town.sidewalk/3 );                
                                dec[ i ][ u ].show();                            
                            }
                            
                            if ( typeof universe !== 'undefined' ) {//add colision
                                var ent = new Entity();
                                ent.mesh = dec[ i ][ u ].mesh;
                                ent.mesh.setHullFromMesh();
                                ent.moveTo.apply( ent, dec[ i ][ u ].getPosition() );               
                                ent.collisionBehaviour = "static";
                                universe.addEntity( ent );
                                var child = world.createElement();
                                child.setEntity( ent );
                                world.appendChild( child );   
                            }
                            ret.push( dec[ i ][ u ] );  
                        }
					}
					else if ( u%2 == 0 ) {
						//add lamp
						dec[ i ][ u ] = light1.clone();
						dec[ i ][ u ].rotateTo( rot[ i ], [ 0, 1, 0 ] );
						dec[ i ][ u ].moveTo.apply( dec[ i ][ u ],
							dian3.add( [ 0, light1Measures.height/2, 0 ], pos )
						);
						dec[ i ][ u ].move( 0, 0, -town.sidewalk/16 );
						dec[ i ][ u ].update();
						dec[ i ][ u ].show();
						ret.push( dec[ i ][ u ] );
					}
					else if ( u%2 == 1 ) {
						//add parteri	
						dec[ i ][ u ] = [];
						dec[ i ][ u ][ 0 ] = parteri.clone();
						dec[ i ][ u ][ 0 ].rotateTo( rot[ i ], [ 0, 1, 0 ] );
						dec[ i ][ u ][ 0 ].moveTo.apply( dec[ i ][ u ][ 0 ],
							dian3.add( [ 0, parteriMeasures.height/2, 0 ], pos )
						);
						dec[ i ][ u ][ 0 ].move( 0, 0, -parteriMeasures.width/1.5 );
						dec[ i ][ u ][ 0 ].show();
						//
						
						//add tree
						dec[ i ][ u ][ 1 ] = fullTree.clone();
						dec[ i ][ u ][ 1 ].rotateTo( rot[ i ], [ 0, 1, 0 ] );
						dec[ i ][ u ][ 1 ].moveTo.apply( dec[ i ][ u ][ 1 ],
							dian3.add( [ 0, treeMeasures.height/2, 0 ], pos )
						);
						dec[ i ][ u ][ 1 ].move( 0, 0, -parteriMeasures.width/1.5 );
						dec[ i ][ u ][ 1 ].show();
						//					
						ret.push( dec[ i ][ u ][ 0 ] );
						ret.push( dec[ i ][ u ][ 1 ] );	
					}
				}
			}
			return ret;				
		},
		makeSidewalk : function ( shape ) {
			//add sidewalk to given 4point shape
			var item = utils.makeTrapezium( 0, 0, 
							shape[ 1 ][ 0 ] - shape[ 0 ][ 0 ], shape[ 1 ][ 2 ] - shape[ 0 ][ 2 ], 
							shape[ 2 ][ 0 ] - shape[ 0 ][ 0 ], shape[ 2 ][ 2 ] - shape[ 0 ][ 2 ], 
							shape[ 3 ][ 0 ] - shape[ 0 ][ 0 ], shape[ 3 ][ 2 ] - shape[ 0 ][ 2 ]
			);
	        var mesh1 = new Mesh( item.vertices, item.indices );
			//scale uvs to be what you want
			var c = 1/3;
			for ( var i = 0; i < item.uvcoords.length; i++ ) {
				item.uvcoords[ i ] *= c;
			}
			//
	        var sidePiece = renderer.createDrawable( { mesh : mesh1, uvcoords : item.uvcoords, normals : item.normals } );
	        sidePiece.material = renderer.createMaterial( 'textured' );
	        sidePiece.material.set( 's2texture', 'resources/FloorsRegular0043_5_S.jpg' );
			sidePiece.moveTo( shape[ 0 ][ 0 ], 0.001, shape[ 0 ][ 2 ] );			
	        sidePiece.show();
	        
			return [ sidePiece ];
		}
    };
    
    return house;
} );
