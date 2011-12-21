define( [ 'require', 'views/hud/widget', './decisiontree' ], function( require ) {
    var widget = require( 'views/hud/widget' );
    var DecisionTree = require( './decisiontree' );

    function init() {
        var widgetDiv = $( '<div class="npc-editor-menu">' );
        
        var newButton = $( '<a href="">New Configuration</a>' ).addClass( 'button' ).click( function( e ) {
            e.preventDefault();
            create();
        } ).appendTo( widgetDiv );
        
        var editButton = $( '<a href="">Edit Configuration</a>' ).addClass( 'button' ).click( function( e ) {
            e.preventDefault();
            list();
        } ).appendTo( widgetDiv );
        
        return widget.makeWidget( widgetDiv, { title: 'NPC Editor' } );
    };
    
    function list() {
        var widgetDiv = $( '<div class="npc-editor-list">' );
        widgetDiv.text( 'Click on a configuration to edit: ' );
        var configList = $( '<ul class="vertical">' ).appendTo( widgetDiv );
        
        configList.append( $( '<li>Fetching list...</li>' ) );
        
        var widgetObj = widget.makeWidget( widgetDiv, { title: 'NPC Configuration List' } );
        
        var basename;
        $.get( 'editor/npc.php?action=list' ).then( function( list ) {
            configList.empty();
            if ( list.length ) {
                for ( var i = 0; i < list.length; ++i ) {
                    basename = list[ i ].basename;
                    widget.makeButton( basename,
                        ( function( basename ) {
                            return function() {
                                $.get( 'editor/npc.php?action=read&filename=' + basename ).then( function( data ) {
                                    var npcEditor = create();
                                    var tree = JSON.parse( data.split( '\n' )[0].substr( 1 ) );
                                    npcEditor.decisionView.decompile( tree );
                                    widgetObj.close();
                                } );
                            }
                        } )( basename )
                    ).appendTo( $( '<li>' ).appendTo( configList ) );
                }
            }
        } );
        
        return widgetObj;
    };
    
    function create() {
        var widgetDiv = $( '<div class="npc-editor">' );
        
        var decisionView = new DecisionTree();
        $( decisionView.elem )
            .appendTo( widgetDiv );
        
        var editPanel = $( '<div class="edit panel">' )
            .appendTo( widgetDiv );
        
        $( '<div>' ).css( 'clear', 'both' ).appendTo( widgetDiv );
        $( '<a href="">' ).text( 'Save' ).addClass( 'button' ).click( function( e ) {
            e.preventDefault();
            
            var dVdata = decisionView.compile();
            
            var question, answer, action, qid, anid, acid, data;
            
            function prologString( text ) {
                return "'" + text.replace( /'/g, '\\\'' ) + "'";
            };
            
            var output = [];
            
            output.push( '%' + JSON.stringify( dVdata ) );
            output.push( '' ); //newline
            
            for ( qid in dVdata.questions ) {
                question = dVdata.questions[ qid ];
                output.push( 'question( ' + qid + ', ' + prologString( question.text ) + ' ).' );
                for ( anid in question.answers ) {
                    answer = question.answers[ anid ];
                    for ( acid in answer.actions ) {
                        action = answer.actions[ acid ];
                        data = action.data;
                        
                        switch ( data.type ) {
                            case 'say':
                                output.push( 'answer( ' + qid + ', ' + prologString( answer.text ) + ', ' + prologString( data.text ) + ' ).' );
                                break;
                            case 'quest':
                                output.push( 'answer( ' + qid + ', ' + prologString( answer.text ) + ', quest( ' + data.questid + ' ) ).' );
                                break;
                            case 'ask':
                                if ( dVdata.questions[ data.questionid ] ) {
                                    output.push( 'answer( ' + qid + ', ' + prologString( answer.text ) + ', ' + data.questionid + ' ).' );
                                }
                                else {
                                    return widget.messageBox( 'Error', 'Broken reference to a question. Aborting save', function() {
                                        decisionView.selectNode( 'action', acid );
                                    } );
                                }
                                break;
                        }
                    }
                }
                output.push( '' ); //Newline
            }
            
            output = output.join( '\n' );
            
            widget.inputDialog( 'Config', 'Type the configuration\'s name:', function( filename ) {
                if ( filename == '' ) {
                    alert( 'Please type a name' );
                    return false;
                }
                $.post( 'editor/npc.php?action=create', { filename: filename, data: output } );
            },
            function() {
            } );
        } ).appendTo( widgetDiv );
        
        
        /*//for testing purposes
        decisionView.addQuestion( 'O haii. Have you ever been in Orgrimmar?' );
        decisionView.addAnswer( 1, 'yes' );
        decisionView.addAnswer( 1, 'no' );
        //decisionView.removeAnswer( 0 );
        decisionView.addAction( 1, { type: 'say', text: 'Go find the secret talisman and bring it to me!' } );
        decisionView.addAction( 1, { type: 'quest', questid: 3092 } );
        decisionView.addAction( 1, { type: 'ask', questionid: 1 } );
        decisionView.addAction( 2, { type: 'say', text: 'Too bad... Farewell!' } );
        decisionView.addQuestion( 'NICE! Do you need anything else?' );
        var y = decisionView.addAnswer( 2, 'yes' );
        var n = decisionView.addAnswer( 2, 'no' );
        decisionView.addAction( y.id, { type: 'say', text: 'Good call! You can also search for the Master Gnome while in Orgrimmar!' } );
        decisionView.addAction( y.id, { type: 'quest', questid: 3093 } );
        decisionView.addAction( n.id, { type: 'say', text: 'Farewell, then! Have fun in your quest!' } );
        //decisionView.removeQuestion( 0 );
        */
        
        decisionView.on( 'select', function( type, id ) {
            editPanel.empty();
            var fieldsPanel = createEditPanel( type, id );
            editPanel.append( fieldsPanel.elem );
            
            var onDelete;
            
            switch ( type ) {
                case 'question':
                    //Initialize question text
                    fieldsPanel.fields[ 'text' ].setValue( decisionView.questions[ id ].text() );
                    
                    //Change qestion text
                    $( fieldsPanel.fields[ 'text' ].inputElem ).change( function() {
                        decisionView.questions[ id ].text( fieldsPanel.fields[ 'text' ].getValue() );
                    } ).focus();
                    
                    //Delete button callback
                    onDelete = function() {
                        decisionView.removeQuestion( id );
                    };
                    
                    //New answer button
                    var newAnswerButton = $( '<a href="">New Answer</a>' ).click( function( e ) {
                        e.preventDefault();
                        decisionView.selectNode( 'answer', decisionView.addAnswer( id ).id, true );
                    } ).addClass( 'button' ).appendTo( editPanel );
                    break;
                case 'answer':
                    //Initialize answer text
                    fieldsPanel.fields[ 'text' ].setValue( decisionView.answerCache[ id ].text() );
                    
                    //Change answer text
                    $( fieldsPanel.fields[ 'text' ].inputElem ).change( function() {
                        decisionView.answerCache[ id ].text( fieldsPanel.fields[ 'text' ].getValue() );
                    } ).focus();
                    
                    //Delete button callback
                    onDelete = function() {
                        decisionView.removeAnswer( id );
                    };
                    
                    //New action button
                    var newActionButton = $( '<a href="">New Action</a>' ).click( function( e ) {
                        e.preventDefault();
                        decisionView.selectNode( 'action', decisionView.addAction( id ).id, true );
                    } ).addClass( 'button' ).appendTo( editPanel );
                    break;
                case 'action':
                    onDelete = function() {
                        decisionView.removeAction( id );
                    };
                    
                    //Read values
                    var data = decisionView.actionCache[ id ].data();
                    fieldsPanel.fields[ 'actiontype' ].setValue( data.type );
                    switch ( data.type ) {
                        case 'ask':
                            fieldsPanel.fields[ 'questionid' ].setValue( data.questionid );
                            $( fieldsPanel.fields[ 'questionid' ].inputElem ).focus();
                            break;
                        case 'say':
                            fieldsPanel.fields[ 'saytext' ].setValue( data.text );
                            $( fieldsPanel.fields[ 'saytext' ].inputElem ).focus();
                            break;
                        case 'quest':
                            fieldsPanel.fields[ 'questid' ].setValue( data.questid );
                            $( fieldsPanel.fields[ 'questid' ].inputElem ).focus();
                            break;
                    }
                    
                    //Various action types secondary fields
                    var actionTypes = { say: 'saytext', ask: 'questionid', quest: 'questid' };
                    for ( var type in actionTypes ) {
                        var fieldName = actionTypes[ type ];
                        
                        $( fieldsPanel.fields[ fieldName ].inputElem ).change( function( type, fieldName ) {
                            if ( fieldsPanel.fields[ 'actiontype' ].getValue() == type ) {
                                var data = {};
                                data.type = type;
                                switch ( type ) {
                                    case 'ask':
                                    case 'quest':
                                        data[ fieldName ] = fieldsPanel.fields[ fieldName ].getValue();
                                        break;
                                    case 'say':
                                        data.text = fieldsPanel.fields[ fieldName ].getValue();
                                }
                                
                                decisionView.actionCache[ id ].data( data );
                            }
                        }.bind( this, type, fieldName ) );
                    }
                    
                    break;
            }
            
            var deleteButton = $( '<a href="">Delete Node</a>' ).addClass( 'button' ).click( function( e ) {
                e.preventDefault();
                onDelete();
                return false;
            } );
            
            editPanel.append( deleteButton );
        } );
        decisionView.on( 'deselect', function() {
            editPanel.empty();
            var newQuestion = $( '<a href="">New Question</a>' ).addClass( 'button' ).click( function( e ) {
                e.preventDefault();
                decisionView.selectNode( 'question', decisionView.addQuestion().id, true );
            } );
            editPanel.append( newQuestion );
        } );
        decisionView.emit( 'deselect' );
        
        function createEditPanel( type, id ) {
            var fieldsPanel;
            
            var idText = isNaN( id ) ? '' : ' [' + id + ']';
            
            switch ( type ) {
                case 'question':
                    fieldsPanel = Forms.newPanel( 'Question' + idText, [
                        {
                            type: 'text',
                            name: 'text',
                            caption: 'Question text',
                            def: ''
                        }
                    ] );
                    break;
                case 'answer':
                    fieldsPanel = Forms.newPanel( 'Answer' + idText, [
                        {
                            type: 'text',
                            name: 'text',
                            caption: 'Answer text',
                            def: ''
                        }
                    ] );
                    break;
                case 'action':
                    fieldsPanel = Forms.newPanel( 'Action' + idText, [
                        {
                            type: 'select',
                            name: 'actiontype',
                            caption: 'Action',
                            options: {
                                'say': 'Say something',
                                'ask': 'Ask question',
                                'quest': 'Assign quest'
                            },
                            def: 0
                        },
                        {
                            type: 'text',
                            name: 'questionid',
                            caption: 'Question Id',
                            def: 0
                        },
                        {
                            type: 'text',
                            name: 'questid',
                            caption: 'Quest Id',
                            def: 0,
                        },
                        {
                            type: 'text',
                            name: 'saytext',
                            caption: 'Say what!?',
                            def: ''
                        }
                    ] );
                    function changeType() {
                        $( [
                            fieldsPanel.fields[ 'questionid' ].elem,
                            fieldsPanel.fields[ 'questid' ].elem,
                            fieldsPanel.fields[ 'saytext' ].elem
                        ] ).hide();
                        
                        switch ( $( this ).val() ) {
                            case 'quest':
                                $( fieldsPanel.fields[ 'questid' ].elem ).show();
                                break;
                            case 'ask':
                                $( fieldsPanel.fields[ 'questionid' ].elem ).show();
                                break;
                            case 'say':
                                $( fieldsPanel.fields[ 'saytext' ].elem ).show();
                        }
                    }
                    $( fieldsPanel.fields[ 'actiontype' ].inputElem ).change( changeType );
                    
                    changeType.call( fieldsPanel.fields[ 'actiontype' ].inputElem );
            }
            
            return fieldsPanel;
        }
        
        return {
            widget: widget.makeWidget( widgetDiv, { title: 'NPC Decision Editor' } ),
            decisionView: decisionView
        };
    }
    
    return { init: init, create: create };
} );