var ScreenDescription = Class.create(BuildingBlockDescription,
    /** @lends ScreenDescription.prototype */ {

    /**
     * Screen building block description.
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);

        // Components of the screen when built inside FAST
        this._preconditions = new Hash();
        this._postconditions = new Hash();
        this._buildingblocks = new Hash();
        this._pipes = new Hash();
        this._triggers = new Hash();
    },
    
    // ****************** PUBLIC METHODS ******************* //

    toJSON: function() {
        var result = {
            "preconditions": this.getPreconditions(),
            "postconditions": this.getPostconditions(),
            "definition": {
                "buildingblocks": this._getScreenBuildingBlocks(),
                "pipes": this._getScreenPipes(),
                "triggers": this.getTriggers()
            }
        };
        // TODO: add basic attributes
        result = Object.extend(result,{});
        return result;
    },
    
    /**
     * This method creates a DOM Node with the preview
     * of the Screen
     * @type DOMNode
     */
    getPreview: function() {
        var node = new Element('div', {
            'class': 'preview'
        });
        var errorField = new Element('div', {
            'class': 'error'
        });
        node.appendChild(errorField);
        var image = new Element ('img', {
            'src': this.screenshot, 
            'onerror': "this.parentNode.childNodes[0].update('Image not available');" +
                "this.src='"+ URIs.logoFast + "';"
        });
        node.appendChild(image);
        return node;
    },

    addPre: function(/** PrePostInstance */ pre) {
        this._preconditions.set(pre.getId(),pre);
    },

    addPost: function(/** PrePostInstance */ post) {
        this._postconditions.set(post.getId(),post);
    },

    addBuildingBlock: function (/** ComponentInstance */ instance) {
        this._buildingblocks.set(instance.getId(),instance);
    },

    addPipe: function(pipe) {
        if (this._pipes.get(pipe.getId())) {
            // TODO: is this situation possible?
            this._pipes.unset(pipe.getId());
            pipe.destroy();
        } else {
            this._pipes.set(pipe.getId(), pipe);
        }
    },

    getPipes: function() {
        var pipes = new Array();
        this._pipes.values().each(function(pipe) {
            pipes.push(pipe.getJSONforCheck());
        });
        return pipes;
    },


    getPreconditions: function() {
        var list = new Array();
        this._preconditions.values().each(function(pre) {
            list.push(pre.getFactData());
        }.bind(this));
        return list;
    },

    getPostconditions: function() {
        var list = new Array();
        this._postconditions.values().each(function(post) {
            list.push(post.getFactData());
        }.bind(this));
        return list;
    },

    getPost: function(/** String */ id) {
        return this._postconditions.get(id);
    },  

    remove: function(/** ComponentInstance */ instance) {
        switch (instance.constructor) {
            case PrePostInstance:
                if (this._preconditions.get(instance.getId())) {
                    this._preconditions.unset(instance.getId());
                } else {
                    this._postconditions.unset(instance.getId());
                }
                break;

            default:
                this._buildingblocks.unset(instance.getId());
        }
    },

    removePipe: function (/** Pipe */ pipe) {
        this._pipes.unset(pipe.getId());
    },

    // ******************** PRIVATE METHODS ************** //

    /**
     * Get building block list for screen composition
     * @private
     * @type Array
     */
     _getScreenBuildingblocks: function() {
        var buildingblocks = new Array();
        this._buildingblocks.values().each(function(block) {
            buildingblocks.push({
                'id': block.getId(),
                'uri': block.getUri()
            });
        });
    },

    /**
     * Get the pipe list for screen composition
     * @private
     * @type Array
     */
    _getScreenPipes: function() {
        var pipes;
        this._pipes.values().each(function(pipe) {
            pipes.push(pipe.getJSONForScreen());
        });
        return pipes;
    }

});

// vim:ts=4:sw=4:et: 
