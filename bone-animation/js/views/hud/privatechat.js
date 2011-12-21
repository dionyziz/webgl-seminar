define( [ 'require', 'controllers/user', './widget', './chat' ] ,function( require ) {
    var userController = require( 'controllers/user' );
    
    var widgetDiv = null;
    
    var init = function( renderer ) {
        /*
        renderer.on( 'mouseover', function( obj ) {
        } );
        */
        
        var userTabs = [];
        
        var newTab = function( userid, username ) {
            var tabDiv = $( '<div class="pvtchat">' );
            
            var widget = require( './widget' ).makeWidget( tabDiv, { title: 'Private Chat [' + username + ']' } );
            
            widget.collapseToggle();
            
            var remove, show, blink;
            remove = show = blink = function() { console.log( 'not yet implemented' ) };
            
            userTabs[ userid ] = {
                show: show,
                remove: remove,
                blink: blink
            };
        };
        
        var widgetDiv = $( '<div class="privatechatlist">' );
        var userUL = $( '<ul class="users">' ).appendTo( widgetDiv );
        
        var populateList = function() {
            userUL.empty();
            
            var clickUser = function( id, name ) {
                var tab = userTabs[ id ] || newTab( id );
                $( tab.div ).empty().append( [ id, name ].join( ',' ) );
                return false;
            };
            
            var users = require( 'controllers/user' ).getUsers();
            var userid, username;
            for ( var u in users ) {
                userid = users[ u ].userid;
                username = users[ u ].name;
                
                $( '<a href="">' + username + '</a>' )
                    .click( function( e ) {
                        e.preventDefault();
                        clickUser( userid, username );
                    } )
                    .appendTo( $( '<li>' ).appendTo( userUL ) );
            }
            
            return false;
        };
        
        $( '<a href="">Refresh List</a>' ).click( populateList ).appendTo( widgetDiv );
        
        populateList();
        return widgetDiv;
    };
    
    return { init: init };
} );