define( [ './camera', './shader', './material', './drawable', 'libs/math', './animable', './billboard', './utils', 'models/mesh', 'libs/events', 'libs/extender' ], function( Camera, Shader, Material, Drawable, math, Animable, Billboard, utils, Mesh, events, inherits ) {

    var Renderer = function() {
        this.objectList = {};
        this.width = 300;
        this.height = 150;
        this.time = 0;
        this.activeCamera = new Camera();
        this.activeCamera.moveTo( 0, 0, 1 );
    };
    
    Renderer.prototype = {
        createBoundingSpheres: function( radius ) {
            var sphere = utils.makeSphere( 1, 10, 10 );
            sphere = new Mesh( sphere.vertices, sphere.indices );
            sphere = renderer.createDrawable( { mesh: sphere } );
            sphere.material.set( 'v4Color', [ 1, 1, 1, 0.02 ] );
            sphere.material.transparent = true;
            
            var spheres = [];
            for ( i in this.objectList ) {
				var pos = this.objectList[ i ].mesh.getBoundingSphere()[ 0 ];
				pos = tetra.multiplyVec3( this.objectList[ i ].getOrientation(), pos );
                pos = math.dian3.add( this.objectList[ i ].getPosition(), pos );
                sphere.moveTo.apply( sphere, pos );
                if( radius ) {
                    sphere.scaleFactor = this.objectList[ i ].mesh.getBoundingSphere()[ 1 ] * this.objectList[ i ].getScale();
                }
  //                  this.objectList[ i ].hide();
                spheres.push( sphere );
                sphere = sphere.clone();
            };
            for( var i = 0; i < spheres.length; ++i ) {
                spheres[ i ].cull = false;
                spheres[ i ].show();
            }
        },
        drawableId: 0,
		textureId: 0,
        materialId: 0,
        init: function( width, height ) {
            this.canvas = document.createElement( 'canvas' );
            if ( !width && !height ) {
                width = window.innerWidth; 
                height = window.innerHeight;
                var that = this;
                window.addEventListener( 'resize', function() { 
                    that.resize( window.innerWidth, window.innerHeight );
                }, false ); 
            }
            this.canvas.width = this.width = width;
            this.canvas.height = this.height = height;
            this.activeCamera.setViewport( width, height );
            this.gl = this.canvas.getContext( 'experimental-webgl', {
                depth: true,
                antialias: true
            } );
            if( this.gl === null ) {
                throw( 'Could not initialize WebGL' );
            }
            //Set the viewport size equal to the canvas size
            this.gl.viewport( 0, 0, width, height );
            //Set the clear color to black
            this.gl.clearColor( 1, 1, 1, 1 );
            
            this.gl.clearDepth( 1 );
            this.gl.enable( this.gl.CULL_FACE );
            this.gl.enable( this.gl.DEPTH_TEST );
            this.gl.depthFunc( this.gl.LEQUAL );
            this.gl.enable( this.gl.BLEND );
            this.gl.blendFunc( this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA );
            this.gl.clear( this.gl.COLOR_BUFFER_BIT );

            this.hitBuffer = this.createFramebuffer( this.width, this.height );
            var renderer = this;
            $( this.canvas ).click( function( e ) {
                var id = renderer.hitTest( e.clientX, renderer.height - e.clientY );
                if ( id == 0xffffff ) {
                    return;
                }
                renderer.emit( 'click', renderer.objectList[ id ] );
                if ( renderer.objectList[ id ] !== undefined ) {
                    renderer.objectList[ id ].emit( 'click' );
                }
            } );
            var prev = null;
            $( this.canvas ).mousemove( function( e ) {
                var id = renderer.hitTest( e.clientX, renderer.height - e.clientY );
                if( id == prev || id == 0xffffff) {
                    return;
                }
                renderer.emit( 'mouseover', renderer.objectList[ id ] );
                if ( renderer.objectList[ id ] !== undefined && !renderer.objectList[ id ].emit ) {
                    console.log( renderer.objectList[ id ].constructor );
                }
                if ( renderer.objectList[ id ] !== undefined ) {
                    renderer.objectList[ id ].emit( 'mouseover' );
                }
                if( renderer.objectList[ prev ] !== undefined ) {
                    renderer.emit( 'mouseout', renderer.objectList[ prev ] );
                    if ( renderer.objectList[ id ] !== undefined ) {
                        renderer.objectList[ prev ].emit( 'mouseout' );
                    }
                }
                prev = id;
            } );
            this.hitMat = this.createMaterial( 'solid' );
            this.hitCounter = 0;
            return this.canvas;
        },
		createTexture: function( data ) {
            var defaults = {
                element: null,
                mipmap: true,
                mipmapFilter: Renderer.LINEAR,
                flipY: true,
                minFilter: Renderer.LINEAR,
                magFilter: Renderer.LINEAR
            }
            for ( var i in defaults ) {
                data[ i ] = data[ i ] ? data[ i ] : defaults[ i ];
            }

            if ( data.element == null ) {
                throw 'Passed element was null.';
            }
            
            var gl = this.gl;
			var texture = gl.createTexture();
            texture.type = gl.TEXTURE_2D;
            gl.activeTexture( gl.TEXTURE0 );
			gl.bindTexture( gl.TEXTURE_2D, texture );
			gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, data.flipY );
			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, data.element );

            var mipFilter = '';
			if ( data.mipmap ) {
				gl.generateMipmap( gl.TEXTURE_2D );
                mipFilter = data.mipmapFilter == Renderer.LINEAR ? 'LINEAR_MIPMAP_' : 'NEAREST_MIPMAP_';
			}

            if ( data.magFilter == Renderer.LINEAR ) {
    			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
            }
            else {
    			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
            }
            if ( data.minFilter == Renderer.LINEAR ) {
    			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[ mipFilter + 'LINEAR' ] );
            }
            else {
    			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[ mipFilter + 'NEAREST' ] );
            }
			gl.bindTexture( gl.TEXTURE_2D, null );
			return texture;
		},
        bindTexture: function( texture, position ) {
            if ( position < 0 || position > 31 ) {
                throw 'Texture bind position is out of bounds';
            }
            this.gl.activeTexture( this.gl.TEXTURE0 + position );
            this.gl.bindTexture( texture.type, texture );
        },
        createCubemap: function( data ) {
            var defaults = {
                sides: [],
                mipmap: true,
                mipmapFilter: Renderer.LINEAR,
                flipY: true,
                minFilter: Renderer.LINEAR,
                maxFilter: Renderer.LINEAR
            }
            for ( var i in defaults ) {
                data[ i ] = data[ i ] ? data[ i ] : defaults[ i ];
            }

            var gl = this.gl;
            var cubemap = renderer.gl.createTexture();
            cubemap.type = gl.TEXTURE_CUBE_MAP;
            gl.activeTexture( gl.TEXTURE0 );
            gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubemap );	
            for( var i = 0; i < 6; ++i ) {
                gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, data.sides[ i ] );
            }
            gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
            gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
            gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
            gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
            gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );
            return cubemap;
        },
        createFramebuffer: function( width, height ) {
            var gl = this.gl;
            var fb = gl.createFramebuffer();
            gl.bindFramebuffer( gl.FRAMEBUFFER, fb );

            var colorTex = gl.createTexture();
            gl.activeTexture( gl.TEXTURE0 );
            gl.bindTexture( gl.TEXTURE_2D, colorTex );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTex, 0 );

            var depthRB = gl.createRenderbuffer();
            gl.bindRenderbuffer( gl.RENDERBUFFER, depthRB );
            gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height );
            gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRB );

            gl.bindRenderbuffer( gl.RENDERBUFFER, null );

            fb.colorAttachment = colorTex;
            fb.depthAttachment = depthRB;
            gl.bindFramebuffer( gl.FRAMEBUFFER, null );

            return fb;
        },
        bindFramebuffer: function( fb ) {
            var gl = this.gl;
            gl.bindFramebuffer( gl.FRAMEBUFFER, fb );
        },
        updateFramebuffer: function( fb, width, height ) {
            var gl = this.gl;
            gl.activeTexture( gl.TEXTURE0 );
            gl.bindTexture( gl.TEXTURE_2D, fb.colorAttachment );
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            gl.bindRenderbuffer( gl.RENDERBUFFER, fb.depthAttachment );
            gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height );
            
            gl.bindRenderbuffer( gl.RENDERBUFFER, null );
        },
        hitTest: function( x, y ) {
            this.bindFramebuffer( this.hitBuffer );
            var arr = new Uint8Array( 4 );
            this.gl.readPixels( x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, arr );
            var id = ( arr[ 0 ] << 16 ) | ( arr[ 1 ] << 8 ) | arr[ 2 ];
            this.bindFramebuffer( null );
            return id;
        },
        createShader: function( url ) {
            return Shader( 'js/views/graphics/new/shaders/' + url, this );
        },
        createMaterial: function( source ) {
            if ( typeof source === 'string' ) {
                source = this.createShader( source );
            }
            var ret = new Material( source, this );
            ret.id = this.materialId++;
            return ret;
        },
        createDrawable: function( data ) {
            var d = new Drawable( data, this );
            d.id = this.drawableId++;
            return d;
        },
        createAnimable: function( data ) {
            var d = new Animable( data, this );
            d.id = this.drawableId++;
            return d;
        },
        createBillboard: function() {
            data = { mesh: Billboard.mesh, uvcoords: Billboard.uvcoords, material: this.createMaterial( 'billboard' ) };
            var d = new Billboard( data, this );
            d.id = this.drawableId++;
            return d;
        },
        add: function( obj ) {
            this.objectList[ obj.id ] = obj;
        },
        remove: function( obj ) {
            delete this.objectList[ obj.id ];
        },
        resize: function( width, height ) {
            this.canvas.width = this.width = width;
            this.canvas.height = this.height = height;
            this.activeCamera.setViewport( width, height );
            this.updateFramebuffer( this.hitBuffer, width, height );
        },
        render: function() {
            this.gl.viewport( 0, 0, this.width, this.height );
            this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
            
            var i, transparentList = [], opaqueList = [], worldViewList = {};
            var tetra = math.tetra;
            for ( i in this.objectList ) {
				var pos = this.objectList[ i ].mesh.getBoundingSphere()[ 0 ];
				pos = tetra.multiplyVec3( this.objectList[ i ].getOrientation(), pos );
                worldViewList[ i ] = mat4.multiplyVec3( this.activeCamera.getInverse(), math.dian3.add( this.objectList[ i ].getPosition(), pos ) );
            };
            
            for ( i in worldViewList ) {
                //Temporary disabling frustum culling until getBoundingSphere behaves correctly
				if ( this.objectList[ i ].cull ) {
					if ( this.activeCamera.isVisible( worldViewList[ i ], this.objectList[ i ].mesh.getBoundingSphere()[ 1 ] ) ) {
						if( this.objectList[ i ].material.transparent ) {
							transparentList.push( this.objectList[ i ] );
						}
						else {
							opaqueList.push( this.objectList[ i ] );
						}
					}
				}
				else {
					if( this.objectList[ i ].material.transparent ) {
                        transparentList.push( this.objectList[ i ] );
                    }
                    else {
                        opaqueList.push( this.objectList[ i ] );
                    }
				}
            }
            //Sort transparent objects
            opaqueList.sort( function( a, b ) {
                return -worldViewList[ a.id ][ 2 ] + worldViewList[ b.id ][ 2 ];
            } );
            
            transparentList.sort( function( a, b ) {
                return worldViewList[ a.id ][ 2 ] - worldViewList[ b.id ][ 2 ];
            } );
            
            //Render opaque objects front to back
            var l = opaqueList.length;
            for ( i = 0; i < l; ++i ) {
                this.gl.useProgram( opaqueList[ i ].material.shader.program );
                opaqueList[ i ].render();
            }
            
            if( this.hitCounter++ == 3 ) {
                this.hitCounter = 0;
                this.bindFramebuffer( this.hitBuffer );
                this.gl.viewport( 0, 0, this.width, this.height );
                this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
                this.gl.useProgram( this.hitMat.shader.program );
                for ( i = 0; i < l; ++i ) {
                    var obj = opaqueList[ i ];
                    var prev = obj.material;
                    obj.material = this.hitMat;
                    this.hitMat.set( 'v4Color', [ ( (obj.id >> 0x10 ) & 0xff ) / 255, ( ( obj.id >> 0x8 ) & 0xff ) / 255, ( obj.id & 0xff ) / 255, 1 ] );
                    obj.render();
                    obj.material = prev;
                }
                this.bindFramebuffer( null );
            }
            
            //Render transparent objects back to front
            l = transparentList.length;
            //this.gl.disable( this.gl.CULL_FACE );
            for ( i = 0; i < l; ++i ) {
                this.gl.useProgram( transparentList[ i ].material.shader.program );
                transparentList[ i ].render();
            }
            //this.gl.enable( this.gl.CULL_FACE );
        },
        useCamera: function( camera ) {
            this.activeCamera = camera;
            camera.setViewport( this.width, this.height );
        },
        getWorldUniform: function( uniform, obj ) {
            var ret;
            uniform = uniform - 0;
            switch( uniform ) {
                case Renderer.WORLD_MATRIX:
                    return obj.getMatrix();
                case Renderer.WORLD_VIEW_MATRIX:
                    return mat4.multiply( this.activeCamera.getInverse(), obj.getMatrix(), tempMat );
                case Renderer.WORLD_VIEW_PROJECTION_MATRIX:
                    ret = tempMat;
                    mat4.multiply( this.activeCamera.perspectiveMatrix, this.activeCamera.getInverse(), ret );
                    return mat4.multiply( ret, obj.getMatrix() );
                case Renderer.VIEW_PROJECTION_MATRIX:
                    ret = mat4.create();
                    return mat4.multiply( this.activeCamera.perspectiveMatrix, this.activeCamera.getInverse(), ret );
                case Renderer.PROJECTION_MATRIX:
                    return this.activeCamera.perspectiveMatrix;
                case Renderer.VIEW_MATRIX:
                    return this.activeCamera.getInverse();
                case Renderer.TIME:
                    return this.time;
                case Renderer.WORLD_INVERSE_MATRIX:
                case Renderer.WORLD_VIEW_INVERSE_MATRIX:
                case Renderer.WORLD_VIEW_PROJECTION_INVERSE_MATRIX:
                case Renderer.VIEW_PROJECTION_INVERSE_MATRIX:
                case Renderer.PROJECTION_INVERSE_MATRIX:
            }
        }
    }

    inherits( Renderer, events.EventEmitter );

    var tempMat = mat4.create();
    Renderer.WORLD_MATRIX = 1;
    Renderer.WORLD_VIEW_MATRIX = 2;
    Renderer.WORLD_VIEW_PROJECTION_MATRIX = 3;
    Renderer.VIEW_PROJECTION_MATRIX = 4;
    Renderer.VIEW_MATRIX = 5;
    Renderer.PROJECTION_MATRIX = 6;
    Renderer.TIME = 7;

    Renderer.LINEAR = 1;
    Renderer.NEAREST = 2;

    return Renderer;
} );
