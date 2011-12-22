attribute vec3 inPosition;

varying vec3 UVCoord;

uniform mat4 g_WorldMatrix;
uniform mat4 g_ViewMatrix;
uniform mat4 g_ProjectionMatrix;
uniform mat4 g_WorldViewProjectionMatrix;

uniform mat4 g_WorldViewMatrix;

void main() {
	mat4 foo = g_WorldViewMatrix;
	foo[ 3 ] = vec4( 0.0, 0.0, 0.0, 1.0 );
	
	foo = g_ProjectionMatrix * foo;
	//vec3 position = mat3( g_WorldViewMatrix[ 0 ].xyz, g_WorldViewMatrix[ 1 ].xyz, g_WorldViewMatrix[ 2 ].xyz ) * inPosition;
    gl_Position = foo * vec4( inPosition, 1.0 );;
    UVCoord = inPosition;
}
