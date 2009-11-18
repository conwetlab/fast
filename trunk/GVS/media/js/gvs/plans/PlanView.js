var PlanView = Class.create(BuildingBlockView,
    /** @lends PlanView.prototype */ {

    /**
     * Plans graphical representation
     * @constructs
     * @extends BuildingBlockView
     */ 
    initialize: function($super, /** Array */ plan) {

        $super();

        this._node = new Element('div', {'class': 'plan view'});
        
        var nScreens = 0;
        plan.each(function(screenDescription) {
            var screenView = new ScreenView(screenDescription);
            this._node.appendChild(screenView.getNode());
            nScreens++;
        }.bind(this));
        // width = (size of each screen)* (number of screens)
        // + (margin+padding)*(number of screens)
        var width = 102*nScreens + 6*nScreens;
        var widthText = width + 'px';
        this._node.setStyle({'width': widthText});
    },
    
    // **************** PUBLIC METHODS **************** //
    
    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {
        
        //Do nothing
    },
    
    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job
        
    }
    
    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
