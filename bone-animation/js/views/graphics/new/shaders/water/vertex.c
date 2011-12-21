attribute vec3 inPosition;
attribute vec3 inNormal;
attribute vec3 inTangent;
attribute vec2 inUVCoord;

varying vec2 UVCoord;
varying vec4 position;
varying vec4 projectedPosition;
varying vec3 N;
varying vec3 T;

uniform mat4 g_WorldViewProjectionMatrix;
uniform mat4 g_WorldViewMatrix;

void main() {
	position = g_WorldViewMatrix * vec4( inPosition, 1.0 );
    gl_Position = g_WorldViewProjectionMatrix * vec4( inPosition, 1.0 );
    UVCoord = inUVCoord;
    mat3 objToWorldRot = mat3( g_WorldViewMatrix[ 0 ].xyz, g_WorldViewMatrix[ 1 ].xyz, g_WorldViewMatrix[ 2 ].xyz );
    N = objToWorldRot * inNormal;
    T = objToWorldRot * inTangent;
}
