define( [ 'libs/events' ], function( events ) {
    var fb = Object.create( events.EventEmitter );

    fb.init = function( loginCallback ) {
        this.loggedIn = false;
        this.connected = false;
        this.loginCallback = loginCallback;
        FB.init( { apiKey: '8aa16c9c739fb495253eead58a9704ed' } );
        // FB.Event.subscribe( 'auth.login', onLoginMessage.bind( this ) );
        FB.getLoginStatus( onStatusMessage.bind( this ) );
    };

    fb.logout = function() {
        FB.api( { method: 'Auth.revokeAuthorization' }, function() {
            fb.emit( 'logout' );
        } );
    };

    fb.available = function() {
        return typeof FB != 'undefined' && window.location.href.indexOf( 'kamibu.com' ) >= 0;
    };

    var onLoginMessage = function( response ) {
        if ( this.loggedIn ) {
            return;
        }
        console.log( 'got fb login message' );
        console.log( response );
        var facebookid = FB.getSession().uid;
        var query = 'SELECT username, name, pic, pic_square FROM profile WHERE id=' + facebookid;
        var that = this;
        FB.api( {  method: 'fql.query', query: query }, onQueryResult.bind( this ) );
    };

    var onQueryResult = function( response ) {
        var info = response[ 0 ];
        if ( typeof info != 'object' ) {
            console.log( 'bad fql response' );
            console.log( response );
            return;
        }
        this.loggedIn = true;
        var facebookid = FB.getSession().uid;
        console.log( 'fb ' + facebookid + ' ' + info.name + ' ' + info.pic );
        this.loginCallback( facebookid, info.name, info.pic );
        this.emit( 'login', facebookid, info.name, info.pic );
    };

    var onStatusMessage = function( response ) {
        if ( !response.session ) {
            console.log( 'no facebook session' );
            fb.emit( 'nosession' );
            return;
        }
        console.log( 'got fb status message' );
        console.log( response );
        var facebookid = FB.getSession().uid;
        var query = 'SELECT username, name, pic, pic_square FROM profile WHERE id=' + facebookid;
        var that = this;
        FB.api( {  method: 'fql.query', query: query }, onQueryResult.bind( this ) );
        // this.loginCallback.call( this, response );
    };

    if ( fb.available() ) {
        fb.login = FB.login;
    }

    // TODO: FacebookView ?
   
    var loginElement = $( '#login' );
    var logoutButton = $( '#logout' );
    var loginButton = loginElement.find( 'button' );
    loginButton.bind( 'click', fb.login );
    logoutButton.bind( 'click', function() {
        $( 'body' ).hide();
        fb.logout();
    } );
    fb.on( 'nosession', function() {
        loginElement.show();
    } );
    fb.once( 'login', function( facebookid, username, pic ) {
        loginElement.hide();
        logoutButton.show();
    } );
    fb.on( 'logout', function() {
        window.location.href = '';
    } );

    return fb;
} );
