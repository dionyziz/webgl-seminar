define( [ 'models/levelloader', 'views/level' ], function( levelLoader, levelView ) {
    var levelController = {};

    levelController.init = function() {
        levelLoader.init();
        levelView.init();
    };

    return levelController;
} );
