attribute vec3 inPosition;
attribute vec3 inNormal;
attribute vec2 inUVCoord;

varying vec2 UVCoord;
varying vec4 position;
varying vec3 N;
varying mat3 R;

uniform mat4 g_WorldViewProjectionMatrix;
uniform mat4 g_WorldViewMatrix;

void main() {
	position = g_WorldViewMatrix * vec4( inPosition, 1.0 );
    gl_Position = g_WorldViewProjectionMatrix * vec4( inPosition, 1.0 );
    UVCoord = inUVCoord;
    N = mat3( g_WorldViewMatrix ) * inNormal;

    float s = 1.0 - pow( N.z, 2.0 );
	float c = N.z;
	float t = 1.0 - c;
    
    vec3 axis = normalize( vec3( -N.y, N.x, 0.0 ) );
    float x = axis.x;
    float y = axis.y;
    
    R = mat3( 
        x*x*t + c, y*x*t, - y*s,
        x*y*t, y*y*t + c, x*s,
        y*s, - x*s, c
	);
}
