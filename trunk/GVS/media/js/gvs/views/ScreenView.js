var ScreenView = Class.create(BuildingBlockView,
    /** @lends ScreenView.prototype */ {

    /**
     * Screens graphical representation
     * @constructs
     * @extends BuildingBlockView
     */
    initialize: function($super,/** ScreenDescription */ description) {

        $super();

        /**
         * Precondition Icons
         * @type Array
         * @private
         */
        this._preIcons = new Array();

        /**
         * Postcondition Icons
         * @type {FactIcon[]}
         * @private
         */
        this._postIcons = new Array();

        /**
         * Tooltip
         * @type dijit.Tooltip
         * @private
         */
        this._tooltip = null;

        /**
         * Title node
         * @type DOMNode
         * @private
         */
        this._titleNode = new Element("div", {"class":"title"});

        this._titleNode.update(description.label['en-gb']);

        var preArea = new Element("div", {"class": "preArea"});

        var preconditions = description.preconditions;


        $A(preconditions).each(
                function(pre) {
                    var preFact = FactFactory.getFactIcon(pre, "embedded");
                    this._preIcons.push(preFact);
                    preArea.appendChild(preFact.getNode());
                }.bind(this)
        );

        var postArea = new Element("div", {"class": "postArea"});

        var postconditions = description.postconditions;

        $A(postconditions).each(
                function(post) {
                    if (post) {
                        var postFact = FactFactory.getFactIcon(post, "embedded");
                        this._postIcons.push(postFact);

                        if (!post.positive)
                        	postFact.getNode().addClassName('negative');

                        postArea.appendChild(postFact.getNode());
                    }
                }.bind(this)
        );

        var prePostSeparator = new Element("div",
                {"class": "prePostSeparator"});

        if (description.icon){
            var imageContainer = new Element ('div',
                    {'class': 'image' });
            var image = new Element ('img',{
                    'class': 'img',
                    'src': description.icon
                    //If we want an onerror image...
                    /*'onError': 'if (this.src != URIs.screenImageNotFound){'+
                                'this.src = URIs.screenImageNotFound;'+
                            '}'*/
                    });
            imageContainer.appendChild (image);
        }

        this._node = new Element("div", {
            "class": "view screen"
        });
        this._node.appendChild(this._titleNode);
        this._node.appendChild(preArea);
        this._node.appendChild(prePostSeparator);
        if (description.icon){
            this._node.appendChild(imageContainer);
        }
        this._node.appendChild(postArea);
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {

        var satisfeable = reachabilityData.reachability;

        // screen
        Utils.setSatisfeabilityClass(this.getNode(), satisfeable);

        // posts
        this._postIcons.each(function(postIcon) {
            Utils.setSatisfeabilityClass(postIcon.getNode(), satisfeable);
        });

        // pres
        var preconditionList = reachabilityData.preconditions;
        var preconditionData = preconditionList;

        //Setting precondition reachability
        var preReachability = new Hash();
        $A(preconditionData).each(function(precondition) {
            preReachability.set(FactFactory.getFactUri(precondition), precondition.satisfied);
        });

        this._preIcons.each(function(preIcon) {
            var factUri = preIcon.getFact().getUri();
            Utils.setSatisfeabilityClass(preIcon.getNode(), preReachability.get(factUri));
        });
    },

    /**
     * Removes the DOM Elements and frees building blocks
     * @override
     */
    destroy: function ($super) {
        // Let the garbage collector to do its job
        this._preIcons = null;
        this._postIcons = null;
        $super();
    },

    /**
     * @override
     */
    setTitle: function(title) {
        this._titleNode.update(title);
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
