var ScreenflowDescription = Class.create(BuildingBlockDescription,
    /** @lends ScreenflowDescription.prototype */ {

    /**
     * Screenflow building block description.
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);

      
        this._screens = new Hash();
        this._preconditions = new Hash();
        this._postconditions = new Hash();
    },

    /**
     * to JSON object function
     * @type Object
     */
    toJSON: function() {
        var result = {
            "definition": {
                "screens": this._getScreens(),
                "preconditions": this.getPreconditions(),//.size() > 0 ? [this.getPreconditions()] : [],
                "postconditions": this.getPostconditions()//.size() > 0 ? [this.getPostconditions()] : []
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
            "type": "screenflow"
        });
        return result;
    },
    
    /**
     * Adds a new screen.
     * @param ScreenDescription
     *      Screen to be added to the
     *      Screenflow document.
     */
    addScreen: function (/** ScreenInstance */ instance, /** Object */ position) {
        this._screens.set(instance.getUri(), {
            "buildingblock":   instance,
            "position": position
        });
    },

    /**
     * Updates the position of the screen
     */
    updateScreen: function (/** String */ uri, /** Object */ position) {
        var buildingBlock = this._screens.get(uri);
        var origin = buildingBlock.position;

        if (origin.top != position.top || origin.left != position.left) {
            buildingBlock.position = position;
            return true;
        } else {
            return false;
        }
    },

    /**
     * Delete a screen.
     * @param ScreenDescription
     *      Screen to be deleted from the
     *      Screenflow document.
     */
    remove: function(/** String */ uri) {
        this._screens.unset(uri);
        this._preconditions.unset(uri);
        this._postconditions.unset(uri);
    },
    /**
     * Adds a new *-condition to the screenflow description
     */
    addPrePost: function(/** PrePostInstance */ instance, /** Object */ position) {
        switch(instance.getType()) {
            case 'pre':
                this._preconditions.set(instance.getUri(), {'buildingblock': instance,
                                                            'position': position});
                break;
            case 'post':
                this._postconditions.set(instance.getUri(), {'buildingblock': instance,
                                                            'position': position});
                break;
            default:
                //Do nothing
        }  
    },

    updatePrePost: function(/** String */ uri, /** Object */ position) {
        var condition = this._preconditions.get(uri);
        if (!condition) {
            condition = this._postconditions.get(uri);
        }
        var origin = condition.position;
        if (origin.top != position.top || origin.left != position.left) {
            condition.position = position;
            return true;
        }
        return false;
    },
    
    
    /**
     * Implementing the TableModel interface
     * @type Array
     */
    getInfo: function() {
        var info = new Hash();
        info.set('Title', this.getTitle());
        info.set('Tags', this.tags.collect(function(tag) {
                return tag.label['en-gb'];
            }).join(", "));
        info.set('Version', this.version);
        return info;
    },
    
    /**
     * Get a list of preconditions in form of a JSON Object
     * @type Array
     */
    getPreconditions: function() {
        var list = new Array();
        this._preconditions.values().each(function(pre) {
            var element = Object.extend(pre.buildingblock.toJSONForScreenflow(), {'position':
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
            var element = Object.extend(post.buildingblock.toJSONForScreenflow(), {'position':
                post.position});
            list.push(element);
        }.bind(this));
        return list;
    },

    /**
     * Get a list of canvas instances
     * @type Array
     */
    getCanvasInstances: function() {
        var result = new Array();
        var list = this._screens.values().concat(this._preconditions.values());
        list = list.concat(this._postconditions.values());
        list.each(function(instance){
            result.push(instance.buildingblock);
        });
        return result;
    },

    /**
     * Returns true if an element with the parameter uri is in the screen
     * @type Boolean
     */
    contains: function(/** String */ uri) {
        var list = this._screens.values().concat(this._preconditions.values());
        list = list.concat(this._postconditions.values());
        var element = list.detect(function(instance) {
                    return instance.buildingblock.getUri() == uri;
        });
        if (element) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * Necessary for compatibility with other BuildingblockDescriptions
     * @type Array
     */
    getConditionInstances: function() {
        return new Array();
    },
    
    //************************ PRIVATE METHODS *******************//
    /**
     * @type Array
     * @private
     */
    _getScreenUris: function() {
        return this._screens.keys();
    },

    /**
     * Return the list of screens
     * @type Array
     * @private
     */
    _getScreens: function() {
        var result = new Array();
        this._screens.values().each(function(screen){
            result.push({
                'uri': screen.buildingblock.getUri(),
                'position': screen.position
            });
        });
        return result;
    }
});

// vim:ts=4:sw=4:et: 