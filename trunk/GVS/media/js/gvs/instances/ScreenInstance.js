var ScreenInstance = Class.create(ComponentInstance,
    /** @lends ScreenInstance.prototype */ {

    /**
     * Screen instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /**ResourceDescription*/ resourceDescription) {
        $super(resourceDescription);
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        this._id = uidGenerator.generate("screenInstance");
        this._buildingBlockType = 'screen';
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Colorize the component depending on the reachability
     * @public
     */
    colorize: function(){
        this.getView().colorize(this.getResourceDescription().satisfeable);
    },

    /**
     * Drop event handler for the DragSource
     * @param finishState
     *      True if a new ScreenInstance has
     *      been added to the new zone.
     * @override
     */
    onDragFinish: function(finishState) {
        // FIXME: remove this
        if(finishState) {
            var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
            currentDocument.addScreen(this);
            currentDocument.onClickCanvas(this.getHandlerNode());
            var canvas = currentDocument.getCanvas();
            var domainContext = {
                "tags":currentDocument.getResourceDescription().getDomainContexts(),
                "user":null
            };
            var elements = currentDocument.getPaletteElements();
            if (URIs.catalogueFlow =='check'){
                CatalogueSingleton.getInstance().check(canvas, domainContext, elements, 'reachability');
            } else {
                CatalogueSingleton.getInstance().get_screens(canvas, domainContext, elements, 'reachability');
            }
        }
    }

    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:
