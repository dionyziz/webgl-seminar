define( [ 'views/utils' ], function( utils ) {
    var questsDiv;
    var questRows = {};
    
    var init = function() {
        questsDiv = $( '<div id="widget-quests">' +
                '<h2>Available Quests</h2>' +
                '<div id="questflow" class="panel">' +
                    '<table id="questtable">' +
                        '<thead><th>Name</th><th>Progress</th></thread>' +
                        '<tbody></tbody>' +
                    '</table>' +
                '</div>' +
                '<h2>Quest Details</h2>' +
                '<div id="questdetails" class="panel">' +
                '</div>' +
            '</div>' );
        
        return questsDiv;
    };
    
    var progressToString = function( arr ) {
        if ( arr[ 0 ] != arr[ 1 ] ) {
            return 'Tasks ' + arr[ 0 ] + ' of ' + arr[ 1 ];
        }
        return 'Completed';
    };
    
    var displayDetails = function( questdata ) {
        var detailsDiv;
        detailsDiv = $( utils.dom.makeDL( [ 'Name', questdata.name ], [ 'Description', questdata.description ] ) );
        $( '#questdetails' ).empty().append( detailsDiv );
    };
    var newQuest = function( questdata ) {
        var questRow = utils.dom.makeTR( questdata.name, progressToString( questdata.progress ) );
        questRows[ questdata.id ] = questRow;
        $( '#questtable tbody' ).append( questRow );
        
        $( questRow ).click( function() { displayDetails( questdata ) } );
    };
    var updateProgress = function( id, progress ) {
        questRows[ id ].childNodes[ 1 ].innerHTML = progressToString( progress );
    };
    
    return { init: init, newQuest: newQuest, updateProgress: updateProgress };
} );