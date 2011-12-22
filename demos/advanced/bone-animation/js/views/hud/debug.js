define( [ 'require', 'views/hud/hud' ], function( require, hud ) {
    var init = function() {
        var widgetDiv = $( '<div class="debug">' );
        return widgetDiv;
    };

    var log = function( text ) {
        require( [ 'views/hud/hud' ], function( hud ) {
            hud.toast( text );
        } );
    };
    
    return { init: init, log: log };
} );