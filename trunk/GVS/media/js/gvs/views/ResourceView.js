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
         * Fact Icons
         * @type Hash
         * @private
         */
        this._icons = new Hash();


        var preArea = new Element("div", {"class": "preArea"});
        var postArea = new Element("div", {"class": "postArea"});

        var actions = description.actions;
        var actionIcons;
        actions.each(function(action) {
        	actionIcons = new Hash();
            action.preconditions.each(function(pre) {
                var fact = FactFactory.getFactIcon(pre, "embedded");
                actionIcons.set(pre.id, fact);
                preArea.appendChild(fact.getNode());
            }.bind(this));
            this._icons.set(action.name, actionIcons)
        }.bind(this));

        var posts;
        if (description.postconditions && description.postconditions[0] instanceof Array) {
            posts = description.postconditions[0];
        } else {
            posts = description.postconditions;
        }

        actionIcons = new Hash();
        posts.each(function(post) {
                var fact = FactFactory.getFactIcon(post, "embedded");
                actionIcons.set(post.id, fact);
                postArea.appendChild(fact.getNode());
            }.bind(this));
        this._icons.set("postconditions", actionIcons);

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
            "class": "view resource",
            "title": description.name
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
     * This function returns the domNode of the precondition that has
     * the identification passed as parameter
     */
    getConditionNode: function(/** String */ id, /** String */ action) {
    	var actionIcons = this._icons.get(action);
    	if (actionIcons) {
    		var icon = actionIcons.get(id);
    		if (icon)
    			return icon.getNode();
    	}

    	return null;
    },

    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {
        var satisfeable = reachabilityData.reachability;
        Utils.setSatisfeabilityClass(this._node, satisfeable);

        this._icons.get("postconditions").each(function(post) {
            Utils.setSatisfeabilityClass(post.value.getNode(), satisfeable);
        });

        reachabilityData.actions.each(function(actionData) {
        	var actionIcons = this._icons.get(actionData.name);

        	actionData.preconditions.each(function(preData) {
        		var factNode = this.get(preData.id).getNode();
        		Utils.setSatisfeabilityClass(factNode, preData.satisfied);
        	}.bind(actionIcons));
        }.bind(this));
    },

    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job
        this._icons = null;
        this._node = null;
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
