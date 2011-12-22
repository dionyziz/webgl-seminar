define( [ 'libs/extender', 'libs/events' ], function( inherits, events ) {
    var shaderCache = {};
    
    var Shader = function( url, renderer ) {
        if ( shaderCache[ url ] === undefined ) {
            shaderCache[ url ] = new NewShader( url, renderer );
        }
        return shaderCache[ url ];
    }
    
    var NewShader = function( url, renderer ) {
        var vShader, fShader, vShaderSource, fShaderSource, shadersLoaded = 0, program;

        var compile = function (){
            vShader = renderer.gl.createShader( renderer.gl.VERTEX_SHADER );
            renderer.gl.shaderSource( vShader, vShaderSource );
            renderer.gl.compileShader( vShader );

            fShader = renderer.gl.createShader( renderer.gl.FRAGMENT_SHADER );
            renderer.gl.shaderSource( fShader, fShaderSource );
            renderer.gl.compileShader( fShader );

            program = renderer.gl.createProgram();
            renderer.gl.attachShader( program, vShader );
            renderer.gl.attachShader( program, fShader );
            renderer.gl.linkProgram( program );

            this.program = program;
            this.loaded = true;
            this.emit( 'load' );
            
        }.bind( this );

        var v = new XMLHttpRequest();
        v.open( 'GET', url + '/vertex.c' );
        v.onreadystatechange = function() {
            if ( v.readyState === 4 ) {
                vShaderSource = v.responseText;
                if( shadersLoaded == 1 ) {
                    compile();
                    return;
                }
                shadersLoaded++;
            }

        }
        v.send();

        var f = new XMLHttpRequest();
        f.open( 'GET', url + '/fragment.c' );
        f.onreadystatechange = function() {
            if ( f.readyState === 4 ) {
                fShaderSource = f.responseText;
                if( shadersLoaded == 1 ) {
                    compile();
                    return;
                }
                shadersLoaded++;
            }
        }
        f.send();
    };

    inherits( NewShader, events.EventEmitter );

    Shader.TYPE_INT         = 1;
    Shader.TYPE_BOOL        = 2;
    Shader.TYPE_FLOAT       = 3;
    Shader.TYPE_VEC3        = 4;
    Shader.TYPE_VEC4        = 5;
    Shader.TYPE_MAT3        = 6;
    Shader.TYPE_MAT4        = 7;
    Shader.TYPE_TEXTURE2D   = 8;
    Shader.TYPE_TEXTURECUBE = 9;

    Shader.typeFromHungarian = function ( name ) {
        var types = {
            'i': Shader.TYPE_INT,
            'b': Shader.TYPE_BOOL,
            'f': Shader.TYPE_FLOAT,
            'v3': Shader.TYPE_VEC3,
            'v4': Shader.TYPE_VEC4,
            'm3': Shader.TYPE_MAT3,
            'm4': Shader.TYPE_MAT4,
            's2': Shader.TYPE_TEXTURE2D,
            'sc': Shader.TYPE_TEXTURECUBE
        };
        
        if ( types[ name[ 0 ] ] !== undefined ) {
            return types[ name[ 0 ] ];
        }
        if ( types[ name.substr( 0, 2 ) ] !== undefined ) {
            return types[ name.substr( 0, 2 ) ];
        }
        
        throw "Type of shader variable is incorrect: " + name;
    }

    Shader.vertexAttributes = {
        Position: 3,
        Normal: 3,
        Tangent: 3,
        Color: 3,
        UVCoord: 2,
        BoneWeights: 4,
        BoneIndices: 4
    };

    return Shader;
} );
