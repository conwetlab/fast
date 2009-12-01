var ResourceView = Class.create(BuildingBlockView,
    /** @lends ResourceView.prototype */ {

    /**
     * Resources graphical representation
     * @constructs
     * @extends BuildingBlockView
     */ 
    initialize: function($super,/** ResourceDescription */ description) {

        $super();

        /**
         * Precondition Icons
         * @type Hash
         * @private
         */
        this._preIcons = new Hash();

        /**
         * Postcondition Icons
         * @type Hash
         * @private
         */
        this._postIcons = new Hash();
        

       

        var factFactory = FactFactorySingleton.getInstance();
        var preArea = new Element("div", {"class": "preArea"});
        var postArea = new Element("div", {"class": "postArea"});
        
        var actions = description.actions;
        
        // TODO: Better action support: put the name of the action somewhere
        // and separation between actions 
        actions.each(function(action) {
            action.preconditions.each(function(pre) {
                var factNode = factFactory.getFactIcon(pre, "embedded");                 
                this._preIcons.set(pre.id, factNode);
                preArea.appendChild(factNode.getNode());
            }.bind(this));
            
        }.bind(this));
        
        description.postconditions.each(function(post) {
                var factNode = factFactory.getFactIcon(post, "embedded");                 
                this._postIcons.set(post.id, factNode);
                postArea.appendChild(factNode.getNode());
            }.bind(this));

        var prePostSeparator = new Element("div",
                {"class": "prePostSeparator"});

        /*if (description.icon){
            var imageContainer = new Element ('div',
                    {'class': 'screenImage' });
            var image = new Element ('img',{
                    'class': 'img', 
                    'src': description.icon
            imageContainer.appendChild (image); 
        }*/

        this._node = new Element("div", {
            "class": "view resource"
        });
        
        this._node.appendChild(preArea);
        this._node.appendChild(prePostSeparator);
        
        /*if (description.icon){
            this._node.appendChild(imageContainer);
        }*/
        this._node.appendChild(postArea);
        
        var titleNode = new Element("div", {"class":"title"});
        titleNode.update(description.label['en-gb']);
        this._node.appendChild(titleNode);
        
        
    },
    
    // **************** PUBLIC METHODS **************** //
    /**
     * This function returns the domNode of the condition that has
     * the identification passed as parameter
     */
    getConditionNode: function(/** String */ id) {
        return this._preIcons.get(id) ? this._preIcons.get(id).getNode() : this._postIcons.get(id).getNode();
    },
    
    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {
        
        // TODO
    },
    
    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job
        this._preIcons = null;
        this._postIcons = null;
        this._node = null;
    }
    
    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
