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
            "preconditions": this._preconditions.values(),
            "postconditions": this._postconditions.values(),
            "definition": {
                "buildingblocks": this._buildingblocks.values(),
                "pipes": this._pipes.values(),
                "triggers": this._triggers.values()
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

    getPipes: function() {
        return this._pipes.values();
    }
});

// vim:ts=4:sw=4:et: 
