define( [ 'libs/extender', './drawable' ], function( inherits, Drawable ) {
    var Animable = function ( data, renderer ) {
        Drawable.call( this, data, renderer );
        if ( data.boneweights !== undefined ) { 
            this.BoneWeights = this.makeBuffer( data.boneweights, renderer );
        }
        if ( data.boneindices !== undefined ) {
            this.BoneIndices = this.makeBuffer( data.boneindices, renderer );
        }
        if ( data.skeleton !== undefined ) {
            this.skeleton = data.skeleton;
        }
        this.renderer = renderer;
    };

    inherits( Animable, Drawable );
    
    Animable.prototype.parentRender = Animable.prototype.render;
    Animable.prototype.render = function() {
        this.skeleton.update();
        this.material.set( 'v4row1[0]', this.skeleton.row1 );
        this.material.set( 'v4row2[0]', this.skeleton.row2 );
        this.material.set( 'v4row3[0]', this.skeleton.row3 );
        this.parentRender();
    }

    return Animable;
} );
