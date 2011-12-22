define( [ 'require', 'libs/events' ], function( require, events ) {
    var managerNames = [ 'user', 'chat', 'quest', 'item', 'itemtype', 'transaction' ];

    var NetworkManager = Object.create( events.EventEmitter );

    NetworkManager.init = function( name ) {
        this._client = null;
        this._name = name;
        this._lastMessage = null;
    };

    NetworkManager.setClient = function( client ) {
        this._client = client;
    };

    NetworkManager.receive = function( type, callback, errorcb, filter ) {
        if ( typeof callback != "function" ) {
            return;
        }
        var removed = false;

        if ( errorcb ) {
            errorcb = errorcb.bind( this, this._lastMessage );
        }
        var that = this;
        var timeout = setTimeout( function() {
            // alert( 'never ' + type );
            if ( errorcb ) {
                errorcb();
            }
            if ( !removed ) {
                that.removeListener( type, cb );
            }
        }, 1000 );
        var cb = function( message ) { 
            // alert( 'some time' );
            clearTimeout( timeout );
            if ( typeof filter == 'function' && !filter( message ) ) {
                console.log( 'filter failed' );
                console.log( message );
                return;
            }
            callback( message );
            this.removeListener( type, cb );
            removed = true;
        };
        this.on( type, cb );
    };

    NetworkManager.send = function( type, message ) {
        if ( !this._client.connected() && network.available() ) {
            console.log( 'sending network message before connection. aborting.' );
            return;
        }
        if ( type == 'login' ) {
            console.log( 'logging in' );
        }
        this._client.send( this._name, type, message );
        this._lastMessage = message;
    };

    var managers = {};
    for ( var i in managerNames ) {
        var name = managerNames[ i ];
        managers[ name ] = Object.create( NetworkManager );
        managers[ name ].init( name );

        require( [ 'network/' + name ], function( methods ) {
            for ( var j in methods ) {
                managers[ this ][ j ] = methods[ j ];
            }
        }.bind( name ) );
    }

    var network = Object.create( events.EventEmitter );

    network.init = function() {
        if ( typeof io == 'undefined' ) {
            console.log( 'no global io object found. assuming this is a node client' );
            io = require( 'socket.io-node-client' ).io;
            console.log( 'io' );
            console.log( io );
            settings = global.settings;
            this._socket = new io.Socket( settings.network.host, settings.network.port );
        }
        else {
            this._socket = new io.Socket( settings.network.host, {
                port: settings.network.port
            } );
        }

        for ( var i in managers ) {
            this[ i ] = Object.create( managers[ i ] );
            this[ i ].setClient( this );
        }
    };

    network.available = function() {
        return settings.network.enabled;
    };

    network.connect = function( callback ) {
        if ( typeof io == 'undefined' ) {
            require( [ 'io-client/io-client' ], function( client ) {
                io = client.io;
                network.connect();
            } );
            return;
        }

        var that = this;

        this._socket.on( 'connect', function() { 
            console.log( 'connected' );
            that._socket.connected = true;
            that.emit( 'connect' );
            if ( typeof callback == 'function' ) {
                callback();
            }
        } );

        this._socket.on( 'disconnect', function() {
            console.log( 'disconnected' );
            // this.connect();
        } );

        this._socket.on( 'message', this._onMessage.bind( this ) );

        console.log( 'trying to connect' );
        this._socket.connect();
    };

    network.send = function( controller, type, message ) {
        if ( this._socket === null || !this._socket.connected ) {
            return false;
        }
        if ( !( message instanceof Object ) ) {
            message = {};
        }

        // metadata
        message.controller = controller;
        message.type = type; 
        
        this._socket.send( message );
    };

    network.ping = function() {
        console.log( 'sending ping' );
        network.send( '', 'ping', {} );
    };

    network.connected = function() {
        return this._socket.connected;
    };

    network._onMessage = function( message ) {
        if ( !message.type ) {
            console.log( 'no network message type defined' );
            console.log( message );
            return;
        }

        if ( message.type != 'move' ) {
            console.log( "new message " + message.controller + ":" + message.type );
        }
        //console.log( message );
        
        if ( message.type == 'pong' ) {
            this.emit( 'pong' );
            return;
        }

        if ( !( message.controller in this ) ) {
            console.log( 'no ' + message.controller + ' controller' );
            return;
        }

        this[ message.controller ].emit( message.type, message );
    };

    network.init();

    return network;
} );
