( function() {
    var WALL_WIDTH = 2;
    var WALL_HEIGHT = 10;
    var ROAD_WIDTH = 20;

    var EventEmitter = require( 'js/libs/events' ).EventEmitter;
    var EventWaiter = require( 'js/libs/events' ).EventWaiter;
    var OldEntity = require( 'js/controllers/entity' ).Entity;

    var LevelLoader = function() {
        this.url = null;
        this.floor = { width: 0, length: 0, instance: null };
        this.roads = [];
        this.items = [];
        this.lights = [];
        this.walls = [];
        this.reload = function() {
            this.clearLevel();
            this.loadLevel( this.url );
        };
        this.clear = function() {
            var road, item, wall, light;
            while ( ( road = this.roads.pop() ) ) {
                road.remove();
            }
            while ( ( item = this.items.pop() ) ) {
                item.remove();
            }
            while ( ( wall = this.walls.pop() ) ) {
                wall.remove();
            }
            while ( ( light = this.lights.pop() ) ) {
                light.off();
            }
            if ( this.floor.instance ) {
                this.floor.instance.remove();
                this.floor.instance = null;
                this.floor.length = 0;
                this.floor.width = 0;
            }
        };
        this.load = function( url ) {
            this.url = url;
            var that = this;
            $.ajax( {
                url: url,
                dataType: 'json',
                data: {},
                success: function ( level ) {
                    that.emit( 'fileloaded' );

                    var WALL_WIDTH = that.WALL_WIDTH;
                    var WALL_HEIGHT = that.WALL_HEIGHT;
                    
                    var light;
                    var models = level.models;
                    
                    var w = that.floor.width = level.size[ 0 ];
                    var l = that.floor.length = level.size[ 2 ];
                    
                    //wall sizes [ x1, y1, z1, x2, y2, z2
                    //position     x, y, z ]
                    var walldata = [];
                    walldata.push( [ -WALL_WIDTH / 2, WALL_HEIGHT / 2, l / 2, WALL_WIDTH / 2, -WALL_HEIGHT / 2, -l / 2, -( w / 2 + WALL_WIDTH / 2 ), WALL_HEIGHT / 2, 0 ] );
                    walldata.push( [ -WALL_WIDTH / 2, WALL_HEIGHT / 2, l / 2, WALL_WIDTH / 2, -WALL_HEIGHT / 2, -l / 2,  ( w / 2 + WALL_WIDTH / 2 ), WALL_HEIGHT / 2 , 0 ] );
                    walldata.push( [ w / 2, WALL_HEIGHT / 2, -WALL_WIDTH / 2, -w / 2, -WALL_HEIGHT / 2, WALL_WIDTH / 2, 0, WALL_HEIGHT / 2, -( l / 2 + WALL_WIDTH / 2 ) ] );
                    walldata.push( [ w / 2, WALL_HEIGHT / 2, -WALL_WIDTH / 2, -w / 2, -WALL_HEIGHT / 2, WALL_WIDTH / 2, 0, WALL_HEIGHT / 2,  ( l / 2 + WALL_WIDTH / 2 ) ] );

                    for ( var i = 0; i <= 3; ++i ) {
                        var d = walldata[ i ];

                        var wall = new OldEntity();
                        wall.load3DModel( gfx.utils.makeParallelepiped( d[ 0 ], d[ 1 ], d[ 2 ], d[ 3 ], d[ 4 ], d[ 5 ] ) );
                        that.walls.push( wall );
                        wall.moveTo( d[ 6 ], d[ 7 ], d[ 8 ] );
                    }

                    var makeItemEntity = function( scenedata, position, rotation, scale ) {
                        $( scenedata ).each( function( i, modelData ) {
                            var entity = new OldEntity();
                            entity.on( 'load', function() {
                                this.moveTo( position[ 0 ], position[ 1 ], position[ 2 ] );
                                if ( rotation ) {
                                    //this.rotateTo( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );
                                    this.rotateTo( rotation[ 1 ] ); //TODO: Multi axes rotation
                                }
                                if ( scale ) {
                                    this.graphical.scale( scale );
                                    this.physical.scale( scale );
                                }
                                var material = this.graphical.model.material;
                                if ( material.ambientColor[ 0 ] === 0 && material.ambientColor[ 1 ] === 0 && material.ambientColor[ 2 ] === 0 ) {
                                    this.graphical.model.material.setAmbient( 0.2, 0.2, 0.2, 1 );
                                    this.graphical.model.material.setDiffuse( 0.3, 0.2, 0.4, 1 );
                                }
                                if ( settings.arealoader.staticItems ) {
                                    this.hold();
                                }
                            } );
                            entity.load3DModel( modelData );
                            that.items.push( entity );
                        } );
                    };

                    var item, modelname, totalWaiting;
                    var objLoaders = [];
                    var waiter = new EventWaiter();
                    
                    $( level.items ).each( function( i, item ) {
                        var modelname = models[ item.model ];
                        var pos = item.position;
                        var rot = item.rotation;
                        var scale = item.scale;
                        
                        waiter.waitMore();
                        var objLoader = gfx.utils.loadOBJ( settings.resources.root + 'models/' + modelname + '/' + modelname + '.obj', function( model ) {
                            waiter.waitLess();
                            // alert( 'progress' );
                            makeItemEntity( model, pos, rot, scale );
                        } );
                        // objLoaders.push( objLoader );
                    } );

                    /*
                    EventEmitter.prototype.all( objLoaders, 'fileloaded', function() {
                        that.emit( 'itemsfilesloaded' );
                    } );
                    */

                    waiter.on( 'complete', function() {
                        that.emit( 'itemsloaded' );
                    } );
                    totalWaiting = waiter.numWaiting();
                    
                    for ( i in level.lights ) {
                        var lightdata = level.lights[ i ];
                        switch ( lightdata.type ) {
                            case 'spot':
                                continue;
                                /* light = new gfx.lights.Spot( false );
                                light.setSpotExponent( lightdata.exponent );
                                light.setSpotCutoffAngle( lightdata.cutoffangle );
                                light.moveTo.apply( light, lightdata.position );
                                light.on();
                                break; */
                            case 'directional':
                                light = new gfx.lights.Directional();
                                // TODO: directional light direction using .lookAt
                                light.rotateX( lightdata.rotation[ 0 ] );
                                light.rotateY( lightdata.rotation[ 1 ] );
                                light.rotateZ( lightdata.rotation[ 2 ] );
                                break;
                        }
                        if ( typeof lightdata.ambient != 'undefined' ) {
                            light.setAmbient.apply( light, lightdata.ambient );
                        }
                        if ( typeof lightdata.diffuse != 'undefined' ) {
                            light.setDiffuse.apply( light, lightdata.diffuse );
                        }
                        if ( typeof lightdata.specular != 'undefined' ) {
                            light.setSpecular.apply( light, lightdata.specular );
                        }
                        light.on( true );
                        that.lights.push( light );
                    }

                    gfx.makeProgram();

                    gfx.setSkyBox( 1000, {
                        negx: level.skybox[ 0 ],
                        negy: level.skybox[ 1 ],
                        negz: level.skybox[ 2 ],
                        posx: level.skybox[ 3 ],
                        posy: level.skybox[ 4 ],
                        posz: level.skybox[ 5 ]
                    } );
                    ( loadFloor.bind( that ) )( level.floor, level.size );
                    ( loadRoads.bind( that ) )( level.floor );
                },
                error: function ( xhr, errstring, err ) {
                    alert( 'Sorry, could not download level! ' + errstring );
                }
            } );
            this.waiter = waiter;
        };
        var loadFloor = function( floor, size ) {
            var floorRectangle = gfx.utils.makeSquare( size[ 0 ] / 2, size[ 2 ] / 2, -size[ 0 ] / 2, -size[ 2 ] / 2 );
            var coord = floor.uvcoords;
            for ( var c = 0, l = floorRectangle.uvcoords.length; c <= l; ++c ) {
                if ( floorRectangle.uvcoords[ c ] !== 0 ) {
                    floorRectangle.uvcoords[ c ] = coord;
                }
            }
            
            var floorModel = new gfx.Model( floorRectangle );    
            floorModel.material = new gfx.Material();
            floorModel.material.setTexture( floor.textures[ 0 ], true );
            floorModel.material.setDiffuse( 0.6, 0.6, 0.6 );
            floorModel.material.setAmbient( 0.4, 0.4, 0.4 );
            floorModel.rotateX( 3 / 2 * Math.PI );
            
            var floorInstance = this.floor.instance = new gfx.Instance( floorModel );
            
            floorInstance.moveTo( 0, 0, 0 );
            this.emit( 'floorloaded' );
        };
        var loadRoads = function( floor ) {
            for ( var r = 0; r < floor.roads.length; ++r ) {
                //iterate roads
                for ( var p = 0; p < floor.roads[ r ].length - 1; ++p ) {
                    //iterate road parts
                    var roadFrom = floor.roads[ r ][ p ];
                    var roadTo = floor.roads[ r ][ p + 1 ];
                    
                    //part length
                    var vf = vec3.create( [ roadFrom[ 0 ], 0, roadFrom[ 1 ] ] );
                    vec3.subtract( vf, [ roadTo[ 0 ], 0, roadTo[ 1 ] ] );
                    var partLen = vec3.length( vf );
                    
                    var roadPartRectangle = gfx.utils.makeSquare( ( partLen + this.ROAD_WIDTH ) / 2, this.ROAD_WIDTH / 2, -( partLen + this.ROAD_WIDTH ) / 2, -this.ROAD_WIDTH / 2 );
                    roadPartRectangle.material = new gfx.Material();
                    roadPartRectangle.material.setDiffuse( 0, 0, 0 );
                    roadPartRectangle.material.setAmbient( 0, 0, 0 );
                    
                    var roadPartModel = new gfx.Model( roadPartRectangle );
                    roadPartModel.rotateX( 3 / 2 * Math.PI );
                    var roadPartInstance = new gfx.Instance( roadPartModel );
                    this.roads.push( roadPartInstance );
                    roadPartInstance.moveTo( ( roadTo[ 0 ] + roadFrom[ 0 ] ) / 2, 0.1, ( roadTo[ 1 ] + roadFrom[ 1 ] ) / 2 );
                    roadPartInstance.rotateY( -Math.atan( ( roadTo[ 1 ] - roadFrom[ 1 ] ) / ( roadTo[ 0 ] - roadFrom[ 0 ] ) ) );
                }
            }
            this.emit( 'roadloaded' );
        };
    }.extend( EventEmitter );

    LevelLoader.call( exports );
} )();
