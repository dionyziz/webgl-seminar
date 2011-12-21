define( [ 'libs/extender' ], function( extend ) {
    var TransactionModel = function( id ) {
        this.id = id;
        this.users = [];
        this.userCount = 0;
        this.pendingUsers = [];
        this.acceptedUsers = [];
        this.gives = {};
    };

    TransactionModel.prototype.addSender = function( sender ) {
        this.users[ sender.id ] = sender;
        this.gives[ sender.id ] = {};
        ++this.userCount;
    };

    TransactionModel.prototype.addUser = function( user ) {
        this.users[ user.id ] = user;
        this.gives[ user.id ] = {};
        ++this.userCount;
        this.pendingUsers.push( user.id );
    };

    TransactionModel.prototype.getUsers = function() {
        return this.users;
    };

    TransactionModel.prototype.giveItem = function( fromuserid, touserid, item ) {
        if ( !this.gives[ fromuserid ][ touserid ] ) {
            this.gives[ fromuserid ][ touserid ] = {};
        }
        this.gives[ fromuserid ][ touserid ][ item.id ] = item;
        this.acceptedUsers = [];
        console.log( 'given' );
        console.log( this.gives );
    };

    TransactionModel.prototype.removeItem = function( fromuserid, touserid, item ) {
        delete this.gives[ fromuserid ][ touserid ][ item.id ];
        this.acceptedUsers = [];
    };

    TransactionModel.prototype.giveGold = function( fromuserid, touserid, gold ) {
        if ( !this.gives[ fromuserid ][ touserid ] ) {
            this.gives[ fromuserid ][ touserid ] = {};
        }
        this.gives[ fromuserid ][ touserid ][ 'gold' ] = gold;
        this.acceptedUsers = [];
    };

    TransactionModel.prototype.removeGold = function( fromuserid, touserid, gold ) {
        this.gives[ fromuserid ][ touserid ][ 'gold' ] = 0;
        this.acceptedUsers = [];
    };

    /* Get the list of objects a user gives. First in the list is the amount of gold and the rest are items. */
    /* A special property toUserid is added to each item. */
    TransactionModel.prototype.userGives = function( userid ) {
        var ugives = [ 0 ];
        for ( var touserid in this.gives[ userid ] ) {
            for ( var id in this.gives[ userid ][ touserid ] ) {
                if ( id == 'gold' ) {
                    ugives[ 0 ] += this.gives[ userid ][ touserid ][ 'gold' ];
                }
                else {
                    ugives.push( id );
                }
            }
        }
    };

    /* Get the list of objects a user takes. First is the amount of gold and the rest are items. */
    TransactionModel.prototype.userTakes = function( userid ) {
        var utakes = [ 0 ];
        for ( var fromuserid in this.gives ) {
            if ( !( userid in this.gives[ fromuserid ] ) ) {
                continue;
            }
            for ( var id in this.gives[ fromuserid ][ userid ] ) {
                if ( id == 'gold' ) {
                    utakes[ 0 ] += this.gives[ fromuserid ][ userid ][ 'gold' ];
                }
                else {
                    utakes.push( id );
                }
            }
        }
        return utakes;
    };

    /* Set if this user accepts the transaction or not. 
     * If some user changes the items he gives, all players must accept the transaction again. */
    TransactionModel.prototype.accepts = function( userid, accepts ) {
        var i = this.acceptedUsers.indexOf( userid );
        console.log( 'index ' + i );
        if ( accepts && i == -1 ) {
            console.log( this.acceptedUsers );
            console.log( 'pushing ' + userid );
            return this.acceptedUsers.push( userid );
        }
        else if ( !accepts && i >= 0 ) {
            this.acceptedUsers.splice( i, 1 );
        }
    };

    TransactionModel.prototype.acceptsRequest = function( userid ) {
        var index = this.pendingUsers.indexOf( userid );
        this.pendingUsers.splice( index, 1 );
    };

    /* Get if all users accept the transaction. */
    TransactionModel.prototype.allAccepted = function() {
        console.log( this.userCount + ' vs ' + this.acceptedUsers.length );
        return this.userCount == this.acceptedUsers.length;
    };

    return TransactionModel;
} );
