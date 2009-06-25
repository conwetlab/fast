var Palette = Class.create( /** @lends Palette.prototype */ {

    /**
     * Represents a palette of droppable components of a given type.
     *
     * @param {String} buildingBlockType  Identifier of the class or building block (e.g.: screen) 
     * @constructs
     */
    initialize: function(/** String */ buildingBlockType, /** String */ docId) {
        /**
         * Node id of the accordion pane.
         * @type String
         * @private @member
         */
        this._id = buildingBlockType + "Palette";

        this._buildingBlockType = buildingBlockType;
        
        this._docId = docId;
        
        /**
         * Collection of components the palette offers.
         * @type PaletteComponent
         * @private @member
         */
        this._components = [];

        /**
         * Accordion pane node.
         * @type DOMNode
         * @private @member
         */
        this._node = this._renderContent(); 
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Gets the node of the accordion pane
     * @type DOMNode
     * @public
     */
    getNode: function() {
        return this._node;
    },

    updateComponents: function() {
        switch(this._buildingBlockType){
            case "screen":
                //find Screens and check
                var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
                var canvas = currentDocument.getCanvas();
                var domainContext = {
                    "tags":currentDocument.getBuildingBlockDescription().getDomainContexts(),
                    "user":null
                };
                var elements = currentDocument.getPaletteElements();
                CatalogueSingleton.getInstance().getScreens(canvas, domainContext, elements, 'reachability');
                break;
            case "domainConcept":
                CatalogueSingleton.getInstance().getDomainConcepts();
                break;
            case "connector":
                this.paintComponents();
                break;
        }
    },

    paintComponents: function () {
        this._components = this._createComponents(CatalogueSingleton.getInstance().getBuildingBlockFactory(this._buildingBlockType));
        var content = this._renderComponents();
        this._node.setContent(content);
    },

    getComponents: function() {
        return this._components;
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * Creates the palette components from building blocks by querying a building block factory.
     * @type {BuildingBlockDescription[]}
     * @private
     */
    _createComponents: function(buildingBlockFactory) {
        var descs = buildingBlockFactory.getBuildingBlockDescriptions();
        var components = [];
        var docId = this._docId;
        $A(descs).each(
            function(desc) {
                components.push(desc.createPaletteComponent(docId));
            }
        );
        return components;
    },

    /**
     * Creates the GUI stuff that shows the content: components and separators.
     * @type DOMNode
     * @private
     */
    _renderContent: function() {
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var paneId = uidGenerator.generate(this._id);
        
        var pane = new dijit.layout.AccordionPane({
            "id":paneId,
            "title":this._buildingBlockType,
            "class":"paletteElement"
        });
        return pane;
    },

    _renderComponents: function() {
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var contentId = uidGenerator.generate(this._id+ "Content");
        var content   = new Element("div", {"class": "paletteContent", "id" : contentId});
        var separator = new Element("div", {"class": "paletteSeparator"});
        $A(this._components).each(
                function(component) {
                    content.appendChild(component.getNode());
                    content.appendChild(separator.cloneNode(false));
                }
        );
        return content;
    }
});

// vim:ts=4:sw=4:et:
