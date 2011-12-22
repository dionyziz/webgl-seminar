precision highp float;

varying vec2 UVCoord;

uniform sampler2D s2texture;

void main() {
    vec3 lightColor = texture2D( s2texture, UVCoord ).xyz;
    if ( length( lightColor - vec3( 0.0, 0.0, 0.0 ) ) < 0.5 ) {
        discard;
    }
    gl_FragColor = vec4( lightColor, 1.0 );
}
