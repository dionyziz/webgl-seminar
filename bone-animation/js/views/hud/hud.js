define( [ './chat', './widget', './quest', './debug', './privatechat' ], function( chatWidget, widget, questWidget, debugWidget, privateChatWidget ) {
    var init = function() {
        widget.makeWidget( chatWidget.init(), { title: 'Chat' } );
        widget.makeWidget( questWidget.init(), { title: 'Quests' } );
        widget.makeWidget( debugWidget.init(), { title: 'Debug' } );
        
        widget.makeWidget( privateChatWidget.init( renderer ), { title: 'Private Chat' } );
    };
    var toast = function( text ) {
        var toastDiv = document.createElement( 'div' );
        toastDiv.className = 'hud-toast widget';
        toastDiv.appendChild( document.createTextNode( text ) );
        $( toastDiv ).hide().appendTo( '#content' )
            .slideDown( 'slow', function() {
                setTimeout( function() {
                    $( this ).slideUp( 'slow' ).remove();
                }.bind( this ), 1500 );
            } );
        return toastDiv;
    };
    
    return { init: init, toast: toast, widget: widget };
} );
