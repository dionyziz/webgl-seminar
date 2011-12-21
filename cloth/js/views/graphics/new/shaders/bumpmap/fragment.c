precision highp float;

varying vec2 UVCoord;
varying vec4 position;
varying vec3 N;
varying mat3 R;

uniform sampler2D s2bumpmap;
uniform sampler2D s2texture;
uniform float g_Time;

uniform mat4 g_WorldViewMatrix;

void main() {
    mat3 R2 = mat3( normalize( R[ 0 ] ), normalize( R[ 1 ] ), normalize( R[ 2 ] ) );
	vec3 normal = normalize( R * normalize( texture2D( s2bumpmap, UVCoord ).rgb * 2.0 - 1.0 ) );
    
	vec3 L = normalize( position.xyz );
	vec3 eye = normalize( position.xyz - vec3( 0.0, 0.0, 5.0 ) );
	vec3 lightColor = texture2D( s2texture, UVCoord ).xyz;
	float diffuse = max( dot( -normal, L ), 0.0 );
	// float specular = pow( max( dot( reflect( -L, normal ), eye ), 0.0 ), 60.0 );
	
	gl_FragColor = vec4( 0.4 * diffuse * lightColor / max( 1.0, abs( .2 * position[ 2 ] ) ), 1.0 );
}
