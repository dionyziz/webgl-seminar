var engine = {
    defaults: {
        material: {
            ambientColor: [ 1, 1, 1, 1 ],
            diffuseColor: [ 1, 1, 1, 1 ],
            specularColor: [ 1, 1, 1, 1 ],
            specularExponent: 20
        }
    },
    gl: null,
    program: null,
    vertexShader: null,
    fragmentShader: null,
    world: {},
    worldId: 0,
    models: {},
    modelId: 0,
    cameraMatrix: null,
    perspectiveMatrix: null,
    currentLight: null,
    pendingOperations: [],
    AbstractObject: function() {
        
        this.position = [ 0, 0, 0 ];
        this.rotationMatrix = Matrix.I( 4 );
        this.scaleFactor = 1;
        this.cachedMatrix = Matrix.I( 4 );
        this.move = function( x, y, z ) {
            this.position[ 0 ] += x;
            this.position[ 1 ] += y;
            this.position[ 2 ] += z;
            this.generateCacheMatrix();
        };
        this.rotate = function( pitch, yaw, roll ) {
            this.rotationMatrix = engine.utils.rotationMatrix( pitch, yaw, roll ).x( this.rotationMatrix );
            this.generateCacheMatrix();
        };
        this.scale = function( factor ) {
            this.scaleFactor *= factor;
            this.generateCacheMatrix();
        };
        this.setRotation = function( pitch, yaw, roll ) {
            this.rotationMatrix = engine.utils.rotationMatrix( pitch, yaw, roll );
            this.generateCacheMatrix();
        };
        this.setTranslation = function( x, y , z ) {
            this.position = [ x, y, z ];
            this.generateCacheMatrix();
        };
        this.setScale = function( factor ) {
            this.scaleFactor = factor;
            this.generateCacheMatrix();
        };
        this.generateCacheMatrix = function () {
            this.cachedMatrix = Matrix.Translation( $V( this.position ) ).x( Matrix.Diagonal( [ this.scaleFactor, this.scaleFactor, this.scaleFactor, 1 ] ).x( this.rotationMatrix ) );
        };
    },
    lights: {
        DirectionalLight: function() {
            this.ambientColor = [ 1, 1, 1, 1 ];
            this.diffuseColor = [ 1, 1, 1, 1 ];
            this.specularColor = [ 1, 1, 1, 1 ];
        },
        SpotLight: function() {
            this.ambientColor = [ 1, 1, 1, 1 ];
            this.diffuseColor = [ 1, 1, 1, 1 ];
            this.specularColor = [ 1, 1, 1, 1 ];
            this.attenuationFactors = [ 0, 0, 0 ];
            this.computeDistanceAttenulation = 0;
            this.spotExponent = 1;
            this.spotCutoffAngle = 45;
        }
    },
    Camera: function(  ) {
    },
    Model: function( object ) {
        var vertices, indices, normals, material;
        if( typeof object.vertices === 'undefined' || typeof object.indices === 'undefined' ) {
            return;
        }
        vertices = object.vertices;
        indices = object.indices;
        normals = object.normals || engine.utils.genNormals( vertices, indices );
        material = object.material || engine.defaults.material;
        
        var vBuffer = engine.gl.createBuffer();
        //Set the current working buffer to the one just created
        engine.gl.bindBuffer( engine.gl.ARRAY_BUFFER, vBuffer );
        //Fill it with the values of vertices Javascript Array
        engine.gl.bufferData( engine.gl.ARRAY_BUFFER, new Float32Array( vertices ), engine.gl.STATIC_DRAW );
        
        var iBuffer = engine.gl.createBuffer();
        //Set the current working buffer to the one just created
        engine.gl.bindBuffer( engine.gl.ELEMENT_ARRAY_BUFFER, iBuffer );
        //Fill it with the values of indices Javascript Array
        engine.gl.bufferData( engine.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ), engine.gl.STATIC_DRAW );
        
        var nBuffer = engine.gl.createBuffer();
        //Set the current working buffer to the one just created
        engine.gl.bindBuffer( engine.gl.ARRAY_BUFFER, nBuffer );
        //Fill it with the values of vertices Javascript Array
        engine.gl.bufferData( engine.gl.ARRAY_BUFFER, new Float32Array( normals ), engine.gl.STATIC_DRAW );
        
        vBuffer.length = vertices.length;
        iBuffer.length = indices.length;
        nBuffer.length = normals.length;
        
        this.id = engine.modelId++;
        this.vBuffer = vBuffer;
        this.iBuffer = iBuffer;
        this.nBuffer = nBuffer;
        this.material = material;
        this.unload = function() {
            for( instance in engine.world ) {
                if( engine.world[ instance ].model.id == this.id ) {
                    engine.world[ instance ].remove();
                }
            }
            engine.gl.deleteBuffer( this.vBuffer );
            engine.gl.deleteBuffer( this.nBuffer );
            engine.gl.deleteBuffer( this.iBuffer );
        }
    },
    Instance: function( model ) {
        var id = engine.worldId++;
        
        this.id = id;
        this.model = model;
        this.visible = true;
        this.material = model.material;
        this.show = function() {
            this.visible = true;
        };
        this.hide = function() {
            this.visible = false;
        };
        this.remove = function() {
            delete engine.world[ this.id ];
        };
        
        engine.world[ id ] = this;
    },
    init: function( width, height ) {
        engine.lights.DirectionalLight.prototype = new engine.AbstractObject();
        engine.lights.SpotLight.prototype = new engine.AbstractObject();
        engine.Model.prototype = new engine.AbstractObject();
        engine.Instance.prototype = new engine.AbstractObject();
        //engine.camera.prototype = new engine.abstractObject();
        
        var canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;
        engine.gl = canvas.getContext( 'experimental-webgl' );
        //Set the viewport size equal to the canvas size
        engine.gl.viewport( 0, 0, width, height );
        //Set the clear color to black
        engine.gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
        
        engine.gl.clearDepth( 1.0 );
        engine.gl.enable( engine.gl.DEPTH_TEST );
        engine.gl.depthFunc( engine.gl.LEQUAL );
        
        
        engine.cameraMatrix = Matrix.I( 4 );
        engine.setPerspective( 60, width, height, 1, 1000 );
        
        $.get( 'vertex.c', {}, function( data ) {
            engine.loadShader( data, 'vertex' );
            if( engine.program == null ) { 
                return;
            }
            var p;
            while( p = engine.pendingOperations.pop() ){
                p();
            }
        } );
        
        $.get( 'fragment.c', {}, function( data ) {
            engine.loadShader( data, 'fragment' );
            if( engine.program == null ) { 
                return;
            }
            var p;
            while( p = engine.pendingOperations.pop() ){
                p();
            }
        } );
        
        return canvas;
    },
    loadShader: function( source, type ) {
        if( type == 'vertex' ) {
            var shader = engine.gl.createShader( engine.gl.VERTEX_SHADER );
            engine.gl.shaderSource( shader, source );
            engine.gl.compileShader( shader );
            console.log( "Vertex Shader compile log:\n" + engine.gl.getShaderInfoLog( shader ) );
            engine.vertexShader = shader;
            engine.makeProgram();
        }
        if( type == 'fragment' ) {
            var shader = engine.gl.createShader( engine.gl.FRAGMENT_SHADER );
            engine.gl.shaderSource( shader, source );
            engine.gl.compileShader( shader );
            console.log( "Fragment Shader compile log:\n" + engine.gl.getShaderInfoLog( shader ) );
            engine.fragmentShader = shader;
            engine.makeProgram();
        }
    },
    makeProgram: function() {
        if( engine.vertexShader == null || engine.fragmentShader == null ) {
            return;
        }
        //Create Shader Program. Attach Vertex and Fragment shaders. Link.
        var shaderProgram = engine.gl.createProgram();
        engine.gl.attachShader( shaderProgram, engine.vertexShader );
        engine.gl.attachShader( shaderProgram, engine.fragmentShader );
        engine.gl.linkProgram( shaderProgram );
        console.log( "Program linking log:\n" + engine.gl.getProgramInfoLog( shaderProgram ) );
        //Use the program just created for rendering
        engine.gl.useProgram( shaderProgram );
        engine.program = shaderProgram;
    },
    setCamera: function( x, y, z, pitch, yaw, roll ) {
        var rotation = engine.utils.rotationMatrix( pitch, yaw, roll );
        engine.cameraMatrix = Matrix.Translation( $V( [ -x, -y, -z ] ) ).x( rotation );
        engine.combinedMatrix = engine.perspectiveMatrix.x( engine.cameraMatrix ).flatten();
    },
    setPerspective: function( field_of_view, width, height, near, far ) {
        var a = near * Math.tan( field_of_view * Math.PI / 360 );
        var ratio = width / height;
        engine.setPerspectivePlanes( -a, a, -a / ratio, a / ratio, near, far );
    },
    setPerspectivePlanes: function( left, right, bottom, top, znear, zfar ) {
        var X = 2 * znear / ( right - left );
        var Y = 2 * znear / ( top - bottom );
        var A = ( right + left ) / ( right - left );
        var B = ( top + bottom ) / ( top - bottom );
        var C = - ( zfar + znear ) / (zfar - znear );
        var D = -2 * zfar * znear / ( zfar - znear );

        engine.perspectiveMatrix = $M( 
            [
                [X, 0, A, 0],
                [0, Y, B, 0],
                [0, 0, C, D],
                [0, 0, -1, 0]
            ]
        );
        engine.combinedMatrix = engine.perspectiveMatrix.x( engine.cameraMatrix ).flatten();
    },
    setLight: function( lightObj ) {
        if( engine.program == null ) {
            engine.pendingOperations.push( function() {
                engine.setLight( lightObj );
            } );
            return;
        }
        var uniformLocation = engine.gl.getUniformLocation( engine.program, "light.position" );
        engine.gl.uniform4fv( uniformLocation, new Float32Array( lightObj.position ) );
        
        uniformLocation = engine.gl.getUniformLocation( engine.program, "light.ambient_color" );
        engine.gl.uniform4fv( uniformLocation, new Float32Array( lightObj.ambientColor ) );
        
        uniformLocation = engine.gl.getUniformLocation( engine.program, "light.diffuse_color" );
        engine.gl.uniform4fv( uniformLocation, new Float32Array( lightObj.diffuseColor ) );
        
        uniformLocation = engine.gl.getUniformLocation( engine.program, "light.specular_color" );
        engine.gl.uniform4fv( uniformLocation, new Float32Array( lightObj.specularColor ) );
        
        uniformLocation = engine.gl.getUniformLocation( engine.program, "light.spot_direction" );
        engine.gl.uniform3fv( uniformLocation, new Float32Array( lightObj.spotDirection ) );
        
        uniformLocation = engine.gl.getUniformLocation( engine.program, "light.attenuation_factors" );
        engine.gl.uniform3fv( uniformLocation, new Float32Array( lightObj.attenuationFactors ) );
        
        uniformLocation = engine.gl.getUniformLocation( engine.program, "light.compute_distance_attenuation" );
        engine.gl.uniform1i( uniformLocation, lightObj.computeDistanceAttenuation );
        
        uniformLocation = engine.gl.getUniformLocation( engine.program, "light.spot_exponent" );
        engine.gl.uniform1f( uniformLocation, lightObj.spotExponent );
        
        uniformLocation = engine.gl.getUniformLocation( engine.program, "light.spot_cutoff_angle" );
        engine.gl.uniform1f( uniformLocation, lightObj.spotCutoffAngle );
        
    },
    setMaterial: function( materialObj ) {
        if( engine.program == null ) {
            engine.pendingOperations.push( function() {
                engine.setMaterial( materialObj );
            } );
            return;
        }
        
        var uniformLocation = engine.gl.getUniformLocation( engine.program, "material.ambient_color" );
        engine.gl.uniform4fv( uniformLocation, new Float32Array( materialObj.ambientColor ) );
        
        uniformLocation = engine.gl.getUniformLocation( engine.program, "material.diffuse_color" );
        engine.gl.uniform4fv( uniformLocation, new Float32Array( materialObj.diffuseColor ) );
        
        uniformLocation = engine.gl.getUniformLocation( engine.program, "material.specular_color" );
        engine.gl.uniform4fv( uniformLocation, new Float32Array( materialObj.specularColor ) );
        
        uniformLocation = engine.gl.getUniformLocation( engine.program, "material.specular_exponent" );
        engine.gl.uniform1f( uniformLocation, materialObj.specularExponent );
        
    },
    draw: function() {
        if( engine.program == null ) {
            return;
        }
        //Clear the screen
        engine.gl.clear( engine.gl.COLOR_BUFFER_BIT | engine.gl.DEPTH_BUFFER_BIT );
        var attrLocation
        
        //Combined Matrix. Camera + Perspective. Same for all elements
        var matLocation = engine.gl.getUniformLocation( engine.program, "combined" );
        engine.gl.uniformMatrix4fv( matLocation, false, new Float32Array( engine.combinedMatrix ) );
        
        var pMatrix;//, mMatrix;
        var instance;
        for( instance in engine.world ) {
            if( !engine.world[ instance ].visible ) {
                continue;
            }
            pMatrix = engine.world[ instance ].model.cachedMatrix.x( engine.world[ instance ].cachedMatrix );
            //iMatrix = engine.world[ instance ].cachedMatrix;
            
            attrLocation = engine.gl.getAttribLocation( engine.program, "vPosition" );
            engine.gl.bindBuffer( engine.gl.ARRAY_BUFFER, engine.world[ instance ].model.vBuffer );
            engine.gl.vertexAttribPointer( attrLocation, 3, engine.gl.FLOAT, false, 0, engine.world[ instance ].model.vBuffer );
            engine.gl.enableVertexAttribArray( attrLocation );
            
            attrLocation = engine.gl.getAttribLocation( engine.program, "vNormal" );
            engine.gl.bindBuffer( engine.gl.ARRAY_BUFFER, engine.world[ instance ].model.nBuffer );
            engine.gl.vertexAttribPointer( attrLocation, 3, engine.gl.FLOAT, false, 0, engine.world[ instance ].model.nBuffer );
            engine.gl.enableVertexAttribArray( attrLocation );
            
            //Model's matrix multiplied by Model instance's matrix
            matLocation = engine.gl.getUniformLocation( engine.program, "pmatrix" );
            engine.gl.uniformMatrix4fv( matLocation, false, new Float32Array( pMatrix.flatten() ) );            
            
            /*Model instance's matrix
            matLocation = engine.gl.getUniformLocation( engine.program, "iMatrix" );
            engine.gl.uniformMatrix4fv( matLocation, false, new Float32Array( iMatrix.flatten() ) );*/
            
            engine.setMaterial( engine.world[ instance ].material );
            
            
            engine.gl.bindBuffer( engine.gl.ELEMENT_ARRAY_BUFFER, engine.world[ instance ].model.iBuffer );
            engine.gl.drawElements( engine.gl.TRIANGLES, engine.world[ instance ].model.iBuffer.length, engine.gl.UNSIGNED_SHORT, 0 );
        }
    },
    utils: {
        makeSphere: function ( radius, precision ) {
            precision = precision || 0.1;
            var model = {
                vertices: [],
                normals: [],
                indices: []
            };
            
            for ( var p = 0; p < 1; p += precision ) {
                for ( var t = 0; t < 1; t += precision ) {
                    var phi = p * Math.PI;
                    var theta = t * Math.PI * 2;
                    var a = [
                        Math.sin( phi ) * Math.cos( theta ),
                        Math.sin( phi ) * Math.sin( theta ),
                        Math.cos( phi )
                    ];
                    var b = [
                        Math.sin( phi ) * Math.cos( theta + 2 * Math.PI * precision ),
                        Math.sin( phi ) * Math.sin( theta + 2 * Math.PI * precision ),
                        Math.cos( phi )
                    ];
                    var c = [
                        Math.sin( phi + Math.PI * precision ) * Math.cos( theta + 2 * Math.PI * precision ),
                        Math.sin( phi + Math.PI * precision ) * Math.sin( theta + 2 * Math.PI * precision ),
                        Math.cos( phi + Math.PI * precision )
                    ];
                    var d = [
                        Math.sin( phi + Math.PI * precision ) * Math.cos( theta ),
                        Math.sin( phi + Math.PI * precision ) * Math.sin( theta ),
                        Math.cos( phi + Math.PI * precision )
                    ];
                    
                    l = model.vertices.length / 3;
                    
                    model.vertices.push(
                        radius * a[ 0 ], radius * a[ 1 ], radius * a[ 2 ],
                        radius * b[ 0 ], radius * b[ 1 ], radius * b[ 2 ],
                        radius * c[ 0 ], radius * c[ 1 ], radius * c[ 2 ],
                        radius * d[ 0 ], radius * d[ 1 ], radius * d[ 2 ]
                    );
                    
                    model.normals.push(
                        a[ 0 ], a[ 1 ], a[ 2 ],
                        b[ 0 ], b[ 1 ], b[ 2 ],
                        c[ 0 ], c[ 1 ], c[ 2 ],
                        d[ 0 ], d[ 1 ], d[ 2 ]
                    );
                    
                    model.indices.push(
                        l + 0, l + 1, l + 2
                    );
                    
                    if ( p <= 1 - precision ) {
                        model.indices.push(
                            l + 0, l + 2, l + 3
                        );
                    }
                }
            }

            return model;
        },
        genNormals: function( points, indices ) {
            var a, b, c;
            var ax, ay, az;
            var bx, by, bz;
            var cx, cy, cz;
            var AB, BC, N;
            var normals = [];

            // default normal
            for ( var i = 0; i < points.length; ++i ) {
                normals[ i ] = [];
            }

            for ( var triangle = 0; triangle < indices.length / 3; ++triangle ) {
                a = indices[ triangle * 3 + 0 ];
                b = indices[ triangle * 3 + 1 ];
                c = indices[ triangle * 3 + 2 ];
                ax = points[ a * 3 + 0 ];
                ay = points[ a * 3 + 1 ];
                az = points[ a * 3 + 2 ];
                bx = points[ b * 3 + 0 ];
                by = points[ b * 3 + 1 ];
                bz = points[ b * 3 + 2 ];
                cx = points[ c * 3 + 0 ];
                cy = points[ c * 3 + 1 ];
                cz = points[ c * 3 + 2 ];

                AB = vec3.create( [ bx - ax, by - ay, bz - az ] );
                BC = vec3.create( [ cx - bx, cy - by, cz - bz ] );
                N = vec3.normalize( vec3.cross( AB, BC ) );

                normals[ a ].push( N );
                normals[ b ].push( N );
                normals[ c ].push( N );
            }

            var fNormals = [];
            for ( var j, i = 0; i < normals.length; ++i ) {
                if ( normals[ i ].length == 0 ) {
                    fNormals.push( 0, 0, 1 );
                    continue;
                }
                if ( normals[ i ].length == 1 ) {
                    fNormals.push( normals[ i ][ 0 ][ 0 ], normals[ i ][ 0 ][ 1 ], normals[ i ][ 0 ][ 2 ] );
                    continue;
                }
                for ( j = 1; j < normals[ i ].length; ++j ) {
                    vec3.add( normals[ i ][ 0 ], normals[ i ][ j ] );
                }
                vec3.normalize( normals[ i ][ 0 ] );
                fNormals.push( normals[ i ][ 0 ][ 0 ], normals[ i ][ 0 ][ 1 ], normals[ i ][ 0 ][ 2 ] );
            }

            return fNormals;
        },
        rotationMatrix: function( pitch, yaw, roll ) {
            var A = Math.cos( pitch ); // pitch
            var B = Math.sin( pitch );

            var C = Math.cos( yaw ); // yaw
            var D = Math.sin( yaw );

            var E = Math.cos( roll ); // roll
            var F = Math.sin( roll );
            return $M( [
                [  C * E, -B * D * E + A * F        ,  A * D * E + B * F, 0 ],
                [ -C * F,  B * D * F + A * E        , -A * D * F + B * E, 0 ],
                [ -D    , -B * C                    ,  A * C            , 0 ], 
                [ 0     ,  0                        ,  0                , 1 ]
            ] );
        }
    }
}