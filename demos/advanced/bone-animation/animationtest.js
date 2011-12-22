require( [ 'graphics', 'models/mesh' ], function( graphics, Mesh ) {
    window.graphics = graphics;
	renderer = new graphics.Renderer();
    
	document.body.appendChild( renderer.init( $( window ).width(), $( window ).height() ) );
	
    $( window ).resize( function () {
        renderer.resize( $( window ).width(), $( window ).height() );
    } );
    
	renderer.activeCamera.moveTo( 0, 1, 5 );
    renderer.gl.clearColor( 0, 0, 0, 1 );
    
    graphics.jsonLoader( 'resources/models/woman.json', renderer, function( woman ) {
        woman.show();
        woman.material.set( 's2texture' , 'resources/models/texture.jpg' );
        woman.skeleton.play( 'idle' );
        woman.material.set( 'v4Color', [ 1, 1, 1, 1 ] );
        var left, right, walk, run;
        $( window ).keydown( function( e ) {
            switch ( e.which ) {
                case 87:
                    if ( e.shiftKey ) {
                        woman.skeleton.play( 'run' );
                        run = true;
                    }
                    else {
                        woman.skeleton.play( 'walk' );
                        walk = true;
                    }
                    break;
                case 65:
                    left = true;
                    right = false;
                    break;
                case 68:
                    left = false;
                    right = true;
                    break;
            }
        } );
        $( window ).keyup( function( e ) {
            switch ( e.which ) {
                case 87:
                    woman.skeleton.play( 'idle' );
                    walk = false;
                    run = false;
                    break;
                case 65:
                    left = false;
                    break;
                case 68:
                    right = false;
                    break;
            }
        } );

        setInterval( function() {
            renderer.render();
            if ( left ) {
                woman.rotate( 0.03, [ 0, 1, 0 ] );
            }
            if ( right ) {
                woman.rotate( -0.03, [ 0, 1, 0 ] );
            }
            if ( walk ) {
                woman.move( 0, 0, 0.04 );
            }
            if ( run ) {
                woman.move( 0, 0, 0.08 );
            }
        }, 20 );
    } );
} );
