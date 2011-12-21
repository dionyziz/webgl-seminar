define( [ 'libs/extender', 'libs/math', 'libs/events', 'graphics', 'libs/procedural/house', 'models/mesh', 'libs/procedural/map', 'libs/procedural/samplemap' ], function( extend, math, events, graphics, house, Mesh, map, mapfile ) {
    var dian3 = math.dian3;

    var parts = [];
    var fileWaiter = Object.create( events.EventWaiter );

    var levelLoader = Object.create( events.EventEmitter );
	
	levelLoader.updateMap = function( pos ) {
		map.update( pos );
	};
    levelLoader.loadFile = function( filename, id, autocenter, callback ) { 
        var temp = [];
        var initPos = [];
        fileWaiter.waitMore();
        graphics.objloader.loadOBJ(  'resources/' + filename, function( objs ){
            parts[ id ] = [];
            var j = 0;
            for( var i in objs ) {
                //console.log( "Part " , i, id, " loaded." );
                var f = new Mesh( objs[ i ].vertices, objs[ i ].indices );
                f.setHullFromMesh();
                
                initPos[ j ] = [ 0, 0, 0 ];
                if ( autocenter ) {
                    var box = f.getBoundingBox();
                    var pos = dian3.add( box[ 0 ] , dian3.scale( dian3.subtract( box[ 7 ], box[ 0 ] ), 0.5 ) );
                    f.move( -pos[ 0 ], -pos[ 1 ], -pos[ 2 ] );	
                    initPos[ j ] = dian3.add( pos, [ 0, 0, 0 ] );			
                }                    
                /*
                if ( typeof angle !== 'undefined' ) {
                    f.rotate( angle, [ 0, 1, 0 ] );
                    f.setHullFromMesh();   
                }
                */
                
                temp[ j ] = renderer.createDrawable( { 
                    mesh: f,
                    normals: objs[ i ].normals,
                    material: objs[ i ].material, 
                    uvcoords: objs[ i ].uvcoords 
                } );
                j++;				
            }
            
            parts[ id ] = [];
            for ( var x in temp ) {
                parts[ id ][ x ] = temp[ x ];
            }
            if ( temp.length > 1 ) {
                var group = new graphics.groupDrawable();
                //calc median
                var median = [ 0, 0, 0 ];
                for ( var x in temp ) {
                    median = dian3.add( initPos[ x ] , median );
                }
                median = dian3.scale( median, 1/temp.length );
                //
                for ( var x in temp ) {
                    group.add( temp[ x ].clone(), dian3.subtract( initPos[ x ], median ), [ 1, 0, 0, 0 ] );
                }
                parts[ id ][ "group" ] = group;
            }
            
                        
            fileWaiter.waitLess();
            if ( typeof callback == 'function' ) {
                callback( id, parts[ id ] );
            }
        }, renderer );
    };

    levelLoader.init = function() {
		//load Map file 
		map.loadMap( mapfile );		
		//TODO Write spec
	
	
        var files = {
            walls : [ 'wallmodel/Wall_01.obj', 'wallmodel/Wall_02.obj', 'wallmodel/Wall_03.obj', 'wallmodel/Wall_04.obj', 'wallmodel/Wall_05.obj', 'wallmodel/Wall_06.obj', 'wallmodel/Wall_07.obj', 'wallmodel/Wall_08.obj' ],
            kases : [ 'doormodel/Door_Thick_Out_01.obj', 'doormodel/Door_Thick_Out_02.obj', 'doormodel/Door_Thick_Out_03.obj', 'doormodel/Door_Thick_Out_04.obj', 'doormodel/Door_Thick_Out_05.obj', 'doormodel/Door_Thick_Out_06.obj', 'doormodel/Door_Thick_Out_07.obj', 'doormodel/Door_Thick_Out_08.obj' ],
            windows : [ 'windowmodel/Window_03.obj',  'windowmodel/Window_05.obj', 'windowmodel/Window_15.obj', 'windowmodel/Window_14.obj', 'windowmodel/Window_05.obj', 'windowmodel/Window_08.obj' ],
            doors : [ 'doormodel/Door_Thick_01.obj', 'doormodel/Door_Thick_02.obj', 'doormodel/Door_Thick_04.obj',   'doormodel/Door_Thick_08.obj', 'doormodel/Door_Thick_09.obj', 'doormodel/Door_Thick_10.obj' ],
            balconies : [ 'balconymodel/Balcony_06.obj', 'balconymodel/Balcony_02.obj', 'balconymodel/Balcony_05.obj' ],
            assets : [ 'assets/Bin.obj', 'assets/hydrant.obj', 'assets/Parteri.obj', 'assets/Pilon.obj', 'assets/StreetLight.obj', 'assets/TrafficLight.obj', 'assets/Tree.obj', 'assets/Roof_02.obj', 'assets/SatPlate_01.obj', 'assets/Antenna.obj', 'assets/ClotheHang.obj' ],
            models : [ 'woman/Woman_Low.obj' ]
        };
        
        
        //****LOAD MODELS*****
        fileWaiter.waitMore();//to prevent loading everything before calling everything to load
        //walls, kases, windows, doors, balconies
        for ( var i in files.walls ) {
            this.loadFile( files.walls[ i ], "wall" + i, renderer, true );
        }
        for ( var i in files.kases ) {
            this.loadFile( files.kases[ i ], "kasa" + i, renderer, true );
        }
        for ( var i in files.windows ) {
            this.loadFile( files.windows[ i ], "window" + i, renderer, true );
        }
        for ( var i in files.doors ) {
            this.loadFile( files.doors[ i ], "door" + i, renderer, true );
        }
        for ( var i in files.balconies ) {
            this.loadFile( files.balconies[ i ], "balcony" + i, renderer, true );
        }
        
        //assets
        this.loadFile( files.assets[ 0 ], "bin", renderer, true );
        this.loadFile( files.assets[ 1 ], "krounos", renderer, true );
        this.loadFile( files.assets[ 2 ], "parteri", renderer, true );
        this.loadFile( files.assets[ 3 ], "kolona", renderer, true );
        this.loadFile( files.assets[ 4 ], "streetLight", renderer, true );
        this.loadFile( files.assets[ 5 ], "trafficLight", renderer, true );
        this.loadFile( files.assets[ 6 ], "tree", renderer, true );
        this.loadFile( files.assets[ 7 ], "roof1", renderer, true );
        this.loadFile( files.assets[ 8 ], "sat1", renderer, true );
        this.loadFile( files.assets[ 9 ], "tv", renderer, true );
        this.loadFile( files.assets[ 10 ], "hanger", renderer, true );
        
        //woman model
        //this.loadFile( files.models[ 0 ], "woman", renderer, false );
        
        fileWaiter.waitLess();//now you can end
        //******

        fileWaiter.on( 'complete' , function() {
            var wallId0 = house.addPart( 'wall', parts[ 'wall0' ][ 0 ]  );
            var wallId1= house.addPart( 'wall', parts[ 'wall1' ][ 0 ] );
            var wallId2 = house.addPart( 'wall', parts[ 'wall2' ][ 0 ] );
            var wallId3 = house.addPart( 'wall', parts[ 'wall3' ][ 0 ]  );
            var wallId4 = house.addPart( 'wall', parts[ 'wall4' ][ 0 ]  );
            var wallId5 = house.addPart( 'wall', parts[ 'wall5' ][ 0 ]  );
            var wallId6 = house.addPart( 'wall', parts[ 'wall6' ][ 0 ]  );
            var wallId7 = house.addPart( 'wall', parts[ 'wall7' ][ 0 ]  );
			
			//same walls , different textures
			parts[ 'wall8' ] = parts[ 'wall0' ][ 0 ].clone()
			parts[ 'wall8' ].material = renderer.createMaterial( 'textured' );
	        parts[ 'wall8' ].material.set( 's2texture', 'resources/wallmodel/Wall_Comp_02.jpg' );
			
			parts[ 'wall9' ] = parts[ 'wall1' ][ 0 ].clone();
			parts[ 'wall9' ].material = parts[ 'wall8' ].material;
			
			parts[ 'wall10' ] = parts[ 'wall2' ][ 0 ].clone();
			parts[ 'wall10' ].material = parts[ 'wall8' ].material;
			
			parts[ 'wall11' ] = parts[ 'wall3' ][ 0 ].clone();
			parts[ 'wall11' ].material = parts[ 'wall8' ].material;
			
			parts[ 'wall12' ] = parts[ 'wall4' ][ 0 ].clone();
			parts[ 'wall12' ].material = parts[ 'wall8' ].material;
			
			parts[ 'wall13' ] = parts[ 'wall5' ][ 0 ].clone();
			parts[ 'wall13' ].material = parts[ 'wall8' ].material;
			
			parts[ 'wall14' ] = parts[ 'wall6' ][ 0 ].clone();
			parts[ 'wall14' ].material = parts[ 'wall8' ].material;
			
			parts[ 'wall15' ] = parts[ 'wall7' ][ 0 ].clone();
			parts[ 'wall15' ].material = parts[ 'wall8' ].material;
			
			var wallId8 = house.addPart( 'wall', parts[ 'wall8' ] );
            var wallId9 = house.addPart( 'wall', parts[ 'wall9' ] );
            var wallId10 = house.addPart( 'wall', parts[ 'wall10' ] );
            var wallId11 = house.addPart( 'wall', parts[ 'wall11' ] );
            var wallId12 = house.addPart( 'wall', parts[ 'wall12' ] );
            var wallId13 = house.addPart( 'wall', parts[ 'wall13' ] );
            var wallId14 = house.addPart( 'wall', parts[ 'wall14' ] );
            var wallId15 = house.addPart( 'wall', parts[ 'wall15' ] );  
			//

			
            var windowId0 = house.addPart( 'window', parts[ 'window0' ][ 0 ] );
            var windowId1 = house.addPart( 'window', parts[ 'window1' ][ 0 ] );
            var windowId2 = house.addPart( 'window', parts[ 'window2' ][ 0 ] );
            var windowId3 = house.addPart( 'window', parts[ 'window3' ][ 0 ] );
            var windowId4 = house.addPart( 'window', parts[ 'window4' ][ 0 ] );
            var windowId5 = house.addPart( 'window', parts[ 'window5' ][ 0 ] );
            
            var balconyId0 = house.addPart( 'balcony', parts[ 'balcony0' ][ 0 ] );
            var balconyId1 = house.addPart( 'balcony', parts[ 'balcony1' ][ 0 ] );
            var balconyId2 = house.addPart( 'balcony', parts[ 'balcony2' ][ 0 ] );
            
            
            var doorId0 = house.addPart( 'door', parts[ 'door0' ][ 0 ] );    
            var doorId1 = house.addPart( 'door', parts[ 'door1' ][ 0 ] ); 
            var doorId2 = house.addPart( 'door', parts[ 'door2' ][ 0 ] );
            var doorId3 = house.addPart( 'door', parts[ 'door3' ][ 0 ] );
            
            
            var balconyDoorId0 = house.addPart( 'door', parts[ 'door4' ][ 0 ] );   
            var balconyDoorId1 = house.addPart( 'door', parts[ 'door5' ][ 0 ] );  
            
			//
            var kasaId0 = house.addPart( 'kasa' , parts[ 'kasa0' ][ 0 ] ); 
            var kasaId1 = house.addPart( 'kasa' , parts[ 'kasa1' ][ 0 ] ); 
            var kasaId2 = house.addPart( 'kasa' , parts[ 'kasa2' ][ 0 ] ); 
            var kasaId3 = house.addPart( 'kasa' , parts[ 'kasa3' ][ 0 ] ); 
            var kasaId4 = house.addPart( 'kasa' , parts[ 'kasa4' ][ 0 ] ); 
            var kasaId5 = house.addPart( 'kasa' , parts[ 'kasa5' ][ 0 ] ); 
            var kasaId6 = house.addPart( 'kasa' , parts[ 'kasa6' ][ 0 ] ); 
            var kasaId7 = house.addPart( 'kasa' , parts[ 'kasa7' ][ 0 ] ); 
			
			parts[ 'kasa8' ] = parts[ 'kasa0' ][ 0 ].clone()
			parts[ 'kasa8' ].material = renderer.createMaterial( 'textured' );
	        parts[ 'kasa8' ].material.set( 's2texture', 'resources/wallmodel/Wall_Comp_02.jpg' );
			
			parts[ 'kasa9' ] = parts[ 'kasa1' ][ 0 ].clone();
			parts[ 'kasa9' ].material = parts[ 'kasa8' ].material;
			
			parts[ 'kasa10' ] = parts[ 'kasa2' ][ 0 ].clone();
			parts[ 'kasa10' ].material = parts[ 'kasa8' ].material;
			
			parts[ 'kasa11' ] = parts[ 'kasa3' ][ 0 ].clone();
			parts[ 'kasa11' ].material = parts[ 'kasa8' ].material;
			
			parts[ 'kasa12' ] = parts[ 'kasa4' ][ 0 ].clone();
			parts[ 'kasa12' ].material = parts[ 'kasa8' ].material;
			
			parts[ 'kasa13' ] = parts[ 'kasa5' ][ 0 ].clone();
			parts[ 'kasa13' ].material = parts[ 'kasa8' ].material;
			
			parts[ 'kasa14' ] = parts[ 'kasa6' ][ 0 ].clone();
			parts[ 'kasa14' ].material = parts[ 'kasa8' ].material;
			
			parts[ 'kasa15' ] = parts[ 'kasa7' ][ 0 ].clone();
			parts[ 'kasa15' ].material = parts[ 'kasa8' ].material;
			
			var kasaId8 = house.addPart( 'kasa', parts[ 'kasa8' ] );
            var kasaId9 = house.addPart( 'kasa', parts[ 'kasa9' ] );
            var kasaId10 = house.addPart( 'kasa', parts[ 'kasa10' ] );
            var kasaId11 = house.addPart( 'kasa', parts[ 'kasa11' ] );
            var kasaId12 = house.addPart( 'kasa', parts[ 'kasa12' ] );
            var kasaId13 = house.addPart( 'kasa', parts[ 'kasa13' ] );
            var kasaId14 = house.addPart( 'kasa', parts[ 'kasa14' ] );
            var kasaId15 = house.addPart( 'kasa', parts[ 'kasa15' ] );  
			//
            
            
            var binId = house.addPart( 'asset' , parts[ 'bin' ][ 0 ] ); 
            var krounosId = house.addPart( 'asset' , parts[ 'krounos' ][ 0 ] ); 
            var parteriId = house.addPart( 'asset' , parts[ 'parteri' ][ 0 ] ); 
            var kolonaId = house.addPart( 'asset' , parts[ 'kolona' ][ 0 ] ); 
            var light1Id = house.addPart( 'asset' , parts[ 'streetLight' ][ 'group' ] );
            var light2Id = house.addPart( 'asset' , parts[ 'trafficLight' ][ 0 ] );
            
            parts[ 'tree' ][ 0 ].material = renderer.createMaterial( 'textured-alphatest' );
            parts[ 'tree' ][ 0 ].material.set( 's2texture', { url: 'resources/assets/Assets_01.jpg', generateMipMap: false } );
            var treeId = house.addPart( 'asset' , parts[ 'tree' ][ '0' ] );
            
            var roof1Id = house.addPart( 'asset' , parts[ 'roof1' ][ 0 ] );
            var sat1Id = house.addPart( 'asset' , parts[ 'sat1' ][ 0 ] );
            var tvId = house.addPart( 'asset' , parts[ 'tv' ][ 0 ] );
            var hangerId = house.addPart( 'asset' , parts[ 'hanger' ][ 0 ] );
                        
            map.buildCreator( //add build callback to map loader
                function( blockId, shape ) {
                    return house.makeBlock( blockId, shape, universe, 
						[ wallId0, wallId1, wallId2, wallId3, wallId4, wallId5, wallId6, wallId7, wallId8, wallId9, wallId10, wallId11,wallId12, wallId13, wallId14, wallId15 ], 
						[ windowId0, windowId1, windowId2, windowId3, windowId4, windowId5 ], 
						[ balconyId0, balconyId1, balconyId2 ] , 
						[ doorId0, doorId1, doorId2, doorId3 ] , 
						[ kasaId0, kasaId1, kasaId2, kasaId3, kasaId4, kasaId5, kasaId6, kasaId7, kasaId8, kasaId9, kasaId10, kasaId11,kasaId12, kasaId13, kasaId14, kasaId15 ], 
						[ balconyDoorId0, balconyDoorId1 ], 
						{ bin : binId, krounos : krounosId, parteri : parteriId, kolona : kolonaId, light1 : light1Id, light2 : light2Id, tree : treeId, roof1 : roof1Id, sat1 : sat1Id, tv : tvId, hanger : hangerId } );
                }
            );
            
            house.initTown( mapfile, universe );
            levelLoader.emit( 'complete', parts );
        } );
    };

    return levelLoader;
} );
