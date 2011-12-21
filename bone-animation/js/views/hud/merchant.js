define( [ 'require', './widget', 'controllers/item' ], function( require, widget, itemController ) {
    return {
        view: function( user, items ) {
            var self = this;
            if ( !itemController ) {
                return require( [ 'controllers/item' ], function( controller ) {
                    console.log( 'loaded itemcontroller' );
                    itemController = controller;
                    self.view( user, items );
                } );
            }

            var merchantElement = $(
                '<div class="widget-merchant" id="merchant' + user.id + '">' + 
                    '<ul></ul>' +
                '</div>'
            );
            widget.makeWidget( merchantElement, { title: 'Merchant ' + user.username } );
            for ( var i in items ) {
                var item = items[ i ];
                var buyButton = $( '<button />' ).text( 'buy' );
                var itemElement = $( '<li />' ).text( item.type.name + ': ' + item.price ).append( buyButton ).attr( 'itemid', i );
                buyButton.click( function() {
                    var itemElement = $( this ).parent();
                    var item = items[ itemElement.attr( 'itemid' ) ];
                    itemController.buy( item, player, function() {
                        itemElement.remove();
                    } );
                } );
                merchantElement.find( 'ul' ).append( itemElement );
            }
        }
    };
} );
