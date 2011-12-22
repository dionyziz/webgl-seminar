define( function() {
    console.matLog = function( mat ) {
        var l = mat.length / 4;
        for ( i = 0; i < l; i++ ) {
            console.log( mat[ 0 + i ], mat[ 4 + i ], mat[ 8 + i ], mat[ 12 + i ]  )
            if ( i > 0 && i % 4 == 0 ) {
                console.log( '--------' );
            }
        }
    };
    
    var dian3 = {
        dot: function( v1, v2 ) {
            return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
        },
        cross: function( v1, v2 ) {
            return [ v1[1]*v2[2] - v1[2]*v2[1], 
                     v1[2]*v2[0] - v1[0]*v2[2], 
                     v1[0]*v2[1] - v1[1]*v2[0] ];
        },
        metro: function( v ) {
            return Math.sqrt( v[0]*v[0] + v[1]*v[1] + v[2]*v[2] );
        },
        metro2: function( v ) {
            return ( v[0]*v[0] + v[1]*v[1] + v[2]*v[2] );
        },
        create: function( x, y ,z ) {
            return [ x, y, z ];
        },
        scale: function( v, k ) {
            return [ k*v[0], k*v[1], k*v[2] ];
        },
        add: function( v1, v2 ) {
            return [ v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2] ]; 
        },
        subtract: function( v1, v2 ) {
            return [ v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2] ]; 
        },
        equals: function( v1, v2 ) {
            return (v1[0]==v2[0] && v1[1]==v2[1] && v1[2]==v2[2] );
        },   
        normal: function( v1 ) {
            var a = 1/dian3.metro( v1 );
            return dian3.scale( v1, 1/dian3.metro( v1 ) );    
        }
    };

    var tetra = {
        calcAbsoluteState : function( parentAbsPos, parentAbsOrient, childPos, childOrient ) {
            //abs position and orientation
            var absOrient = tetra.cross( parentAbsOrient, childOrient );
            var absPos = dian3.add( parentAbsPos,
	                    tetra.multiplyVec3( parentAbsOrient, childPos ) );
            return [ absPos, absOrient ];
        },
        create : function ( x, y, z, angle ) {
            var len = Math.sqrt( x*x + y*y + z*z );
            var c = Math.sin( angle/2 );
            return [ Math.cos( angle/2 ), x/len*c, y/len*c, z/len*c ];
        },
        scale: function( v, k ) {
            return [ k*v[0], k*v[1], k*v[2], k*v[3] ];
        },
        cross : function ( q1, q2 ) {
            return [ q1[0]*q2[0] - q1[1]*q2[1] - q1[2]*q2[2] - q1[3]*q2[3] ,
                     q1[0]*q2[1] + q1[1]*q2[0] + q1[2]*q2[3] - q1[3]*q2[2] ,
                     q1[0]*q2[2] - q1[1]*q2[3] + q1[2]*q2[0] + q1[3]*q2[1] ,
                     q1[0]*q2[3] + q1[1]*q2[2] - q1[2]*q2[1] + q1[3]*q2[0] ];
        },
        add : function( q1, q2 ) {
            return [ q1[0]+q2[0], q1[1]+q2[1], q1[2]+q2[2], q1[3]+q2[3] ]; 
        },
        rotMatrix : function ( q ) {
            var res = [];
            res[0] = 1 - 2*( q[2]*q[2] + q[3]*q[3] );
            res[1] = 2*( q[1]*q[2] + q[3]*q[0] );
            res[2] = 2*( q[1]*q[3] - q[2]*q[0] );
            res[3] = 0;
            res[4] = 2*( q[1]*q[2] - q[3]*q[0] );
            res[5] = 1 - 2*( q[1]*q[1] + q[3]*q[3] );
            res[6] = 2*( q[2]*q[3] + q[1]*q[0] );
            res[7] = 0;
            res[8] = 2*( q[1]*q[3] + q[2]*q[0] );
            res[9] = 2*( q[2]*q[3] - q[1]*q[0] );
            res[10] = 1 - 2*( q[1]*q[1] + q[2]*q[2] );
            res[11] = 0;
            res[12] = 0;
            res[13] = 0;
            res[14] = 0;
            res[15] = 1;
            return res;
        },
        scaleMatrix: function ( x, y, z ) {
            return [
                x, 0, 0, 0,
                0, y, 0, 0,
                0, 0, z, 0,
                0, 0, 0, 1
            ];
        },
        axis : function ( q ) {
            var c = Math.sin( ( Math.acos( q[0] ) ) );
            if ( c == 0 ) {
                return [ 0, 0, -1 ];
            }
            return [ q[1]/c, q[2]/c, q[3]/c ];		
        },
        angle : function ( q ) {
            return ( Math.acos( q[0] )*2 );
        },
        rotateX : function ( q, angle ) {
            var b = tetra.create( 1, 0, 0, angle );
            return tetra.cross( q, b );	
        },
        rotateY : function ( q, angle ) {
            var b = tetra.create( 0, 1, 0, angle );
            return tetra.cross( q, b );	
        },
        rotateZ : function ( q, angle ) {
            var b = tetra.create( 0, 0, 1, angle );
            return tetra.cross( q, b );	
        },
        rotate : function ( q, x, y, z, angle ) {
            var len = Math.sqrt( x*x + y*y + z*z );
            var b = tetra.create( x/len, y/len, z/len, angle );
            return tetra.cross( q, b );	
        },
        lookAt: function( x, y, z ) {
            var theta, phi, a, b, c, d;
            if ( x == 0 && z == 0 ) {
                if ( y > 0 ) {
                    return [ Math.cos( Math.PI / 4 ), Math.sin( Math.PI / 4 ), 0, 0 ];
                }
                return [ Math.cos( -Math.PI / 4 ), Math.sin( -Math.PI / 4 ), 0, 0 ];
            }
            theta = Math.atan2( x, z ) - Math.PI;
            phi = Math.atan( y / Math.sqrt( x * x + z * z ) );
            a = Math.cos( theta / 2 );
            b = Math.sin( theta / 2 );
            c = Math.cos( phi / 2 );
            d = Math.sin( phi / 2 );
            return [ a * c, a * d, b * c, -b * d ];
        },
        normalize : function ( q ) {
            var len = Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3]);
            len = 1/len;
            return [ q[0]*len, q[1]*len, q[2]*len, q[3]*len ];
        },
        multiplyVec3 : function( quat, vec ) {//rotate a vector in R3 by a quartenion
            var dest = [];
	
	        var x = vec[0], y = vec[1], z = vec[2];
	        var qx = quat[1], qy = quat[2], qz = quat[3], qw = quat[0];

	        // calculate quat * vec
	        var ix = qw*x + qy*z - qz*y;
	        var iy = qw*y + qz*x - qx*z;
	        var iz = qw*z + qx*y - qy*x;
	        var iw = -qx*x - qy*y - qz*z;
	
	        // calculate result * inverse quat
	        dest[0] = ix*qw + iw*-qx + iy*-qz - iz*-qy;
	        dest[1] = iy*qw + iw*-qy + iz*-qx - ix*-qz;
	        dest[2] = iz*qw + iw*-qz + ix*-qy - iy*-qx;
	
	        return dest;
        },
        getQuartFromMat : function( mat ) {
            //mat is a 4X4 matrix
            var maxel = Math.max( mat[ 0 ], mat[ 5 ], mat[ 10 ] );
            var r = Math.sqrt( 1 + 2*maxel - mat[ 0 ] - mat[ 5 ] - mat[ 10 ] );
            if ( r < 0.00001 ) {
                return [ 1, 0, 0, 0 ];
            } 
            
            return tetra.normalize( 
                    [ ( mat[ 6 ] - mat[ 9 ] )/( 2*r ),
                      r/2,
                      ( mat[ 4 ] + mat[ 1 ] )/( 2*r ),
                      ( mat[ 2 ] + mat[ 8 ] )/( 2*r ) ] );
        }, // TODO: remove this function, it is obsolete because of the following
        fromRotationMatrix: function( mat /* 4x4 */ ) {
            return tetra.fromRotationMatrixElements(
                mat[ 0 ], mat[ 1 ], mat[ 2 ], // TODO: check this for accuracy (row-major VS col-major)
                mat[ 4 ], mat[ 5 ], mat[ 6 ],
                mat[ 8 ], mat[ 9 ], mat[ 10 ]
            );
        },
        fromRotationMatrixElements: function ( m00, m01, m02,
                                               m10, m11, m12,
                                               m20, m21, m22 ) {
            // Use the Graphics Gems code, from 
            // ftp://ftp.cis.upenn.edu/pub/graphics/shoemake/quatut.ps.Z
            // *NOT* the "Matrix and Quaternions FAQ", which has errors!
            
            // the trace is the sum of the diagonal elements; see
            // http://mathworld.wolfram.com/MatrixTrace.html
            var t = m00 + m11 + m22, s;

            // we protect the division by s by ensuring that s>=1
            if ( t >= 0 ) { // |w| >= .5
                s = Math.sqrt( t + 1 ); // |s|>=1 ... TODO: optimize?
                w = 0.5 * s;
                s = 0.5 / s;                 // so this division isn't bad
                x = ( m21 - m12 ) * s;
                y = ( m02 - m20 ) * s;
                z = ( m10 - m01 ) * s;
            }
            else if ( m00 > m11 && m00 > m22 ) {
                s = Math.sqrt( 1 + m00 - m11 - m22 ); // |s|>=1
                x = s * 0.5; // |x| >= .5
                s = 0.5 / s;
                y = ( m10 + m01 ) * s;
                z = ( m02 + m20 ) * s;
                w = ( m21 - m12 ) * s;
            }
            else if ( m11 > m22 ) {
                s = Math.sqrt( 1 + m11 - m00 - m22 ); // |s|>=1
                y = s * 0.5; // |y| >= .5
                s = 0.5 / s;
                x = ( m10 + m01 ) * s;
                z = ( m21 + m12 ) * s;
                w = ( m02 - m20 ) * s;
            }
            else {
                s = Math.sqrt( 1 + m22 - m00 - m11 ); // |s|>=1
                z = s * 0.5; // |z| >= .5
                s = 0.5 / s;
                x = ( m02 + m20 ) * s;
                y = ( m21 + m12 ) * s;
                w = ( m10 - m01 ) * s;
            }
            
            return [ w, x, y, z ];
        }
    };

    Object.defineProperty( Array.prototype, "max", {
        value: function () {
            return this.reduce( Math.max );
        }
    } );
    
    Object.defineProperty( Array.prototype, "min", {
        value: function () {
            return this.reduce( Math.min );
        }
    } );

    return {
        dian3: dian3,
        tetra: tetra,
        zip : function( a1, a2, f ) {
            var ret = [];
            var m = Math.max( a1.length, a2.length );
            
            for ( var i = 0; i < m; ++i ) {
                ret[ i ] = f( a1[ i ], a2[ i ] );
            }
            
            return ret;
        }
    };
} );
