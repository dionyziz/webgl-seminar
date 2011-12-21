define( [ 'libs/events' ], function( events ) {
    var ChatModel = Object.create( events.EventEmitter );

    ChatModel.newMessage = function( message ) {
        this.emit( 'message', message );
    };

    return ChatModel;
} );
