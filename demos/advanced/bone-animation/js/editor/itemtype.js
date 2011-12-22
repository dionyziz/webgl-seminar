define( [ 'require', 'views/hud/widget', 'models/itemtype' ], function( require ) {
    var widget = require( 'views/hud/widget' );
    var ItemType = require( 'models/itemtype' );
    
    function init() {
        var widgetDiv = $( '<div class="itemtype-editor-menu">' );
        var widgetObj = widget.makeWidget( widgetDiv, { title: 'ItemType Editor' } );
        
        widget.makeButton( 'New ItemType', function() {
            var newItemType = create();
        } ).appendTo( widgetDiv );

        widget.makeButton( 'Edit ItemType', function() {
            var listDiv = $( '<div class="itemtype-editor-list">' );
            var listUl = $( '<ul class="vertical">' ).appendTo( listDiv );
            listUl.append( '<li>Fetching list, please wait...</li>' );
            
            $.get( 'editor/itemtype.php?action=list' ).then( function( data ) {
                listUl.empty();
                for ( var id in data ) {
                    listUl.append(
                        $( '<li>' ).append(
                            widget.makeButton(
                                data[ id ].name,
                                function( id ) {
                                    edit( id )
                                }.bind( this, data[ id ].id )
                            )
                        )
                    );
                }
            } );
            
            widget.makeWidget( listDiv, { title: 'Edit ItemType' } );
        } ).appendTo( widgetDiv );
        
        return widgetObj;
    };
    
    function edit( id ) {
        id = id * 1;
        
        $.get( 'editor/itemtype.php?action=read&id=' + ( id || 0 ) ).then(
            function( itemData ) {
                var editItem = new ItemType();
                
                editItem[ 'id' ] = id;
                editItem[ 'name' ] = itemData.name;
                editItem[ 'description' ] = itemData.description;
                editItem[ 'icon' ] = itemData.icon;
                editItem[ 'data' ] = itemData.data;
                
                create( editItem );
            }
        );
    };
    
    function create( editItem ) {
        var widgetDiv = $( '<div class="itemtype-editor">' );
        var widgetObj = widget.makeWidget( widgetDiv, { title: !editItem ? 'New ItemType' : 'Editing ItemType #' + editItem.id } );
        var id = null;
        
        
        var basePanel = Forms.newPanel( 'Item Attributes', [
            {
                name: 'name',
                caption: 'Name',
                type: 'text',
                def: ''
            },
            {
                name: 'description',
                caption: 'Description',
                type: 'text',
                def: ''
            },
            {
                name: 'icon',
                caption: 'Icon',
                type: 'text',
                def: ''
            }
        ] );
        
        if ( editItem ) {
            basePanel.fields[ 'name' ].setValue( editItem.name );
            basePanel.fields[ 'description' ].setValue( editItem.description );
            basePanel.fields[ 'icon' ].setValue( editItem.icon );
        }
        else {
            editItem = new ItemType();
        }
        
        widgetDiv.append( basePanel.elem );
        widgetDiv.append( widget.makeButton( 'Save', function() {
            var name = editItem.name = basePanel.fields[ 'name' ].getValue();
            var description = editItem.description = basePanel.fields[ 'description' ].getValue();
            var icon = editItem.icon = basePanel.fields[ 'icon' ].getValue();
            var data = editItem.data = '{}';
            
            var postData = { name: name, description: description, icon: icon, data: data };
            
            if ( editItem.id ) {
                postData.id = editItem.id;
                $.post( 'editor/itemtype.php?action=update', postData, function() {
                    widget.messageBox( 'Save', 'Update successful!' );
                } );
            }
            else {
                $.post( 'editor/itemtype.php?action=create', postData, function( data ) {
                    if ( data.id ) {
                        widgetObj.hide();
                        editItem.id = data.id;
                        widget.messageBox( 'Save', 'Create successful!', function() {
                            return create( editItem );
                        } );
                    }
                    widget.messageBox( 'Save', 'Save failed' );
                } );
            }
        } ) );
        
        return widgetObj;
    };
    
    /*
    var fieldMap = [];
    
    fieldMap[ 'equip' ]= {
        'energyrate': 'equip.energyrate',
        'moralerate': 'equip.moralerate',
        'bodyexpmin': 'equip.bodyexpmin',
        'soulexpmin': 'equip.soulexpmin',
        'mindexpmin': 'equip.mindexpmin'
    };
    fieldMap[ 'consume' ] = {
        'energy': 'consume.energy',
        'morale': 'consume.morale',
        'bodyxp': 'consume.bodyxp',
        'soulxp': 'consume.soulxp',
        'mindxp': 'consume.mindxp'
    };
    
    var itemEditor = {
        init: function() {
            var self = this;
            var widgetDiv = $( '<div class="itemtype-editor-menu">' );
            
            var newButton = $( '<a href="">New Item</a>' );
            newButton.click( function( e ) {
                e.preventDefault();
                self.newItemWidget();
            } );
            
            var editButton = $( '<a href="">Edit Item</a>' );
            editButton.click( function( e ) {
                e.preventDefault();
                self.editItemWidget();
            } );

            widgetDiv.append( newButton, '<br>', editButton );
            return widget.makeWidget( widgetDiv, { title: 'Item Editor' } );
        },
        makePanels: function() {
            
            //Base item properties:
            var baseFields = [];
            baseFields.push( {
                name: 'name',
                type: 'text',
                caption: 'Name',
                def: ''
            } );
            baseFields.push( {
                name: 'type',
                type: 'select',
                caption: 'Type',
                def: 0,
                options: { 0: 'Equipable', 1: 'Consumable', 2: 'Asset' }
            } );
            baseFields.push( {
                name: 'description',
                type: 'text',
                caption: 'Description',
                def: ''
            } );
            baseFields.push( {
                name: 'price',
                type: 'text',
                caption: 'Suggested Price',
                def: 0
            } );
            baseFields.push( {
                name: 'weight',
                type: 'text',
                caption: 'Weight',
                def: 0
            } );
            baseFields.push( {
                name: 'icon',
                type: 'text',
                caption: 'Icon',
                def: ''
            } );
            
            var basePanel = Forms.newPanel( 'Base Data', baseFields );

                //Type option box onchange
                $( basePanel.fields[ 'type' ].elem ).find( 'select' ).change( itemTypeCallback );
            
            //Equipable item properties:
            var equipFields = [];
            equipFields.push( {
                name: 'equippoint',
                type: 'select',
                caption: 'Equip Point',
                options: [ 'Head', 'R. Shoulder', 'L. Shoulder', 'R. Arm',
                    'L. Arm', 'R. Hand', 'L. Hand', 'Body',
                    'Legs', 'Feet' ],
                def: 0
            } );
            equipFields.push( {
                name: 'energyrate',
                type: 'text',
                caption: 'Energy Rate Modifier',
                def: 0
            } );
            equipFields.push( {
                name: 'moralerate',
                type: 'text',
                caption: 'Morale Rate Modifier',
                def: 0
            } );
            equipFields.push( {
                name: 'bodyexpmin',
                type: 'text',
                caption: 'Body XP / min',
                def: 0
            } );
            equipFields.push( {
                name: 'soulexpmin',
                type: 'text',
                caption: 'Soul XP / min',
                def: 0
            } );
            equipFields.push( {
                name: 'mindexpmin',
                type: 'text',
                caption: 'Mind XP / min',
                def: 0
            } );
            
            var equipPanel = Forms.newPanel( 'Equip Data', equipFields );
            
            //Consumable item properties:
            var consumeFields = [];
            
            consumeFields.push( {
                name: 'energy',
                type: 'text',
                caption: 'Energy',
                def: 0
            } );
            consumeFields.push( {
                name: 'morale',
                type: 'text',
                caption: 'Morale',
                def: 0
            } );
            consumeFields.push( {
                name: 'bodyxp',
                type: 'text',
                caption: 'Body XP',
                def: 0
            } );
            consumeFields.push( {
                name: 'soulxp',
                type: 'text',
                caption: 'Soul XP',
                def: 0
            } );
            consumeFields.push( {
                name: 'mindxp',
                type: 'text',
                caption: 'Mind XP',
                def: 0
            } );
            
            var consumePanel = Forms.newPanel( 'Consume Data', consumeFields );
            
            var assetFields = [];
            var assetPanel = Forms.newPanel( 'Asset Data', assetFields );
            
            function itemTypeCallback() {
                switch ( this.value * 1 ) {
                    case 0:
                        $( consumePanel.elem ).hide();
                        $( equipPanel.elem ).show();
                        $( assetPanel.elem ).hide();
                        break;
                    case 1:
                        $( consumePanel.elem ).show();
                        $( equipPanel.elem ).hide();
                        $( assetPanel.elem ).hide();
                        break;
                    case 2:
                        $( consumePanel.elem ).hide();
                        $( equipPanel.elem ).hide();
                        $( assetPanel.elem ).show();
                        break;
                }
            };
            
            itemTypeCallback.call( { 'value': 0 } );
            return { 'base': basePanel, 'equip': equipPanel, 'consume': consumePanel, 'asset': assetPanel };
        },
        newItemWidget: function() {
            var self = this;
            var widgetDiv = $( '<div class="new-itemtype-editor">' );
            
            var panels = this.makePanels();
            
            widgetDiv.append(
                panels[ 'base' ].elem,
                panels[ 'equip' ].elem,
                panels[ 'consume' ].elem,
                panels[ 'asset' ].elem
            );
            
            var saveButton = $( '<a href="">Save</a>' );
            saveButton.click( function( e ) {
                e.preventDefault();
                console.log( self.compileItem( panels ) );
            } );
            widgetDiv.append( saveButton );
            
            return widget.makeWidget( widgetDiv, { title: 'New Item' } );
        },
        editItemWidget: function() {
            
        },
        compileItem: function( panels ) {
            var newItem = new ItemType();
            
            var basePanel = panels[ 'base' ];
            var equipPanel = panels[ 'equip' ];
            var consumePanel = panels[ 'consume' ];
            var assetPanel = panels[ 'asset' ];
            
            switch ( basePanel.fields[ 'type' ].getValue() ) {
                case '0': //Equipable
                    newItem.setDeep( 'equip.point', equipPanel.fields[ 'equippoint' ].getValue() );
                    
                    var fieldName;
                    var field;
                    
                    for ( fieldName in fieldMap.equip ) {
                        field = equipPanel.fields[ fieldName ];
                        if ( field.getValue() !== field.def ) {
                            newItem.setDeep( fieldMap.equip[ fieldName ], field.getValue() );
                        }
                    }
                    break;
                case '1': //Consumable
                    var fieldName;
                    var field;
                    
                    for ( fieldName in fieldMap.consume ) {
                        console.log( fieldName );
                        field = equipPanel.fields[ fieldName ];
                        if ( field.getValue() !== field.def ) {
                            newItem.setDeep( fieldMap.consume[ fieldName ], field.getValue() );
                        }
                    }
                    break;
                case '2': //Asset
                    //TODO: fill maybe?
                    break;
            }
            
            return newItem;
        }
    };*/
    
    return { init: init };
} );