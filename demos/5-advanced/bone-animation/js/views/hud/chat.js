define( [ 'framework/network/client', 'controllers/chat', 'models/chat', 'controllers/user' ], function( network, chatController, ChatModel, userController ) {
    var init = function() {
        var chatElement = $(
            '<div id="widget-chat">' + 
                '<div id="chatscrollbox"><div id="chatmessages">' +
                '</div></div>' +
                '<form id="chatform">' +
                    '<input type="text"></input>' +
                    '<input type="submit"></input>' +
                '</form>' +
            '</div>'
        );
        function postMessage( text, username ) {
            //TODO: optimize #chatmessages, #chatscrollbox
            chatElement.find( '#chatmessages' ).append( $( '<div><span>' + username + '</span></div>'  ).append( document.createTextNode( text ) ) );
            $( '#chatscrollbox' ).data( 'jsp' ).reinitialise();
            //$( '#chatscrollbox' ).data( 'jsp' ).scrollToBottom( true );
        }
        $( '#chatscrollbox' ).jScrollPane();
        
        chatElement.find( 'form' ).bind( 'submit', function( e ) {
            var text = chatElement.find( 'input[type=text]' ).val();
            e.preventDefault();
            postMessage( text, 'You' );
            chatElement.find( 'input[type=text]' ).val( '' );
            network.chat.sendAreaMessage( text ); //TODO: chatController
            return false;
        } );
        
        ChatModel.on( 'message', function( message ) {
            var username, text;
            console.log( message );
            console.log( userController.getUsers() );
            username = userController.get( message.userid ).name;
            text = message.message;
            
            postMessage( text, username );
        } );
        
        //Private Messages
        
        network.user.on( 'move', function( message ) {
            var x = message.position[ 0 ];
            var z = message.position[ 2 ];

            userController.getPlayer( function( character ) {
                var dx = x - character.getPosition()[ 0 ];
                var dz = z - character.getPosition()[ 2 ];
                
                if ( Math.sqrt( dx * dx + dz * dz ) > 30 ) {
                    //alert( 'moved near you' );
                }
            } );
        } );
        
        return chatElement;
    };
    
    return { init: init };
} );
