attribute vec2 inUVCoord;
attribute vec3 inPosition;
 
uniform mat4 g_WorldViewProjectionMatrix;
varying vec2 UVCoord; 
 
void main()
{
    UVCoord = inUVCoord;
    gl_Position = g_WorldViewProjectionMatrix * vec4( inPosition, 1.0 );
}
