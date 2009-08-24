var DomainConceptInstance = Class.create(ComponentInstance,
    /** @lends DomainConceptInstance.prototype */ {

    /**
     * Domain concept instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /**BuildingBlockDescription*/ domainConceptDescription) {
        $super(domainConceptDescription);
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        this._id = uidGenerator.generate("domainConceptInstance");
        this._buildingBlockType = Constants.BuildingBlock.DOMAIN_CONCEPT;
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
            var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
            currentDocument.addDomainConcept(this);
            currentDocument.onClickCanvas(this.getHandlerNode());
        }
    }

    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:
