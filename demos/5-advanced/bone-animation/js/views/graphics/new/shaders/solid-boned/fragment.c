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
    float fogGradientHeight = 20.0;
    vec3 fogColor = vec3(
        clamp( position.y / fogGradientHeight, 0.0, 1.0 ) * 107.0 / 255.0,
        clamp( position.y / fogGradientHeight, 0.0, 1.0 ) * 97.0 / 255.0,
        clamp( position.y / fogGradientHeight, 0.0, 1.0 ) * 114.0 / 255.0
    ) + vec3(
        clamp( 1.0 - position.y / fogGradientHeight, 0.0, 1.0 ) * 0.0 / 255.0,
        clamp( 1.0 - position.y / fogGradientHeight, 0.0, 1.0 ) * 0.0 / 255.0,
        clamp( 1.0 - position.y / fogGradientHeight, 0.0, 1.0 ) * 0.0 / 255.0
    );
    float fogPortion = -position.z / 70.0;
    fogPortion = clamp( fogPortion, 0.0, 1.0 );
    // fogPortion = ;
	float diffuse = max( dot( -normal, L ), 0.0 );
	//float specular = pow( max( dot( reflect( -L, normal ), eye ), 0.0 ), 10.0 );
	
	// gl_FragColor = vec4( ( 1.0 * diffuse ) * lightColor, 1.0 );
	vec3 diffuseResult = diffuse * lightColor;
    gl_FragColor = vec4( diffuseResult * ( 1.0 - fogPortion ) + fogColor * fogPortion, 1.0 );
//    gl_FragColor = vec4( 0.5 + 0.5 * normal, 1.0 );
    //gl_FragColor = texture2D( s2texture, UVCoord );
}
