define( function( require, exports, module ) {
    // physics package
    // require( 'physics' ) to use
    
    // dependencies
    require( 'libs/extender' );

    exports.Universe = require( './universe' );
    exports.Particle = require( './particle' );
    exports.collision = require( './collision' );
    exports.bounds = require( './bounds' );
} );
