( function() {
    var DIST = 13;
    var SPEED = 1.5;
    var FRAME_TIME = 0;
    var DIST_ERROR = 0.1;

    var dian3 = require( 'js/libs/math' ).dian3;
    var Camera = require( 'graphics' ).Camera;
    
    var camera = new Camera();
    camera.position = [ 0, 0, 0 ];
    camera.rotation = 0;
    camera.update = function( duration ) {
        if ( typeof duration === "undefined" ) {
            duration = 0.1;
        }
        if ( duration > 1 ) {
            duration = 1;
        }
        if ( duration < 0.00001 ) {
            duration = 0.1;
        }
        FRAME_TIME = duration;

        var corpos, maxdiff;

        var player = require( 'js/controllers/player' );
        player.position = player.entity.physical.getPosition();
        player.rotation = player.entity.physical.getRotation();

        corpos = [ player.position[0] + DIST*Math.sin( player.rotation ), player.position[1] + 8, player.position[2] + DIST *Math.cos( player.rotation )  ];
        
        //console.log( time );
        camera.position = dian3.add( dian3.scale( dian3.subtract( corpos, camera.position ), SPEED*FRAME_TIME ), camera.position );
        camera.rotation = player.rotation;
        //camera.position = corpos;
        
        maxdiff = 0;
        for ( var i = 0; i < 3; i++ ) {
            maxdiff = Math.max( Math.abs( corpos[i] - camera.position[i] ), maxdiff );
        }
        if ( maxdiff < DIST_ERROR ) { // no need to move
            return;
        }
        
        //console.log( camera.position, duration );
        
        camera.moveTo( camera.position[ 0 ], camera.position[ 1 ], camera.position[ 2 ] );
        camera.lookAt( player.position[0], player.position[1] + 8, player.position[2] );
        // camera.setRotation( 0, player.rotation, 0 );
        //camera.rotateX( -0.2 );
    };
    camera.active();
    camera.move( 0, 1000, 0 );
    exports.camera = camera;
} )();
