define( [ 'libs/extender', 'libs/events' ], function( inherits, events ) {
    var ItemModel = function( data ) {
        this.id = data.id || null;
        this.typeid = data.typeid || null;
        this.ownerid = data.ownerid || 0;
        this.location = data.location || 'world';
        this.onsale = data.onsale || false;
        this.price = data.price || null;
        this.position = data.prosition || [ 0, 0, 0 ];        
        this.type = data.type || null;
    };

    inherits( ItemModel, events.EventEmitter ); 

    ItemModel.prototype.offer = function( price ) {
        this.price = price;
        this.onsale = true;

        this.emit( 'offer', this.price );
    };
        
    ItemModel.prototype.stopOffering = function() {
        this.onsale = false;

        this.emit( 'stopOffering' );
    };

    return ItemModel;
} );
