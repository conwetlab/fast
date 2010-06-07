var OperatorInstance = Class.create(ComponentInstance,
    /** @lends OperatorInstance.prototype */ {

    /**
     * Pre or Post instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /** BuildingBlockDescription */ description,
            /** InferenceEngine */ inferenceEngine) {
        $super(description, inferenceEngine);


        /**
         * Terminals for screen design
         * @type Hash
         * @private
         */
        this._terminals = new Hash();

    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Creates the terminal
     */
    createTerminals: function(/** Hash */ handlers) {
        var options = {
            'direction':[0,1],
            'wireConfig': {
                'drawingMethod': 'arrows'
            }
        };
        this._buildingBlockDescription.actions.each(function(action) {
            var actionTerminals = new Hash();
            action.preconditions.each(function(pre) {
                options.ddConfig = {
                    'type': 'input',
                    'allowedTypes': ['output']
                };
                options.offsetPosition =  {
                    'top': 6,
                    'left': 0
                };
                var node = this._view.getConditionNode(pre.id);
                var terminal = new Terminal(node, options, this, pre.id, action.name);
                terminal.onWireHandler(handlers);
                actionTerminals.set(pre.id, terminal);
            }.bind(this));
            this._terminals.set(action.name, actionTerminals);
        }.bind(this));

        var posts;
        if (this._buildingBlockDescription.postconditions &&
                this._buildingBlockDescription.postconditions[0] instanceof Array) {
            posts = this._buildingBlockDescription.postconditions[0];
        } else {
            posts = this._buildingBlockDescription.postconditions;
        }

        var postconditionTerminals = new Hash();
        posts.each(function(post) {
                options.alwaysSrc = true;
                options.ddConfig = {
                     'type': 'output',
                     'allowedTypes': ['input']
                };
                options.offsetPosition = {
                    'top': -10,
                    'left': 2
                };
                var node = this._view.getConditionNode(post.id);
                var terminal = new Terminal(node, options, this, post.id);
                terminal.onWireHandler(handlers);
                postconditionTerminals.set(post.id, terminal);
            }.bind(this));
            this._terminals.set("postconditions", postconditionTerminals);
    },

    /**
     * Gets a terminal from an id
     * @type Terminal
     */
    getTerminal: function(/** String */ id, /** String (Optional) */ _action) {
        var terminal = null;
        if (_action) {
            var actionTerminals = this._terminals.get(_action);
            if (actionTerminals) {
                terminal = actionTerminals.get(id);
            }
        } else {
            terminal = this._terminals.get("postconditions").get(id);
        }
        return terminal;
    },

    /**
     * Destroy the instance
     * @override
     */
    destroy: function($super, /** Boolean */ removeFromServer) {
    	if (this._terminals) {
            this._terminals.values().each(function(terminalGroup){
                terminalGroup.values().each(function(terminal){
                    terminal.destroy();
                });
            });
            this._terminals = null;
        }
        $super();
    },

    /**
     * On position update
     * @override
     */
    onUpdate: function(/** Number */ x, /** Number */ y) {
        if (this._terminals) {
            this._terminals.values().each(function(terminalGroup) {
                terminalGroup.values().each(function(terminal) {
                    terminal.updatePosition();
                });
            });
        }
    },

    /**
     * On rotate
     * @override
     */
    onRotate: function(/** Number */ orientation) {
        if (this._terminals) {
            this._terminals.values().each(function(terminalGroup) {
                terminalGroup.values().each(function(terminal) {
                    terminal.updatePosition();
                });
            });
        }
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new OperatorView(this._buildingBlockDescription, this._orientation);
    }

});

// vim:ts=4:sw=4:et:
