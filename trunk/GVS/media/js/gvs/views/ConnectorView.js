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

        var title = new Element("div", {"class":"connectorTitle unknown"});
        title.update(connectorResourceDescription.name);

        if (connectorResourceDescription.image){
            var imageContainer = new Element ('div',
                    {'class': 'connectorImage' });
            var image = new Element ('img',
                    {'class': 'img', 'src': connectorResourceDescription.image});
            imageContainer.appendChild (image);
        }
        
        this._node = new Element("div", {
            "id":     this._id,
            "class": "view connector unknown"
        });
        //this._node.appendChild(title);
        if (connectorResourceDescription.image){
            this._node.appendChild(imageContainer);
        }
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
