var ConnectorView = Class.create( BuildingBlockView,
    /** @lends ConnectorView.prototype */ {
    
    /**
     * Connectors graphical representation
     * @constructs
     * @extends BuildingBlockView
     */ 
    initialize: function($super,/** BuildingBlockDescription */ connectorBuildingBlockDescription) {
        $super();

        var uidGenerator = UIDGeneratorSingleton.getInstance();
        this._id = uidGenerator.generate("connectorView");

        var container = new Element('div', {'class': 'connectorImage'});
        switch(connectorBuildingBlockDescription.type){
            case "In":
                container.addClassName('connectorIn');
                break;
            case "Out":
                container.addClassName('connectorOut');
                break;
            case "None":
                container.addClassName('connectorNone');
                break;
            default:
                container.addClassName('connectorDefault');
                break;
        }
        
        this._node = new Element("div", {
            "id":     this._id,
            "class": "view connector unknown"
        });
        this._node.appendChild(container);
    },

    // **************** PUBLIC METHODS **************** //
    
    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job
        this._node = null;
    },
    
    update: function (properties){
        var container = this._node.firstDescendant();
        if (properties.get('shortcut') != undefined) {
            container.update(properties.get('shortcut') + ((properties.get('factAttr') != '') ? '*' : ''));
        }

        container.removeClassName('connectorIn');
        container.removeClassName('connectorOut');
        container.removeClassName('connectorNone');
        container.removeClassName('connectorDefault');
        switch(properties.get('type').toLowerCase()){
            case 'in':
                container.addClassName('connectorIn');
                break;
            case 'out':
                container.addClassName('connectorOut');
                break;
            case 'none':
                container.addClassName('connectorNone');
                break;
            default:
                container.addClassName('connectorDefault');
                break;
        }
    }
});

// vim:ts=4:sw=4:et:
