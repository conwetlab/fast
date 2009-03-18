var Palette = Class.create( /** @lends Palette.prototype */ {

    /**
     * Represents a palette of droppable components of a given type.
     *
     * @param {String} resourceType  Identifier of the class or resource (e.g.: screen) 
     * @constructs
     */
    initialize: function(/** String */ resourceType) {
        var resourceFactory = CatalogueSingleton.getInstance().getResourceFactory(resourceType);
        var uidGenerator = UIDGeneratorSingleton.getInstance();

        /**
         * Node id of the accordion pane.
         * @type String
         * @private @member
         */
        this._id = resourceType + "Palette";
        
        /**
         * Accordion pane node.
         * @type DOMNode
         * @private @member
         */
        this._node = dijit.byId(this._id);

        /**
         * Collection of components the palette offers.
         * @type PaletteComponent
         * @private @member
         */
        this._components = this._createComponents(resourceFactory);

        /**
         * Node of the palette body.
         * @type DOMNode
         * @private @member
         */
        this._content = this._renderContent();
        this._node.setContent(this._content);

        //Hidden by default
        this.setVisible(false);
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
     * Shows or hides the palette.
     * @public
     */
    setVisible: function (/** Boolean */ visible) {
        this._node.domNode.setStyle({
                "display": (visible ? "block" : "none")
        });
    },
    

    // **************** PRIVATE METHODS **************** //


    /**
     * Creates the palette components from resources by querying a resource factory.
     * @type {ResourceDescription[]}
     * @private
     */
    _createComponents: function(resourceFactory) {
        var descs = resourceFactory.getResourceDescriptions();
        var components = [];
        $A(descs).each(
                function(desc) { components.push(desc.createPaletteComponent()); } 
        );
        return components;
    },
    

    /**
     * Creates the GUI stuff that shows the content: components and separators.
     * @type DOMNode
     * @private
     */
    _renderContent: function() {
        var content   = new Element("div", {"class": "paletteContent", "id" : this._id + "Content"});
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
