define( [ 'framework/network/client', 'views/hud/hud', 'views/hud/quest' ], function( network, hud, questView ) {
    return {
        init: function() {
            network.quest.on( 'complete', function( message ) {
                hud.toast( 'Quest Completed!' );
                questView.updateProgress( message.questid, message.progress );
            } );
            network.quest.on( 'new', function( message ) {
                console.log( message );
                hud.toast( 'New quest: ' + message.quest.name );
                message.quest.progress = message.progress;
                questView.newQuest( message.quest );
            } );
        }
    };
} );
