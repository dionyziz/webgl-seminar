define( [ 'libs/extender', 'models/transformable', 'models/mesh', './shader', './utils' ], function( inherits, Transformable, Mesh, Shader, utils ) {
    var Drawable = function( data, renderer ) {
        Transformable.call( this );

        if ( renderer !== undefined ) {
            this.renderer = renderer;
        }
        if ( data !== undefined && data.mesh !== undefined ) {
            this.createBuffers( data );
        }
    };
	
    var enabledAttribArray = {};
    
    Drawable.prototype = {
		cull: true,
        show: function(){
            this.renderer.add( this );
            return this;
        },
        hide: function(){
            this.renderer.remove( this );
            return this;
        },
        remove: function() {
            for( i in Shader.vertexAttributes ) {
                if ( this[ i ] ) {
                    if ( this[ i ].references == 0 ) {
                        this.renderer.gl.deleteBuffer( this[ i ] );
                    }
                    this[ i ].references--;
                    this[ i ] = null;
                }
            }
            this.hide();
        },
        makeBuffer: function ( data, renderer ) {
            var ret = this.renderer.gl.createBuffer();    
            renderer.gl.bindBuffer( renderer.gl.ARRAY_BUFFER, ret );
            renderer.gl.bufferData( renderer.gl.ARRAY_BUFFER, new Float32Array( data ), renderer.gl.STATIC_DRAW );
            ret.references = 1;
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
            this.indices.references++;

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

            if ( this.Position ) {
                ret.Position = this.Position;
                ret.Position.references++;
            }

            if ( this.UVCoord ) {
                ret.UVCoord = this.UVCoord;
                ret.UVCoord.references++;
            }
            
            if ( this.Normal ) {
                ret.Normal = this.Normal;
                ret.Normal.references++;
            }
            
            if ( this.Tangent ) {
                ret.Tangent = this.Tangent;
                ret.Tangent.references++;
            }
            
            if ( this.Color ) {
                ret.Color = this.Color;
                ret.Color.references++;
            }

            ret.material = this.material;
            ret.mesh = this.mesh;
            ret.indices = this.indices;
            ret.indices.references++;
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
            
            for ( i in this.material.globalInputs ) {
                this.renderer.gl.uniformMatrix4fv( this.material.globalInputs[ i ], false, this.renderer.getWorldUniform( i, this ) );
            }
            
            var activeTexture = 1;
            
            for ( i in this.material.inputs ) {
                var type = Shader.typeFromHungarian( i );
                
                switch ( type ) {
                    case Shader.TYPE_TEXTURE2D:
                        /*this.renderer.gl.activeTexture( this.renderer.gl.TEXTURE0 + activeTexture );
                        this.renderer.gl.bindTexture( this.renderer.gl.TEXTURE_2D, this.material.inputs[ i ].value );*/
                        try {
                            this.renderer.gl.uniform1i( this.material.inputs[ i ].location, this.material.inputs[ i ].value.bindPosition );
                        }
                        catch(e){
                        }
                        activeTexture++;
                        break;
                    case Shader.TYPE_TEXTURECUBE:
                        /*this.renderer.gl.activeTexture( this.renderer.gl.TEXTURE0 + activeTexture );
                        this.renderer.gl.bindTexture( this.renderer.gl.TEXTURE_CUBE_MAP, this.material.inputs[ i ].value );*/
                        try {
                            this.renderer.gl.uniform1i( this.material.inputs[ i ].location, this.material.inputs[ i ].value.bindPosition );
                        }
                        catch(e){
                        }
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

    inherits( Drawable, Transformable );

    return Drawable;
} );
