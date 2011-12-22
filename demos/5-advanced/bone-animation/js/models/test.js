(  function() {
    var Transformable = require( 'js/models/transformable' ).Transformable;
    var Mesh = require( 'js/models/mesh' ).Mesh;
    var Entity = require( 'js/models/entity' ).Entity;
    var physics = require( 'js/models/physics/' );
    var dian3 = require( 'js/libs/math' ).dian3;
	var tetra = require( 'js/libs/math' ).tetra;

    
    //mesh tests
    var mesh = new Mesh();
    mesh.vertices = [ 0, 0, 0, 
                      0, 0, 2, 
                      0, 1, 0, 
                      1, 0, 0,
                      1, 1, 0,
                      1, 0, 2,
                      0, 1, 2,
                      1, 1, 2 ];
    mesh.indices = [ 0, 1, 2,
                     1, 6, 2,
                     0, 3, 1,
                     1, 3, 5,
                     1, 5, 6,
                     5, 7, 6,
                     2, 6, 4,
                     4, 6, 7,
                     2, 4, 3,
                     0, 2, 3,
                     3, 4, 5,
                     4, 7, 5 ];//a paralillepid
     mesh.setHullFromMesh();
    //
    
    //entity tests
    var ent = new Entity();//0
    ent.setMass( 1 );
    ent.mesh = mesh;
    //        
    
    //universe tests
    var uni = new physics.Universe();
    ent.moveTo( 0, 0, 0 );
    ent.velocity = [ 0.5, 0, 0 ];
    uni.addEntity( ent );
    if ( uni.entities.length !== 1 ) {
        alert( "ERROR : The universe has " + uni.entities.length + " entities instead of 1" );
    }
    var ent2 = new Entity();//1
    ent2.mesh = ent.mesh;
    ent2.moveTo( 5, 0, 0 );
    uni.addEntity( ent2 );
    //
       
    
    //TODO try scene groups
    var child1 = world.createElement();
    var child2 = world.createElement();
    child1.entity = ent;
    child2.entity = ent2;
    //ent2.velocity = [ -0.5, 0, 0 ];
    
    ent3 = new Entity();//2
    uni.addEntity( ent3 );
    ent3.setMass( 1 );
    ent3.moveTo( 0, 0, 0 );
    ent3.mesh = new Mesh();
    var group1 = world.createGroupElement();
    group1.entity = ent3;
    group1.appendChild( child1 );
    group1.appendChild( child2 );
    world.appendChild( group1 );
    ent3.mesh.setHullFromEntities( group1 );
    
    
    ent4 = new Entity();//3
    uni.addEntity( ent4 );
    ent4.setMass( 1 );
    ent4.moveTo( 0, 0, 0 );
    ent4.mesh = ent2.mesh;
    var child3 = world.createElement();
    child3.entity = ent4;
    world.appendChild( child3 );

    
    ent5 = new Entity();//4
    uni.addEntity( ent5 );
    ent5.setMass( 1 );
    ent5.moveTo( 0, 0, 0 );
    ent5.mesh = ent2.mesh;
    var child4 = world.createElement();
    child4.entity = ent5;
    world.appendChild( child4 );    
    
    node = [];
    node[ ent.id ] = child1;
    node[ ent2.id ] = child2;
    node[ ent3.id ] = group1;
    node[ ent4.id ] = child3;
    node[ ent5.id ] = child4;
    
    ent.moveTo( -3, 0, 0 );
    ent2.moveTo( -6, 0, 0 );
    ent3.mesh.setHullFromEntities( group1 );
    ent3.moveTo( -4, 2, 0 );
    ent4.moveTo( 2, 0, 0 );
    ent5.moveTo( -8, -6, 0 );

    
    ent.velocity = ent2.velocity = ent3.velocity = ent4.velocity = ent5.velocity = [ 0, 0, 0 ];
    
    ent4.velocity = [ -0.9, 0, 0 ];
    ent5.velocity = [ 0 , 0.6 , 0 ];
    ent3.velocity = [ -0.1,  0.1, 0 ];

    //ent2.velocity = [ 0.1, 0, 0 ];
    
    //ent.velocity = [ 0.9, 0, 0 ];
    //ent5.velocity = [ -0.1, 0, 0 ];
    //
	

	//initiate graphics!
	function plotScene( uni ) {
	    renderer = new Renderer();
	    document.body.appendChild( renderer.init( 400, 300 ) );
	    var shader = renderer.createShader( 'solid' );
	
	    var material = [];
	    material[ 0 ] = renderer.createMaterial( shader );//the materials
	    material[ 0 ].set( 'v4Color', [ 1, 1, 0.3, 0.4 ] );
	    material[ 0 ].transparent = true;
	
	    material[ 1 ] = renderer.createMaterial( shader );
	    material[ 1 ].set( 'v4Color', [ 0.2, 1, 0.5, 0.4 ] );
	    material[ 1 ].transparent = true;
        
        material[ 2 ] = renderer.createMaterial( shader );
	    material[ 2 ].set( 'v4Color', [ 0.9, 0.1, 0.5, 0.4 ] );
	    material[ 2 ].transparent = true;
	    
	    camera = renderer.activeCamera;
		camera.move( 0, 12, 250 );    
	    
	    var drawable = [];
	    var sphere = [];
	    var mesh = [];
	    for ( var x in uni.entities ) {
            drawable[ uni.entities[ x ].id  ] = renderer.createDrawable( { mesh: uni.entities[ x ].mesh, material: material[ ( x%3 ) ] } );
		    renderer.add( drawable[ uni.entities[ x ].id  ] );
		    
		    mesh[ x ] = new Mesh();
	        var item = renderer.utils.makeSphere( ( uni.entities[ x ].mesh.getBoundingSphere() )[ 1 ], 0.05 );
	        mesh[ x ].indices = item.indices;
	        mesh[ x ].vertices = item.vertices;
	        sphere[ uni.entities[ x ].id ] = []
	        sphere[ uni.entities[ x ].id ].drawable = renderer.createDrawable( { mesh: mesh[ x ], material: material[ x%3 ] } );
            console.log( mesh[ x ], material[ x%3 ], ( uni.entities[ x ].mesh.getBoundingSphere() )[ 1 ] );
	        //renderer.add( sphere[ uni.entities[ x ].id ].drawable );
	        sphere[ uni.entities[ x ].id ].initRadius = uni.entities[ x ].mesh.getBoundingSphere()[ 1 ];
	    }
	
			
		var angle = 0;
		var turnRate = 0.01;
		var dist = 20;
		var frameN = 0;		
		flag = false;
		setInterval( function() {
		    if ( flag === true  ) return;
		    //angle += turnRate;
		    //camera.rotate( turnRate, [ 0, 1, 0 ] );
		    camera.moveTo( Math.sin( angle )*dist, 2, Math.cos( angle )*dist );
		    //camera.rotateTo( -0.1, [ 1, 0, 0 ] );
		
            var pos = [];
            var orient = [];
            var newRadius;
            var center;
			
			for ( var x in uni.entities ) {
			    pos[ uni.entities[ x ].id ] = uni.entities[ x ].getAbsolutePosition( node[ uni.entities[ x ].id ] );
			    orient[ uni.entities[ x ].id ] = uni.entities[ x ].getAbsoluteOrientation( node[ uni.entities[ x ].id ] );
			    
			    if ( false && frameN < 1 )
			    console.log( uni.entities[ x ].id, pos[ uni.entities[ x ].id ], orient[ uni.entities[ x ].id ] );
			    	    
			    drawable[ uni.entities[ x ].id  ].moveTo( pos[ uni.entities[ x ].id ][ 0 ], pos[ uni.entities[ x ].id ][ 1 ], pos[ uni.entities[ x ].id ][ 2 ]);
			    drawable[ uni.entities[ x ].id  ].rotateToByQuart( orient[ uni.entities[ x ].id ] );
			    
			    newRadius = uni.entities[ x ].mesh.getBoundingSphere()[ 1 ];
			    center = uni.entities[ x ].mesh.getBoundingSphere()[ 0 ];
                sphere[ uni.entities[ x ].id ].drawable.scale( newRadius/sphere[ uni.entities[ x ].id ].initRadius );
			    sphere[ uni.entities[ x ].id ].drawable.moveTo( pos[ uni.entities[ x ].id ][ 0 ] + center[ 0 ] , pos[ uni.entities[ x ].id ][ 1 ] + center[ 1 ], pos[ uni.entities[ x ].id ][ 2 ] + center[ 2 ] );
	        }
	        
			uni._updateState( 0.05, world ); 
		
		    frameN++;
			renderer.render();
		}, 17 );
	    
	    window.addEventListener( 'resize', function() { renderer.resize( window.innerWidth, window.innerHeight ) } ); 
	    renderer.resize( window.innerWidth, window.innerHeight );
    };
    setTimeout( function() {
        plotScene( ent.universe );
    }, 1000 );
    //
    console.log( "All done!" );
} )();
