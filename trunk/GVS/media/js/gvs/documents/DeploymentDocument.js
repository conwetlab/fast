var DeploymentDocument = Class.create(AbstractDocument,
    /** @lends DeploymentDocument.prototype */ {

    /**
     * DeploymentDocument allows the user to access
     * to the most important deployment features.
     * @constructs
     * @extends AbstractDocument
     */
    initialize: function($super) {
        $super("Deployment", []);
    },



    // **************** PUBLIC METHODS **************** //


    /**
     * Checks if it is possible to drop a kind of building block within the
     * document area.
     * @type Boolean
     */
    isAccepted: function (/** String **/ buildingBlockType) {
        return false;
    },


    // **************** PRIVATE METHODS **************** //


    /**
     * Constructs the document content.
     * @private
     */
    populate: function(/** String **/ deploymentContent){
        
        this._tabContent = new Element("div", {
            "id":    this._tabContentId,
            "class": "document deployment"
        }).update(deploymentContent);        
        
        this._tab.setContent (this._tabContent);
        
    },
    /**
     * @override
     */
    updateToolbar: function () {
           $("header_button").hide();
    }
});

// vim:ts=4:sw=4:et: