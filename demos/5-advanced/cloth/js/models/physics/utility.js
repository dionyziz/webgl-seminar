( function() {
    var dian3 = require( 'libs/math' );

    exports.makeConstantForce = function( particle, force ) {
        return function() {
            particle.force = dian3.add( particle.force, force );
        };
    };

    exports.makeSpringForce = function ( p1, p2, k, l ) {
        return function() {
            var AB = dian3.subtract( p2.getPosition(), p1.getPosition() );
            var Fmon = dian3.normal( AB );
            var dx = dian3.metro( AB );
            var force = dian3.scale( Fmon, dx*k );
            p1.force = dian3.add( particle.force, force );
        };
    };
} )();
