define( function() {
    var mouseX = 0,
        mouseY = 0,
        mousePressed = false,
        mouseHandlers = {
            move : {},
            mousedown : {},
            mouseup : {},
            click : {}
        };

    return {
        init: function () {
            $( window ).load( function() {
                var wHeight = $( window ).height();
                var wWidth = $( window ).width();
                $( window ).mousemove( function( e ) {
                    mouseX = ( e.pageX - wWidth/2 )/( wWidth/2 );
                    mouseY = ( wHeight/2 - e.pageY )/( wHeight/2 );
                    if ( typeof mouseHandlers.move === 'function' ) {
                        mouseHandlers.move();
                    }
                } );
                $( window ).mousedown( function() {
                        mousePressed = true;
                        if ( typeof mouseHandlers.mousedown === 'function' ) {
                            mouseHandlers.mousedown();
                        }
                    }
                );
                $( window ).mouseup( function() {
                        mousePressed = false;
                        if ( typeof mouseHandlers.mouseup === 'function' ) {
                            mouseHandlers.mouseup();
                        }
                    }
                );
                $( window ).click( function() {
                        mousePressed = true;
                        if ( typeof mouseHandlers.click === 'function' ) {
                            mouseHandlers.click();
                        }				
                    }
                );
            } );
        },
        mousemove: function( callback ) {
            mouseHandlers.move = callback; 
        },
        unregisterMousemove: function() {
            delete( mouseHandlers.move );
        },
        click: function( callback ) {
            mouseHandlers.click = callback;
        },
        unregisterClick: function() {
            delete( mouseHandlers.click );
        },
        mousedown: function( callback ) {
            mouseHandlers.mousedown = callback;
        },
        unregisterMousedown: function() {
            delete( mouseHandlers.mousedown );
        },
        mouseup: function( callback ) {
            mouseHandlers.mouseup = callback;
        },
        unregisterMouseup: function() {
            delete( mouseHandlers.mouseup );
        }
    };
} );
