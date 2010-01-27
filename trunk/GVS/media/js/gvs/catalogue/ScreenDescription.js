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
        this._buildingBlocks = new Hash();
        this._pipes = new Hash();
        this._triggers = new Hash();
    },
    
    // ****************** PUBLIC METHODS ******************* //

    /**
     * to JSON object function
     * @type Object
     */
    toJSON: function() {
        var result = {
            "preconditions": this.getPreconditions().size() > 0 ? [this.getPreconditions()] : [],
            "postconditions": this.getPostconditions().size() > 0 ? [this.getPostconditions()] : [],
            "definition": {
                "buildingblocks": this._getScreenBuildingBlocks(),
                "pipes": this._getScreenPipes(),
                "triggers": this._getTriggers()
            }
        };
        result = Object.extend(result,{
            "name": this.name,
            "label": this.label,
            "tags": this.tags,
            "version": this.version,
            "id": this.id,
            "creator": this.creator,
            "description": this.description,
            "rights": this.rights,
            "creationDate": this.creationDate,
            "icon": this.icon,
            "screenshot": this.screenshot,
            "homepage": this.homepage,
            "type": "screen"
        });
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

    /**
     * Implementing the TableModel interface
     * @type Array
     */
    getInfo: function() {
        var info = new Hash();
        info.set('Title', this.label['en-gb']);
        info.set('Tags', this.tags.collect(function(tag) {
                return tag.label['en-gb'];
            }).join(", "));
        info.set('Version', this.version);
        return info;
    },

    /**
     * Adds a pre instance to the description
     */
    addPre: function(/** PrePostInstance */ pre, /** Object */ position) {
        this._preconditions.set(pre.getId(), {
            'buildingblock': pre,
            'position': position
        });
    },

    /**
     * Adds a post instance
     */
    addPost: function(/** PrePostInstance */ post, /** Object */ position) {
        this._postconditions.set(post.getId(),{
            'buildingblock': post,
            'position': position
        });
    },

    /**
     * Updates the position of a *-condition
     */
    updatePrePost: function(/** PrePostInstance */ prepost, /** Object */ position) {
        var list;
        if (prepost.getType() == "pre") {
            list = this._preconditions;
        } else {
            list = this._postconditions;
        }
        list.get(prepost.getId()).position = position;
    },

    /**
     * Adds a building block (other than pre/post) to the description
     */
    addBuildingBlock: function (/** ComponentInstance */ instance, /** Object */ position) {
        this._buildingBlocks.set(instance.getId(),{
            'buildingblock': instance,
            'position': position
        });
    },

    /**
     * Updates the position of a building block
     */
    updateBuildingBlock: function (/** ComponentInstance */ instance, /** Object */ position) {
        this._buildingBlocks.get(instance.getId()).position = position;
    },

    /**
     * Adds a pipe
     */
    addPipe: function(/** Pipe */ pipe) {
        if (this._pipes.get(pipe.getId())) {
            // TODO: is this situation possible?
            this._pipes.unset(pipe.getId());
            pipe.destroy();
        } else {
            this._pipes.set(pipe.getId(), pipe);
        }
    },

    addTrigger: function(/** Trigger */ trigger) {
        if (this._triggers.get(trigger.getId())) {
            // TODO: is this situation possible?
            this._triggers.unset(trigger.getId());
        } else {
            this._triggers.set(trigger.getId(), trigger);
        }
    },

    /**
     * Get all the pipes of the screen
     * @type Array
     */
    getPipes: function() {
        var pipes = new Array();
        this._pipes.values().each(function(pipe) {
            pipes.push(pipe.getJSONforCheck());
        });
        return pipes;
    },

    /**
     * Get a list of preconditions in form of a JSON Object
     * @type Array
     */
    getPreconditions: function() {
        var list = new Array();
        this._preconditions.values().each(function(pre) {
            var element = Object.extend(pre.buildingblock.getFactData(), {'position':
                pre.position});
            list.push(element);
        }.bind(this));
        return list;
    },

    /**
     * Get a list of postconditions in form of a JSON Object
     * @type Array
     */
    getPostconditions: function() {
        var list = new Array();
        this._postconditions.values().each(function(post) {
            var element = Object.extend(post.buildingblock.getFactData(), {'position':
                post.position});
            list.push(element);
        }.bind(this));
        return list;
    },

    /**
     * Get a list of pre and post condition instances 
     * @type Array
     */
    getConditionInstances: function() {
        var result = new Array();
        this._preconditions.values().each(function(pre){
            result.push(pre.buildingblock);
        });
        this._postconditions.values().each(function(post){
            result.push(post.buildingblock);
        });
        return result;
    },

    /**
     * Get a post by its string identifier
     * @type PrePostInstance
     */
    getPost: function(/** String */ id) {
        return this._postconditions.get(id).buildingblock;
    },  

    /**
     * Removes an instance from the screen description
     */
    remove: function(/** Object */ instance) {
        switch (instance.constructor) {
            case PrePostInstance:
                if (this._preconditions.get(instance.getId())) {
                    this._preconditions.unset(instance.getId());
                } else {
                    this._postconditions.unset(instance.getId());
                }
                break;
            case Pipe:
                this._pipes.unset(instance.getId());
                break;
            case Trigger:
            case ScreenTrigger:
                this._triggers.unset(instance.getId());
                break;
            default:
                this._buildingBlocks.unset(instance.getId());
        }
    },

    // ******************** PRIVATE METHODS ************** //

    /**
     * Get building block list for screen composition
     * @private
     * @type Array
     */
     _getScreenBuildingBlocks: function() {
        var buildingBlocks = new Array();
        this._buildingBlocks.values().each(function(block) {
            buildingBlocks.push({
                'id': block.buildingblock.getId(),
                'uri': block.buildingblock.getUri(),
                'position': block.position
            });
        });
        return buildingBlocks;
    },

    /**
     * Get the pipe list for screen composition
     * @private
     * @type Array
     */
    _getScreenPipes: function() {
        var pipes = new Array();
        this._pipes.values().each(function(pipe) {
            pipes.push(pipe.getJSONforScreen());
        });
        return pipes;
    },

    /**
     * Get the trigger list for screen composition
     * @private
     * @type Array
     */
    _getTriggers: function() {
        var triggers = new Array();
        this._triggers.values().each(function(trigger) {
            triggers.push(trigger.toJSON());
        });
        return triggers;
    }

});

// vim:ts=4:sw=4:et: 
