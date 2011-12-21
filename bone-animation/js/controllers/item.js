define( [ 'require', 'libs/events', 'framework/network/client', 'models/item', 'controllers/user', 'views/hud/merchant', 'views/hud/inventory' ], function( require, events, network, ItemModel, userController, merchantView, inventoryView ) {
    var items = {};
    var itemtypes = {};
    var typeWaiting = {};

    var itemController = Object.create( events.EventEmitter );

    itemController.init = function() {
        network.item.on( 'bought', itemController.create );
        network.item.on( 'init', function( message ) {
            userController.getPlayer( populateUserItems.bind( this, message.items ) );
        } );
        network.item.on( 'new', function( message ) {
            console.log( 'new item' );
            var item = itemController.create( message );
            player.items.push( item );
        } );
    };

    itemController.buy = function( item, buyer, callback ) {
        if ( !( buyer.gold > item.price ) ) {
            return alert( 'not enough money' );
        }
        network.item.buy( item.id, item.price, callback );
    };

    itemController.create = function( data ) {
        var item = new ItemModel( data ); 

        item.on( 'offer', function( price ) {
            network.item.offer( item.id, item.price ); 
        } );

        item.on( 'stopOffering', function() {
            network.item.stopOffering( item.id );
        } );

        items[ item.id ] = item;

        if ( data.typeid && !data.type ) {
            itemController.getType( data.typeid, function( type ) {
                if ( !type ) {
                    // avoid infinite recursion
                    console.log( 'could not get item type' );
                    console.log( data );
                    return;
                }
                item.type = type;
                setTimeout( function() {
                    item.emit( 'ready' );
                    itemController.emit( 'new', item );
                }, 0 );
            } );
        }

        return item;
    };

    itemController.get = function( id ) {
        return items[ id ];
    };

    itemController.getType = function( typeid, callback ) {
        if ( typeid in itemtypes ) {
            console.log( 'found type' );
            console.log( itemtypes[ typeid ] );
            console.log( itemtypes );
            return callback( itemtypes[ typeid ] );
        }
        else if ( typeid in typeWaiting ) {
            typeWaiting[ typeid ].push( callback );
            return;
        }
        else {
            typeWaiting[ typeid ] = [ callback ];
            network.itemtype.get( [ typeid ], function( message ) {
                console.log( 'got message' );
                console.log( message );
                console.log( message.types[ 0 ] );
                itemtypes[ typeid ] = message.types[ 0 ];
                for ( var i in message.types ) {
                    var type = message.types[ i ];
                    var typeid = type.id;
                    itemtypes[ typeid ] = type;
                    for ( var j in typeWaiting[ typeid ] ) {
                        var callback = typeWaiting[ typeid ][ j ];
                        callback( type );
                    }
                }
            } );
        }
    };
    
    itemController.getPricelist = function( userid, callback ) {
        network.item.pricelist( userid, function( data ) {
            callback( data.map( function( itemData ) {
                return itemController.create( itemData );
            } ) );
        } );
    };

    itemController.viewMerchant = function( id ) {
        itemController.getPricelist( id, function( items ) {
            events.all( items, 'ready', function() {
                merchantView.view( userController.get( id ), items );
            } );
        } );
    };

    var populateUserItems = function( items, user ) {
        for ( var x in items ) {
            var itemDesc = items[ x ];
            var item = itemController.create( itemDesc );
            user.takeItem( item );
        }
        events.all( user.items, 'ready', function() {
            inventoryView.populate( user.items );
        } );
    };

    return itemController;
} );
