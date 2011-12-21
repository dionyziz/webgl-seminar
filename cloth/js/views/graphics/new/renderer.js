define( [ './camera', './shader', './material', './drawable' ], function( Camera, Shader, Material, Drawable ) {
    var Renderer = function() {
        this.objectList = {};
        this.width = 300;
        this.height = 150;
        this.time = 0;
        this.activeCamera = new Camera();
        this.activeCamera.moveTo( 0, 0, 1 );
    };

    Renderer.prototype = {
        drawableId: 0,
		textureId: 0,
        materialId: 0,
        init: function( width, height ) {
            var canvas = document.createElement( 'canvas' );
            canvas.width = this.width = width;
            canvas.height = this.height = height;
            this.activeCamera.setViewport( width, height );
            this.canvas = canvas;
            this.gl = canvas.getContext( 'experimental-webgl', {
                depth: true
            } );
            if( this.gl === null ) {
                throw( 'Could not initialize WebGL' );
            }
            //Set the viewport size equal to the canvas size
            this.gl.viewport( 0, 0, width, height );
            //Set the clear color to black
            this.gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
            
            this.gl.clearDepth( 1.0 );
            this.gl.enable( this.gl.CULL_FACE );
            this.gl.enable( this.gl.DEPTH_TEST );
            this.gl.depthFunc( this.gl.LEQUAL );
            this.gl.enable( this.gl.BLEND );
            this.gl.blendFunc( this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA );
            this.gl.clear( this.gl.COLOR_BUFFER_BIT );
            return canvas;
        },
		createTexture: function( data, mipmap, format ) {
			var texture = renderer.gl.createTexture();                            
			renderer.gl.bindTexture( renderer.gl.TEXTURE_2D, texture );
			renderer.gl.pixelStorei( renderer.gl.UNPACK_FLIP_Y_WEBGL, true );
			renderer.gl.texParameteri( renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_MAG_FILTER, renderer.gl.LINEAR );
			renderer.gl.texImage2D( renderer.gl.TEXTURE_2D, 0, renderer.gl.RGB, renderer.gl.RGB, renderer.gl.UNSIGNED_BYTE, this );
			if ( mipmap ) {
				renderer.gl.texParameteri( renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_MIN_FILTER, renderer.gl.LINEAR_MIPMAP_NEAREST );
				renderer.gl.generateMipmap( renderer.gl.TEXTURE_2D );
			}
			else {
				renderer.gl.texParameteri( renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_MIN_FILTER, renderer.gl.LINEAR );
			}
			renderer.gl.bindTexture( renderer.gl.TEXTURE_2D, null );
			return texture;
		},
        createShader: function( url ) {
            return new Shader( 'js/views/graphics/new/shaders/' +url, this );
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
        },
        render: function() {
            this.gl.viewport( 0, 0, this.width, this.height );
            this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
            
            var i, transparentList = [], opaqueList = [], worldViewList = {};
            
            for ( i in this.objectList ) {
                worldViewList[ i ] = mat4.multiplyVec3( this.activeCamera.getInverse(), this.objectList[ i ].getPosition() );
            };
            
            for ( i in worldViewList ) {
                //Temporary disabling frustum culling until getBoundingSphere behaves correctly
                //if ( this.activeCamera.isVisible( worldViewList[ i ], this.objectList[ i ].mesh.getAbsoluteBoundingSphere()[ 1 ] ) ) {
                    //if( this.objectList[ i ].material.transparent ) {
                        transparentList.push( this.objectList[ i ] );
                    //}
                    //else {
                        //opaqueList.push( this.objectList[ i ] );
                    //}
                //}
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
            
            //Render transparent objects back to front
            l = transparentList.length;
            for ( i = 0; i < l; ++i ) {
                this.gl.useProgram( transparentList[ i ].material.shader.program );
                transparentList[ i ].render();
            }
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
                    return mat4.multiply( this.activeCamera.getInverse(), obj.getMatrix(), mat4.create() );
                case Renderer.WORLD_VIEW_PROJECTION_MATRIX:
                    ret = mat4.create();
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

    Renderer.WORLD_MATRIX = 1;
    Renderer.WORLD_VIEW_MATRIX = 2;
    Renderer.WORLD_VIEW_PROJECTION_MATRIX = 3;
    Renderer.VIEW_PROJECTION_MATRIX = 4;
    Renderer.VIEW_MATRIX = 5;
    Renderer.PROJECTION_MATRIX = 6;
    Renderer.TIME = 7;

    return Renderer;
} );
