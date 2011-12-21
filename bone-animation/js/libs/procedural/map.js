define( [ 'libs/math', 'models/entity', 'models/mesh', 'graphics', 'models/scene' ], function( math, Entity, Mesh, graphics, scene ) {
    var dian3 = math.dian3;
    var MergeGroup = graphics.MergeGroup;
    var utils = graphics.utils;
    var world = scene.world;
    var groupDrawable = graphics.groupDrawable;
	
	var map = -1;
	var buildCreator = -1;
	var blockList = [];
	var blockData = [];
	var blockStatus = [];
	var lastPosition = -1;
	var lastPositionChecked = -1;
	
	//blocks
	// lb,rb,rt,lt -  0,1,2,3 - x,z
	//proceduralID - care
	
	

  
    var pointLineSegDist = function( v, w , p ) { 
        // http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
        var l2  = Math.pow( v[ 0 ] - w[ 0 ], 2 ) + Math.pow( v[ 1 ] - w[ 1 ], 2 );
        if ( l2 < 0.0001 ) {
            return Math.sqrt( Math.pow( v[ 0 ] - p[ 0 ], 2 ) + Math.pow( v[ 1 ] - p[ 1 ], 2 ) );
        }
        var t = ( ( p[ 0 ] - v[ 0 ] )*( w[ 0 ] - v[ 0 ] ) + ( p[ 1 ] - v[ 1 ] )*( w[ 1 ] - v[ 1 ] ) )/l2;
        if ( t < 0.0001 ) {
            return Math.sqrt( Math.pow( v[ 0 ] - p[ 0 ], 2 ) + Math.pow( v[ 1 ] - p[ 1 ], 2 ) );
        }
        else if ( t > 1.000 ) {
            return Math.sqrt( Math.pow( w[ 0 ] - p[ 0 ], 2 ) + Math.pow( w[ 1 ] - p[ 1 ], 2 ) );
        } 
        
        var proj = [ v[ 0 ] + t*( w[ 0 ] - v[ 0 ] ), v[ 1 ] + t*( w[ 1 ] - v[ 1 ] ) ];
        return Math.sqrt( Math.pow( proj[ 0 ] - p[ 0 ], 2 ) + Math.pow( proj[ 1 ] - p[ 1 ], 2 ) );    
    };
	
	var Map = {
		R : 50,
		miniMap : true,
		miniMapInited : false,
		canvasDrawBackground : function() {
		    var canvas = $( "#map" )[ 0 ];
            var ctx = canvas.getContext( '2d' );
            
            ctx.fillStyle = "rgb(200,0,0)";
            ctx.fillRect ( 0, 0, 199, 199 );
            
            ctx.fillStyle = "rgb(0,200,0)";
            for ( var i in map.blocks ) {
                if ( blockList[ i ] === true ) {
                    ctx.fillStyle = "rgb(0,200,0)";
                }
                else {
                    ctx.fillStyle = "rgb(0,0,0)";
                }
            
                var p0 = map.blocks[ i ];
                ctx.beginPath();
                ctx.moveTo( p0[ 0 ][ 0 ], p0[ 0 ][ 2 ] );
                for ( var u = 1; u < 4; u++ ) {
                    ctx.lineTo( p0[ u ][ 0 ], p0[ u ][ 2 ] );
                }
                ctx.fill();
            }
		},
		canvasDrawPlayer : function( pos ) {
		    var canvas = $( "#map" )[ 0 ];
            var ctx = canvas.getContext( '2d' );
            
            ctx.fillStyle = "rgb(0,0,200)";
            ctx.beginPath();
            ctx.arc( pos[ 0 ], pos[ 2 ], Map.R, 0, Math.PI*2, true ); 
            ctx.stroke();
		},
		canvasInit : function() {
		    $( "body" ).append( '<canvas id="map" width="200" height="200"></canvas>' );
		    $( "#map" ).css( { position : "absolute", 'z-index' : 9009, right : 0, top : 0 } );
		    Map.canvasDrawBackground();
		},
		canvasUpdate : function( pos ) {
		    Map.canvasDrawBackground();
		    Map.canvasDrawPlayer( pos );
		},
		loadMap : function( jMap ) {
			//todo check format
			if ( typeof jMap !== "object" ) {
				return false;
			}
			map = jMap;
			if ( Map.miniMap && !Map.miniMapInited ) {
			    Map.canvasInit();
			    Map.miniMapInited = true;
		    }
		    
		    if ( lastPosition !== -1 ) {
		        map.update( lastPosition );
		    }
			return true;
		},
		buildCreator : function ( callback ) {
		    buildCreator = callback;
		},
		removeBlock : function( ind ) {
		    for ( var u in blockData[ ind ] ) {
			    blockData[ ind ][ u ].remove();
			}
			return;
		},
		addBlock : function( ind ) {
		    Map.removeBlock( ind );
		    blockData[ ind ] = buildCreator( ind, map.blocks[ ind ] );
		    return;
        },
        blockComplete : function( ind ) {
            blockStatus[ ind ] = false;
            //console.log( "block ", ind, "completed.Can be removed now." );
        },
		update : function( pos ) {		
		    lastPosition = pos;
		    
		    if ( map === -1 || buildCreator === -1 ) { //map undefined
		        return;
		    }		    
			
			//find all blocks in range
			var newList = [];
			var p1 = [], p2 = [], p0 = [];
			
		    p0[ 0 ] = pos[ 0 ];
		    p0[ 1 ] = pos[ 2 ];
			for ( var i in  map.blocks ) {
				newList[ i ] = false;
				for ( var u = 0; u < 4; u++ ) {
					p1[ 0 ] = map.blocks[ i ][ u ][ 0 ] + 0;
					p1[ 1 ] = map.blocks[ i ][ u ][ 2 ] + 0;
					
					p2[ 0 ] = map.blocks[ i ][ ( u+1 ) % 4 ][ 0 ] + 0;
					p2[ 1 ] = map.blocks[ i ][ ( u+1 ) % 4 ][ 2 ] + 0;
					
					var d = pointLineSegDist( p2, p1, p0 );				
					if ( d < Map.R ) {
					    newList[ i ] = true;
					}					
				}
			}
			
			//cross check with old, to erase obsolete
			var toRemove = []
			for ( var i in  map.blocks ) { //old blockList - new newList
				if ( blockList[ i ] === true && newList[ i ] === false ) {
				    if ( blockStatus[ i ] === false ) {
    					toRemove.push( i );
					}
					else {
					    //add it to current list, to erase later on
					    newList[ i ] = true;
					}
				}
			}			
			//cross  check to add new ones
			var toAdd = [];
			for ( var i in map.blocks ) {
				if ( newList[ i ] === true && ( blockList[ i ] === false || blockList.length == 0 ) ) {
					toAdd.push( i );
				}
			}			
			//make new list, old
			for ( var i in map.blocks ) {
				blockList[ i ] = newList[ i ];
			}
			
			//remove buildings
			for ( var i in toRemove ) {
				console.log( "DML : remove block ", toRemove[ i ] );
				Map.removeBlock( toRemove[ i ] );
			}
			
			//add buildigns
			for ( var i in toAdd ) {
				console.log( "DML : add block ", toAdd[ i ] );
			    blockStatus[ toAdd[ i ] ] = true;//locked till completion
			    //console.log( "block ", toAdd[ i ], "locked till completion." );
				Map.addBlock( toAdd[ i ] );
			}

			if ( Map.miniMap ) { //update mini map
		        if ( !Map.miniMapInited ) {
    			    Map.canvasInit();
    			    Map.miniMapInited = true;
			    }
			    Map.canvasUpdate( pos );
		    }
		}
	};
	return Map;
} );
