define( [], function() {
    var Skeleton = function() {
        this.root = null;
        this.nextId = 0;
        this.mats = null;
        this.row1 = null;
        this.row2 = null;
        this.row3 = null;

        this.animations = {};
        this.currentAnimation = null;

        this.bindShapeMatrix = mat4.create();
        this.tempMatrix = mat4.create();
    }
        
    Skeleton.prototype = {
        setRoot: function( joint ) {
            var count = 0;
            function countJoints( joint ) {
                count++;
                var i = joint.children.length;
                while ( i-- ) {
                    countJoints( joint.children[ i ] );
                }
            }
            countJoints( joint );
            mat4.set( joint.matrix, joint.absoluteMatrix );
            this.root = joint;
            this.mats = new Float32Array( 16 * count );
            this.row1 = new Float32Array( 4 * count );
            this.row2 = new Float32Array( 4 * count );
            this.row3 = new Float32Array( 4 * count );
            while ( count-- ) {
                this.mats[ count * 16 ] = 1;
                this.mats[ count * 16 + 5 ] = 1;
                this.mats[ count * 16 + 10 ] = 1;
                this.mats[ count * 16 + 15 ] = 1;
            }
        },
        play: function( animation ) {
            if ( this.currentAnimation != this.animations[ animation ] ) {
                this.currentAnimation = this.animations[ animation ];
                this.currentAnimation.started = Date.now();
            }
        },
        stop: function() {
            this.currentAnimation = null;
        },
        update: function() {
            if ( this.currentAnimation ) {
                var animation = this.currentAnimation;
                var keyframe = ( ( ( Date.now() - animation.started ) / animation.duration ) * animation.keyframes ) % animation.keyframes;
                keyframe |= 0;

                function animate( joint ) {
                    var mat = animation.matrices[ joint.id ][ keyframe ];
                    var pos = [ joint.matrix[ 12 ], joint.matrix[ 13 ], joint.matrix[ 14 ] ];
                    mat3.toMat4( mat, joint.matrix );
                    joint.matrix[ 12 ] = pos[ 0 ];
                    joint.matrix[ 13 ] = pos[ 1 ];
                    joint.matrix[ 14 ] = pos[ 2 ];

                    //mat4.set( animtions.matrices[ joint.id ][ keyframe ], joint.matrix );
                    var i = joint.children.length;
                    while ( i-- ) {
                        animate( joint.children[ i ] );
                    }
                }

                animate( this.root );
                this.root.absoluteMatrix[ 12 ] = animation.rootPosition[ keyframe ][ 0 ];
                this.root.absoluteMatrix[ 13 ] = animation.rootPosition[ keyframe ][ 1 ];
                this.root.absoluteMatrix[ 14 ] = animation.rootPosition[ keyframe ][ 2 ];
            }

            function updateMatrices( joint ) {
                var i = joint.children.length;
                var child;
                while ( i-- ) {
                    child = joint.children[ i ];
                    mat4.multiply( joint.absoluteMatrix, child.matrix, child.absoluteMatrix );
                    updateMatrices( child );
                }
            }
            updateMatrices( this.root );
            
            var bindShapeMatrix = this.bindShapeMatrix;
            var temp = this.tempMatrix;
            var row1 = this.row1;
            var row2 = this.row2;
            var row3 = this.row3;

            function updateSkinningMatrices( joint ) {
                var offset, i;
                
                mat4.set( joint.absoluteMatrix, temp );
                mat4.multiply( temp, joint.inverseBindMatrix );
                //mat4.multiply( temp, bindShapeMatrix );

                offset = joint.id * 4;
                
                row1[ offset + 0 ] = temp[ 0 ];
                row1[ offset + 1 ] = temp[ 4 ];
                row1[ offset + 2 ] = temp[ 8 ];
                row1[ offset + 3 ] = temp[ 12 ];

                row2[ offset + 0 ] = temp[ 1 ];
                row2[ offset + 1 ] = temp[ 5 ];
                row2[ offset + 2 ] = temp[ 9 ];
                row2[ offset + 3 ] = temp[ 13 ];

                row3[ offset + 0 ] = temp[ 2 ];
                row3[ offset + 1 ] = temp[ 6 ];
                row3[ offset + 2 ] = temp[ 10 ];
                row3[ offset + 3 ] = temp[ 14 ];

                i = joint.children.length;
                while ( i-- ) {
                    updateSkinningMatrices( joint.children[ i ] );
                }
            }
            updateSkinningMatrices( this.root )
        }
    }

    return Skeleton;
} );
