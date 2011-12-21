define( [ 'libs/extender', 'libs/math', 'models/entity' ], function( inherits, math, Entity ) {
    var dian3 = math.dian3,
        tetra = math.tetra,
        SPEED = 0.9;
    
    var UserModel = function( data ) {
        Entity.call( this );

        this.id = data.id;
        this.facebookid = data.facebookid || 0;
        this.username = data.username || "";
        this.gold = data.gold || 0;
        this.items = data.items || [];

        this.email = data.email || "";
        this.username = data.username || "";
        this.health = data.health || 0;
        this.stamina = data.stamina || 0;

        if ( 'position' in data ) {
            console.log( 'has position' );
            console.log( data.position );
            this.setPosition( data.position );
        }
        else {
            this.setPosition( [ 0, 0, 0 ] );
        }
        if ( 'orientation' in data ) {
            this.setOrientation( data.orientation );
        }
        else {
            this.setOrientation( [ 1, 0, 0, 0 ] );
        }

        this.collisionBehaviour = "human";
    };

    UserModel.prototype = {
        getAngle: function() {
            var userAngle = tetra.angle( this.getOrientation() );
            if ( Math.abs( ( tetra.axis( this.getOrientation() )[ 1 ] - 1 ) ) > 1   ) {
                userAngle = 2*Math.PI - userAngle;
            } 
            return userAngle;
        },

        moveForward: function() { 
            var userAngle = this.getAngle();
            this.velocity = dian3.scale( [ Math.sin( userAngle ), 0, Math.cos( userAngle ) ], -SPEED  ); 
        },

        moveBackward: function() {
            var userAngle = this.getAngle();
            this.velocity = dian3.scale( [ Math.sin( userAngle ), 0, Math.cos( userAngle ) ], SPEED  ); 
        },
        
        moveLeft: function() {
            var userAngle = this.getAngle();
            this.velocity = dian3.scale( [ Math.cos( userAngle ), 0, -Math.sin( userAngle ) ], -SPEED  ); 
        },

        moveRight: function() {
            var userAngle = this.getAngle();
            this.velocity = dian3.scale( [ -Math.cos( userAngle ), 0, Math.sin( userAngle ) ], -SPEED  ); 
        },

        rotateLeft: function() {
            this.angularVelocity = [ 0, 0.1, 0 ]; 
        },

        rotateRight: function() {
            this.angularVelocity = [ 0, -0.1, 0 ];
        },

        stopMove: function() {
            this.velocity = [ 0, 0, 0 ]; 
        },

        stopRotate: function() {
            this.angularVelocity = [ 0, 0, 0 ]; 
        },

        followPathTo:  function( position, orientation ) {
            this.moveTo.apply( this, position );
            this.rotateToByQuart( orientation );
            this.emit( 'move', position, orientation );
        },

        takeItem: function( item ) {
            this.items.push( item );
            console.log( 'got item' );
            this.emit( 'takeItem', item );
        },

        /*
        setPosition: function( position ) {
            Transformable.
        }
        */
    };

    inherits( UserModel, Entity );
    
    return UserModel;
} );
