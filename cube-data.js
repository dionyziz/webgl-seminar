var cubeTriangles = [
    //Front side
    [
        [  1,  1, -1 ],
        [  1, -1, -1 ],
        [ -1,  1, -1 ]
    ],
    [
        [ -1, -1, -1 ],
        [ -1,  1, -1 ],
        [  1, -1, -1 ]
    ],
    //Backside
    [
        [  1,  1,  1 ],
        [  1, -1,  1 ],
        [ -1,  1,  1 ]
    ],
    [
        [ -1, -1,  1 ],
        [ -1,  1,  1 ],
        [  1, -1,  1 ]
    ],
    //Left side
    [
        [ -1,  1,  1 ],
        [ -1, -1,  1 ],
        [ -1,  1, -1 ]
    ],
    [
        [ -1, -1, -1 ],
        [ -1,  1, -1 ],
        [ -1, -1,  1 ]
    ],
    //Rightside
    [
        [ 1,  1,  1 ],
        [ 1, -1,  1 ],
        [ 1,  1, -1 ]
    ],
    [
        [ 1, -1, -1 ],
        [ 1,  1, -1 ],
        [ 1, -1,  1 ]
    ],
    //Bottom side
    [
        [  1, -1,  1 ],
        [ -1, -1,  1 ],
        [  1, -1, -1 ]
    ],
    [
        [ -1, -1, -1 ],
        [  1, -1, -1 ],
        [ -1, -1,  1 ]
    ],
    //Top side
    [
        [  1, 1,  1 ],
        [ -1, 1,  1 ],
        [  1, 1, -1 ]
    ],
    [
        [ -1, 1, -1 ],
        [  1, 1, -1 ],
        [ -1, 1,  1 ]
    ],
];

var colors = [ 
    'aqua',
    'blue',
    'fuchsia',
    'green',
    'maroon',
    'navy',
    'purple',
    'red',
    'silver',
    'teal',
    'white',
    'yellow'
];

var numTriangles = cubeTriangles.length;
for ( var i = 0; i < numTriangles; i += 2 ) {
    cubeTriangles[ i ].color =  colors[ ( i / 2 )  % colors.length ];
    cubeTriangles[ i + 1 ].color = colors[ ( i / 2 )  % colors.length ];
};
