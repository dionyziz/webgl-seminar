( function() {
    //init
	var dian3 = require( 'libs/math' ).dian3;
	var Mesh = require( 'models/mesh' );
    var objloader = require( 'js/views/graphics/new/objloader' );

	renderer = new Renderer();
	document.body.appendChild( renderer.init( 400, 300, 'js/views/graphics/core.js' ) );
	
	var shader = renderer.createShader( 'js/views/graphics/new/shaders/solid' );
	
	camera = new Camera();
	renderer.useCamera( camera );	
	//
	
	
	//load objs
	var parts = [];
    objloader.loadOBJ(  './resources/wallmodel/Wall_01.obj', function( objs ){
            var id = 'wall'        
            for( var i in objs ) {
                var f = new Mesh( objs[ i ].vertices, objs[ i ].indices );
                f.setHullFromMesh();
                var pos = f.getBoundingSphere()[ 0 ];
                f.move( -pos[ 0 ], -pos[ 1 ], -pos[ 2 ] );
                f.setHullFromMesh();
                parts[ id ] = renderer.createDrawable( { 
                    mesh: f,
                    normals: objs[ i ].normals,
                    material: objs[ i ].material, 
                    uvcoords: objs[ i ].uvcoords 
                } );                                
                renderer.add( parts[ id ] );
                parts[ id ].moveTo( 10, 0 ,0 );
                console.log( id, parts[ id ] );
            }            
    }, renderer );
    
    objloader.OBJ.loadOBJ(  './resources/windowmodel/Window_01.obj', function( objs ){
            var id = 'window'        
            for( var i in objs ) {
                var f = new Mesh( objs[ i ].vertices, objs[ i ].indices );
                f.setHullFromMesh();
                var pos = f.getBoundingSphere()[ 0 ];
                f.move( -pos[ 0 ], -pos[ 1 ], -pos[ 2 ] );
                f.setHullFromMesh();
                parts[ id ] = renderer.createDrawable( { 
                    mesh: f,
                    normals: objs[ i ].normals,
                    material: objs[ i ].material, 
                    uvcoords: objs[ i ].uvcoords 
                } );                                
                renderer.add( parts[ id ] );
                parts[ id ].moveTo( 10, 0 ,0 );
                console.log( id, parts[ id ] );
            }            
    }, renderer );
    //
    
    
    //make house 
    makeHouse = function( floors ) {
        var box = parts[ 'wall' ].mesh.getBoundingBox();
        width = box[ 7 ][ 0 ] - box[ 0 ][ 0 ];
        console.log( width );

        var wall = [];
        var depth = 0;
        var center = [ 0, 0, 0 ];
        var st;
        var pos, absPos, rot, brot;
        for ( var i = 0; i < floors; i++ ) {
            st = 8*i;
            for ( var u = 0; u <4; u++ ) {
                //wall[ st + u ] = renderer.createDrawable( { mesh : parts[ "wall" ].mesh, material  : parts[ "wall" ].material,normals: parts[ "wall" ].normals,uvcoords: parts[ "wall" ].uvcoords } );
                wall[ st + u ] = parts[ "wall" ].clone();
	            renderer.add( wall[ st + u ] );
	            //wall[ st + u ].scale( 10 );
	            if ( u == 0 ) {
		            pos = [ width/2 - depth/2, i*width, 0 ];
		            absPos = dian3.add( pos, center );
		            rot = [ [ 0, 1, 0 ], Math.PI/2 ];
		            brot = [ [ 0, 1, 0 ], Math.PI/2 ];
	            }
	            else if ( u == 1 ) {
		            pos = [ -width/2 + depth/2, i*width, 0 ];
		            absPos = dian3.add( pos, center );
		            rot = [ [ 0, 1, 0 ], -Math.PI/2  ]
		            brot = [ [ 0, 1, 0 ], -Math.PI/2 ];
	            }
	            else if ( u == 2 ) {
		            pos = [ 0, i*width, width/2 - depth/2 ];
		            absPos = dian3.add( pos, center );
		            rot = [ [ 0, 1, 0 ], 0 ];
		            brot = [ [ 0, 1, 0 ], 0 ];
	            }
	            else if ( u == 3 ) {
		            pos = [ 0, i*width, -width/2 + depth/2 ];
		            absPos = dian3.add( pos, center );
		            rot = [ [ 0, 1, 0 ], 0 ];
		            brot = [ [ 0, 1, 0 ], Math.PI ];
	            }
	            console.log( absPos, u );
	            wall[ st + u ].rotateTo( rot[ 1 ] , rot[ 0 ] );
	            wall[ st + u ].moveTo( absPos[ 0 ], absPos[ 1 ], absPos[ 2 ] );
            }
        }
    };
    setTimeout( function() { makeHouse( 2 ); }, 1000 );
    //
    
    
    
    //camera 
	var angle = 0;
	var turnRate = 0.01;
	var dist = 30
    setInterval( function() {
        angle += turnRate;
	    camera.rotate( turnRate, [ 0, 1, 0 ] );
	    camera.moveTo( Math.sin( angle )*dist, 0, Math.cos( angle )*dist ) 
		
	    renderer.render();
    }, 17 );
    //
    window.addEventListener( 'resize', function() { renderer.resize( window.innerWidth, window.innerHeight ) } ); 
    renderer.resize( window.innerWidth, window.innerHeight );
}() );
