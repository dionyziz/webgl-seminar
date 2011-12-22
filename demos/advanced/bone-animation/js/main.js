require( [ 'framework/application', 'physics', 'graphics', 'models/scene', 'input' ], function( application, physics, graphics, scene, input, debugWidget, map ) {
    var renderer = new graphics.Renderer(),
        camera = new graphics.Camera( 0, 10, 50 ),
        universe = new physics.Universe();

    application.init = function() {
        // globals
        window.universe = universe;
        window.renderer = renderer;
        window.camera = camera;

        document.getElementById( 'content' ).appendChild( renderer.init() );
        renderer.useCamera( camera );

        window.requestAnimationFrame( renderer.render );
        (function renderLoop() {
            renderer.render();
            window.requestAnimationFrame( renderLoop );
        } )();
        input.init(); 
    };

    application.loop = function loop() {
        var speed = 1/60;
        universe._updateState( ( Date.now() - loop.lastCall ) * speed, scene.world );
        loop.lastCall = Date.now();
    };

    application.controllers = [ 'level', 'user', 'item', 'quest', 'transaction', 'chat' ];

    application.execute();
} );
