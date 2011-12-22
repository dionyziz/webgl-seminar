define( [ 'framework/network/client', 'controllers/user', 'models/chat', 'cs!views/chat' ], function( network, userController, ChatModel, chatView ) {
    return {
        init: function() {
            network.chat.on( 'message', function( data ) { 
                var roomid = 0;
                if ( data.channelType == 1 ) {
                    roomid = data.userid;
                }
                var user = userController.get( data.userid );
                chatView.appendMessage( roomid, user.id, user.username, data.message );
            } );
            chatView.init( this.sendMessage );
        },
        sendMessage: function( message, touserid ) {
            if ( !touserid ) {
                network.chat.sendAreaMessage( message );
            }
            else {
                network.chat.sendPrivateMessage( message, touserid );
            }
        }
    };
} );
