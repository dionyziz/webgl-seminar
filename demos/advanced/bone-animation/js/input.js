define( [ 'libs/math', 'framework/input/keyboard', 'framework/input/mouse', 'controllers/user', 'cs!views/chat' ], function( math, keyboard, mouse, userController, chatView ) {
    var dian3 = math.dian3;
    var keys = keyboard.keys;

    var bindMovement = function( type, bindings ) {
        var registerHandler;
        var repeat = false;
        if ( type == 'key' ) {
            repeat = true;
            registerHandler = keyboard.registerHandler;
        }
        else if ( type == 'keyup' ) {
            registerHandler = keyboard.registerKeyupHandler;
        }
        for ( var method in bindings ) {
            var keyNames = bindings[ method ];
            if ( typeof keyNames == 'string' ) {
                var keyName = keyNames;
                registerHandler( keys[ keyName ], player[ method ].bind( player ), repeat );
                continue;
            }
            for ( var i in keyNames ) {
                var keyName = keyNames[ i ];
                registerHandler( keys[ keyName ], player[ method ].bind( player ), repeat );
            }
        }
    };

    var setKeys = function() {
        console.log( 'setting keys' );
        bindMovement( 'key', {
            'moveForward': 'W',
            'moveBackward': 'S',
            'rotateLeft': 'A',
            'rotateRight': 'D',
            'moveRight' : 'E',
            'moveLeft' : 'Q'
        } );
        bindMovement( 'keyup', {
            'stopMove': [ 'W', 'S', 'E', 'Q' ],
            'stopRotate': [ 'A', 'D' ]
        } );

        keyboard.registerHandler( 13, chatView.enterPressed );
        keyboard.registerHandler( 27, chatView.escapePressed );
    };

    return {
        init: function() {
            keyboard.init();
            mouse.init();

            userController.on( 'login', setKeys );
        }
    };
} );
