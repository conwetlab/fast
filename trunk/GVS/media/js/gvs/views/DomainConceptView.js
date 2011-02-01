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
     * @override
     */
    setReachability: function (/** Object */ reachabilityData) {
        var reachability = (reachabilityData.reachability !== undefined) ?
                            reachabilityData.reachability : reachabilityData.satisfied;
        Utils.setSatisfeabilityClass(this._factIcon, reachability);
    },

    getReachability: function() {
        return this._factIcon.hasClassName("satisfeable");
    }

});

// vim:ts=4:sw=4:et:
