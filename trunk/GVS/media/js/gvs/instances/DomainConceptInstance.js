var DomainConceptInstance = Class.create(ComponentInstance,
    /** @lends DomainConceptInstance.prototype */ {

    /**
     * Domain concept instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /**ResourceDescription*/ domainConceptDescription) {
        $super(domainConceptDescription);
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        this._id = uidGenerator.generate("domainConceptInstance");
    },

    // **************** PUBLIC METHODS **************** //

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
            GVSSingleton.getInstance().getDocumentController().getCurrentDocument().addDomainConcept(this);
            UIUtils.onClickCanvas(null, this.getView().getNode());
            var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
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
