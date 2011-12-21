define( [ './renderer', './mergegroup', './camera', './utils', './objloader', './groupdrawable', './skeleton', './joint', './animable', './billboard', './jsonloader' ], 
        function( Renderer, MergeGroup, Camera, utils, objloader, groupDrawable, Skeleton, Joint, Animable, Billboard, jsonLoader ) {
    return {
        Renderer: Renderer,
        MergeGroup: MergeGroup,
        Camera: Camera,
        utils: utils,
        objloader: objloader,
        groupDrawable : groupDrawable,
        Joint: Joint,
        Skeleton: Skeleton,
        Animable: Animable,
        Billboard: Billboard,
        jsonLoader: jsonLoader
    };
} );
