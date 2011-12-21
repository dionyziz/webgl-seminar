define( [ 'require', './shader' ], function( require, Shader ) {
    var Material = function( source, renderer ) {
        var log = {};
        var textureCache = {};
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
                    ( function assignTexture() {
                        if ( typeof value == 'string' ) {
                            value = {
                                url: value,
                                generateMipMap: true
                            };
                        }
                        var key = value.url + ( value.generateMipMap? ':mipmapped': '' );
                        
                        if ( textureCache[ key ] !== undefined ) {
                            that.inputs[ name ].value = textureCache[ key ];
                            return;
                        }
                        
                        var img = new Image();
                        img.src = value.url;
                        img.onload = function () {
                            var texture = renderer.gl.createTexture();
                            
                            renderer.gl.bindTexture( renderer.gl.TEXTURE_2D, texture );
                            renderer.gl.pixelStorei( renderer.gl.UNPACK_FLIP_Y_WEBGL, true );
                            renderer.gl.texParameteri( renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_MAG_FILTER, renderer.gl.LINEAR );
                            renderer.gl.texImage2D( renderer.gl.TEXTURE_2D, 0, renderer.gl.RGB, renderer.gl.RGB, renderer.gl.UNSIGNED_BYTE, this );
                            if ( value.generateMipMap ) {
                                renderer.gl.texParameteri( renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_MIN_FILTER, renderer.gl.LINEAR_MIPMAP_LINEAR );
                                renderer.gl.generateMipmap( renderer.gl.TEXTURE_2D );
                            }
                            else {
                                renderer.gl.texParameteri( renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_MIN_FILTER, renderer.gl.LINEAR );
                            }
                            renderer.gl.bindTexture( renderer.gl.TEXTURE_2D, null );
                            // memoize
                            textureCache[ key ] = texture;
                            that.inputs[ name ].value = texture;
                        };
                    } )();
                    break;
                case Shader.TYPE_TEXTURECUBE:
                    ( function assignCubeMap() {
                        var cubemap = renderer.gl.createTexture();
                        renderer.gl.bindTexture( renderer.gl.TEXTURE_CUBE_MAP, cubemap );
                        var positions = {
                            posx: renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                            negx: renderer.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                            posy: renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                            negy: renderer.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                            posz: renderer.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                            negz: renderer.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
                        };
                        var images = [];
                        var waiter = new ( require( 'libs/events' ).EventWaiter )();
                        
                        for ( var i in positions ) {
                            images[ i ] = new Image();
                            images[ i ].src = value[ i ];
                            waiter.waitMore();
                            images[ i ].onload = ( function ( texturePosition ) {
                                return function () {
                                    renderer.gl.texImage2D( texturePosition, 0, renderer.gl.RGB, renderer.gl.RGB, renderer.gl.UNSIGNED_BYTE, that );
                                    waiter.waitLess();
                                }
                            } )( positions[ i ] );
                        }
                        waiter.on( 'complete', function () {
                            if ( value.generateMipMap ) {
                                renderer.gl.generateMipmap( GL_TEXTURE_CUBE_MAP );
                                renderer.gl.texParameteri( GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR );
                            }
                        } );
                        
                        renderer.gl.texParameteri( GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR );
                        renderer.gl.bindTexture( renderer.gl.TEXTURE_CUBE_MAP, null );
                        
                        that.inputs[ name ].value = cubemap;
                    } )();
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
