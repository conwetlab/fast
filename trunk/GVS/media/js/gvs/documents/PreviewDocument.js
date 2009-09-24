var PreviewDocument = Class.create(AbstractDocument,
    /** @lends PreviewDocument.prototype */ {

    /**
     * PreviewDocument allows the user to access
     * to the most important preview features.
     * @constructs
     * @extends AbstractDocument
     */
    initialize: function($super, /** String */ title) {
        $super("Preview: " + title);
    },



    // **************** PUBLIC METHODS **************** //
    
    /**
     * Constructs the document content.
     * @private
     */
    populate: function(/** String **/ buildingBlockDesc){
        var content = this.getNode();
        var previewDiv = new Element ("div", {"id": "previewDivContent" ,"class": "documentTitle"}).
            update("Preview of the Screen: " + buildingBlockDesc.label['en-gb']);
        content.update(previewDiv);

        var imageDiv = new Element ("img", {
            "src": buildingBlockDesc.screenshot, 
            "onerror": "this.parentNode.childNodes[0].update('Image " + 
                buildingBlockDesc.screenshot + 
                " not available');this.src='"+URIs.logoFast+"';"
        })
        content.appendChild(imageDiv);
    }
    
    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et: