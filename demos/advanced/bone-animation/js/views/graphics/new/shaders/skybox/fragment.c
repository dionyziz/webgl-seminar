precision highp float;

varying vec3 UVCoord;

uniform samplerCube scSky;

void main() {
	gl_FragColor = vec4( textureCube( scSky, normalize( UVCoord ) ).xyz, 1.0 );
}
