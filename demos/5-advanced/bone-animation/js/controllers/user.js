define( [ 'libs/events', 'framework/network/client', 'models/levelloader', 'models/entity', 'models/scene', 'models/user', 'connect/facebook', "models/levelloader" ], function( events, network, levelloader, Entity, scene, UserModel, facebook, level ) {
    player = null;

    var world = scene.world;

    var userController = Object.create( events.EventEmitter );
	console.log( userController );
	
    userController.init = function() {
        this.womanModel = null;
        this._views = {};
        this._users = {};
        
        var that = this;
        require( 'graphics').jsonLoader( 'resources/models/woman.optimized.json', renderer, function( a ){
            that.womanModel = a;
            that.emit( 'load_woman' );
        } );

        network.user.on( 'init', userController.login );
        network.user.on( 'spawn', userController.create );
        network.user.on( 'destroy', function( message ) {
            userController.remove( message.userid );
        } );
        network.user.on( 'move', function( message ) {
            var user = userController.get( message.userid );
            if ( !user ) {
                return;
            }
            user.followPathTo( message.position, message.orientation );
        } );
        network.item.on( 'sold', function( message ) {
            for ( var i in player.items ) {
                var item = player.items[ i ];
                if ( item.id == message.id ) {
                    player.items.splice( i, 1 );
                    player.gold += message.gold;
                    break;
                }
            }
        } );
        network.item.on( 'bought', function( message ) {
            player.gold -= message.gold;
        } );
		
        if ( !network.available() ) {
            console.log( 'no network available' );
            console.log( 'manual login' );
            return userController.login( {
                id: 1,
                name: 'Guest',
                position: [ 0, 0, 50 ]
            } );
        }
        console.log( 'connecting to network' );
        setTimeout( function() {
            network.connect( networkLogin );
        }, 200 );
    };

    userController.login = function( message, callback ) {
        console.log( message );
        userController.create( message, function( user ) {
            player = user;
            for ( var x in message.users ) {
                var userDesc = message.users[ x ];
                userController.create( userDesc );
            }

            userController.emit( 'login', player );

            player.on( 'move', network.user.move.bind( network.user ) );
            renderer.activeCamera.follow( player );
            level.updateMap( player.getPosition() );//update dynamic map loading
        } );
    };

    userController.get = function( id ) {
        return this._users[ id ];
    };

    userController.getUsers = function() { // for testing
        return this._users;
    };

    userController.getPlayer = function( callback ) {
        if ( !player ) {
            return this.on( 'login', callback );
        }
        callback( player );
    };

    userController.remove = function( id ) {
        if ( !( id in this._views ) ) {
            console.log( 'no such views to remove: ' + id );
        }
        else {
            for ( var i = 0; i < this._views[ id ].length; i++ ) {
                renderer.remove( this._views[ id ][ i ] );
            }
        }
        if ( !( id in this._users ) ) {
            console.log( 'no such user to remove: ' + id );
            return;
        }
        world.removeChild( this._users[ id ].node );
        delete( this._users[ id ] );
    };

    userController.create = function( data, callback ) {
        if ( !this.humanModel ) ) {
            this.on( 'load_woman', function() { userController.create( data, callback ) } );
            return;
        }

        var woman = this.womanModel.clone().show();
        woman.moveTo( 0, 0, 0 );

        // -- model --
        
        //the group node
        var group = world.createGroupElement();
        console.log( data );

        var user = new UserModel( data );
        console.log( user );
        group.setEntity( user );
        group.name = "User " + 0;
                 
        var childs = [];
        for ( var i = 0; i < woman.length; i++ ) {
            //make view somehow                
            childs.push( world.createElement() );
            group.appendChild( childs[ i ] );
            childs[ i ].setEntity( new Entity() );
            childs[ i ].entity.mesh = woman[ i ].mesh;
            childs[ i ].entity.moveTo.apply( childs[ i ].entity, woman[ i ].getPosition() );
            universe.addEntity( childs[ i ].entity );
        }
        universe.addEntity( group.entity );            
        group.entity.mesh.setHullFromEntities( group ); 
        world.appendChild( group );
        
        //register to the controller
        this._users[ user.id ] = user;

        group.children[ 0 ].entity.rotate( Math.PI, [ 0, 1, 0 ] );
        group.children[ 1 ].entity.rotate( Math.PI, [ 0, 1, 0 ] );
        
        // -- setup --
        var c = 0.1;        
        woman[ 0 ].scale( c );
        woman[ 1 ].scale( c );        
        group.children[ 0 ].entity.scale( c );
        group.children[ 1 ].entity.scale( c );
        user.mesh.setHullFromEntities( group );  

        var moveParts = function() {
            //console.log( "draw", group.entity.id );
            var head = group.children[ 0 ];
            var body = group.children[ 1 ];

            pos1 = head.entity.getAbsolutePosition( head );
            rot1 = head.entity.getAbsoluteOrientation( head );
            woman[ 1 ].moveTo( pos1[ 0 ], pos1[ 1 ], pos1[ 2 ] );
            woman[ 1 ].rotateToByQuart( rot1 );
            
            
            pos2 = body.entity.getAbsolutePosition( body );
            rot2 = body.entity.getAbsoluteOrientation( body );
            woman[ 0 ].moveTo( pos2[ 0 ], pos2[ 1 ], pos2[ 2 ] );
            woman[ 0 ].rotateToByQuart( rot2 );	
            
            b.moveTo( pos1[ 0 ], pos1[ 1 ] + 2, pos1[ 2 ] );
        };

        var b = renderer.createBillboard().show();
        b.setText( user.username );
        // model - view communication
        group.entity.on( 'move', function( position, orientation ) {
            //console.log( "on",group.entity.id );
            moveParts();
            woman[ 1 ].emit( 'move', position, orientation );
                       
            if ( group.entity.id === player.id ) {
                level.updateMap( position );
            }
        } );

        if ( data.position ) {
            user.moveTo( data.position[ 0 ], data.position[ 1 ], data.position[ 2 ] );
        }
        user.node = group; // HACK for deleting users
        moveParts();

        this._views[ user.id ] = [ woman[ 0 ], woman[ 1 ], b ];
        
        // TODO: rotate

        if ( typeof callback == "function" ) {
            console.log( 'create callback' );
            console.log( user );
            callback( user );
        }
        
        return user;
    }.bind( userController );

    var getLoginFromURL = function() {
        var url = window.location.href;
        var fbid = url.substr( url.indexOf( '?' ) - url.length + 1 ) - 0;
        fbid = fbid || 1;
        console.log( 'facebook id: ' + fbid );
        return [ fbid, 'Guest' + fbid ];
    };

    var networkLogin = function() {
        if ( facebook.available() ) {
            console.log( 'facebook initing' );
            return facebook.init( network.user.login.bind( network.user ) );
        }
        console.log( 'no facebook available' );
        var info = getLoginFromURL();
        network.user.login( info[ 0 ], info[ 1 ] );
    }

    return userController;
} );
