var FormView = Class.create(BuildingBlockView,
    /** @lends FormView.prototype */ {

    /**
     * Forms graphical representation
     * @constructs
     * @extends BuildingBlockView
     */
    initialize: function($super, /** FormDescription */ description) {

        $super();

        /**
         * Actions
         * @type Hash
         * @private
         */
        this._actions = new Hash();

        /**
         * Postcondition Icons
         * @type Hash
         * @private
         */
        this._postIcons = new Hash();

        /**
         * Trigger icons
         * @type Hash
         * @private
         */
        this._triggerIcons = new Hash();


        this._node = new Element("div", {
            "class": "view form",
            "title": description.name
        });

        var title = new Element("div", {
            "class": "title"
        }).update(description.label['en-gb']);

        this._node.appendChild(title);

        var actionsNode = new Element("div", {
            "class": "actions"
        });
        var actionsTitle = new Element("div", {
            "class": "title"
        }).update("Actions");
        this._node.appendChild(actionsNode);
        actionsNode.appendChild(actionsTitle);

        var actions = description.actions;
        actions.each( function(action) {
            var actionView = new ActionView(action);
            this._actions.set(action.name, actionView);
            actionsNode.appendChild(actionView.getNode());
        }.bind(this));

        var triggerPostContainer = new Element("div", {
            "class": "postTriggerContainer"
        });

        var containerTitle = new Element("div", {
            "class": "title"
        }).update("Postconditions");
        triggerPostContainer.appendChild(containerTitle);

        var triggerArea = new Element("div", {
            "class": "triggerArea"
        });
        triggerPostContainer.appendChild(triggerArea);

        var posts;
        if (description.postconditions && description.postconditions[0] instanceof Array) {
            posts =  description.postconditions[0];
        } else {
            posts = description.postconditions;
        }

        var postArea = new Element("div", {
            "class": "postArea"
        });



        posts.each (function(post) {
            var fact = FactFactory.getFactIcon(post, "embedded");
            this._postIcons.set(post.id, fact);
            postArea.appendChild(fact.getNode());
        }.bind(this));
        triggerPostContainer.appendChild(postArea);

        this._node.appendChild(triggerPostContainer);

    },

    // **************** PUBLIC METHODS **************** //
    /**
     * This function returns the domNode of the condition that has
     * the id passed as parameter
     * @type DOMNode
     */
    getConditionNode: function(/** String */ id,
                            /** String (Optional) */ _action) {
        if (_action) {
            return this._actions.get(_action).getConditionNode(id);
        } else {
            return this._postIcons.get(id).getNode();
        }
    },

    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {
        var satisfeable = reachabilityData.reachability;
        Utils.setSatisfeabilityClass(this._node, satisfeable);
        reachabilityData.actions.each(function(actionData) {
            this._actions.get(actionData.name).setReachability(actionData);
        }.bind(this));

        this._postIcons.values().each(function(post) {
            Utils.setSatisfeabilityClass(post.getNode(), satisfeable);
        });
    },

    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job

        this._actions.each(function(pair) {
            pair.value.destroy();
        });
        this._postIcons = null;
        this._triggerIcons.each(function(pair) {
            pair.value.destroy();
        });
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
