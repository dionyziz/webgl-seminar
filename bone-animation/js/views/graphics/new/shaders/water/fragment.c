precision highp float;

varying vec2 UVCoord;
varying vec4 position;
varying vec4 projectedPosition;
varying vec3 N;
varying vec3 T;
uniform float fTime;

uniform sampler2D s2textureBed;
uniform sampler2D s2textureWater;

const float PI = 3.141592;
const float uvfactor = 3.0;

float wave( float alpha, float omega, float phi, vec2 c ) {
    float x = UVCoord.x;
    float y = UVCoord.y;
    float t = fTime;
    vec2 d = UVCoord - c;
    
    return alpha * sin( phi + omega * dot( UVCoord, d ) );
}

float dwavedx( float alpha, float omega, float phi, vec2 c ) {
    float x = UVCoord.x;
    float y = UVCoord.y;
    float t = fTime;
    vec2 d = UVCoord - c;
    
    return alpha * omega * d.x * cos( phi + omega * dot( UVCoord, d ) );
}

float dwavedy( float alpha, float omega, float phi, vec2 c ) {
    float x = UVCoord.x;
    float y = UVCoord.y;
    float t = fTime;
    vec2 d = UVCoord - c;
    
    return alpha * omega * d.y * cos( phi + omega * dot( UVCoord, d ) );
}

void main() {
    float offset = -10.0 * fTime;
    float omega = 50.0 * PI / 2.0;
    float alpha = 1.0 / 2000.0; // 1.0 / 500.0;
    float h = wave( alpha / 4.0, omega, offset, vec2( 1.0, 1.0 ) )
              + wave( alpha / 5.0, omega + 0.1, offset + 0.5, vec2( 1.5, 1.5 ) )
              + wave( alpha / 100.0, omega * 5.0, offset + 0.1, vec2( 0.6, 0.6 ) )
              + wave( alpha / 100.0, omega * 6.1, offset + 0.1, vec2( 1.6, 0.6 ) );
    // generate new tangent vector and new binormal vector after perturbation, in tangent space
    // (originally, tangent = (1, 0, 0); binormal = (0, 1, 0) in tangent space
    vec3 newTangent = vec3( 1, 0, 
                        // dh / dx
                        dwavedx( alpha / 4.0, omega, offset, vec2( 1.0, 1.0 ) )
                         + dwavedx( alpha / 5.0, omega + 0.1, offset, vec2( 1.5, 1.5 ) )
                         + dwavedx( alpha / 100.0, omega * 5.0, offset + 0.1, vec2( 0.6, 0.6 ) )
                         + dwavedx( alpha / 100.0, omega * 6.1, offset + 0.1, vec2( 1.6, 0.6 ) )
                      );
    vec3 newBinormal = vec3( 0, 1,
                        // dh / dy
                        dwavedy( alpha / 4.0, omega, offset + 0.5, vec2( 1.0, 1.0 ) )
                         + dwavedy( alpha / 5.0, omega, offset + 0.1, vec2( 1.5, 1.5 ) )
                         + dwavedy( alpha / 100.0, omega * 5.0, offset + 0.1, vec2( 0.6, 0.6 ) )
                         + dwavedy( alpha / 100.0, omega * 6.1, offset + 0.1, vec2( 1.6, 0.6 ) )
                      );
    alpha /= 3.0;
    vec3 newTangentSmall = vec3( 1, 0, 
                        // dh / dx
                        dwavedx( alpha / 4.0, omega, offset, vec2( 1.0, 1.0 ) )
                         + dwavedx( alpha / 5.0, omega + 0.1, offset, vec2( 1.5, 1.5 ) )
                         + dwavedx( alpha / 100.0, omega * 5.0, offset + 0.1, vec2( 0.6, 0.6 ) )
                         + dwavedx( alpha / 100.0, omega * 6.1, offset + 0.1, vec2( 1.6, 0.6 ) )
                      );
    vec3 newBinormalSmall = vec3( 0, 1,
                        // dh / dy
                        dwavedy( alpha / 4.0, omega, offset + 0.5, vec2( 1.0, 1.0 ) )
                         + dwavedy( alpha / 5.0, omega, offset + 0.1, vec2( 1.5, 1.5 ) )
                         + dwavedy( alpha / 100.0, omega * 5.0, offset + 0.1, vec2( 0.6, 0.6 ) )
                         + dwavedy( alpha / 100.0, omega * 6.1, offset + 0.1, vec2( 1.6, 0.6 ) )
                      );

    vec3 normal = normalize( N );
    vec3 tangent = normalize( T );
    vec3 binormal = cross( normal, tangent );
    mat3 TBN = mat3( tangent, binormal, normal ); // TBN matrix: tangent space -> world space

    // perturbate tangent, binormal, and normal vectors
    tangent = TBN * newTangent;
    binormal = TBN * newBinormal;
    normal = cross( tangent, binormal );
    vec3 tangentS = TBN * newTangentSmall;
    vec3 binormalS = TBN * newBinormalSmall;
    vec3 normalS = cross( tangentS, binormalS );

    // reconstruct inverse TBN matrix based on perturbation
    // transforms: world space -> perurbated tangent space
    mat3 perturbatedTBNinv = mat3( tangent.x, binormal.x, normal.x,
                                   tangent.y, binormal.y, normal.y,
                                   tangent.z, binormal.z, normal.z );
    mat3 perturbatedSTBNinv = mat3( tangentS.x, binormalS.x, normalS.x,
                                    tangentS.y, binormalS.y, normalS.y,
                                    tangentS.z, binormalS.z, normalS.z );

    vec3 L = normalize( vec3( 0.0, 1.0, 0.0 ) );
    L = perturbatedTBNinv * L; // convert to tangent space
    
    vec3 eye = -position.xyz;
    vec3 eyeS = perturbatedSTBNinv * eye;
    eye = perturbatedTBNinv * eye;
    eye = normalize( eye );
    eyeS = normalize( eyeS );
    
    vec3 eyeExtended = -( 0.5 / eyeS.z ) * eyeS;
    vec3 eyeDisplaced = -( 10.0 * h / eye.z ) * eye;
    
    vec3 reflected = vec3( -L.x, -L.y, L.z );
    float specular = max( dot( reflected, eye ), 0.0 );
    
	vec3 waterColor = texture2D( s2textureWater, vec2( ( UVCoord.x + eyeDisplaced.x ) * uvfactor, ( UVCoord.y + eyeDisplaced.y ) * uvfactor ) ).xyz;
    vec3 bedColor   = texture2D( s2textureBed, vec2( ( UVCoord.x + eyeExtended.x ) * uvfactor, ( UVCoord.y + eyeExtended.y ) * uvfactor ) ).xyz;
    
    // check for wall sides
    bool ybig = false, ysmall = false, xbig = false, xsmall = false;
    
    ysmall = ( UVCoord.y + eyeExtended.y < 0.0 );
    ybig   = ( UVCoord.y + eyeExtended.y > 1.0 );
    xsmall = ( UVCoord.x + eyeExtended.x < 0.0 );
    xbig   = ( UVCoord.x + eyeExtended.x > 1.0 );
    
    if ( ysmall
      || ybig
      || xsmall
      || xbig ) {
        float lambda;
        bool vertical = false;
        float dx = 1.0, dy = 1.0;
        
        if ( ysmall ) {
            lambda = UVCoord.y / eyeExtended.y;
            dy = lambda * lambda;
        }
        else if ( ybig ) {
            lambda = ( UVCoord.y - 1.0 ) / eyeExtended.y;
            dy = lambda * lambda;
        }
        if ( xsmall ) {
            lambda = UVCoord.x / eyeExtended.x;
            dx = lambda * lambda;
        }
        else if ( xbig ) {
            lambda = ( UVCoord.x - 1.0 ) / eyeExtended.x;
            dx = lambda * lambda;
        }
        if ( dx < dy ) {
            vertical = true;
            if ( xsmall ) {
                lambda = UVCoord.x / eyeExtended.x;
            }
            else { // xbig
                lambda = ( UVCoord.x - 1.0 ) / eyeExtended.x;
            }
        }
        else { // dy >= dx
            if ( ysmall ) {
                lambda = UVCoord.y / eyeExtended.y;
            }
            else { // ybig
                lambda = ( UVCoord.y - 1.0 ) / eyeExtended.y;
            }
        }
        
        eyeExtended = lambda * eyeExtended;
        if ( vertical ) {
            bedColor = texture2D( s2textureBed, vec2( 1.0 - eyeExtended.z, UVCoord.y - eyeExtended.y ) * uvfactor ).xyz;
        }
        else {
            bedColor = texture2D( s2textureBed, vec2( eyeExtended.z, UVCoord.x - eyeExtended.x ) * uvfactor ).xyz;
        }
    }
    
    vec3 objectColor = 0.5 * waterColor + 0.5 * bedColor;
    
	float diffuse = max( L.z, 0.0 );

    gl_FragColor = vec4( diffuse * objectColor + 0.2 * pow( specular, 60.0 ) * vec3( 1.0, 1.0, 1.0 ), 1.0 );
}
