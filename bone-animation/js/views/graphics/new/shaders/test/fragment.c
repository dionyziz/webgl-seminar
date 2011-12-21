precision highp float;
const float PI = 3.141592653589793;
varying vec4 position;
varying vec3 N;
varying mat3 R;

uniform sampler2D s2bumpmap;
uniform sampler2D s2texture;

uniform mat4 g_WorldViewMatrix;

void main() {
    vec3 test = normalize( N );
    vec2 UVCoord;
    UVCoord.x = 0.5 + 0.5 * atan( test.x, test.z ) / PI;
    UVCoord.y = 0.5 - 0.5 * test.y;
    
    
    mat3 R2 = mat3( normalize( R[ 0 ] ), normalize( R[ 1 ] ), normalize( R[ 2 ] ) );
	vec3 normal = normalize( R * normalize( texture2D( s2bumpmap, UVCoord ).rgb * 2.0 - 1.0 ) );
    
	vec3 L = normalize( position.xyz );
	vec3 eye = normalize( position.xyz - vec3( 0.0, 0.0, 5.0 ) );
	vec3 lightColor = texture2D( s2texture, UVCoord ).xyz;
	float diffuse = max( dot( -normal, L ), 0.0 );
	float specular = pow( max( dot( reflect( -L, normal ), eye ), 0.0 ), 60.0 );
	
	gl_FragColor = vec4( ( 0.2 + 0.8 * diffuse + 1.0 * specular ) * lightColor, 1.0 );
}