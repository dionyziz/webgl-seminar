define( [ './widget' ], function( widget ) {
    var inventoryElement;
    return {
        init: function() {
            inventoryElement = $(
                '<div class="widget-merchant" id="inventory-' + player.id + '"><ul></ul>' +
                '</div>'
            );
            return inventoryElement;
        },
        populate: function( items ) {
            if ( !inventoryElement ) { // FIX THIS PROPERLY
                this.init();
            }
            inventoryElement.find( 'ul' ).append( '<li class="gold">Gold: ' + player.gold + '</li>' );
            for ( var i in items ) {
                var item = items[ i ];
                inventoryElement.find( 'ul' ).append( '<li id="' + item.id + '">' + item.type.class + ' ' + item.type.name + '</li>' );
            }
            player.on( 'takeItem', function( item ) {
                inventoryElement.find( 'ul' ).append( '<li id="' + item.id + '">' + item.type.class + ' ' + item.type.name + '</li>' );
            } );
        }
    };
} );
