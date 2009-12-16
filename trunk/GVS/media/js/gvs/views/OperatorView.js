var OperatorView = Class.create(BuildingBlockView,
    /** @lends OperatorView.prototype */ {

    /**
     * Operators graphical representation
     * @constructs
     * @extends BuildingBlockView
     */ 
    initialize: function($super,/** OperatorDescription */ description) {

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
        
        this._node = new Element("div", {
            "class": "view operator",
            "title": description.name
        });
        
        var actions = description.actions;
        
        // TODO: Better action support: put the name of the action somewhere
        // and separation between actions      
        var preOrdered = new Array();
        
        actions.each(function(action) {
            action.preconditions.each(function(pre) {
                var fact = factFactory.getFactIcon(pre, "embedded");                 
                this._preIcons.set(pre.id, fact);
                preOrdered.push(fact);
            }.bind(this));
            
        }.bind(this));
        
        var size = preOrdered.size();
        var factNode;
        
        switch (size) {
            case 0:
                // Do nothing
                break;
            case 1:
                factNode = preOrdered[0].getNode();
                this._node.appendChild(factNode);
                factNode.setStyle({
                    'top': '60px',
                    'left': '37px'
                });
                break;
            case 2:
                factNode = preOrdered[0].getNode();
                this._node.appendChild(factNode);
                factNode.setStyle({
                    'top': '48px',
                    'left': '13px'
                });
                factNode = preOrdered[1].getNode();
                this._node.appendChild(factNode);
                factNode.setStyle({
                    'top': '48px',
                    'left': '59px'
                });
                break;
            case 3:
                factNode = preOrdered[0].getNode();
                this._node.appendChild(factNode);
                factNode.setStyle({
                    'top': '45px',
                    'left': '10px'
                });
                factNode = preOrdered[1].getNode();
                this._node.appendChild(factNode);
                factNode.setStyle({
                    'top': '45px',
                    'left': '65px'
                });
                factNode = preOrdered[2].getNode();
                this._node.appendChild(factNode);
                factNode.setStyle({
                    'top': '60px',
                    'left': '37px'
                });
            default:
                console.log("Too many preconditions");                
        }
        
        var postOrdered = new Array();
        
        if (description.postconditions && description.postconditions[0] instanceof Array) {
            var posts =  description.postconditions[0];
        } else {
            var posts = description.postconditions;
        }
        
        posts.each(function(post) {
                var fact = factFactory.getFactIcon(post, "embedded");                 
                this._postIcons.set(post.id, fact);
                postOrdered.push(fact);
            }.bind(this));
            
        size = postOrdered.size();
            
        
        switch (size) {
            case 0:
                // Do nothing
                break;
            case 1:
                factNode = postOrdered[0].getNode();
                this._node.appendChild(factNode);
                factNode.setStyle({
                    'top': '0px',
                    'left': '37px'
                });
                break;
            case 2:
                factNode = postOrdered[0].getNode();
                this._node.appendChild(factNode);
                factNode.setStyle({
                    'top': '10px',
                    'left': '13px'
                });
                factNode = postOrdered[1].getNode();
                this._node.appendChild(factNode);
                factNode.setStyle({
                    'top': '10px',
                    'left': '59px'
                });
                break;
            case 3:
                factNode = postOrdered[0].getNode();
                this._node.appendChild(factNode);
                factNode.setStyle({
                    'top': '15px',
                    'left': '10px'
                });
                factNode = postOrdered[1].getNode();
                this._node.appendChild(factNode);
                factNode.setStyle({
                    'top': '15px',
                    'left': '65px'
                });
                factNode = postOrdered[2].getNode();
                this._node.appendChild(factNode);
                factNode.setStyle({
                    'top': '0px',
                    'left': '37px'
                });
            default:
                console.log("Too many postconditions");                
        }

        /*if (description.icon){
            var imageContainer = new Element ('div',
                    {'class': 'screenImage' });
            var image = new Element ('img',{
                    'class': 'img', 
                    'src': description.icon
            imageContainer.appendChild (image); 
        }*/      
        
        /*if (description.icon){
            this._node.appendChild(imageContainer);
        }*/
        
        var titleNode = new Element("div", {"class":"title"});
        titleNode.update(description.label['en-gb']);
        this._node.appendChild(titleNode);
        
        
    },
    
    // **************** PUBLIC METHODS **************** //
    /**
     * This function returns the domNode of the condition that has
     * the id passed as parameter
     */
    getConditionNode: function(/** String */ id) {
        return this._preIcons.get(id) ? this._preIcons.get(id).getNode() : this._postIcons.get(id).getNode();
    },
    
    /**
     * Colorize the component depending on the reachability
     * @public @override
     */
    setReachability: function( /** Hash */ reachabilityData) {
        this._setViewReachability(reachabilityData, this._preIcons,
                                this._postIcons.values(), this._node);
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
