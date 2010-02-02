var WelcomeDocument = Class.create(AbstractDocument,
    /** @lends WelcomeDocument.prototype */ {

    /**
     * WelcomeDocument is the initial document and allows the user to access
     * to the most important GVS features as starting point.
     * @constructs
     * @extends AbstractDocument
     */
    initialize: function($super) {
        $super("Welcome!");
        this._populate ();
    },



    // **************** PUBLIC METHODS **************** //

    // **************** PRIVATE METHODS **************** //


    /**
     * Constructs the document content.
     * @private
     */
    _populate: function(){
        var content = this.getNode();

        content.addClassName("welcome");

        var logo = new Element('img', {
            'src': URIs.logoFast
        });
        content.appendChild(logo);
        var documentTitle = new Element ("div", {"class": "documentTitle"}).
            update("Welcome to the Gadget Visual Storyboard!");
        content.appendChild(documentTitle);
        var welcomeIntro = new Element ("div", {"id": "intro"}).
            update("Choose your desired action:");
        content.appendChild (welcomeIntro);

        var newScreenflowButton = new dijit.form.Button({
            label: "Create a Screenflow from Scratch",
            onClick: function() {GVS.action("newScreenflow");}}
        );
        var openScreenflowButton = new dijit.form.Button({
            label: "Open Existing Screenflow...",
            onClick: function() {GVS.action("openScreenflow");}}
        );

        var newScreenButton = new dijit.form.Button({
            label: "Create a Screen from Scratch",
            onClick: function() {GVS.action("newScreen");}}
        );
        var browseScreensButton = new dijit.form.Button({
            label: "Browse Screens...",
            onClick: function() {GVS.action("browseScreens");}}
        );

        var openWrapperServiceButton = new dijit.form.Button({
            label: "Wrap existing services",
            onClick: function() {GVS.action("wrapperService");}}
        );

        var buttonsContainer = new Element("div");
        buttonsContainer.appendChild(new Element("div").update("Screenflows"));
        buttonsContainer.appendChild(newScreenflowButton.domNode);
        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(openScreenflowButton.domNode);
        buttonsContainer.appendChild(new Element("div").update("Screens"));
        buttonsContainer.appendChild(newScreenButton.domNode);
        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(browseScreensButton.domNode);

        if (!GlobalOptions.isPublicDemo) {
            buttonsContainer.appendChild(new Element("div").update("Building blocks"));
            buttonsContainer.appendChild(openWrapperServiceButton.domNode);
        }
        content.appendChild(buttonsContainer);
    }
});

// vim:ts=4:sw=4:et:
