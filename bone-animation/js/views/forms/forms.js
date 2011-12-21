var Forms = ( function( $ ) {
    var newOption = function( val, caption ) {
        var optElem;
        optElem = document.createElement( 'option' );
        optElem.value = val;
        optElem.appendChild( document.createTextNode( caption ) );
        
        return optElem;
    };
    var newField = function( type, name, caption, defvalue, optvalues ) {
        var inputElem, fieldElem, captionElem;
        var setValue, getValue;
        if ( defvalue instanceof Object ) {
            defvalue = defvalue[ name ].toString();
        }
        
        if ( !type ) {
            console.log( 'Did not supply an input type' );
            return false;
        }
        switch ( type ) {
            case 'text':
                inputElem = document.createElement( 'input' );
                inputElem.type = 'text';
                inputElem.value = defvalue ? defvalue : '';
                if ( typeof optvalues == 'function' ) {
                    $( inputElem ).change( function() {
                        var ret = optvalues.call( this, ( $( inputElem ).val() ) );
                        
                        if ( ret ) {
                            inputElem.style.backgroundColor = '';
                        }
                        else {
                            inputElem.style.backgroundColor = 'red';
                        }
                        return ret;
                    } );
                }
                break;
            case 'select':
                inputElem = document.createElement( 'select' );
                if ( typeof optvalues == 'object' ) {
                    for ( opt in optvalues ) {
                        inputElem.appendChild( newOption( opt, optvalues[ opt ] ) );
                    }
                }
                inputElem.value = defvalue;
                break;
        }
        inputElem.name = name;
        captionElem = document.createElement( 'span' );
        captionElem.appendChild( document.createTextNode( caption + ':' ) );
        fieldElem = document.createElement( 'div' );
        fieldElem.appendChild( captionElem );
        fieldElem.appendChild( inputElem );
        
        setValue = function( val ) {
            inputElem.value = ( val != '' ) ? val : defvalue;
            $( inputElem ).trigger( 'change' );
        };
        getValue = function() {
            return ( inputElem.value != '' ) ? inputElem.value : defvalue;
        };
        
        return { elem: fieldElem, setValue: setValue, getValue: getValue, def: defvalue, inputElem: inputElem };
    };
    
    function compile( fieldsDiv ) {
        var fields = $( fieldsDiv ).find( '*[name]' );
        var ret = {};
        for ( var i = 0, l = fields.length; i < l; ++i ) {
            ret[ fields[ i ].name ] = fields[ i ].value;
        }
        
        return ret;
    }
    
    function newPanel( title, fields ) {
        var panelDiv = $( '<div class="panel">' );
        var titleDiv = $( '<h2>' );
        titleDiv.text( title );
        
        panelDiv.append( titleDiv );
        var fieldsDiv = $( '<div class="fields">' );
        panelDiv.append( fieldsDiv );
        
        var panelObj = {
            elem: panelDiv,
            newField: function() {
                if ( arguments.length == 1 ) {
                    //TODO: compact option list
                }
                var field = newField.apply( this, arguments );
                fieldsDiv.append( field.elem );
                
                return field;
            },
            compile: function() {
                return compile( fieldsDiv );
            }
        };
        
        if ( fields ) {
            var field;
            panelObj.fields = {};
            for ( var i = 0, l = fields.length; i < l; ++i ) {
                field = fields[ i ];
                panelObj.fields[ field.name ] = panelObj.newField( field.type, field.name, field.caption, field.def, field.type == 'select' ? field.options : field.validate );
            }
        }
        
        return panelObj;
    }
    
    return {
        newField: newField,
        compile: compile,
        newPanel: newPanel
    };
} )( jQuery );