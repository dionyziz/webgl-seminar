#define NUM_BONES 60

attribute vec3 inPosition;
attribute vec3 inNormal;
attribute vec2 inUVCoord;
attribute vec4 inBoneWeights;
attribute vec4 inBoneIndices;

uniform vec4 v4row1[ NUM_BONES ];
uniform vec4 v4row2[ NUM_BONES ];
uniform vec4 v4row3[ NUM_BONES ];

uniform mat4 g_WorldViewProjectionMatrix;
uniform mat4 g_WorldViewMatrix;

varying vec4 position;
varying vec3 N;
varying vec2 UVCoord;

void main() {
    vec4 index = inBoneIndices;
    vec4 weight = inBoneWeights;

    vec4 newPos = vec4( 0.0 );
	vec4 newNormal = vec4( 0.0 );
    
    for ( float i = 0.0; i < 4.0; i += 1.0 ) {
        vec4 r1 = v4row1[ int( index.x ) ];
        vec4 r2 = v4row2[ int( index.x ) ];
        vec4 r3 = v4row3[ int( index.x ) ];
        mat4 skinMat = mat4( 
            r1.x, r2.x, r3.x, 0.0,
            r1.y, r2.y, r3.y, 0.0,
            r1.z, r2.z, r3.z, 0.0,
            r1.w, r2.w, r3.w, 1.0
        );
        newPos += weight.x * ( skinMat * vec4( inPosition, 1.0 ) );
		newNormal += weight.x * ( skinMat * vec4( inNormal, 0.0 ) );
        index = index.yzwx;
        weight = weight.yzwx;
    }
    
    N = ( g_WorldViewMatrix * vec4( inNormal, 0.0 ) ).xyz;
    position = g_WorldViewMatrix * newPos;
    gl_Position = g_WorldViewProjectionMatrix * newPos;
    UVCoord = inUVCoord;
}
