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

        var titleNode = new Element("div", {"class":"screenTitle"});
        titleNode.update(description.label['en-gb']);

        var factFactory = FactFactorySingleton.getInstance();
        var preArea = new Element("div", {"class": "preArea"});

        if (description.preconditions.length > 1){ //More than one set of preconditions
            console.log("OR precondition support not implemented yet");
        }
        else {
            var preconditions = description.preconditions[0];
        }
    
        
        $A(preconditions).each(
                function(pre) {
                    var preFact = factFactory.getFactIcon(pre, "embedded");
                    this._preIcons.push(preFact);
                    preArea.appendChild(preFact.getNode());
                }.bind(this)
        );
        
        var postArea = new Element("div", {"class": "postArea"});

        if (description.postconditions.length > 1){ //More than one set of preconditions
            console.log("OR postcondition support not implemented yet");
        }
        else {
            var postconditions = description.postconditions[0];
        }      
        
        $A(postconditions).each(
                function(post) {
                    if (post) {
                        var postFact = factFactory.getFactIcon(post, "embedded");
                        this._postIcons.push(postFact);
                        postArea.appendChild(postFact.getNode());
                    }
                }.bind(this)
        );

        var prePostSeparator = new Element("div",
                {"class": "prePostSeparator"});

        if (description.icon){
            var imageContainer = new Element ('div',
                    {'class': 'screenImage' });
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
        this._node.appendChild(titleNode);
        this._node.appendChild(preArea);
        this._node.appendChild(prePostSeparator);
        if (description.icon){
            this._node.appendChild(imageContainer);
        }
        this._node.appendChild(postArea);
        
        this._createTooltip(description);
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
        if (preconditionList.length > 1) {
            //More than one set of preconditions is NOT YET SUPPORTED
            console.log("OR precondition support not implemented yet");
            return;
        } else {
            var preconditionData = preconditionList[0];
        }
        
        //Setting precondition reachability
        var factFactory = FactFactorySingleton.getInstance();
        var preReachability = new Hash();
        $A(preconditionData).each(function(precondition) {
            preReachability.set(factFactory.getFactUri(precondition), precondition.satisfied);    
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
    destroy: function () {
        // Let the garbage collector to do its job
        this._preIcons = null;
        this._postIcons = null;
        this._node = null;
    },
    
    // **************** PRIVATE METHODS **************** //
    /**
     * This function creates the tooltip for the view
     * @private
     */
    _createTooltip: function (/** ScreenDescription */ description) {
        /*var content = new Element('div');
        
        var title = new Element('h3').update(description.label['en-gb']);
        content.appendChild(title);
        
        var description = new Element('div').update(description.description['en-gb']);
        content.appendChild(description);
        
        var factFactory = FactFactorySingleton.getInstance();
        
        if (description.preconditions.length > 1){ //More than one set of preconditions
            console.log("OR precondition support not implemented yet");
        }
        else {
            var preconditions = description.preconditions[0];
        }
        if (preconditions.length > 0){
            var preTitle = new Element('h4').update('Preconditions');
            content.appendChild(preTitle);
            $A(preconditions).each(function(pre){
                //TODO
            });
        }*/
    }
});

// vim:ts=4:sw=4:et:
