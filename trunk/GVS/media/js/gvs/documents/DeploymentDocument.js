var DeploymentDocument = Class.create(AbstractDocument,
    /** @lends DeploymentDocument.prototype */ {

    /**
     * DeploymentDocument allows the user to access
     * to the most important deployment features.
     * @constructs
     * @extends AbstractDocument
     */
    initialize: function($super) {
        $super("Deployment");
        this._documentType=Constants.DocumentType.DEPLOYMENT;
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
        var content = this.getContent();

        content.addClassName("deployment");
        content.update(deploymentContent);
        /*
        var documentTitle = new Element ("div", {"class": "documentTitle"}).
            update("Welcome to the Gadget Visual Storyboard!");
        content.appendChild(documentTitle);
        var welcomeIntro = new Element ("div", {"id": "intro"}).
            update("Choose your desired action:");
        content.appendChild (welcomeIntro);

        var gvs = GVSSingleton.getInstance();
        var newScreenflowButton = new dijit.form.Button({
            label: "New Screenflow",
            onClick: function() { gvs.action("newScreenflow"); }}
        );
        var openScreenflowButton = new dijit.form.Button({
            label: "Open Existing Screenflow...",
            onClick: function() { gvs.action("openScreenflow"); }}
        );

        var buttonsContainer = new Element("div");
        buttonsContainer.appendChild(newScreenflowButton.domNode);
        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(openScreenflowButton.domNode);
        content.appendChild (buttonsContainer);
        */
    }
});

// vim:ts=4:sw=4:et: