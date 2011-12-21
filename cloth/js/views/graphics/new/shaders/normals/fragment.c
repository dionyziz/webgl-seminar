precision highp float;

#define SIZE (128.0)
 
#define DELTA  (1.0/SIZE)

uniform sampler2D s2positions;

varying vec2 UVCoord;

void main()
{
    vec3 pos = texture2D( s2positions, UVCoord ).xyz;
    vec3 v1 = texture2D( s2positions, UVCoord + vec2( 0.0, DELTA ) ).xyz - pos;
    vec3 v2 = texture2D( s2positions, UVCoord + vec2( DELTA, DELTA ) ).xyz - pos;
    vec3 v3 = texture2D( s2positions, UVCoord + vec2( DELTA, 0.0 ) ).xyz - pos;
    vec3 v4 = texture2D( s2positions, UVCoord + vec2( 0.0, -DELTA ) ).xyz - pos;
    vec3 v5 = texture2D( s2positions, UVCoord + vec2( -DELTA, -DELTA ) ).xyz - pos;
    vec3 v6 = texture2D( s2positions, UVCoord + vec2( -DELTA, 0.0 ) ).xyz - pos;

    vec3 n1, n2, n3, n4, n5, n6;
    
    if( v1 == v2 ) {
        n1 = vec3( 0.0 );
    }
    else {
        n1 = normalize( cross( v1, v2 ) );
    }
    
    if( v2 == v3 ) {
        n2 = vec3( 0.0 );
    }
    else {
        n2 = normalize( cross( v2, v3 ) );
    }
    
    if( v3 == v4 ) {
        n3 = vec3( 0.0 );
    }
    else {
        n3 = normalize( cross( v3, v4 ) );
    }
    
    if( v4 == v5 ) {
        n4 = vec3( 0.0 );
    }
    else {
        n4 = normalize( cross( v4, v5 ) );
    }
    
    if( v5 == v6 ) {
        n5 = vec3( 0.0 );
    }
    else {
        n5 = normalize( cross( v5, v6 ) );
    }
    
    if( v6 == v1 ) {
        n6 = vec3( 0.0 );
    }
    else {
        n6 = normalize( cross( v6, v1 ) );
    }
    if( v1 == vec3( 0.0 ) ) {
        n1 = n6 = vec3( 0.0 );
    }
    if( v2 == vec3( 0.0 ) ) {
        n1 = n2 = vec3( 0.0 );
    }
    if( v3 == vec3( 0.0 ) ) {
        n2 = n3 = vec3( 0.0 );
    }
    if( v4 == vec3( 0.0 ) ) {
        n3 = n4 = vec3( 0.0 );
    }
    if( v5 == vec3( 0.0 ) ) {
        n4 = n5 = vec3( 0.0 );
    }
    if( v6 == vec3( 0.0 ) ) {
        n5 = n6 = vec3( 0.0 );
    }
    gl_FragColor = vec4( normalize( n1 + n2 + n3 + n4 + n5 + n6 ), 1.0 );
}
