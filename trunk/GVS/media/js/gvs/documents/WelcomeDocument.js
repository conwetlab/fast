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
            label: "Edit a new Screenflow",
            onClick: function() {GVS.action("newScreenflow");}}
        );
        var openScreenflowButton = new dijit.form.Button({
            label: "Browse Screenflows...",
            onClick: function() {GVS.action("browseScreenflows");}}
        );

        var newScreenButton = new dijit.form.Button({
            label: "Edit a new Screen",
            onClick: function() {GVS.action("newScreen");}}
        );
        var browseScreensButton = new dijit.form.Button({
            label: "Browse Screens...",
            onClick: function() {GVS.action("browseScreens");}}
        );

        var newBuildingBlockButton = new dijit.form.Button({
            label: "Add a Building Block from sources",
            onClick: function() {GVS.action("newBuildingBlock");}}
        );

        var browseBuildingBlockButton = new dijit.form.Button({
            label: "Browse Building Blocks...",
            onClick: function() {GVS.action("browseBuildingBlocks");}}
        );

        var openWrapperServiceButton = new dijit.form.Button({
            label: "Create a resource from a service",
            onClick: function() {GVS.action("wrapperService");}}
        );
        var mediationButton = new dijit.form.Button({
            label: "Create operator for concepts",
            onClick: function() {GVS.action("mediation");}}
        );
        var manageConceptsButton = new dijit.form.Button({
            label: "Manage Domain Concepts",
            onClick: function() {GVS.action("manageConcepts");}}
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

        var wrapper = new Element("div", {
            "style": "visibility:hidden;"
        });
        wrapper.appendChild(newBuildingBlockButton.domNode);
        wrapper.appendChild(new Element("br"));
        wrapper.appendChild(browseBuildingBlockButton.domNode);
        wrapper.appendChild(new Element("br"));
        wrapper.appendChild(document.createTextNode("---"));
        if (URIs.wrapperService != "") {
            wrapper.appendChild(new Element("br"));
            wrapper.appendChild(openWrapperServiceButton.domNode);
        }
        if (URIs.dataMediation != "") {
            wrapper.appendChild(new Element("br"));
            wrapper.appendChild(mediationButton.domNode);
        }
        if (URIs.factTool != "") {
            wrapper.appendChild(new Element("br"));
            wrapper.appendChild(manageConceptsButton.domNode);
        }


        var link = new Element("a", {
            "href": "javascript:"
        }).update("Show advanced features...");
        link.observe("click", function(e) {
            if (wrapper.style.visibility == "hidden") {
                wrapper.setStyle({"visibility":"visible"});
                link.update("Hide advanced features...");
            } else {
                wrapper.setStyle({"visibility":"hidden"});
                link.update("Show advanced features...");
            }
        });

        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(link);
        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(new Element("br"));
        buttonsContainer.appendChild(wrapper);

        content.appendChild(buttonsContainer);
    }
});

// vim:ts=4:sw=4:et:
