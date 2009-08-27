var ConnectorInstance = Class.create(ComponentInstance,
    /** @lends ConnectorInstance.prototype */ {

    /**
     * Connector instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /**BuildingBlockDescription*/ buildingBlockDescription) {
        $super(buildingBlockDescription);
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        this._id = uidGenerator.generate("connectorInstance");
        this._properties = new Hash();
        this._propertiesDialog = null;
        this._buildingBlockType = Constants.BuildingBlock.CONNECTOR;
    },


    // **************** PUBLIC METHODS **************** //

    setProperties: function(properties) {
        this._properties = $H(properties);
        this.getView().update(this._properties);
    },
    
    getProperties: function() {
        return this._properties;
    },
    
    /**
     * Drop event handler for the DragSource
     * @param finishState
     *      True if a new ScreenInstance has
     *      been added to the new zone.
     * @override
     */
    onDragFinish: function($super, finishState) {
        $super(finishState);
        // FIXME: remove this
        if(finishState) {
            var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
            currentDocument.addConnector(this);
            currentDocument.onClickCanvas(this.getHandlerNode());
        }
    },
    
    getPropertiesDialog: function(){
        return this._propertiesDialog;
    },
    
    showPropertiesDialog: function(){
        if (this._propertiesDialog == null) {
            this._propertiesDialog = new FormDialog({
                "title": "Connector properties",
                "style": "display:none;"
            });
            
            var dialogDiv = new Element("div");
            var h2 = new Element("h2").update("Check connector details");
            dialogDiv.insert(h2);
            var divConnectorInfo = new Element("div", {
                "class": "line"
            }).update("Please fulfill the required information in order to" +
            " set up the connector.");
            
            dialogDiv.insert(divConnectorInfo);
            
            var form = new Element('form', {
                method: "post"
            });
            
            var divConnectorType = new Element("div", {
                "class": "line"
            });
            var labelConnType = new Element("label").update("Type:");
            divConnectorType.insert(labelConnType);
            var inputConnType = new Element("select", {
                name: 'type'
            });
            
            var option_none = new Element("option", {
                value: "None"
            });
            option_none.innerHTML = "Choose a type...";
            inputConnType.insert(option_none);
            
            var option_in = new Element("option", {
                value: "In"
            });
            option_in.innerHTML = 'In';
            inputConnType.insert(option_in);
            var option_out = new Element("option", {
                value: "Out"
            });
            option_out.innerHTML = 'Out';
            
            inputConnType.insert(option_out);
            if (this.getProperties().get('type') != undefined) {
                var i;
                for (i = inputConnType.length - 1; i >= 0; i--) {
                    if (inputConnType.options[i].value == this.getProperties().get('type')) {
                        inputConnType.selectedIndex = i;
                    }
                }
            }
            inputConnType.observe('change', this.onPropertiesDialogChange.bind(this));
            divConnectorType.insert(inputConnType);
            
            var errorConnType = new Element("span", {
                'class': 'errorDialogDiv'
            }).update('Please choose one valid type');
            divConnectorType.insert(errorConnType);
            
            form.insert(divConnectorType);
            
            var divConnectorKind = new Element("div", {
                "class": "line"
            });
            var labelConnKind = new Element("label").update("Kind of connection:");
            divConnectorKind.insert(labelConnKind);
            var inputConnKind = new Element("select", {
                name: 'kind'
            });
            
            var option_event_slot = new Element('option', {
                value: 'event_slot'
            });
            if (this.getProperties().get('type') != undefined) {
                switch(this.getProperties().get('type').toLowerCase()){
                    case 'in':
                        option_event_slot.innerHTML = 'Slot';
                        break;
                    case 'out':
                        option_event_slot.innerHTML = 'Event';
                        break;
                    default:
                        option_event_slot.innerHTML = 'Event/slot';
                }
            } else {
                option_event_slot.innerHTML = 'Event/slot';
            }
            inputConnKind.insert(option_event_slot);
            
            var option_user_context = new Element('option', {
                value: 'user_context'
            });
            option_user_context.innerHTML = 'User context';
            inputConnKind.insert(option_user_context);
            
            var option_user_preferences = new Element('option', {
                value: 'user_preferences'
            });
            option_user_preferences.innerHTML = 'User preferences';
            inputConnKind.insert(option_user_preferences);
            
            divConnectorKind.insert(inputConnKind);
            form.insert(divConnectorKind);
            
            var divConnectorFact = new Element("div", {
                "class": "line"
            });
            var labelConnFact = new Element("label").update("Fact:");
            divConnectorFact.insert(labelConnFact);
            var inputConnFact = new Element("select", {
                name: 'fact'
            });
            inputConnFact.observe('change', this.onPropertiesDialogChange.bind(this));

            var option_none = new Element("option", {
                value: "none"
            });
            option_none.innerHTML = "Choose a fact...";
            inputConnFact.insert(option_none);
            
            var descs = CatalogueSingleton.getInstance().getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT).getBuildingBlockDescriptions();
            var mine = this;
            $A(descs).each(function(desc){
                var option = new Element("option", {
                    value: desc.name,
                    selected: ((desc.name == mine.getProperties().get('fact'))? true : false)
                });
                option.innerHTML = desc.name;
                inputConnFact.insert(option);
            });
                  
            divConnectorFact.insert(inputConnFact);
            
            var inputConnFactShortcut = new Element("input", {
                name: 'shortcut',
                type: 'hidden'
            });
            form.insert(inputConnFactShortcut);
            
            var errorConnFact = new Element("span", {
                'class': 'errorDialogDiv'
            }).update('Please choose one valid fact');
            divConnectorFact.insert(errorConnFact);
            
            form.insert(divConnectorFact);
            
            var inputConnFactSemantics = new Element("input", {
                name: 'semantics',
                type: 'hidden'
            });
            form.insert(inputConnFactSemantics);
            
            var divConnectorFactAttr = new Element("div", {
                "class": "line"
            });
            var labelConnFactAttr = new Element("label").update("Fact attribute:");
            divConnectorFactAttr.insert(labelConnFactAttr);
            var inputConnFactAttr = new Element("select", {
                name: "factAttr"
            });
            
            var option_all = new Element("option", {
                value: ""
            });
            option_all.innerHTML = "All attributes";
            inputConnFactAttr.insert(option_all);

            var fact = this.getProperties().get('fact')
            if (fact != undefined) {
                var descs = CatalogueSingleton.getInstance().getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT).getBuildingBlockDescriptions();
                $A(descs).each(function(desc){
                    if (desc.name == fact) {
                        $A(desc.attributes).each(function(attr){
                            var option = new Element("option", {
                                value: attr
                            });
                            option.innerHTML = attr;
                            inputConnFactAttr.insert(option);
                        })
                        inputConnFactSemantics.setValue(desc.semantics);
                        inputConnFactShortcut.setValue(desc.shortcut);
                    }
                });
            }

            divConnectorFactAttr.insert(inputConnFactAttr);
            form.insert(divConnectorFactAttr);
            
            var divConnectorVariableName = new Element("div", {
                "class": "line"
            });
            var labelConnVariableName = new Element("label").update("Variable name:");
            divConnectorVariableName.insert(labelConnVariableName);
            var inputConnVariableName = new Element("input", {
                type: "text",
                name: "variableName",
                value: "variableName"
            });
            divConnectorVariableName.insert(inputConnVariableName);
            form.insert(divConnectorVariableName);
            
            var divConnectorLabel = new Element("div", {
                "class": "line"
            });
            var labelConnLabel = new Element("label").update("Label:");
            divConnectorLabel.insert(labelConnLabel);
            var inputConnLabel = new Element("input", {
                type: "text",
                name: "label",
                value: "Variable Label"
            });
            divConnectorLabel.insert(inputConnLabel);
            form.insert(divConnectorLabel);
            
            var divConnectorFriendCode = new Element("div", {
                "class": "line"
            });
            var labelConnFriendCode = new Element("label").update("Friend Code:");
            divConnectorFriendCode.insert(labelConnFriendCode);
            var inputConnFriendCode = new Element("input", {
                type: "text",
                name: "friendcode",
                value: "friendcode"
            });
            divConnectorFriendCode.insert(inputConnFriendCode);
            form.insert(divConnectorFriendCode);
            
            dialogDiv.insert(form);
            
            var divConnButtons = new Element("div");
            var mine = this;
            var acceptConnButton = new dijit.form.Button({
                "label": "Accept",
                onClick: function(){
                    var form = mine._propertiesDialog.getForm();
                    // If no type is selected, an error message is shown
                    if ($F(form.type).toLowerCase() == 'none') {
                        errorConnType.setStyle({
                            opacity: "100"
                        });
                        dojo.fadeOut({
                            node: errorConnType,
                            duration: 750,
                            delay: 750
                        }).play();
                        return;
                    }
                    
                    // If no fact is selected, an error message is shown
                    if ($F(form.fact).toLowerCase() == 'none') {
                        errorConnFact.setStyle({
                            opacity: "100"
                        });
                        dojo.fadeOut({
                            node: errorConnFact,
                            duration: 750,
                            delay: 750
                        }).play();
                        return;
                    }

                    ConnectorInstance.prototype.setProperties.apply(mine, [form.serialize(true)]);
                    GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateConnector(this);
                    GVSSingleton.getInstance().getDocumentController().getCurrentDocument().onClickCanvas(mine.getHandlerNode());
                    FormDialog.prototype.hide.apply(mine._propertiesDialog, arguments);
                }
            });
            divConnButtons.insert(acceptConnButton.domNode);
            
            var cancelConnButton = new dijit.form.Button({
                label: "Cancel",
                onClick: function(){
                    FormDialog.prototype.hide.apply(mine._propertiesDialog, arguments);
                }
            });
            divConnButtons.insert(cancelConnButton.domNode);
            dialogDiv.insert(divConnButtons);
            this._propertiesDialog.getDialog().setContent(dialogDiv);
        }
        this._propertiesDialog.show();
    },
    
    onPropertiesDialogChange: function(event){
        switch (event.element().name) {
            case 'fact':
                var form = this.getPropertiesDialog().getForm();
                var fact = $F(event.element());
                if (fact == 'none') {
                    var i;
                    for (i = form.factAttr.length - 1; i>=0; i--) {
                        if(form.factAttr.options[i].value != ''){
                            form.factAttr.remove(i);
                        }
                    }
                }
                else {
                    var descs = CatalogueSingleton.getInstance().getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT).getBuildingBlockDescriptions();
                    $A(descs).each(function(desc){
                        if (desc.name == fact) {
                            var i;
                            for (i = form.factAttr.length - 1; i >= 0; i--) {
                                if (form.factAttr.options[i].value != '') {
                                    form.factAttr.remove(i);
                                }
                            }
                            $A(desc.attributes).each(function(attr){
                                var option = new Element("option", {
                                    value: attr
                                });
                                option.innerHTML = attr;
                                form.factAttr.insert(option);
                            })
                            form.semantics.setValue(desc.semantics);
                            form.shortcut.setValue(desc.shortcut);
                        }
                    });
                }
                break;
            case 'type':
                var kind = this.getPropertiesDialog().getForm().kind;
                var type = $F(event.element());
                var i;
                for (i = kind.length - 1; i >= 0; i--) {
                    if (kind.options[i].value == 'event_slot') {
                        switch (type.toLowerCase()) {
                            case 'in':
                                kind.options[i].innerHTML = 'Slot';
                                break;
                            case 'out':
                                kind.options[i].innerHTML = 'Event';
                                break;
                            default:
                                kind.options[i].innerHTML = 'Event/slot';
                        }
                    }
                }
                break;
            default:
        }
    },
    
    // **************** PRIVATE METHODS **************** //
    /**
     * This function is called when the attached view is dbl-clicked
     * @private
     * @override
     */
    _onDoubleClick: function (/** Event */ event){
       var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
       //TODO: finish this
       alert("double click");
    }
});

// vim:ts=4:sw=4:et:
