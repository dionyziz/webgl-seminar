define( [ 'require', './shader', 'libs/events' ], function( require, Shader, events ) {
    var textureCache = {};
    var activeTexture = 2;
    var activeCubemap = 1;
    
    var Material = function( source, renderer ) {
        var log = {};
        var that = this;
        this.transparent = false;

        function setUniform( name, value ) {
            // actually set the uniform on the shader...
            var type = Shader.typeFromHungarian( name );
            
            if ( that.inputs[ name ] === undefined ) {
                that.inputs[ name ] = {};
            }
            
            switch ( type ) {
                case Shader.TYPE_TEXTURE2D:
                    if ( typeof value == 'string' ) {
                        value = {
                            url: value,
                            generateMipMap: true
                        };
                    }
                    var key = value.url + ( value.generateMipMap? ':mipmapped': '' );
                    
                    if ( typeof textureCache[ key ] !== 'undefined' ) {
                        that.inputs[ name ].value = textureCache[ key ];
                        return;
                    }
                    var ret = {};
                    that.inputs[ name ].value = ret;
                    
                    var img = new Image();
                    img.src = value.url;
                    img.onload = function () {
                        ret.texture = renderer.createTexture( {
                            element: this   
                        });
                        renderer.bindTexture( ret.texture, activeTexture );
                        ret.bindPosition = activeTexture;
                        activeTexture++;
                    };
                    textureCache[ key ] = ret;
                    break;
                case Shader.TYPE_TEXTURECUBE:
					var positions = [ 'posx', 'negx', 'posy', 'negy', 'posz', 'negz' ];
					var images = [];
					var waiter = Object.create( events.EventWaiter );

					for( var i = 0; i < 6; ++i ) {
						images[ i ] = new Image();
						images[ i ].src = value[ positions[ i ] ];
						waiter.waitMore();
						images[ i ].onload = function () {
							waiter.waitLess();
						}
					}
					waiter.on( 'complete', function () {
						var cubemap = renderer.createCubemap( {
                            sides: images
                        } );
						that.inputs[ name ].value = { texture: cubemap, bindPosition: activeCubemap };
                        renderer.bindTexture( cubemap, activeCubemap );
                        activeCubemap++;
					} );
                    break;
                case Shader.TYPE_INT:
                case Shader.TYPE_BOOL:
                case Shader.TYPE_FLOAT:
                case Shader.TYPE_VEC3:
                case Shader.TYPE_VEC4:
                case Shader.TYPE_MAT3:
                case Shader.TYPE_MAT4:
                    that.inputs[ name ].value = value;
            }
        }

        this.set = function( name, value ) {
            if ( source.loaded ) {
                setUniform( name, value );
            }
            else {
                log[ name ] = value;
            }
        };
        
        var onload = function () {
            var Renderer = require('./renderer' );
            var globalInputs = {
                WorldMatrix: Renderer.WORLD_MATRIX,
                WorldViewMatrix: Renderer.WORLD_VIEW_MATRIX,
                WorldViewProjectionMatrix: Renderer.WORLD_VIEW_PROJECTION_MATRIX,
                ViewProjectionMatrix: Renderer.VIEW_PROJECTION_MATRIX,
                ProjectionMatrix: Renderer.PROJECTION_MATRIX,
                ViewMatrix: Renderer.VIEW_MATRIX,
                InverseWorldMatrix: null,
                InverseWorldViewMatrix: null,
                Time: Renderer.TIME
            };

            for ( var name in log ) {
                setUniform( name, log[ name ] );
            }
            var uniformCount = renderer.gl.getProgramParameter( source.program, renderer.gl.ACTIVE_UNIFORMS );
            for ( var i = 0; i < uniformCount; ++i ) {
                name = renderer.gl.getActiveUniform( source.program, i ).name;
                if ( name[ 0 ] + name[ 1 ] == 'g_' && name.split( 'g_' )[ 1 ] in globalInputs ) {
                    this.globalInputs[ globalInputs[ name.split( 'g_' )[ 1 ] ] ] = renderer.gl.getUniformLocation( source.program, name );
                }
                else {
                    if ( this.inputs[ name ] === undefined ) {
                        this.inputs[ name ] = {};
                    }
                    this.inputs[ name ].location = renderer.gl.getUniformLocation( source.program, name );
                }
            }
            
            var attributeCount = renderer.gl.getProgramParameter( source.program, renderer.gl.ACTIVE_ATTRIBUTES );
            for ( i = 0; i < attributeCount; ++i ) {
 //               console.log( renderer.gl.getActiveAttrib( source.program, i ) );
                name = renderer.gl.getActiveAttrib( source.program, i ).name;
                if ( name[ 0 ] + name[ 1 ] == 'in' && name.split( 'in' )[ 1 ] in Shader.vertexAttributes ) {
                    this.vertexAttributes[ name.split( 'in' )[ 1 ] ] = renderer.gl.getAttribLocation( source.program, name );
                }
            }

        }.bind( this );
        
        if ( typeof source === 'object' ) {
            var name;
            
            this.inputs = {};
            this.globalInputs = {};
            this.vertexAttributes = {};
            this.shader = source;
            
            if ( !source.loaded ) {
                source.on( 'load', onload );
            }
            else {
                onload();
            }
        }
    };

    return Material;
} );
