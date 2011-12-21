define( [ './animable', './skeleton', './joint', 'models/mesh' ], function( animable, Skeleton, Joint, Mesh ) {
    var JSONLoader = function( url, renderer, callback ) {
        var r = new XMLHttpRequest();
        r.open( 'GET', url );
        r.onreadystatechange = function() {
            if ( r.readyState == 4 ) {
                var data = JSON.parse( r.responseText );
                console.log( data );
                function makeSkeleton( joint ) {
                    var j = new Joint( joint.id );
                    try {
                        mat4.set( joint.inverseBindMatrix, j.inverseBindMatrix );
                        if ( joint.relativePosition ) {
                            j.matrix[ 12 ] = joint.relativePosition[ 0 ];
                            j.matrix[ 13 ] = joint.relativePosition[ 1 ];
                            j.matrix[ 14 ] = joint.relativePosition[ 2 ];
                        }
                        else if ( joint.matrix ) {
                            mat4.set( joint.matrix, j.matrix );
                        }
                    }
                    catch ( e ) {
                        console.log( joint );
                        mat4.identity( j.inverseBindMatrix );
                    }

                    var l = joint.children.length;
                    while ( l-- ) {
                        j.appendChild( makeSkeleton( joint.children[ l ] ) );
                    }
                    return j;
                }
                var skeleton = new Skeleton();
                skeleton.setRoot( makeSkeleton( data.skeleton ) );
                skeleton.animations = data.animations;

                for ( var a in skeleton.animations ) {
                    skeleton.animations[ a ].duration = skeleton.animations[ a ].keyframes * 33;
                    skeleton.animations[ a ].started = 0;
                }
                skeleton.root.absoluteMatrix = skeleton.root.matrix;

                var anim = renderer.createAnimable( {
                    mesh: new Mesh( data.vertices, data.indices ),
                    normals: data.normals,
                    uvcoords: data.uvcoords,
                    boneindices: data.boneIndices,
                    boneweights: data.boneWeights,
                    material: renderer.createMaterial( 'solid-boned' ),
                    skeleton: skeleton
                } );
                callback( anim );
            }
        }
        r.send();
    }
    return JSONLoader;
} );
