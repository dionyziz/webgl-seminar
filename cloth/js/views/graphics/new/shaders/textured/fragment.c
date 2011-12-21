precision highp float;

varying vec2 UVCoord;
varying vec4 position;
varying vec3 N;

uniform sampler2D s2texture;

void main() {
	vec3 normal = normalize( N );
	vec3 L = normalize( position.xyz );
	vec3 eye = normalize( position.xyz - vec3( 0.0, 0.0, 5.0 ) );
	vec3 lightColor = texture2D( s2texture, UVCoord ).xyz;
	float diffuse = max( dot( -normal, L ), 0.0 );
	//float specular = pow( max( dot( reflect( -L, normal ), eye ), 0.0 ), 10.0 );
	
	gl_FragColor = vec4( ( 1.0 * diffuse ) * lightColor, 1.0 );
    //gl_FragColor = texture2D( s2texture, UVCoord );
}
