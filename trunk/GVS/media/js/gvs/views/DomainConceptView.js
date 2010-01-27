var DomainConceptView = Class.create( BuildingBlockView,
    /** @lends DomainConceptView.prototype */ {

    /**
     * Domain Concepts graphical representation
     * @constructs
     * @extends BuildingBlockView
     */ 
    initialize: function($super, /** BuildingBlockDescription */ description) {
        $super();
        
        var factFactory = FactFactorySingleton.getInstance();
        var factIcon = factFactory.getFactIcon(description, "standalone");
        
        this._node = new Element("div", {
            "class": "view domainConcept"
        });
        this._node.appendChild(factIcon.getNode());

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
        Utils.setSatisfeabilityClass(this._node, reachability);
    }

});

// vim:ts=4:sw=4:et:
