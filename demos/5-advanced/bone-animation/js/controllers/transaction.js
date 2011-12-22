define( [ 'libs/events', 'framework/network/client', 'models/transaction', 'controllers/user', 'controllers/item' ], function( events, network, TransactionModel, userController, itemController ) {

    var controller = Object.create( events.EventEmitter );
    var transactions = {};

    var createTransaction = function( data ) {
        var receiver, sender, userid;

        if ( 'receiverid' in data ) {
            userid = data.receiverid;
            receiver = userController.get( data.receiverid );
            sender = player;
        }
        else {
            userid = data.senderid;
            sender = userController.get( data.senderid );
            receiver = player;
        }

        if ( !sender || !receiver ) {
            console.log( sender );
            console.log( receiver );
            return console.log( '(createTransaction): unknown user ' + userid );
        }

        var transaction = new TransactionModel( data.transactionid );
        transactions[ transaction.id ] = transaction;
        transaction.addSender( sender );
        transaction.addUser( receiver );

        if ( sender == player ) {
            transaction.friendid = receiver.id;
            controller.emit( 'requestSent', transaction );
        }
        else {
            transaction.friendid = sender.id;
            controller.emit( 'request', transaction, sender );
        }
    };

    controller.init = function() {
        network.transaction.on( 'request', function( data ) {
            createTransaction( data );
            network.transaction.acceptRequest( data.transactionid );
        } );
        network.transaction.on( 'requestSent', createTransaction );
        network.transaction.on( 'requestResponse', function( data ) {
            console.log( 'got request response' );
            console.log( data );

            if ( !data.accepted ) {
                return controller.emit( 'cancelled', data.userid, data.transactionid );
            }

            controller.emit( 'start', data.transactionid, data.userid );
        } );
    };

    controller.start = function( userid, callback ) {
        network.transaction.request( userid, function( message ) {
            // by this time, the transaction should have been created by network.transaction.on( 'requestSent' )
            if ( typeof callback == 'function' ) {
                controller.get( message.id, callback );
            }
        } );
    };

    controller.give = function( transactionid, itemid ) {
        var transaction = transactions[ transactionid ]; 
        if ( !transaction ) {
            return console.log( '(transactionController.give): invalid transactionid: ' + transactionid );
        }
        var item = itemController.get( itemid );
        if ( !item ) {
            return console.log( '(transactionController.give): tried to give invalid item: ' + itemid );
        }
        transaction.giveItem( player.id, transaction.friendid, item );
        network.transaction.give( transaction.id, transaction.friendid, item.id );
    };

    controller.giveGold = function( transactionid, amount ) {
        var transaction = transactions[ transactionid ];
        if ( !transaction ) {
            return console.log( '(transactionController.give): invalid transactionid: ' + transactionid );
        }
        if ( amount > player.gold ) {
            return console.log( '(transactionController.igve): not enought gold: ' + amount + ' > ' + player.gold );
        }
        transaction.giveGold( player.id, transaction.friendid, amount );
        network.transaction.giveGold( transaction.id, transaction.friendid, amount );
    };

    controller.giveOne = function( userid, itemid, callback ) {
        this.start( userid, function( transaction ) {
            controller.give( transaction.id, itemid );
            controller.accept( transaction.id, true );
            callback( transaction );
        } );
    };

    controller.accept = function( transactionid, accept ) {
        var transaction = transactions[ transactionid ];
        transaction.accepts( transactionid, accept );
        network.transaction.accept( transactionid, accept );
    };

    controller.get = function( id, callback ) {
        if ( typeof callback == 'function' ) {
            if ( !( id in transactions ) ) {
                controller.on( 'request', function( transaction ) {
                    if ( transaction.id == id ) {
                        callback( transaction );  
                    }
                } );
                controller.on( 'requestSent', function( transaction ) {
                    if ( transaction.id == id ) {
                        callback( transaction );  
                    }
                } );
            }
            return callback( transactions[ id ] );
        }
        return transactions[ id ];
    };

    return controller;
} );
