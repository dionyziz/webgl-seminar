define( [ 'graphics', 'models/mesh' ], function( graphics, Mesh ) {
    return {
        init: function() {
            var sky = renderer.createMaterial( 'skybox' );
            sky.set( 'scSky', {
                posx: 'resources/sky/day/posx.jpg',
                negx: 'resources/sky/day/negx.jpg',
                posy: 'resources/sky/day/posy.jpg',
                negy: 'resources/sky/day/negy.jpg',
                posz: 'resources/sky/day/negz.jpg',
                negz: 'resources/sky/day/posz.jpg',
            } );	
            
            var cube = graphics.utils.makeUnitCube();
            var cubeMesh = new Mesh( cube.vertices, cube.indices.reverse() );
            
            var cube = renderer.createDrawable( { mesh: cubeMesh, material: sky } ).show();
            cube.cull = false;
            cube.scale( renderer.activeCamera.zFar - 1 );
        }
    };
} );
