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
        this._documentType='preview';
    },



    // **************** PUBLIC METHODS **************** //


    /**
     * Checks if it is possible to drop a kind of resource within the
     * document area.
     * @type Boolean
     */
    isAccepted: function (/** String **/ resourceType) {
        return false;
    },
    
    /**
     * Constructs the document content.
     * @private
     */
    populate: function(/** String **/ resourceDesc){
        console.log("TODO: populating");
        var content = this.getContent();
        var previewDiv = new Element ("div", {"id": "previewDivContent" ,"class": "documentTitle"}).
            update("Preview of the Screen: " + resourceDesc.label['en-gb']);
        content.update(previewDiv);

        var imageDiv = new Element ("img", {
            "src": resourceDesc.screenshot, 
            "onerror": "this.parentNode.childNodes[0].update('Image " + 
                resourceDesc.screenshot + 
                " not available');this.src='"+URIs.logoFast+"';"
        })
        content.appendChild(imageDiv);
    }
    
    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et: