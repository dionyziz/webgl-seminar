define( function() {
    var widgetProto = $( '<div class="widget"><div class="body"/></div>' );

    var maxZ = 1;
    var widgetShortcuts = {};
    
    function makeWidget( element, opt ) {
        var pagewidth, pageheight, heightT, height, width;
        
        var widget = widgetProto.clone();
        
        defopts = {
            title: 'Widget Title',
            movable: true,
            position: {
                x: 0,
                y: 0,
            },
            center: false,
            margin: 2,
            snap: 5,
            border: 3,
            titlePadding: 4,
            resizable: true,
            modal: false,
            shortcut: false,
            onclose: function() {}
        }
        
        opt = $.extend( defopts, opt || {} );
        var margin = opt.margin, snap = opt.snap, border = opt.border, paddingT = opt.titlePadding;
        
        var title = $( '<h1>', { text: opt.title } );
        var body = widget.find( '.body' );
        widget.appendTo( '#content' ).prepend( title );
        body.append( element );
        
        for ( var pos = 0; pos <= 3; ++pos ) {
            widget.append( '<div class="resizehandle ' + [ 'tl', 'tr', 'bl', 'br' ][ pos ] + '" />' );
        }
        
        widget.onTop = function() {
            widget.css( 'z-index', maxZ++ );
        };
        
        if ( !opt.modal ) {
            widget.onTop();
        }
        else {
            widget.css( 'z-index', 50000 );
        }
        
        var close = $( '<div class="close">X</div>' ).appendTo( widget );
        var collapse = $( '<div class="collapse">_</div>' ).appendTo( widget );
        
        widget.collapseToggle = function() {
            body.slideToggle( function() {
                checkPosition();
                widget.forceRedraw( true );
                widget.toggleClass( 'collapsed' );
            } );
        };
        //widget.collapseToggle();
        
        heightT = widget.offset().top - widget.find( 'h1:first' ).offset().top; //Mumbo jumbo cause it's relatively positioned
        var offsetX = opt.position.x, offsetY = opt.position.y + heightT;
        
        
        function checkPosition() {
            pagewidth = $( 'body' ).width();
            pageheight = $( 'body' ).height();
            height = widget.height();
            width = widget.width();
            
            //Right
            if ( offsetX + width > pagewidth - snap - margin - border * 2 ) {
                offsetX = pagewidth - width - margin - border * 2;
            }
            //Left
            if ( offsetX < 0 + snap + margin ) {
                offsetX = 0 + margin;
            }
            
            //Bottom
            if ( offsetY + height > pageheight - snap - margin - border * 2 - paddingT ) {
                offsetY = pageheight - height - margin - border * 2 - paddingT;
            }
            //Top
            if ( offsetY - heightT < 0 + snap + margin - paddingT ) {
                offsetY = heightT + margin - paddingT;
            }
        };
        function updatePosition() {
            $( widget ).css( { left: offsetX + 'px', top: offsetY + 'px' } );
        };
        
        //On Top:
        widget.bind( 'mousedown.widget', function( e ) {
            widget.onTop();
        } );
        
        //Handle, Dragging functions
        title.bind( 'dragstart.widget selectstart.widget', function() { return false; } )
                .bind( 'mousedown.widget', function( e ) {
                    var startX = e.pageX, startY = e.pageY;
                    var startOffsetX = offsetX, startOffsetY = offsetY;
                    
                    $( 'html' ).bind( 'mousemove.widget', function( e ) {
                        offsetX = startOffsetX + e.pageX - startX;
                        offsetY = startOffsetY + e.pageY - startY;
                        
                        checkPosition();
                        updatePosition();
                    } )
                    .bind( 'mouseup.widget mouseleave.widget', function() {
                        $( 'html' ).unbind( 'mousemove.widget mouseup.widget mouseout.widget' );
                    } );
                } );
        //End of 'Handle+Dragging functions'
        
        //Close:
        close.bind( 'click.widget', widget.close = function() { widget.fadeOut(); opt.onclose(); } );
        
        
        //Collapse:
        collapse.bind( 'click.widget', widget.collapseToggle );
        
        title.dblclick( function( e ) {
            e.preventDefault();
            widget.collapseToggle();
        } );
        if ( opt.center ) {
            offsetY = Math.floor( ( $( 'html' ).height() - height ) / 2 );
            offsetX = Math.floor( ( $( 'html' ).width() - width ) / 2 );
            checkPosition();
        };
        updatePosition();

        if ( opt.shortcut ) {
            if ( opt.shortcut in widgetShortcuts ) {
                return console.log( 'double shortcut:' + opt.shortcut + '. ignoring.' );
            }
            widgetShortcuts[ opt.shortcut ] = function() {
                $( widget ).toggle();
            };
        }
        
        return widget;
    };

    var getShortcuts = function() {
        return widgetShortcuts;
    };
    
    function inputDialog( title, text, callback, onclose ) {
        var widgetDiv = $( '<div class="inputbox">' ).text( text || '' );
        var inputElem = $( '<input type="text">' ).appendTo( widgetDiv );
        
        var widgetObj = makeWidget( widgetDiv, { title: title, onclose: onclose } );
        
        var okButton = $( '<a href="">' ).addClass( 'button' ).text( 'Ok' ).click( function( e ) {
            e.preventDefault();
            if ( callback ) {
                if ( callback( inputElem.val() ) !== false ) {
                    widgetObj.close();
                }
            }
        } );
        var cancelButton = $( '<a href="">' ).addClass( 'button' ).text( 'Cancel' ).click( function( e ) {
            e.preventDefault();
            widgetObj.close();
            
            if ( onclose ) {
                onclose();
            }
        } );
        
        widgetDiv.append( okButton, cancelButton );
        
        return widgetObj;
    };
    
    function makeButton( caption, callback ) {
        if ( !callback ) {
            callback = function() {};
        }
        return $( '<a href="" class="button">' )
            .text( caption || '' )
            .click( function( e ) {
                e.preventDefault();
                if ( !$( this ).hasClass( 'disabled' ) ) {
                    callback();
                }
            } );
    }
    
    function messageBox( title, caption, callback ) {
        if ( !callback ) callback = function() {};
        
        var widgetDiv = $( '<div class="messagebox">' );
        var widgetObj = makeWidget( widgetDiv, { title: title, onclose: callback } );
        
        widgetDiv.text( caption || '' );
        
        widgetDiv.append( makeButton( 'Ok', widgetObj.close ) );
    }
    
    return { makeWidget: makeWidget, getShortcuts: getShortcuts, inputDialog: inputDialog, makeButton: makeButton, messageBox: messageBox };
} );
