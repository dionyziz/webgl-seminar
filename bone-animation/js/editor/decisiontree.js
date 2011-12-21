define( [ 'require', 'libs/extender', 'libs/events' ], function( require, inherits ) {
    var EventEmitter = require( 'libs/events' ).EventEmitter;
    
    var DecisionTree = function() {
        this.question_i = 1;
        this.answer_i = 1;
        this.action_i = 1;
        
        this.answerCache = this.answers = {};
        this.actionCache = this.actions = {};
        
        this.questions = {};
        this.lastClicked = null;
        
        this.treeElem = $( '<div class="tree">' );

        this.elem = $( '<div class="decisiontree">' );
        this.elem.append( this.treeElem );
        
        this.elem.click( function( e ) {
            e.preventDefault();
            if ( this.lastClicked !== null ) {
                this.deselectNode();
            }
        }.bind( this ) );
    }
    
    inherits( DecisionTree, EventEmitter );
    
    DecisionTree.prototype.addQuestion = function( text, qid ) {
        if ( qid ) {
            if ( qid > this.question_i ) {
                this.question_i = qid;
            }
        }
        else {
            qid = this.question_i++;
        }
        
        text = text || '';
        var textElem = $( '<span>' )
            .text( text )
            .attr( 'title', text );
        var elem = $( '<div class="question">' )
            .appendTo( this.treeElem )
            .click( this.clickFactory( 'question', qid ) )
            .append( textElem );

        var question = this.questions[ qid ] = {
            text: function() {
                if ( !arguments[ 0 ] ) {
                    return text;
                }
                text = arguments[ 0 ] || '';
                textElem.text( text ).attr( 'title', text );
            },
            id: qid,
            elem: elem,
            answers: {}
        };
        
        return question;
    };
    DecisionTree.prototype.removeQuestion = function( qid ) {
        //TODO: recursive uncache
        
        $( this.questions[ qid ].elem ).remove();
        delete( this.questions[ qid ] );
        this.checkClicked( 'question', qid );
    };
    DecisionTree.prototype.addAnswer = function( qid, text, anid ) {
        var question = this.questions[ qid ];
    
        text = text || '';
        if ( question ) {
            if ( anid > this.answer_i ) {
                this.answer_i = anid;
            }
            else {
                anid = this.answer_i++;
            }

            var textElem = $( '<span>' )
                .text( text )
                .attr( 'title', text );
            var elem = $( '<div class="answer">' )
                .appendTo( question.elem )
                .click( this.clickFactory( 'answer', anid ) )
                .append( textElem );
            
            var answer = {
                text: function() {
                    if ( !arguments[ 0 ] ) {
                        return text;
                    }
                    text = arguments[ 0 ] || '';
                    textElem.text( text ).attr( 'title', text );
                },
                elem: elem,
                id: anid,
                qid: qid,
                actions: {}
            };
            
            this.answerCache[ anid ] = question.answers[ anid ] = answer;
            
            return answer;
        }
        
        return false;
    };
    DecisionTree.prototype.removeAnswer = function( anid ) {
        var answer = this.answerCache[ anid ];
        delete( this.answerCache[ anid ] );
        delete( this.questions[ answer.qid ].answers[ anid ] );
        answer.elem.remove();
        this.checkClicked( 'answer', anid );
        
        return true;
    };
    DecisionTree.prototype.addAction = function( anid, data, acid ) {
        var answer = this.answerCache[ anid ];

        if ( !data || !data.type ) {
            data = {
                type: 'quest'
            };
        }
        
        if ( answer ) {
           if ( acid > this.action_i ) {
                this.action_i = acid;
            }
            else {
                acid = this.action_i++;
            }
            
            var text = this.actionToText( data );
            var textSpan = $( '<span>' )
                .text( text )
                .attr( 'title', text );
            
            var elem = $( '<div class="action">' )
                .appendTo( answer.elem )
                .click( this.clickFactory( 'action', acid ) )
                .append( textSpan );
            
            var action = {
                data: function() {
                    if ( !arguments[ 0 ] ) {
                        return data;
                    }
                    data = arguments[ 0 ];
                    var text = this.actionToText( data ) || '';
                    textSpan.text( text ).attr( 'title', text );
                }.bind( this ),
                text: function() {
                    if ( arguments[ 0 ] ) {
                        console.log( "You can't set an action's data" );
                        return;
                    }
                    return text;
                },
                id: acid,
                anid: anid,
                elem: elem
            }
            
            this.actionCache[ acid ] = answer.actions[ acid ] = action;
            
            return action;
        }
        
        return false;
    };
    DecisionTree.prototype.removeAction = function( acid ) {
        var action = this.actionCache[ acid ];
        var answer = this.answerCache[ action.anid ];
        delete( answer.actions[ acid ] );
        delete( this.actionCache[ acid ] );
        if ( this.checkClicked( 'action', acid ) ) {
            this.deselectNode();
        };
        action.elem.remove();
        
        return true;
    };
    DecisionTree.prototype.actionToText = function( data ) {
        switch ( data.type ) {
            case 'say':
                return 'Say: ' + data.text;
                break;
            case 'ask':
                return 'Ask question: ' + data.questionid;
                break;
            case 'quest':
                return 'Assign quest with id: ' + data.questid;
                break;
        }
    };
    DecisionTree.prototype.checkClicked = function( type, id ) {
        var that = this;
        
        if ( that.lastClicked ) {
            if ( that.lastClicked.type == type && that.lastClicked.id == id ) {
                return true;
            }
        }
        
        return false;
    };
    DecisionTree.prototype.clickFactory = function( type, id ) {
        var elem;
        var that = this;
        
        return function( e ) {
            e.stopPropagation();
            e.preventDefault();
            
            if ( that.checkClicked( type, id ) ) {
                that.deselectNode( type, id );
            }
            else {
                that.selectNode( type, id );
            }
            
            that.emit( 'click', type, id );
        }
    };
    DecisionTree.prototype.deselectNode = function() {
        var that = this;
        
        $( that.lastClicked.elem ).removeClass( 'clicked' );
        that.lastClicked = null;
        that.emit( 'deselect' );
    };
    DecisionTree.prototype.selectNode = function( type, id, scroll ) {
        var that = this;
        
        if ( that.lastClicked != null ) {
            that.deselectNode();
        }
        
        switch ( type ) {
            case 'question':
                elem = that.questions[ id ].elem;
                break;
            case 'answer':
                elem = that.answerCache[ id ].elem;
                break;
            case 'action':
                elem = that.actionCache[ id ].elem;
                break;
        }
        
        elem.addClass( 'clicked' );
        
        if ( scroll ) {
            that.elem.scrollTo( elem );
        }
        
        that.lastClicked = { type: type, id: id, elem: elem };
        
        that.emit( 'select', type, id );
    };
    
    DecisionTree.prototype.compile = function() {
        var question, answer, action, tquestion, tanswer;
        var tree = {};
        
        for ( qid in this.questions ) {
            question = this.questions[ qid ];
            
            tquestion = tree[ qid ] = {
                text: question.text(),
                answers: {}
            };
            for ( anid in question.answers ) {
                answer = question.answers[ anid ];
                
                tanswer = tquestion.answers[ anid ] = {
                    text: answer.text(),
                    actions: {}
                };
                for ( acid in answer.actions ) {
                    action = answer.actions[ acid ];
                    data = action.data();
                    
                    tanswer.actions[ acid ] = {
                        data: data
                    };
                }
            }
        }
        return { questions: tree };
    };
    DecisionTree.prototype.decompile = function( tree ) {
        try {
            for ( var qid in tree.questions ) {
                this.addQuestion( tree.questions[ qid ].text, qid );
                for ( var anid in tree.questions[ qid ].answers ) {
                    this.addAnswer( qid, tree.questions[ qid ].answers[ anid ].text, anid );
                    for ( var acid in tree.questions[ qid ].answers[ anid ].actions ) {
                        this.addAction( anid, tree.questions[ qid ].answers[ anid ].actions[ acid ].data, acid );
                    }
                }
            }
            return true;
        }
        catch ( e ) {
            return false;
        }
    };
    
    return DecisionTree;
} );