define( function() {
    var Joint = function( id ) {
        this.id = id;
        this.matrix = mat4.create();
        this.absoluteMatrix = mat4.create();
        this.inverseBindMatrix = mat4.create();
        this.children = [];
    };
    
    Joint.prototype = {
        appendChild: function( joint ) {
            this.children.push( joint );
        }
    }

    return Joint;
} );
