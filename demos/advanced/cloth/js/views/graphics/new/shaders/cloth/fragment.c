precision highp float;

varying vec2 UVCoord;
uniform sampler2D s2flag;
varying vec3 normal;
varying vec3 pos;

void main(){
    vec3 L = normalize( pos );
    vec3 N = normalize( normal );
    float color = abs( dot( -N, L ) );
    gl_FragColor = vec4( min( ( 0.2 + color ), 1.0 ) * texture2D( s2flag, UVCoord ).rgb, 1.0 );
}
