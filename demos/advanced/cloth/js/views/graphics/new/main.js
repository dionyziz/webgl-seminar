define( [ './renderer', './mergegroup', './camera', './utils', './objloader' ], function( Renderer, MergeGroup, Camera, utils, objloader ) {
    return {
        Renderer: Renderer,
        MergeGroup: MergeGroup,
        Camera: Camera,
        utils: utils,
        objloader: objloader
    };
} );
