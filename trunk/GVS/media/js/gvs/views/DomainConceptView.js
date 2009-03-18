var DomainConceptView = Class.create( ResourceView,
    /** @lends DomainConceptView.prototype */ {
    
    /**
     * Domain Concepts graphical representation
     * @constructs
     * @extends ResourceView
     */ 
    initialize: function($super,/** ResourceDescription */ domainConceptResourceDescription) {
            
        $super();

        var uidGenerator = UIDGeneratorSingleton.getInstance();
        
        this._id = uidGenerator.generate("domainConceptView");
         
        /**
         * ResourceDescription this view is based of
         * @type ResourceDescription
         * @private
         */
        this._resourceDescription = domainConceptResourceDescription;


        var title = new Element("div", {"class":"domainConceptTitle unknown"});
        title.update(this._resourceDescription.name);

        if (this._resourceDescription.image){
            var imageContainer = new Element ('div',
                    {'class': 'domainConceptImage' });
            var image = new Element ('img',
                    {'class': 'img', 'src': this._resourceDescription.image});
            imageContainer.appendChild (image);
        }
        
        this._node = new Element("div", {
            "id":     this._id,
            "class": "view domainConcept unknown"
        });
        this._node.appendChild(title);
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
