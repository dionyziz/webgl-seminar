define( [ 'libs/extender', 'libs/math', 'models/transformable' ], function( inherits, math, Transformable ) {
    var Camera = function( x, y, z ) {
        Transformable.call( this );

        this.w = 1;
        this.h = 1;
        this.ratio = 1;
        this.zNear = 0.1;
        this.zFar = 500;
        this.perspectiveMatrix = mat4.create();

        this.move( x, y, z );
    };

    inherits( Camera, Transformable );
    
    Camera.prototype.FOV = 50;
    Camera.prototype.tanFOV = Math.tan( ( Camera.prototype.FOV / 2 ) * ( Math.PI / 180 ) );
    Camera.prototype.cosFOV = Math.cos( ( Camera.prototype.FOV / 2 ) * ( Math.PI / 180 ) );
    Camera.prototype.horizTanFOV = Camera.prototype.tanFOV;
    Camera.prototype.horizCosFOV = Math.cos( Math.atan( Camera.prototype.tanFOV ) );

    Camera.prototype.setPerspective = function () {
        mat4.perspective( this.FOV, this.w / this.h, this.zNear, this.zFar, this.perspectiveMatrix );
        this.ratio = this.w / this.h;
        this.horizCosFOV = Math.cos( Math.atan( this.tanFOV * this.ratio ) );
        this.horizTanFOV = this.tanFOV * this.ratio;
    };
        
    Camera.prototype.setViewport = function( w, h ) {
        this.w = w;
        this.h = h;
        this.setPerspective();
    };

    Camera.prototype.setClipping = function ( zNear, zFar ) {
        this.zNear = zNear;
        this.zFar = zFar;
        this.setPerspective();
    };

    Camera.prototype.isVisible = function ( position, radius ) {
        if ( -position[ 2 ] - radius > this.zFar ) {
            return false;
        }
        if ( -position[ 2 ] + radius < this.zNear ) {
            return false;
        }
        
        var distance = this.cosFOV * ( Math.abs( position[ 1 ] ) - this.tanFOV * -position[ 2 ] );
        if(  distance > radius  ) {
            return false;
        }        
        
        var distance = this.horizCosFOV *  ( Math.abs( position[ 0 ] ) - this.horizTanFOV * -position[ 2 ] );
        if( distance > radius ) {
            return false;
        }
        
        return true;
    };

    var tetra = math.tetra;
       
    Camera.prototype.follow = function( entity ) {
        var camera = this;
		var camPos = [ 0, 0, 0 ], camRot = 0;
        var moveAnimation = function( position, orientation ) {
			var oldCamRot = camRot + 0;
			var oldCamPos = dian3.scale( camPos, 1 );
		
            var CAM_DIST = 5;
            var camRot = tetra.angle( orientation );
            if ( Math.abs( ( tetra.axis( orientation )[ 1 ] - 1 ) ) > 1   ) {
                camRot = 2*Math.PI - camRot;
            } 
			
			camPos = [ position[ 0 ] + CAM_DIST * Math.sin( camRot ), 3, position[ 2 ] + CAM_DIST * Math.cos( camRot ) ];
			
			//camRot = oldCamRot + ( camRot - oldCamRot )/10;
			//camPos = dian3.add( oldCamPos, dian3.scale( dian3.subtract( camPos, oldCamPos ), 0.1 ) ); 
			
			//var camPos = [ position[ 0 ] + CAM_DIST * Math.sin( camRot ), 3, position[ 2 ] + CAM_DIST * Math.cos( camRot ) ]
			
			
            camera.moveTo.apply( camera, camPos );
            camera.lookAt( position[ 0 ], 2.5, position[ 2 ] );
            /*camera.moveTo( 20, 20, 20 );//look from above, TODO have camera modes
            camera.lookAt( 20, 100,20 );*/
			
			oldCamPos = camPos;
			oldCamRot = camRot;			
        };

        entity.on( 'move', moveAnimation );
        moveAnimation( entity.getPosition(), entity.getOrientation() );
    };

    return Camera;
} );

