define( [ 'libs/extender', 'models/transformable', 'models/mesh', './shader', './utils' ], function( inherits, Transformable, Mesh, Shader, utils ) {
    var Billboard = function( data, renderer ) {
        Transformable.call( this );

        if ( renderer !== undefined ) {
            this.renderer = renderer;
        }
        if ( data !== undefined && data.mesh !== undefined ) {
            this.createBuffers( data );
        }
        this.texture = null;
    };
    var enabledAttribArray = {};
   
    var square = utils.makeSquare( -0.5, -0.5, 0.5, 0.5 );
    Billboard.mesh = new Mesh( square.vertices, square.indices );
    Billboard.uvcoords = square.uvcoords;
    
    Billboard.prototype = {
        setText: function( text ) {
            var textHeight = 10;
            var TEXTURE_WIDTH = 1024;
            //measurement canvas - used nowhere else
            var c = document.createElement( 'canvas' );
            c.height = textHeight;
            var sc = c.getContext( '2d' );
            sc.textBaseline = 'top';
            sc.font = 'bold ' + textHeight + 'px "Helvetica"';
            var textWidth = sc.measureText( text ).width;
            
            var c2 = document.createElement( 'canvas' );
            c2.width = TEXTURE_WIDTH;
            c2.height = TEXTURE_WIDTH;
            var s = c2.getContext( '2d' );

            s.textBaseline = sc.textBaseline;
            s.font = 'bold ' + Math.floor( TEXTURE_WIDTH * textHeight / textWidth ) + 'px "Helvetica"'; // sc.font; //same font style as the measurement canvas
            s.lineJoin = 'miter';

            //background
            s.fillStyle = 'black';
            s.fillRect( 0, 0, c2.width, c2.height );
            
            //text fill
            s.fillStyle = 'white';
            s.fillText( text, 3, 0 );
            
            var gl = this.renderer.gl;
            var texture = gl.createTexture();
            gl.activeTexture( gl.TEXTURE1 );
            gl.bindTexture( gl.TEXTURE_2D, texture );
			gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, c2 );
            gl.generateMipmap( gl.TEXTURE_2D );
            gl.bindTexture( gl.TEXTURE_2D, null );

            this.texture = texture;
        },
		cull: true,
        show: function(){
            this.renderer.add( this );
            return this;
        },
        hide: function(){
            this.renderer.remove( this );
            return this;
        },
        'delete': function() {
            for( i in Shader.vertexAttributes ) {
                this.renderer.gl.deleteBuffer( this[ i ] );
                delete this[ i ];
            }
        },
        makeBuffer: function ( data, renderer ) {
            var ret = this.renderer.gl.createBuffer();    
            renderer.gl.bindBuffer( renderer.gl.ARRAY_BUFFER, ret );
            renderer.gl.bufferData( renderer.gl.ARRAY_BUFFER, new Float32Array( data ), renderer.gl.STATIC_DRAW );
            return ret;
        },
        createBuffers: function( data ) {
            if ( typeof data.mesh === 'string' ) {
                switch ( data.mesh ) {
                    case 'cube':
                        var a = utils.makeUnitCube();
                        data.uvcoords = a.uvcoords;
                        data.mesh = new Mesh( a.vertices, a.indices );;
                        break;
                }
            }
        
            this.mesh = data.mesh;
            this.material = null;
            this.indices = this.renderer.gl.createBuffer();    
            this.renderer.gl.bindBuffer( this.renderer.gl.ELEMENT_ARRAY_BUFFER, this.indices );
            this.renderer.gl.bufferData( this.renderer.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.mesh.indices ), this.renderer.gl.STATIC_DRAW );
            this.indices.length = this.mesh.indices.length;

            this.Position = this.makeBuffer( this.mesh.vertices, this.renderer );
            if ( data.normals !== undefined ) {
                this.Normal = this.makeBuffer( data.normals, this.renderer );
                this.normals = data.normals;
            }
            if ( data.tangents !== undefined ) {
                this.Tangent = this.makeBuffer( data.tangents, this.renderer );
                this.tangents = data.tangents;
            }
            if ( data.uvcoords !== undefined ) {
                this.UVCoord = this.makeBuffer( data.uvcoords, this.renderer );
                this.uvcoords = data.uvcoords;
            }
            if ( data.color !== undefined ) {
                this.Color = this.makeBuffer( data.color, this.renderer );
            }
            if ( data.material !== undefined ) {
                this.material = data.material;
            }
            else {
                this.material = this.renderer.createMaterial( 'solid' );
                this.material.set( 'v4Color', [ 1, 1, 1, 1 ] );
            }
        },
        clone: function() {
            var ret = this.renderer.createDrawable();
            ret.setPosition( this.getPosition() );
            ret.setOrientation( this.getOrientation() );
            ret.Position = this.Position;
            ret.UVCoord = this.UVCoord;
            ret.Normal = this.Normal;
            ret.Tangent = this.Tangent;
            ret.Color = this.Color;
            ret.material = this.material;
            ret.mesh = this.mesh;
            ret.indices = this.indices;
            ret.normals = this.normals;
            ret.tangents = this.tangents;
            ret.uvcoords = this.uvcoords;
            return ret;
        },
        attachRenderer: function( renderer ) {
            this.renderer = renderer;
        },
        render: function() {
            var i;
            var pos = this.getPosition();
            var campos = this.renderer.activeCamera.getPosition();
            vec3.subtract( campos, pos );
            var angle = Math.atan2( campos[ 0 ], campos[ 2 ] );

            this.rotateTo( angle, [ 0, 1, 0 ] );
            for ( i in this.material.globalInputs ) {
                this.renderer.gl.uniformMatrix4fv( this.material.globalInputs[ i ], false, this.renderer.getWorldUniform( i, this ) );
            }
            
            var activeTexture = 1;
            
            for ( i in this.material.inputs ) {
                var type = Shader.typeFromHungarian( i );
                
                switch ( type ) {
                    case Shader.TYPE_TEXTURE2D:
                        this.renderer.gl.activeTexture( this.renderer.gl.TEXTURE0 );
                        this.renderer.gl.bindTexture( this.renderer.gl.TEXTURE_2D, this.texture );
                        this.renderer.gl.uniform1i( this.material.inputs[ i ].location, 0 );
                        activeTexture++;
                        break;
                    case Shader.TYPE_TEXTURECUBE:
                        /*this.renderer.gl.activeTexture( this.renderer.gl.TEXTURE0 + activeTexture );
                        this.renderer.gl.bindTexture( this.renderer.gl.TEXTURE_CUBE_MAP, this.material.inputs[ i ].value );*/
                        this.renderer.gl.uniform1i( this.material.inputs[ i ].location, this.material.inputs[ i ].value.bindPosition );
                        activeTexture++;
                        break;
                    case Shader.TYPE_INT:
                        this.renderer.gl.uniform1i( this.material.inputs[ i ].location, this.material.inputs[ i ].value );
                        break;
                    case Shader.TYPE_BOOL:
                        this.renderer.gl.uniform1i( this.material.inputs[ i ].location, this.material.inputs[ i ].value );
                        break;
                    case Shader.TYPE_FLOAT:
                        this.renderer.gl.uniform1f( this.material.inputs[ i ].location, this.material.inputs[ i ].value );
                        break;
                    case Shader.TYPE_VEC3:
                        this.renderer.gl.uniform3fv( this.material.inputs[ i ].location, this.material.inputs[ i ].value );
                        break;
                    case Shader.TYPE_VEC4:
                        this.renderer.gl.uniform4fv( this.material.inputs[ i ].location, this.material.inputs[ i ].value );
                        break;
                    case Shader.TYPE_MAT3:
                        this.renderer.gl.uniformMatrix3fv( this.material.inputs[ i ].location, false,  this.material.inputs[ i ].value );
                        break;
                    case Shader.TYPE_MAT4:
                        this.renderer.gl.uniformMatrix4fv( this.material.inputs[ i ].location, false, this.material.inputs[ i ].value );
                        break;
                }
            }
            
            for ( i in this.material.vertexAttributes ) {
                if ( this[ i ] !== undefined ) {
                    this.renderer.gl.bindBuffer( this.renderer.gl.ARRAY_BUFFER, this[ i ] );
                    this.renderer.gl.vertexAttribPointer( this.material.vertexAttributes[ i ], Shader.vertexAttributes[ i ], this.renderer.gl.FLOAT, false, 0, 0 );
                    if( !enabledAttribArray[ this.material.vertexAttributes[ i ] ] ) {
                        this.renderer.gl.enableVertexAttribArray( this.material.vertexAttributes[ i ] );
                        enabledAttribArray[ this.material.vertexAttributes[ i ] ] = true;
                    }
                }
            }
            
            this.renderer.gl.bindBuffer( this.renderer.gl.ELEMENT_ARRAY_BUFFER, this.indices );
            this.renderer.gl.drawElements( this.renderer.gl.TRIANGLES, this.indices.length, this.renderer.gl.UNSIGNED_SHORT, 0 );
        }
    }
    inherits( Billboard, Transformable );

    return Billboard;
} );
