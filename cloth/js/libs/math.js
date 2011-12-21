define( function() {
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
            return dian3.scale( v1, 1/dian3.metro( v1 ) );    
        }
    };

    var tetra = {
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
                    return [ Math.cos( -Math.PI / 4 ), Math.sin( -Math.PI / 4 ), 0, 0 ];
                }
                return [ Math.cos( Math.PI / 4 ), Math.sin( Math.PI / 4 ), 0, 0 ];
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
