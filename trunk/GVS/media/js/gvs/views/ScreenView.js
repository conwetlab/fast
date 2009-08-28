var ScreenView = Class.create( BuildingBlockView,
    /** @lends ScreenView.prototype */ {

    /**
     * Screens graphical representation
     * @constructs
     * @extends BuildingBlockView
     */ 
    initialize: function($super,/** BuildingBlockDescription */ screenBuildingBlockDescription) {

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
        title.update(screenBuildingBlockDescription.label['en-gb']);

        var factFactory = FactFactorySingleton.getInstance();
        var preArea = new Element("div", {"class": "preArea"});
        var preIcons = [];

        if (screenBuildingBlockDescription.preconditions.length > 1){ //More than one set of preconditions
            console.log("OR precondition support not implemented yet");
        }
        else {
            var preconditions = screenBuildingBlockDescription.preconditions[0];
        }
    
        
        $A(preconditions).each(
                function(pre) {
                    var uri = pre.pattern;
                    var preFact = factFactory.getFactIcon(uri, "medium");
                    preIcons.push(preFact);
                    preArea.appendChild(preFact.getNode());
                }
        );
        this._preIcons = preIcons;

        var postArea = new Element("div", {"class": "postArea"});
        var postIcons = [];

        //Backward compatibility with the previous catalogue
        if (screenBuildingBlockDescription.postconditions[0] instanceof Array){//new catalogue
            if (screenBuildingBlockDescription.postconditions.length > 1){ //More than one set of preconditions
                console.log("OR postcondition support not implemented yet");
            }
            else {
                var postconditions = screenBuildingBlockDescription.postconditions[0];
            }
        }
        else {//old catalogue
            var postconditions = screenBuildingBlockDescription.postconditions;
        }        
        
        $A(postconditions).each(
                function(post) {
                    if (post) {
                        var uri = post.pattern;
                        var postFact = factFactory.getFactIcon(uri, "medium");
                        postIcons.push(postFact);
                        postArea.appendChild(postFact.getNode());
                    }
                }
        );
        this._postIcons = postIcons;

        var prePostSeparator = new Element("div",
                {"class": "prePostSeparator"});

        if (screenBuildingBlockDescription.icon){
            var imageContainer = new Element ('div',
                    {'class': 'screenImage' });
            var image = new Element ('img',
                    {'class': 'img', 'src': screenBuildingBlockDescription.icon});
            imageContainer.appendChild (image); 
        }

        this._node = new Element("div", {
            "id":     this._id,
            "class": "view screen unknown"
        });
        this._node.appendChild(title);
        this._node.appendChild(preArea);
        this._node.appendChild(prePostSeparator);
        if (screenBuildingBlockDescription.icon){
            this._node.appendChild(imageContainer);
        }
        this._node.appendChild(postArea);
    },

    // **************** PUBLIC METHODS **************** //
    
    colorize: function( /** Boolean */ satisfeable) {
        var globalColor = (satisfeable) ? "green" : "#B90000";
        // border
        this.getNode().style.borderColor = globalColor;
        
        //screen
        this.getNode().removeClassName(satisfeable ? 'unsatisfeable' : 'satisfeable');
        this.getNode().addClassName(satisfeable ? 'satisfeable' : 'unsatisfeable');
        
        //descendants
        this.getNode().descendants().each(function(node){
            //title
            if (node.hasClassName('screenTitle')) {
                node.style.backgroundColor = globalColor;
            }
            //posts
            if (node.hasClassName('postArea')) {
                node.descendants().each(function(fact){
                    if (fact.hasClassName('fact')) {
                        fact.removeClassName(satisfeable ? 'unsatisfeable' : 'satisfeable');
                        fact.addClassName(satisfeable ? 'satisfeable' : 'unsatisfeable');
                    }
                });
            }
            //pres
            if (node.hasClassName('preArea')) {
                node.descendants().each(function(fact){
                    if (fact.hasClassName('fact')) {
                        fact.removeClassName(satisfeable ? 'unsatisfeable' : 'satisfeable');
                        fact.addClassName(satisfeable ? 'satisfeable' : 'unsatisfeable');
                    }
                });
            }
        });
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

});

// vim:ts=4:sw=4:et:
