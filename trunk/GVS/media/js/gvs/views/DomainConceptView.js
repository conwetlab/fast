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

        var title = new Element("div", {"class":"domainConceptTitle unknown"});
        title.update(domainConceptResourceDescription.name);

        if (domainConceptResourceDescription.image){
            var imageContainer = new Element ('div',
                    {'class': 'domainConceptImage' });
            var image = new Element ('img',
                    {'class': 'img', 'src': domainConceptResourceDescription.image});
            imageContainer.appendChild (image);
        }
        
        this._node = new Element("div", {
            "id":     this._id,
            "class": "view domainConcept unknown"
        });
        this._node.appendChild(title);
        if (domainConceptResourceDescription.image){
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
