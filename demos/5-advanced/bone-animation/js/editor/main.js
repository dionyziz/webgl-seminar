require( [ 'require', 'views/hud/widget', 'models/itemtype', 'editor/npc', 'editor/itemtype' ], function( require ) {
    var widget = require( 'views/hud/widget' );
    var ItemType = require( 'models/itemtype' );
    var itemTypeEditor = require( 'editor/itemtype' );
    var NPCEditor = require( 'editor/npc' );
    
    function init() {
        itemTypeEditor.init();
        NPCEditor.init();
    }
    
    init();
} );
