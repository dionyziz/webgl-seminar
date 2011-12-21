uniform mat4 combined;
uniform mat4 pmatrix;

attribute vec3 vPosition;
attribute vec3 vNormal;

varying vec4 pPosition;
varying vec3 pNormal;

void main() {
	pPosition = pmatrix * vec4( vPosition, 1.0 );
	pNormal = mat3( pmatrix[ 0 ].xyz, pmatrix[ 1 ].xyz, pmatrix[ 2 ].xyz ) * vNormal;
	gl_Position = combined * pPosition;
}