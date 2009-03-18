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
         
        /**
         * ResourceDescription this view is based of
         * @type ResourceDescription
         * @private
         */
        this._resourceDescription = connectorResourceDescription;

        var title = new Element("div", {"class":"connectorTitle unknown"});
        title.update(this._resourceDescription.name);

        if (this._resourceDescription.image){
            var imageContainer = new Element ('div',
                    {'class': 'connectorImage' });
            var image = new Element ('img',
                    {'class': 'img', 'src': this._resourceDescription.image});
            imageContainer.appendChild (image);
        }
        
        this._node = new Element("div", {
            "id":     this._id,
            "class": "view connector unknown"
        });
        //this._node.appendChild(title);
        if (this._resourceDescription.image){
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
        this._resorceDescription = null;
        this._node = null;
    } 

    
});

// vim:ts=4:sw=4:et:
