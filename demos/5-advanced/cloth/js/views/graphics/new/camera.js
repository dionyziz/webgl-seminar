define( [ 'models/transformable' ], function( Transformable ) {
    var Camera = function() {
        this.w = 1;
        this.h = 1;
        this.ratio = 1;
        this.zNear = 0.1;
        this.zFar = 100;
        this.perspectiveMatrix = mat4.create();
    }.extend( Transformable );

    Camera.prototype.tanFOV = Math.tan( ( 50 / 2 ) * ( Math.PI / 180 ) );

    Camera.prototype.setPerspective = function () {
        mat4.perspective( 50, this.w / this.h, this.zNear, this.zFar, this.perspectiveMatrix );
        this.ratio = this.w / this.h;
    }
        
    Camera.prototype.setViewport = function( w, h ) {
        this.w = w;
        this.h = h;
        this.setPerspective();
    };

    Camera.prototype.setClipping = function ( zNear, zFar ) {
        return;
        this.zNear = zNear;
        this.zFar = zFar;
        this.setPerspective();
    }

    Camera.prototype.isVisible = function ( position, radius ) {
        if ( -position[ 2 ] - radius > this.zFar ) {
            return false;
        }
        if ( -position[ 2 ] + radius < this.zNear ) {
            return false;
        }
        if( Math.abs( position[ 1 ] ) - radius > this.tanFOV * -position[ 2 ] ) {
            return false;
        }
        if( Math.abs( position[ 0 ] ) - radius > this.tanFOV * this.ratio * -position[ 2 ] ) {
            return false;
        }
        return true;
    }

    return Camera;
} );
