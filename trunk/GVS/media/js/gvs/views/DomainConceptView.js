var DomainConceptView = Class.create( BuildingBlockView,
    /** @lends DomainConceptView.prototype */ {

    /**
     * Domain Concepts graphical representation
     * @constructs
     * @extends BuildingBlockView
     */
    initialize: function($super, /** BuildingBlockDescription */ description) {
        $super();

        this._factIcon = FactFactory.getFactIcon(description, "standalone").getNode();

        this._node = new Element("div", {
            "class": "view domainConcept"
        });
        this._node.appendChild(this._factIcon);

    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job
        this._node = null;
    },


    /**
     * @override
     */
    setReachability: function (/** Object */ reachabilityData) {
        var reachability = (reachabilityData.reachability !== undefined) ?
                            reachabilityData.reachability : reachabilityData.satisfied;
        Utils.setSatisfeabilityClass(this._factIcon, reachability);
    }

});

// vim:ts=4:sw=4:et:
