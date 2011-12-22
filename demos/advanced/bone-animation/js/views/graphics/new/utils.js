define( [ 'libs/math' ], function( math ) {
    var	dian3 = math.dian3;
    return  {
        makeSphere : function( R ) {
            if ( arguments.length === 2 ) {
                var p, m;
                p = m = 1 / arguments[ 1 ];
            }
            else if ( arguments.length == 3 ) {
                var p = arguments[ 1 ];
                var m = arguments[ 2 ];
            }
        
            //p parallhloi, p > 1
            //m meshmbrinoi
            
            if ( p < 2 ) {
                return false;
            }
            
            var model = {
                vertices: [],
                //normals: [],
                indices: []
            };
            
            var prev = function( x, m ) {
                if ( x === 0 ) {
                    return ( m - 1 );
                }
                else {
                    return ( x -1 );
                }
            };
            
            var y, x, z, r,cnt = 0, cnt2 = 0;		
            for ( var i = 1; i < p-1; i++ ) { // end points are missing
                y = R*Math.sin( -Math.PI/2 + i*Math.PI/( p - 1 ) );
                r = R*Math.cos( -Math.PI/2 + i*Math.PI/( p - 1 ) );
                //console.log( "y , r " ,y, r );
                for ( var k = 0; k < m; k++ ) {
                    x = r*Math.cos( 2*Math.PI*k/ m );
                    z = r*Math.sin( 2*Math.PI*k/ m );
                    //console.log( x, z ); 
                    model.vertices[ cnt ] = x;
                    model.vertices[ cnt+1 ] = y;
                    model.vertices[ cnt+2 ] = z;
                    cnt = cnt+3;
                }
                //make the triangle
                
                
                if ( i > 1 ) {
                    var st = ( i - 2 )*m;
                    for ( var x = 0; x < m; x++ ) {					
                        model.indices[ cnt2 ] = st + x;
                        model.indices[ cnt2+1 ] = st + prev( x, m ) + m;
                        model.indices[ cnt2+2 ] = st + x + m;
                        cnt2  += 3;
                        
                        model.indices[ cnt2 ] = st + x;
                        model.indices[ cnt2+1 ] = st + prev( x, m );
                        model.indices[ cnt2+2 ] = st + prev( x, m ) + m;
                        cnt2 += 3;					
                    }				
                }
            }
            
            model.vertices[ cnt ] = 0;
            model.vertices[ cnt+1 ] = -R;
            model.vertices[ cnt+2 ] = 0;
            var down = cnt/3;
            cnt += 3;
            model.vertices[ cnt ] = 0;
            model.vertices[ cnt+1 ] = R;
            model.vertices[ cnt+2 ] = 0;
            cnt += 3;
            
            var top = down + 1;
            for ( var x = 0; x < m; x++ ) {
                model.indices[ cnt2 ] = down;
                model.indices[ cnt2+1 ] = prev( x, m );
                model.indices[ cnt2+2 ] = x;
                cnt2 += 3;
                
                model.indices[ cnt2 ] = down - m + x;
                model.indices[ cnt2+1 ] = down - m + prev( x, m );		
                model.indices[ cnt2+2 ] = top;
                cnt2 +=3
            }
            return model;
        },
        genNormals: function( points, indices ) {
            var a, b, c,
                ax, ay, az,
                bx, by, bz,
                cx, cy, cz,
                AB, BC, N,
                i, j, 
                normals = [];

            // default normal
            for ( i = 0; i < points.length / 3; ++i ) {
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
            for ( j, i = 0; i < normals.length; ++i ) {
                if ( normals[ i ].length === 0 ) {
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
        // DEPRECATED!
        // Use makeUnitCube and mesh translations/scaling/rotationns to achieve your desired result
        // TODO: Remove this function
        makeParallelepiped: function ( x1, y1, z1, x2, y2, z2 ) {
            var vertices = [
                x1, y1, z1,
                x1, y1, z2,
                x1, y2, z1,

                x1, y1, z2,
                x1, y2, z2,
                x1, y2, z1,

                x2, y2, z1,
                x2, y1, z2,
                x2, y1, z1,

                x2, y2, z1,
                x2, y2, z2,
                x2, y1, z2,

                x1, y1, z1,
                x2, y1, z2,
                x1, y1, z2,

                x1, y1, z1,
                x2, y1, z1,
                x2, y1, z2,

                x1, y2, z1,
                x1, y2, z2,
                x2, y2, z2,

                x1, y2, z1,
                x2, y2, z2,
                x2, y2, z1,
                
                x1, y2, z1,
                x2, y1, z1,
                x1, y1, z1,
                
                x1, y2, z1,
                x2, y2, z1,
                x2, y1, z1,
                
                x1, y1, z2,
                x2, y1, z2,
                x2, y2, z2,

                x1, y2, z2,
                x1, y1, z2,
                x2, y2, z2
            ];
            var indices = [];
            
            for ( var i = 0; i < vertices.length / 3; ++i ) {
                indices.push( i );
            }
            return {
                vertices: vertices,
                indices:  indices
            };
        },
        // DEPRECATED!
        // Use makeUnitSquare and mesh translations/scaling/rotationns to achieve your desired result
        // TODO: Remove this function
        makeSquare: function ( x1, y1, x2, y2 ) {
            /*   ____________B (x2, y2)
                | \          |
                |   \        |
                |      \     |
                |         \  |
                |___________\|
               A (x1, y1)
            */
            return {
                vertices: [
                    x1, y1, 0,
                    x2, y1, 0,
                    x1, y2, 0,
                    x2, y2, 0,
                ],
                indices: [
                    0, 1, 2,
                    3, 2, 1
                ],
                normals: [
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1
                ],
                uvcoords: [
                    0, 0,
                    1, 0,
                    0, 1,
                    1, 1,
                ]
            };
        },
		makeTrapezium : function( x1, y1, x2, y2, x3, y3, x4, y4 ) {
            /*(x4,y4)__________C (x3, y3)
                    / \        |
                   /    \      |
                  /       \    |
                 /          \  |
                /_____________\|
               A (x1, y1)		B( x2,y2 )
            */
            return {
                vertices: [
                    x1, 0, y1,
                    x2, 0, y2,
                    x3, 0, y3,
                    x4, 0, y4
                ],
                indices: [
                    2, 1, 0,
                    2, 0, 3					
                ],
                normals: [
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0
                ],
                uvcoords: [
                    x1, y1,
                    x2, y2,
                    x3, y3,
                    x4, y4,
                ]
            };
        },
        makeUnitSquare: function () {
            return {
                vertices: [
                    -0.5, -0.5, 0,
                    0.5, 0.5, 0,
                    -0.5, 0.5, 0,
                    -0.5, -0.5, 0,
                    0.5, -0.5, 0,
                    0.5, 0.5, 0
                ],
                indices: [ 0, 1, 2, 3, 4, 5 ],
                uvcoords: [
                    0, 0,
                    1, 1,
                    0, 1,
                    0, 0,
                    1, 0,
                    1, 1
                ],
                normals: [
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1
                ],
                tangents: [
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0
                ]
            };
        },
        makeUnitCube: function () {
            var vertices = [
                // right
                1, 0, 0,
                1, 1, 1,
                1, 0, 1,
                1, 1, 0,
                // left
                0, 1, 0,
                0, 0, 1,
                0, 1, 1,
                0, 0, 0,
                // top
                0, 1, 0,
                1, 1, 1,
                1, 1, 0,
                0, 1, 1,
                // bottom
                0, 0, 1,
                1, 0, 0,
                1, 0, 1,
                0, 0, 0,
                // front
                0, 0, 1,
                1, 1, 1,
                0, 1, 1,
                1, 0, 1,
                // back
                1, 0, 0,
                0, 1, 0,
                1, 1, 0,
                0, 0, 0
            ];
            var uvcoords = [
                0, 0,
                1, 1,
                0, 1,
                1, 0
            ];
            var normals = [
                1, 0, 0,
               -1, 0, 0,
                0, 1, 0,
                0,-1, 0,
                0, 0, 1,
                0, 0,-1
            ];
            var tangents = [
                0, 1, 0,
                0,-1, 0,
                0, 0, 1,
                0, 0,-1,
                1, 0, 0,
               -1, 0, 0
            ];
            
            // center unit cube around the origin
            for ( var i = 0; i < vertices.length; ++i ) {
                vertices[ i ] -= 0.5;
            }
            
            var ret = {
                vertices: [],
                indices: [],
                normals: [],
                tangents: [],
                uvcoords: []
            };
            
            for ( var face = 0; face < 6; ++face ) {
                for ( var vertex = 0; vertex < 6; ++vertex ) { // 6 vertices per face
                    ret.normals.push(
                        normals[ face * 3 ],
                        normals[ face * 3 + 1 ],
                        normals[ face * 3 + 2 ]
                    );
                    ret.tangents.push(
                        tangents[ face * 3 ],
                        tangents[ face * 3 + 1 ],
                        tangents[ face * 3 + 2 ]
                    );
                    ret.indices.push( face * 6 + vertex );
                }
            }
            
            function addPoint( face, point ) {
                ret.vertices.push(
                    vertices[ face * 3 * 4 + point * 3 ],
                    vertices[ face * 3 * 4 + point * 3 + 1 ],
                    vertices[ face * 3 * 4 + point * 3 + 2 ]
                );
                ret.uvcoords.push(
                    uvcoords[ point * 2 ],
                    uvcoords[ point * 2 + 1 ]
                );
            }
            
            for ( var face = 0; face < 6; ++face ) {
                // top triangle
                addPoint( face, 0 );
                addPoint( face, 1 );
                addPoint( face, 2 );
                // bottom triangle
                addPoint( face, 0 );
                addPoint( face, 3 );
                addPoint( face, 1 );
            }
            
            return ret;
        },
        makeTextTexture: function ( text ) {
            var c = document.createElement( 'canvas' );
            c.width = 100;
            c.height = 100;
            
            var s = c.getContext( '2d' );
            
            s.fillStyle = 'white';
            s.fillRect( 0, 0, 100, 100 );
            s.strokeStyle = "black";
            s.strokeText( text, 0, 0 );
            
            return c;
        },
        genSphericalUVCoords: function( vertices ) {
            var center = [ 0, 0, 0 ];
            var vertexCount = vertices.length / 3;
            for( var i = 0; i < vertexCount; ++i ) {
                center[ 0 ] += vertices[ i * 3 ];
                center[ 1 ] += vertices[ i * 3 + 1 ];
                center[ 2 ] += vertices[ i * 3 + 2 ];
            }
            center[ 0 ] /= vertexCount;
            center[ 1 ] /= vertexCount;
            center[ 2 ] /= vertexCount;
            
            var temp = [ 0, 0, 0 ];
            var uvcoords = [];
            for( var i = 0; i < vertexCount; ++i ) {
                temp[ 0 ] = vertices[ i * 3 ] - center[ 0 ];
                temp[ 1 ] = vertices[ i * 3 + 1 ] - center[ 1 ];
                temp[ 2 ] = vertices[ i * 3 + 2 ] - center[ 2 ];
                vec3.normalize( temp );
                uvcoords.push( 0.5 + 0.5 * Math.atan( temp[ 0 ], temp[ 2 ] ) / Math.PI );
                uvcoords.push( 0.5 - 0.5 * temp[ 1 ] );
            }
            return uvcoords;
        }
    };
} );
