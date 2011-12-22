( function( window, document ) {
    // var scriptExports = window.scriptExports = {};
    var scriptExports = {};
    
    //Default value is settings.modules.root, falls back to document.baseURI
    var root = settings.modules.root || document.baseURI.substring( 0, document.baseURI.lastIndexOf( '/' ) + 1 );
    window.exports = {};
    window.require = function( path ) {
        if ( !( path in scriptExports ) ) {
            var req = new XMLHttpRequest();
            var p = root + path + 'package.json';
            req.open( 'GET', p, false );
            req.send();
            var pkg = JSON.parse( req.responseText );
            if ( pkg.main ) {
                var main = pkg.main.substring( 0, pkg.main.length - 3 );
                return scriptExports[ path + main ];
            }
        }
        return scriptExports[ path ];
    };
    var scripts = document.body.getElementsByTagName( 'script' );
    for ( var i = 0; i < scripts.length; ++i ) {
        var script = scripts[ i ];
        var url = script.src.substring( 0, script.src.length - 3 );
        if ( url.substring( 0, root.length ) != root ) {
            continue;
        }
        var path = url.substring( root.length );
        var file = path.substring( path.lastIndexOf( '/' ) + 1 );
        if ( file == 'index' ) {
            path = path.substring( 0, path.length - file.length );
        }
        if ( !( path in scriptExports ) ) {
            scriptExports[ path ] = {};
        }
        script.onload = ( function( path ) {
            return function() {
                scriptExports[ path ] = window.exports;
                window.exports = {};
            };
        } )( path );
    }
} )( this, document );
