define( function() {
    var enable = [],
        handle = [],
        keyPressed = [],
        userHandlers = {
            repeat: {},
            once: {},
            delay: {},
            up: {}
        };

    function handlerOnce( key ) {
        if ( typeof userHandlers.once[ key ] !== 'undefined' ) {
            userHandlers.once[ key ]();
        }
    };
    function handlerRepeat( key ) {
        if ( keyPressed[ key ] === true ) {
            userHandlers.repeat[ key ]();
        }
        else {
            clearInterval( handle[ key ] );
        }
    };

    return {
        keys: {
            'LEFT_ARROW': 37,
            'UP_ARROW': 38,
            'RIGHT_ARROW': 39,
            'DOWN_ARROW': 40,
            'SPACE': 32
        },
        init: function () {
            for ( var i = 65; i<91; i++ ) {        
                var c = String.fromCharCode( i );
                this.keys[ c ] = i;
            }
            window.onkeydown = function ( e ) {
                if ( keyPressed[ e.keyCode ] ) {
                    return;
                }
                keyPressed[ e.keyCode ] = true;
                handlerOnce( e.keyCode );
                if ( typeof userHandlers.repeat[ e.keyCode ] !== 'undefined' ) {
                    handlerRepeat( e.keyCode );
                    clearInterval( handle[ e.keyCode ] );
                    clearTimeout( enable[ e.keyCode ] );
                    enable[ e.keyCode ] = setTimeout( function () {
                        handle[ e.keyCode ] = setInterval( 
                            function() { handlerRepeat( e.keyCode ); }, 30 
                        );
                    }, userHandlers.delay[ e.keyCode ] );
                }

            };		
            window.onkeyup = function ( e ) {
                if ( typeof userHandlers.up[ e.keyCode ] === 'function' ) {
                    userHandlers.up[ e.keyCode ]();
                }
                keyPressed[ e.keyCode ] = false;
            };
        },
        registerHandler: function ( key, callback, repeat, delay ) {
            //console.log( arguments );//wtf?
            if ( repeat ) {
                userHandlers.repeat[ key ] = callback;
                userHandlers.delay[ key ] = delay;
            }
            else {
                userHandlers.once[ key ] = callback;
            }
        },
        unregisterHandler: function( key, repeat ) {
            if ( repeat ) {
                delete( userHandlers.repeat[ key ] );
            }
            else {
                delete( userHandlers.once[ key ] );
            }
        },
        registerKeyupHandler: function( key, callback ) {
            userHandlers.up[ key ] = callback;
        },
        unregisterKeyupHandler: function( key, callback ) {
            delete( userHandlers.up[ key ] );
        }
    };
} );
