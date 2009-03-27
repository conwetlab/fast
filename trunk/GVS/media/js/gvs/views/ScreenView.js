var ScreenView = Class.create( ResourceView,
    /** @lends ScreenView.prototype */ {

    /**
     * Screens graphical representation
     * @constructs
     * @extends ResourceView
     */ 
    initialize: function($super,/** ResourceDescription */ screenResourceDescription) {

        $super();

        var uidGenerator = UIDGeneratorSingleton.getInstance();
        this._id = uidGenerator.generate("screenView");

        /**
         * Precondition Icons
         * @type {FactIcon[]}
         * @private
         */
        this._preIcons;

        /**
         * Postcondition Icons
         * @type {FactIcon[]}
         * @private
         */
        this._postIcons;

        var title = new Element("div", {"class":"screenTitle unknown"});
        title.update(screenResourceDescription.name);

        var factFactory = FactFactorySingleton.getInstance();
        var preArea = new Element("div", {"class": "preArea"});
        var preIcons = [];
        $A(screenResourceDescription.preconditions).each(
                function(pre) {
                    var preFact = factFactory.getFactIcon(pre, "medium");
                    preIcons.push(preFact);
                    preArea.appendChild(preFact.getNode());
                }
        );
        this._preIcons = preIcons;

        var postArea = new Element("div", {"class": "postArea"});
        postIcons = [];
        $A(screenResourceDescription.postconditions).each(
                function(post) {
                    var postFact = factFactory.getFactIcon(post, "medium");
                    postIcons.push(postFact);
                    postArea.appendChild(postFact.getNode());
                }
        );
        this._postIcons = postIcons;

        var prePostSeparator = new Element("div",
                {"class": "prePostSeparator"});  

        if (screenResourceDescription.icon){
            var imageContainer = new Element ('div',
                    {'class': 'screenImage' });
            var image = new Element ('img',
                    {'class': 'img', 'src': screenResourceDescription.icon});
            imageContainer.appendChild (image); 
        }

        this._node = new Element("div", {
            "id":     this._id,
            "class": "view screen unknown"
        });
        this._node.appendChild(title);
        this._node.appendChild(preArea);
        this._node.appendChild(prePostSeparator);
        if (screenResourceDescription.icon){
            this._node.appendChild(imageContainer);
        }
        this._node.appendChild(postArea);
    },

    // **************** PUBLIC METHODS **************** //
    
    /**
     * Removes the DOM Elements and frees resources
     * @override
     */
    destroy: function () {
        // Let the garbage collector to do its job
        this._preIcons = null;
        this._postIcons = null;
        this._node = null;
    }

});

// vim:ts=4:sw=4:et:
