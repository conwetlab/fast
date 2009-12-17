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

    addPipe: function(/** Terminal */ source, /** Terminal */ destination,
                        /** WireIt.Wire */ wire) {
        var pipe = {
            'from': source,
            'to': destination,
            'wire': wire
        };
        if (!this._pipes.get(this._getPipeId(source,destination))) {
            this._pipes.set(this._getPipeId(source,destination), pipe);
        } else {
            source.removeWire(wire);
            destination.removeWire(wire);
        }
        
    },

    getPipes: function() {
        var pipes = new Array();
        this._pipes.values().each(function(pipe) {
            pipes.push({
                'from': {
                    'buildingblock': pipe.from.getBuildingblockUri(),
                    'condition': pipe.from.getConditionId()
                },
                'to': {
                    'buildingblock': pipe.to.getBuildingblockUri(),
                    'action': pipe.to.getActionId(),
                    'condition': pipe.to.getConditionId()
                }
            });
        });
        return pipes;
    },

    getPipeWire: function(/** Object */source, /** Object */ destination) {
        var sourceTerminal = this._buildFakeTerminal(source);
        var destinationTerminal = this._buildFakeTerminal(destination);
        return this._pipes.get(this._getPipeId(sourceTerminal, destinationTerminal)).
                                wire;
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

    removePipe: function (/** Terminal */ source, /** Terminal */ destination) {
        this._pipes.unset(this._getPipeId(source, destination));
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
            pipes.push({
                'from': {
                    'buildingblock': pipe.from.getBuildingblockId(),
                    'condition': pipe.from.getConditionId()
                },
                'to': {
                    'buildingblock': pipe.to.getBuildingblockId(),
                    'action': pipe.to.getActionId(),
                    'condition': pipe.to.getConditionId()
                }
            });
        });
        return pipes;
    },

    /**
     * Gets a pipe unique id from its endpoints
     * @private
     * @type String
     */
    _getPipeId: function(source, destination) {
        return source.getBuildingblockUri() + source.getConditionId() +
            destination.getBuildingblockUri() + destination.getActionId() +
            destination.getConditionId();
    },

    /**
     * Creates an anonymous class to simulate a terminal
     * @private
     * @type Terminal
     */
    _buildFakeTerminal: function(/** Object */terminalData) {
        var object = new Object();
        object.terminalData = terminalData;
        object.getBuildingblockUri = function() {
            return this.terminalData.buildingblock;
        }
        object.getConditionId = function() {
            return this.terminalData.condition;
        }
        object.getActionId = function() {
            return this.terminalData.action;
        }
        return object;
    }



});

// vim:ts=4:sw=4:et: 
