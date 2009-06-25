var DomainConceptView = Class.create( BuildingBlockView,
    /** @lends DomainConceptView.prototype */ {

    /**
     * Domain Concepts graphical representation
     * @constructs
     * @extends BuildingBlockView
     */ 
    initialize: function($super,/** BuildingBlockDescription */ domainConceptBuildingBlockDescription) {
        $super();

        var uidGenerator = UIDGeneratorSingleton.getInstance();
        this._id = uidGenerator.generate("domainConceptView");

        var container = new Element('div', {'class': 'domainConceptImage'}).update(domainConceptBuildingBlockDescription.shortcut);
        
        this._node = new Element("div", {
            "id":     this._id,
            "class": "view domainConcept unknown"
        });
        this._node.appendChild(container);

        /*
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        this._id = uidGenerator.generate("domainConceptView");

        var title = new Element("div", {"class":"domainConceptTitle unknown"});
        title.update(domainConceptBuildingBlockDescription.name);

        if (domainConceptBuildingBlockDescription.image){
            var imageContainer = new Element ('div',
                    {'class': 'domainConceptImage' });
            var image = new Element ('img',
                    {'class': 'img', 'src': domainConceptBuildingBlockDescription.image});
            imageContainer.appendChild (image);
        }
        
        this._node = new Element("div", {
            "id":     this._id,
            "class": "view domainConcept unknown"
        });
        this._node.appendChild(title);
        if (domainConceptBuildingBlockDescription.image){
            this._node.appendChild(imageContainer);
        }*/
    },

    // **************** PUBLIC METHODS **************** //
    
    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job
        this._node = null;
    }

});

// vim:ts=4:sw=4:et:
