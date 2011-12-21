define( [ 'libs/math' ], function( math ) {
    var dian3 = math.dian3;

    var makeConstantForce = function( particle, force ) {
        return function() {
            particle.force = dian3.add( particle.force, force );
        };
    };

    var makeSpringForce = function ( p1, p2, k, l ) {
        return function() {
            var AB = dian3.subtract( p2.getPosition(), p1.getPosition() );
            var Fmon = dian3.normal( AB );
            var dx = dian3.metro( AB );
            var force = dian3.scale( Fmon, dx*k );
            p1.force = dian3.add( particle.force, force );
        };
    };
    
    return {
        makeConstantForce: makeConstantForce,
        makeSpringForce: makeSpringForce
    };
} );
