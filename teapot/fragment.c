precision highp float;

struct spot_light {
    vec4 position; // light position in eye space
    vec4 ambient_color;
    vec4 diffuse_color;
    vec4 specular_color;
    vec3 spot_direction; // normalized spot direction
    vec3 attenuation_factors; // attenuation factors K0, K1, K2
    bool compute_distance_attenuation;
    float spot_exponent; // spotlight exponent term
    float spot_cutoff_angle; // spot cutoff angle in degrees
};

struct material_properties {
    vec4 ambient_color;
    vec4 diffuse_color;
    vec4 specular_color;
    float specular_exponent;
};

//Save zero and one to a constant variable to save some shader size
const float c_zero = 0.0;
const float c_one = 1.0;

//Uniform variables
uniform material_properties material;
uniform spot_light light;

vec4 spotlight( vec3 normal, vec4 position ) {
    vec4 computed_color = vec4( c_zero, c_zero, c_zero, c_zero );
    vec3 lightdir;
    vec3 halfplane;
    float ndotl, ndoth;
    float att_factor;
    att_factor = c_one;
    // we assume "w" values for light position and
    // vertex position are the same
    lightdir = light.position.xyz - position.xyz;
    // compute distance attenuation
    if( light.compute_distance_attenuation ) {
        vec3 att_dist;
        att_dist.x = c_one;
        att_dist.z = dot(lightdir, lightdir);
        att_dist.y = sqrt(att_dist.z);
        att_factor = c_one / dot(att_dist, light.attenuation_factors);
    }
    // normalize the light direction vector
    lightdir = normalize( lightdir );
    // compute spot cutoff factor
    if( light.spot_cutoff_angle < 180.0 ) {
        float spot_factor = dot( -lightdir, light.spot_direction );
        if( spot_factor >= cos( radians( light.spot_cutoff_angle ) ) ) {
            spot_factor = pow( spot_factor, light.spot_exponent );
        }
        else {
            spot_factor = c_zero;
        }
        // compute combined distance & spot attenuation factor
        att_factor *= spot_factor;
    }
    if( att_factor > c_zero ) {
        // process lighting equation --> compute the light color
        computed_color += (light.ambient_color *
        material.ambient_color);
        ndotl = max(c_zero, dot(normal, lightdir));
        computed_color += (ndotl * light.diffuse_color *
        material.diffuse_color);
        halfplane = normalize(lightdir + vec3(c_zero, c_zero, c_one));
        ndoth = dot(normal, halfplane);
        if( ndoth > c_zero ) {
            computed_color += ( pow( ndoth, material.specular_exponent ) * material.specular_color * light.specular_color );
        }
        // multiply color with computed attenuation
        computed_color *= att_factor;
    }
    return computed_color;
}

varying vec4 pPosition;
varying vec3 pNormal;

void main() {
	gl_FragColor = spotlight( normalize( pNormal ), pPosition );
}
