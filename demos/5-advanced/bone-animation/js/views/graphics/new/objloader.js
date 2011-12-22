define( function( require, exports, module ) {
    return {
        mtlCache: {},
        objCache: {},
        loadMtl: function( url, callback, renderer ) {
            var that = this;
            
            if ( this.mtlCache[ url ] !== undefined ) {
                // cache hit
                callback( this.mtlCache[ url ] );
                return;
            }
            
            /*Find the base url in order to construct the path for the texture maps*/
            var baseUrl = url.substring( 0, url.lastIndexOf( '/' ) + 1 );
            
            var matReq = new XMLHttpRequest();
            matReq.open( 'GET', url );
            matReq.onreadystatechange = function() {
                if ( matReq.readyState == 4 ) {
                    //This map will hold an object for each material found in the mtl file
                    var materials = {};
                    
                    /*Get the response and put each line in an array*/
                    var lines = matReq.responseText.split( '\n' );
                    
                    var i, line, l = lines.length, currentMaterial;
                    
                    /*Parse the file line by line*/
                    for ( i = 0; i < l; i++ ) {
                        /*Trim each line and split it in parts with whitespace as separator*/
                        line = lines[ i ].trim().split( /\s+/ );
                        switch ( line[ 0 ] ){
                            /*A new material definition starts here.*/
                            case 'newmtl':
                                /*Every line following this one will this material definion
                                 *Keep the current material name*/
                                currentMaterial = line[ 1 ];
                                /*Make a new object in which the material parameters will be saved*/
                                materials[ currentMaterial ] = {};
                                break;
                            case 'map_Kd':
                                /*A diffuse texture map. Store the url pointing to the image*/
                                materials[ currentMaterial ].diffuseTexture = baseUrl + line[ 1 ];
                                break;
                            case 'Ka':
                                /*The material's ambient color*/
                                materials[ currentMaterial ].ambient = [ line[ 1 ], line[ 2 ], line[ 3 ] ];
                                break;
                            case 'Kd':
                                /*The material's diffuse color*/
                                materials[ currentMaterial ].diffuse = [ line[ 1 ], line[ 2 ], line[ 3 ] ];
                                break;
                            case 'Ks':
                                /*The material's specular color*/
                                materials[ currentMaterial ].specular = [ line[ 1 ], line[ 2 ], line[ 3 ] ];
                                break;
                            case 'bump':
                                /*A bump map. Store the url pointing to the image*/
                                materials[ currentMaterial ].bumpTexture = baseUrl + line[ 1 ];
                                break;
                        }
                    }
                    //TODO: Fix this shit
                    var tex = renderer.createShader( 'textured' );
                    var solid = renderer.createShader( 'solid' );
                    
                    for ( var material in materials ) {
                        if ( materials[ material ].diffuseTexture !== undefined ) {
                            var texture = materials[ material ].diffuseTexture;
                            materials[ material ] = renderer.createMaterial( tex );
                            materials[ material ].set( 's2texture', texture );
                        }
                        else {
                            materials[ material ] = renderer.createMaterial( solid );
                            materials[ material ].set( 'v4Color', [ 1, 1, 1, 1 ] );
                        }
                    }
                    that.mtlCache[ url ] = materials; // memoize
                    callback( materials );
                }
            };
            matReq.send();
        },
        loadOBJ: function( url, callback, renderer ) {
            if ( typeof url == 'undefined' ) {
                throw "loadOBJ() called on an empty url";
            }
            
            var that = this;
            
            if ( this.objCache[ url ] !== undefined ) {
                // cache hit
                callback( this.objCache[ url ] );
                return;
            }
            
            var baseUrl = url.substring( 0, url.lastIndexOf( '/' ) + 1 );
            var vReq = new XMLHttpRequest();
            vReq.open( 'GET', url );
            vReq.onreadystatechange = function() {
                if ( vReq.readyState == 4 ) {
                    var data = vReq.responseText;
                    var lines = data.split( "\n" );
                    var i, j, line, activeMaterial, indicesIndex;
                    
                    var vList = [];
                    var nList = [];
                    var tList = [];
                    
                    var ret = {};
                    var materialsLoaded = true;
                    var materialCallback = function( materials ) {
                        for ( var material in ret ) {
                            if ( material === 'default' ) {
                                continue;
                            }
                            ret[ material ].material = materials[ material ];
                        }
                        that.objCache[ url ] = ret; // memoize
                        callback( ret );
                    };
                    
                    ret[ 'default' ] = {
                        vertices: [],
                        normals: [],
                        uvcoords:[],
                        indices: [],
                        material: renderer.createMaterial( 'solid' ),
                        indexIndex: 0 //lol
                    };
                    ret[ 'default' ].material.set( 'v4Color', [ 1, 1, 1, 1 ] );
                    activeMaterial = ret[ 'default' ];
                    
                    var lineCount = lines.length;
                    for ( i = 0; i < lineCount; ++i ){
                        line = lines[ i ].trim().split( /\s+/ );
                        switch ( line[ 0 ] ) {
                            case 'mtllib':
                                materialsLoaded = false;
                                that.loadMtl( baseUrl + line[ 1 ], materialCallback, renderer );
                                break;
                            case 'usemtl': //Group Data
                                var materialName = line[ 1 ];
                                if ( ret[ materialName ] === undefined ) {
                                    ret[ materialName ] = {
                                        vertices: [],
                                        normals: [],
                                        uvcoords:[],
                                        indices: [],
                                        indexIndex: 0 //lol
                                    };
                                }
                                activeMaterial = ret[ materialName ];
                                break;
                            case 'v': //Vertex Data
                                vList.push( line[ 1 ], line[ 2 ], line[ 3 ] );
                                break;
                            case 'vn': //Normal Data
                                nList.push( line[ 1 ], line[ 2 ], line[ 3 ] );
                                break;
                            case 'vt': //Normal Data
                                tList.push( line[ 1 ], line[ 2 ] );
                                break;
                            case 'f': //Face definition
                                var vertexIndex, uvIndex, normalIndex;
                                for ( j = 1; j <= 3; ++j ) {
                                    vertexIndex = ( line[ j ].split( '/' )[ 0 ] - 1 ) * 3;
                                    uvIndex = ( line[ j ].split( '/' )[ 1 ] - 1 ) * 2;
                                    normalIndex = ( line[ j ].split( '/' )[ 2 ] - 1 ) * 3;
                                    
                                    activeMaterial.vertices.push( vList[ vertexIndex ], vList[ vertexIndex  + 1 ], vList[ vertexIndex  + 2 ] );
                                    activeMaterial.uvcoords.push( tList[ uvIndex ], tList[ uvIndex  + 1 ] );
                                    activeMaterial.normals.push( nList[normalIndex ], nList[ normalIndex + 1 ], nList[ normalIndex + 2 ] );
                                    activeMaterial.indices.push( activeMaterial.indexIndex++ );
                                }
                                if ( line[ 4 ] !== undefined ) {
                                    vertexIndex = ( line[ 3 ].split( '/' )[ 0 ] - 1 ) * 3;
                                    uvIndex = ( line[ 3 ].split( '/' )[ 1 ] - 1 ) * 2;
                                    normalIndex = ( line[ 3 ].split( '/' )[ 2 ] - 1 ) * 3;
                                    
                                    activeMaterial.vertices.push( vList[ vertexIndex ], vList[ vertexIndex  + 1 ], vList[ vertexIndex  + 2 ] );
                                    activeMaterial.uvcoords.push( tList[ uvIndex ], tList[ uvIndex  + 1 ] );
                                    activeMaterial.normals.push( nList[normalIndex ], nList[ normalIndex + 1 ], nList[ normalIndex + 2 ] );
                                    activeMaterial.indices.push( activeMaterial.indexIndex++ );
                                    
                                    vertexIndex = ( line[ 4 ].split( '/' )[ 0 ] - 1 ) * 3;
                                    uvIndex = ( line[ 4 ].split( '/' )[ 1 ] - 1 ) * 2;
                                    normalIndex = ( line[ 4 ].split( '/' )[ 2 ] - 1 ) * 3;
                                    
                                    activeMaterial.vertices.push( vList[ vertexIndex ], vList[ vertexIndex  + 1 ], vList[ vertexIndex  + 2 ] );
                                    activeMaterial.uvcoords.push( tList[ uvIndex ], tList[ uvIndex  + 1 ] );
                                    activeMaterial.normals.push( nList[normalIndex ], nList[ normalIndex + 1 ], nList[ normalIndex + 2 ] );
                                    activeMaterial.indices.push( activeMaterial.indexIndex++ );
                                    
                                    vertexIndex = ( line[ 1 ].split( '/' )[ 0 ] - 1 ) * 3;
                                    uvIndex = ( line[ 1 ].split( '/' )[ 1 ] - 1 ) * 2;
                                    normalIndex = ( line[ 1 ].split( '/' )[ 2 ] - 1 ) * 3;
                                    
                                    activeMaterial.vertices.push( vList[ vertexIndex ], vList[ vertexIndex  + 1 ], vList[ vertexIndex  + 2 ] );
                                    activeMaterial.uvcoords.push( tList[ uvIndex ], tList[ uvIndex  + 1 ] );
                                    activeMaterial.normals.push( nList[normalIndex ], nList[ normalIndex + 1 ], nList[ normalIndex + 2 ] );
                                    activeMaterial.indices.push( activeMaterial.indexIndex++ );
                                }
                        }
                    }
                    for ( i in ret ) {
                        if ( ret[ i ].indices.length === 0 ) {
                            delete ret[ i ];
                        }
                    }
                    if ( materialsLoaded ) {
                        that.objCache[ url ] = ret; // memoize
                        callback( ret );
                    }
                }
            };
            vReq.send();
        }
    };
} );
