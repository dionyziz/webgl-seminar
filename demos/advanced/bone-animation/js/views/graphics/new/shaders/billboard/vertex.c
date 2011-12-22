attribute vec3 inPosition;
attribute vec3 inNormal;
attribute vec2 inUVCoord;

varying vec2 UVCoord;

uniform mat4 g_WorldViewProjectionMatrix;

void main() {
    gl_Position = g_WorldViewProjectionMatrix * vec4( inPosition, 1.0 );
    UVCoord = inUVCoord;
}
