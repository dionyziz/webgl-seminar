define( [ 'require', 'libs/events' ], function( require, events ) {
    var application = window.application = {};

    var loadedControllers = [];

    application.execute = function() {
        loadControllers( function() {
            if ( typeof application.init == 'function' ) {
                application.init();
            }

            initControllers();

            if ( typeof application.loop != 'function' ) {
                return;
            }

            setInterval( application.loop, 17 );
        } );
    };

    var loadControllers = function( callback ) {
        var w = Object.create( events.EventWaiter ); 

        for ( var i in application.controllers ) {
            var controllerName = application.controllers[ i ];
            require( [ 'controllers/' + controllerName ], w.callback( controllerName ) );
        }

        w.on( 'complete', callback );
    };

    var initControllers = function() {
        for ( i in application.controllers ) {
            var controllerName = application.controllers[ i ];
            var controller = require( 'controllers/' + controllerName );
            
            if ( typeof controller.init == 'function' ) {
                controller.init();
            }
        }
    };

    return application;
} );
