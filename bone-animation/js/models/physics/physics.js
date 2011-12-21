define( [ './universe', './particle', './collision', './bounds' ], function( Universe, Particle, collision, bounds ) {
    return {
        Universe: Universe,
        Particle: Particle,
        collision: collision,
        bounds: bounds
    };
} );
