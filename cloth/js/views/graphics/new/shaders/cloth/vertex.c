attribute vec3 inPosition;
attribute vec2 inUVCoord;

uniform mat4 g_WorldViewProjectionMatrix;
uniform sampler2D s2positions;
uniform sampler2D s2normals;
varying vec2 UVCoord;
varying vec3 normal;
varying vec3 pos;

void main() {
    pos = texture2D( s2positions, inUVCoord ).xyz;
    normal = texture2D( s2normals, inUVCoord ).xyz;
    UVCoord = inUVCoord;
    
    gl_Position = g_WorldViewProjectionMatrix * vec4( pos, 1.0 );
}
