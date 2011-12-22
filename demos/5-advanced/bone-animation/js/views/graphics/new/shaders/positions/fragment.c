precision highp float;

uniform sampler2D s2positions;
uniform sampler2D s2speeds;

varying vec2 UVCoord;

const vec3 sph = vec3(-0.7,0.0,-0.8);
const vec3 sph2 = vec3(0.4,0.0,0.5);
const vec2 cyl = vec2(1.0,0.0);

void main()
{
    vec3 speed = texture2D(s2speeds,UVCoord).xyz;
    vec3 pos = texture2D(s2positions,UVCoord).xyz;

    pos += speed * 0.2;
    
    //check sphere 1 collision
    if(distance(pos,sph)<0.7)
        pos = sph + normalize(pos-sph)*0.7;

    // check sphere 2 collision
    if(distance(pos,sph2)<0.5)
        pos = sph2 + normalize(pos-sph2)*0.5;

    // check cilynder collision
    //if(distance(pos.xy,cyl)<0.4)
    //    pos.xy = cyl + normalize(pos.xy-cyl)*0.4;

    gl_FragColor = vec4( pos, 1.0);
}
