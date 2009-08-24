var Palette = Class.create( /** @lends Palette.prototype */ {

    /**
     * Represents a palette of droppable components of a given type.
     *
     * @param {String} buildingBlockType  Identifier of the class or building block (e.g.: screen) 
     * @constructs
     */
    initialize: function(/** String */ buildingBlockType, /** AbstractDocument */ parent) {
        /**
         * Node id of the accordion pane.
         * @type String
         * @private @member
         */
        this._id = buildingBlockType + "Palette";

        this._buildingBlockType = buildingBlockType;
        
        this._parent = parent;
        
        /**
         * Collection of components the palette offers.
         * @type PaletteComponent
         * @private @member
         */
        this._components = [];
        
        /**
         * Domain of the current palette
         * @type Array
         * @private @member
         */
        this._domainContext = [];

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
    
    /**
     * This function populates the current palette
     * with the building blocks associated to a given
     * domain context
     */
    populateBuildingBlocks: function (/** Array */ domainContext){
        
        this._domainContext = domainContext;
        
        switch(this._buildingBlockType){
            case Constants.BuildingBlock.SCREEN:
                //find Screens and check
                this._parent.getInferenceEngine().retrieveScreens(domainContext);
                break;
            case Constants.BuildingBlock.DOMAIN_CONCEPT:
                //FIXME: Handle domain concepts
                break;
            case Constants.BuildingBlock.CONNECTOR:
                this.paintComponents();
                break;
        }
    },
    
    /**
     * TODO: describe this. maybe this method will dissapear
     */
    updateComponents: function() {
        switch(this._buildingBlockType){
            case Constants.BuildingBlock.SCREEN:
                //find Screens and check
                var currentDocument = this._parent;
                var canvas = currentDocument.getCanvas();
                var domainContext = {
                    "tags":currentDocument.getBuildingBlockDescription().getDomainContext(),
                    "user":null
                };
                var elements = currentDocument.getPaletteElements();
                CatalogueSingleton.getInstance().findAndCheck(canvas, domainContext, elements, 'reachability');
                break;
            case Constants.BuildingBlock.DOMAIN_CONCEPT:
                CatalogueSingleton.getInstance().getDomainConcepts();
                break;
            case Constants.BuildingBlock.CONNECTOR:
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
        var descs = buildingBlockFactory.getBuildingBlockDescriptions(this._domainContext);
        var components = [];
        $A(descs).each(
            function(desc) {
                components.push(desc.createPaletteComponent());
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
            'id':paneId,
            'title':CatalogueSingleton.getInstance().getBuildingBlockFactory(this._buildingBlockType).getBuildingBlockName(),
            'class':'paletteElement'
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
