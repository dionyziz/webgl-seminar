require( [ 'graphics', 'models/mesh' ], function( graphics, Mesh ) {
    var Camera = graphics.Camera;
    var Renderer = graphics.Renderer;
    var utils = graphics.utils;

    var SIZE = 128;

    renderer = new Renderer();
    document.body.appendChild( renderer.init(  $( window ).width(), $( window ).height() ) );
    $( window ).resize( function() {
        renderer.resize( $( window ).width(), $( window ).height() );
    } );

    renderer.gl.enable( renderer.gl.DEPTH_TEST );
    renderer.gl.disable( renderer.gl.CULL_FACE );

    if ( !renderer.gl.getExtension("OES_texture_float" ) ) {
        alert( 'Your WebGL implementation does not support "OES_texture_float" extension' );
    }
    if ( !renderer.gl.getParameter( renderer.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ) ) {
        alert( 'Your WebGL implementation does not support texture fetching in vertex shader' );
    }

    function makeFloatTexture( data ) {
        var ret = renderer.gl.createTexture();
        renderer.gl.bindTexture( renderer.gl.TEXTURE_2D, ret );
        renderer.gl.texParameteri( renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_WRAP_S, renderer.gl.CLAMP_TO_EDGE );
        renderer.gl.texParameteri( renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_WRAP_T, renderer.gl.CLAMP_TO_EDGE );
        renderer.gl.texParameteri( renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_MAG_FILTER, renderer.gl.NEAREST );
        renderer.gl.texParameteri( renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_MIN_FILTER, renderer.gl.NEAREST );
        renderer.gl.texImage2D( renderer.gl.TEXTURE_2D, 0, renderer.gl.RGB, SIZE, SIZE, 0, renderer.gl.RGB, renderer.gl.FLOAT, data );
        renderer.gl.bindTexture( renderer.gl.TEXTURE_2D, null );
        return ret;
    }

    /* calculate positions texture data */
    var pos = new Float32Array( SIZE * SIZE * 3 );
    for ( j = 0; j < SIZE; j++ ) {
        for ( i = 0; i < SIZE; i++ ) {
            var a = ( i + j * SIZE ) * 3;
            pos[ a ] =  4 * i / SIZE - 2;
            pos[ a + 1 ] = 1 + 0.01 * Math.sin( i * j / 5 );
            pos[ a + 2 ] = 4 * j / SIZE - 2;
        }
    }
    positions = makeFloatTexture( pos );

    /* calculate speeds texture data */ 
    for ( j = 0; j < SIZE; j++ ) {
        for ( i = 0; i < SIZE; i++ ) {
            var a = ( i + j * SIZE ) * 3;
            pos[ a ] = 0;
            pos[ a + 1 ] = 0;
            pos[ a + 2 ] = 0;
        }
    }
    speeds = makeFloatTexture( pos );

    /* calculate normal texture data */
    for ( j = 0; j < SIZE; j++ ) {
        for ( i = 0; i < SIZE; i++ ) {
            var a = ( i + j * SIZE ) * 3;
            pos[ a ] = 0;
            pos[ a + 1 ] = 1;
            pos[ a + 2 ] = 0;
        }
    }

    normals = makeFloatTexture( pos );

    var positions_shader = renderer.createMaterial( 'positions' );
    var speeds_shader = renderer.createMaterial( 'speeds' );
    speeds_shader.set( 'v3wind', [ 0.5, -0.2, 0.3 ] );
    var normals_shader = renderer.createMaterial( 'normals' );

    speeds_shader.inputs.s2speeds = { value: speeds };
    speeds_shader.inputs.s2positions = { value: positions };
    speeds_shader.inputs.s2normals = { value: normals };

    positions_shader.inputs.s2speeds = { value: speeds };
    positions_shader.inputs.s2positions = { value: positions };

    normals_shader.inputs.s2positions = { value: positions };

    function setUpMaterials() {
        speeds_shader.inputs.s2speeds.value = speeds;
        speeds_shader.inputs.s2positions.value = positions;
        speeds_shader.inputs.s2normals.value = normals;

        positions_shader.inputs.s2speeds.value = speeds;
        positions_shader.inputs.s2positions.value = positions;

        normals_shader.inputs.s2positions.value = positions;
        
        clothMat.inputs.s2positions.value = positions;
        clothMat.inputs.s2normals.value = normals;
    }

    var clothMat = renderer.createMaterial( 'cloth' );
    clothMat.set( 's2flag', 'cloth.jpg' );
    clothMat.inputs.s2positions = { value: positions };
    clothMat.inputs.s2normals = { value: normals };

    //Not used, position will fetched from the positions texture

    var cut = 2;
    var indices = [];
    for( var j = 0; j < SIZE - 2 * cut - 1; j++ ) {
        for ( var i = 0; i < SIZE - 2 * cut - 1; i++ ) {
            var a = i + j * ( SIZE - 2 * cut );
            indices.push( a, a + 1 + SIZE - 2 * cut, a + 1 );
            indices.push( a, a + SIZE - 2 * cut, a + 1 + SIZE - 2 * cut );
        }
    }

    var vertices = [];
    for ( j = cut; j < SIZE - cut; j++ ) {
        for ( i = cut; i < SIZE - cut; i++ ) {
            var a = ( i - cut + ( j - cut ) * ( SIZE - 2 * cut ) ) * 3;
            vertices[ a ] = i / SIZE;
            vertices[ a + 1 ] = 1 - j / SIZE;
            vertices[ a + 2 ] = 0;
        }
    }

    var uvcoords = new Float32Array( ( SIZE - 2 ) * ( SIZE - 2 ) * 2 ); 
    for ( j = cut; j < SIZE - cut; j++ ) {
        for ( i = cut; i < SIZE - cut; i++ ) {
            var a = ( i - cut + ( j - cut ) * ( SIZE - 2 * cut ) ) * 2;
            uvcoords[ a ] = i / SIZE;
            uvcoords[ a + 1 ] = 1 - j / SIZE;
        }
    }

    var flagMesh = new Mesh( vertices, indices );
    var flagDrawable = renderer.createDrawable( { mesh: flagMesh, uvcoords: uvcoords, material: clothMat } ).show();

    var square = {
        vertices: [ 
            0, 0, 0, 
            0, 1, 0, 
            1, 1, 0,
            1, 0, 0
        ],
        indices: [
            0, 2, 1,
            0, 3, 2
        ],
        uvcoords: [
            0, 0,
            0, 1,
            1, 1,
            1, 0
        ]
    }

    var squareMesh = new Mesh( square.vertices, square.indices );
    var squareDrawable = renderer.createDrawable( { mesh: squareMesh, uvcoords: square.uvcoords, material: speeds_shader } );

    var fb = renderer.gl.createFramebuffer();
    var temp = makeFloatTexture( null );

    renderer.gl.bindFramebuffer( renderer.gl.FRAMEBUFFER, fb );
    renderer.gl.bindTexture( renderer.gl.TEXTURE_2D, temp );
    renderer.gl.framebufferTexture2D( renderer.gl.FRAMEBUFFER, renderer.gl.COLOR_ATTACHMENT0, renderer.gl.TEXTURE_2D, temp, 0 );

    renderer.gl.bindFramebuffer( renderer.gl.FRAMEBUFFER, null );

    var orthoCamera = new Camera();
    orthoCamera.perspectiveMatrix = mat4.ortho( 0, 1, 0, 1, -1, 1 );

    function renderToTexture( result, name ) {
        renderer.gl.bindFramebuffer( renderer.gl.FRAMEBUFFER, fb );
        renderer.gl.framebufferTexture2D( renderer.gl.FRAMEBUFFER, renderer.gl.COLOR_ATTACHMENT0, renderer.gl.TEXTURE_2D, temp, 0 );
        renderer.gl.viewport( 0, 0, SIZE, SIZE );
        renderer.gl.useProgram( squareDrawable.material.shader.program );
        renderer.activeCamera = orthoCamera;
        renderer.gl.clear( renderer.gl.COLOR_BUFFER_BIT | renderer.gl.DEPTH_BUFFER_BIT );
        squareDrawable.render();
        renderer.gl.framebufferTexture2D( renderer.gl.FRAMEBUFFER, renderer.gl.COLOR_ATTACHMENT0, renderer.gl.TEXTURE_2D, null, 0 );
        renderer.gl.bindFramebuffer( renderer.gl.FRAMEBUFFER, null );
        window[ name ] = temp;
        temp = result;
        setUpMaterials();
    }

    function tick() {
        squareDrawable.material = speeds_shader;
        renderToTexture( speeds, 'speeds' );
        squareDrawable.material = positions_shader;
        renderToTexture( positions, 'positions' );
        squareDrawable.material = normals_shader;
        renderToTexture( normals, 'normals' );
    }

    var SPACE = 32,
        LEFT_ARROW = 37,
        UP_ARROW = 38,
        RIGHT_ARROW = 39,
        DOWN_ARROW = 40;

    var angularVelocity = 0.01;
    var hAngle = 0;    
    var horizontalRotation = 0;
    var verticalRotation = 0;

    $( window ).keydown( function( e ) {
        switch( e.which ) {
            case LEFT_ARROW:
                horizontalRotation = 1;
                break;
            case UP_ARROW:
                verticalRotation = 1;
                break;
            case RIGHT_ARROW:
                horizontalRotation = -1;
                break;
            case DOWN_ARROW:
                verticalRotation = -1;
                break;
            case SPACE:
                speeds_shader.set( 'v3wind', [ 0, 1.5, 0 ] );
                break;
        }
    } );

    $( window ).keyup( function( e ) {
        switch( e.which ) {
            case LEFT_ARROW:
                horizontalRotation = 0;
                break;
            case UP_ARROW:
                verticalRotation = 0;
                break;
            case RIGHT_ARROW:
                horizontalRotation = 0;
                break;
            case DOWN_ARROW:
                verticalRotation = 0;
                break;
            case SPACE:
                speeds_shader.set( 'v3wind', [ 0.5, -0.2, 0.3 ] );
                break;
        }
    } );

    var cam = new Camera();
    cam.moveTo( 0, 0, 5 );
    cam.rotate( -0.2, [ 0, 1, 0 ], true );

    var mat = renderer.createMaterial( 'textured' );
    mat.set( 's2texture', 'marble1.jpg' );

    var mat2 = renderer.createMaterial( 'textured' );
    mat2.set( 's2texture', 'marble2.jpg' );

    var sph1 = utils.makeSphere( 0.7, 0.05 );
    sph1 = new Mesh( sph1.vertices, sph1.indices );
    sph1 = renderer.createDrawable( { 
        mesh: sph1, 
        normals: utils.genNormals( sph1.vertices, sph1.indices ), 
        uvcoords: utils.genSphericalUVCoords( sph1.vertices ), material: mat } ).show();
    sph1.moveTo( -0.7,0.0,-0.8 );

    var sph2 = utils.makeSphere( 0.5, 0.05 );
    sph2 = new Mesh( sph2.vertices, sph2.indices );
    sph2 = renderer.createDrawable( { 
        mesh: sph2, 
        normals: utils.genNormals( sph2.vertices, sph2.indices ), 
        uvcoords: utils.genSphericalUVCoords( sph2.vertices ), material: mat2 } ).show();
    sph2.moveTo( 0.4, 0.0, 0.5 );


    setTimeout( function() {
        setInterval( function() {
            tick();
            tick();
            tick();
            tick();
            tick();
            //Dont fuck with this, black magic
            //renderer.gl.getParameter( renderer.gl.DEPTH_CLEAR_VALUE );
            
            renderer.useCamera( cam );
            if( horizontalRotation ) {
                cam.rotate( angularVelocity * horizontalRotation, [ 0, 1, 0 ], true );
            }
            if( verticalRotation ) {
                cam.rotate( angularVelocity * verticalRotation, [ 1, 0, 0 ] );
            }
            renderer.render();
        }, 17 );
    }, 3000 );
} );
