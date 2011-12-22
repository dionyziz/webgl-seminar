var debug = {
    fps: 0,
    netIn: 0,
    netOut: 0
};

debug.panel = {
    context: null,
    graphs: {
        fps: null,
        netIn: null,
        netOut: null,
        update: function() {
            document.title = debug.fps;
            debug.panel.graphs.fps.updateData( debug.fps );
            debug.panel.graphs.netIn.updateData( debug.netIn );
            debug.panel.graphs.netOut.updateData( debug.netOut );
            debug.fps = 0;
            debug.netIn = 0;
            debug.netOut = 0;
        }
    },
    player: {
        context: null,
        init: function() {
            var context = debug.panel.player.context = document.createElement( 'div' );
            var span = document.createElement( 'span' );
            $( span ).appendTo( context );
            context.setAttribute( 'style', [
                'color: white',
                'font-size: 6pt',
                'font-weight: bold',
                'padding: 0, 4px',
                'background: black' ].join( ';' ) );
            debug.panel.player.update();
            player.on( 'move', debug.panel.player.update );
            return context;
        },
        update: function() {
            var text;
            if ( !player.entity ) {
                text = 'not logged in';
            }
            else {
                text = [
                    'x:', Math.floor( player.entity.position[ 0 ] * 100 ) / 100,
                    'y:', Math.floor( player.entity.position[ 1 ] * 100 ) / 100,
                    'z:', Math.floor( player.entity.position[ 2 ] * 100 ) / 100
                    ].join( ' ' );
            }
            var span = $( debug.panel.player.context ).find( 'span' ).get( 0 );
            $( span ).text( text );
            $( span ).forceRedraw();
            //span.style.webkitTransform = 'scale(1)';
        }
    },
    init: function() {
        input.registerHandler( input.KEY_P, function() { debug.panel.toggle(); } );
        
        var context = debug.panel.context = document.createElement( 'div' );
        $( context ).css( { position: 'absolute',
                            right: 0,
                            top: 0 } )
                    .hide()
                    .appendTo( main.context );
                    
        debug.panel.graphs.fps = new SimpleGraph( 30, 120, 60, 'fps: ', 'blue' );
        debug.panel.graphs.fps.appendTo( context );
        debug.panel.graphs.netIn = new SimpleGraph( 30, 120, false, 'net in: ', 'orange' );
        debug.panel.graphs.netIn.appendTo( context );
        debug.panel.graphs.netOut = new SimpleGraph( 30, 120, false, 'net out: ', '#800' );
        debug.panel.graphs.netOut.appendTo( context );
        
        $( debug.panel.player.init() ).prependTo( context );
        
        setInterval( debug.panel.graphs.update, 1000 );
    },
    show: function() {
        $( debug.panel.context ).show();
        this.visible = true;
    },
    hide: function() {
        $( debug.panel.context ).hide();
        this.visible = false;
    },
    visible: false,
    toggle: function() {
        
        if ( !this.visible ) {
            this.show();
        }
        else {
            this.hide();
        }
    }
};
