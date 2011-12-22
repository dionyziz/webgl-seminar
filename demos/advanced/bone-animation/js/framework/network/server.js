define( [ 'require', 'libs/events', 'server/network/transaction', 'server/network/user', 'server/network/item', 'server/network/itemtype', 'server/network/quest', 'server/network/chat' ], function( require, events, transaction, user, item, itemtype, quest, chat ) {
    var http = require( 'http' ),
        io = require( 'socket.io' ),
        clients = {},
        socket = null,
        managers = {
            transaction: transaction, 
            user: user, 
            item: item, 
            itemtype: itemtype,
            quest: quest, 
            chat: chat
        };

    var network = Object.create( events.EventEmitter );

    network.available = function() {
        return settings.network.enabled;
    }

    network.listen = function( port, host ) {
        var webserver = http.createServer( function( req, res ) {} );
        webserver.listen( port, host );

        socket = io.listen( webserver );
        var server = this;
        console.log( 'ready for listening' );
        socket.on( 'connection', function( client ) {
            clients[ client.sessionId ] = client;
            console.log( 'got connection' );
            // server.emit( 'connect', client );
            client.on( 'message', function( message ) {
                onMessage( client, message ) 
            } );
            client.on( 'disconnect', function() {
                console.log( 'disconnected' );
                server.emit( 'disconnect', client );
                // delete server.clients[ client.sessionId ];
            } );
        } );
    }

    function onMessage( client, message ) {
        console.log( 'got message' );
        if ( !message.type ) {
            console.log( 'no network message type defined' );
            console.log( message );
            return;
        }
        console.log( "new message " + message.controller + ":" + message.type );
        //console.log( message );
        if ( message.type == 'ping' ) {
            console.log( 'sending pong' );
            client.send( { type: 'pong' } );
            return;
        }

        if ( !( message.controller in network ) ) {
            console.log( 'no ' + message.controller + ' controller' );
            return;
        }

        network[ message.controller ].emit( message.type, message, client );
    }

    for ( var name in managers ) {
        var methods = managers[ name ];
        var manager = Object.create( events.EventEmitter );

        for ( var j in methods ) {
            manager[ j ] = methods[ j ];
        }
        network[ name ] = manager;
    }

    return network;
} );
