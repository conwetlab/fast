var ConnectorView = Class.create( ResourceView,
    /** @lends ConnectorView.prototype */ {
    
    /**
     * Connectors graphical representation
     * @constructs
     * @extends ResourceView
     */ 
    initialize: function($super,/** ResourceDescription */ connectorResourceDescription) {
        $super();

        var uidGenerator = UIDGeneratorSingleton.getInstance();
        this._id = uidGenerator.generate("connectorView");

        var container = new Element('div', {'class': 'connectorImage'}).update(connectorResourceDescription.name);
        switch(connectorResourceDescription.name){
            case "In":
                container.addClassName('connectorIn')
                break;
            case "Out":
                container.addClassName('connectorOut')
                break;
            default:
                container.addClassName('connectorDefault')
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
     * Removes the DOM Elements and frees resources
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job
        this._node = null;
    }

});

// vim:ts=4:sw=4:et:
