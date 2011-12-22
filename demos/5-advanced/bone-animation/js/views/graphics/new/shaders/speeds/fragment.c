precision highp float;

#define SIZE (128.0)
#define LINK (3.0)

#define SQRT2     (1.4142136)

/* num of points */
#define DELTA     (1.0/SIZE)
#define DELTA2    (LINK*DELTA)
#define GRID      (4.0/SIZE)
#define GRID_SQ2  (GRID*SQRT2)
#define GRID2     (GRID*LINK)
#define GRID2_SQ2 (GRID2*SQRT2)

/* how speed components are reduced */
#define SLOWDOWN_TANGENT (0.96)
#define SLOWDOWN_NORMAL  (0.92)

/* how springs force is reduced */
#define REDUCTION_ALL    (0.4)
#define REDUCTION_ORTH   (REDUCTION_ALL*1.0)
#define REDUCTION_DIAG   (REDUCTION_ALL*0.9)
#define REDUCTION_ORTH2  (REDUCTION_ALL*0.8)
#define REDUCTION_DIAG2  (REDUCTION_ALL*0.7)
#define GRAVITY          (1.0/(2.0*1024.0))

uniform sampler2D s2speeds;
uniform sampler2D s2positions;
uniform sampler2D s2normals;

varying vec2 UVCoord;

uniform vec3 v3wind;

void main()
{
    vec3 speed  = texture2D(s2speeds,UVCoord).xyz;
    vec3 pos    = texture2D(s2positions,UVCoord).xyz;
    vec3 normal = texture2D(s2normals,UVCoord).xyz;

    speed.y -= GRAVITY;

    vec3 wn = normal * dot(v3wind,normal);
    speed -= 0.01 * wn;
    vec3 n = normal * dot(speed,normal);
    vec3 t = speed - n;
    speed = n*SLOWDOWN_NORMAL + t*SLOWDOWN_TANGENT;
    speed += 0.01 * wn;

    if(UVCoord.s<1.0-DELTA)
    {
        vec3 spring = texture2D(s2positions,UVCoord+vec2(DELTA,0.0)).xyz - pos;
        speed += (spring - normalize(spring)*GRID) * REDUCTION_ORTH;

        if(UVCoord.t<1.0-DELTA)
        {
            vec3 spring = texture2D(s2positions,UVCoord+vec2(DELTA,DELTA)).xyz - pos;
            speed += (spring - normalize(spring)*GRID_SQ2) * REDUCTION_DIAG;
        }
        if(UVCoord.t>DELTA)
        {
            vec3 spring = texture2D(s2positions,UVCoord+vec2(DELTA,-DELTA)).xyz - pos;
            speed += (spring - normalize(spring)*GRID_SQ2) * REDUCTION_DIAG;
        }

        if(UVCoord.s<1.0-DELTA2)
        {
            vec3 spring = texture2D(s2positions,UVCoord+vec2(DELTA2,0.0)).xyz - pos;
            speed += (spring - normalize(spring)*GRID2) * REDUCTION_ORTH2;

            if(UVCoord.t<1.0-DELTA2)
            {
                vec3 spring = texture2D(s2positions,UVCoord+vec2(DELTA2,DELTA2)).xyz - pos;
                speed += (spring - normalize(spring)*GRID2_SQ2) * REDUCTION_DIAG2;
            }
            if(UVCoord.t>DELTA2)
            {
                vec3 spring = texture2D(s2positions,UVCoord+vec2(DELTA2,-DELTA2)).xyz - pos;
                speed += (spring - normalize(spring)*GRID2_SQ2) * REDUCTION_DIAG2;
            }
        }
    }
    if(UVCoord.s>DELTA)
    {
        vec3 spring = texture2D(s2positions,UVCoord+vec2(-DELTA,0.0)).xyz - pos;
        speed += (spring - normalize(spring)*GRID) * REDUCTION_ORTH;

        if(UVCoord.t<1.0-DELTA)
        {
            vec3 spring = texture2D(s2positions,UVCoord+vec2(-DELTA,DELTA)).xyz - pos;
            speed += (spring - normalize(spring)*GRID_SQ2) * REDUCTION_DIAG;
        }
        if(UVCoord.t>DELTA)
        {
            vec3 spring = texture2D(s2positions,UVCoord+vec2(-DELTA,-DELTA)).xyz - pos;
            speed += (spring - normalize(spring)*GRID_SQ2) * REDUCTION_DIAG;
        }

        if(UVCoord.s>DELTA2)
        {
            vec3 spring = texture2D(s2positions,UVCoord+vec2(-DELTA2,0.0)).xyz - pos;
            speed += (spring - normalize(spring)*GRID2) * REDUCTION_ORTH2;

            if(UVCoord.t<1.0-DELTA2)
            {
                vec3 spring = texture2D(s2positions,UVCoord+vec2(-DELTA2,DELTA2)).xyz - pos;
                speed += (spring - normalize(spring)*GRID2_SQ2) * REDUCTION_DIAG2;
            }
            if(UVCoord.t>DELTA2)
            {
                vec3 spring = texture2D(s2positions,UVCoord+vec2(-DELTA2,-DELTA2)).xyz - pos;
                speed += (spring - normalize(spring)*GRID2_SQ2) * REDUCTION_DIAG2;
            }
        }
    }
    if(UVCoord.t<1.0-DELTA)
    {
        vec3 spring = texture2D(s2positions,UVCoord+vec2(0.0,DELTA)).xyz - pos;
        speed += (spring - normalize(spring)*GRID) * REDUCTION_ORTH;

        if(UVCoord.t<1.0-DELTA2)
        {
            vec3 spring = texture2D(s2positions,UVCoord+vec2(0.0,DELTA2)).xyz - pos;
            speed += (spring - normalize(spring)*GRID2) * REDUCTION_ORTH2;
        }
    }
    if(UVCoord.t>DELTA)
    {
        vec3 spring = texture2D(s2positions,UVCoord+vec2(0.0,-DELTA)).xyz - pos;
        speed += (spring - normalize(spring)*GRID) * REDUCTION_ORTH;

        if(UVCoord.t>DELTA2)
        {
            vec3 spring = texture2D(s2positions,UVCoord+vec2(0.0,-DELTA2)).xyz - pos;
            speed += (spring - normalize(spring)*GRID2) * REDUCTION_ORTH2;
        }
    }

    gl_FragColor = vec4( speed, 1.0 );
}
