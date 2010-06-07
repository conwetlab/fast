var ScreenComponentInstance = Class.create(ComponentInstance,
/** @lends ScreenComponentInstance.prototype */ {

    /**
     * Destroy the instance
     * @override
     */
    destroy: function($super, /** Boolean */ removeFromServer) {
        $super();
        this._destroyTerminals();
    },

    /**
     * Create the terminals
     */
    createTerminals: function(handlers) {
        this._destroyTerminals();
        this._terminals = new Hash();
        this._buildPreConditionsTerminals(handlers, this);
        this._buildPostConditionsTerminals(handlers, this);
    },

    /**
     * Update position of the terminals
     * @override
     */
    updateTerminals: function() {
        if (this._terminals) {
            this._terminals.values().each(function(terminalGroup) {
                terminalGroup.values().each(function(terminal) {
                    terminal.updatePosition();
                });
            });
        }
    },

    /**
     * Gets a terminal from an id
     * @type Terminal
     */
    getTerminal: function(/** String */ id, /** String (Optional) */ _action) {
        var terminal = null;
        if (this._terminals) {
            if (_action) {
                var actionTerminals = this._terminals.get(_action);
                if (actionTerminals) {
                    terminal = actionTerminals.get(id);
                }
            } else {
                terminal = this._terminals.get("postconditions").get(id);
            }
        }
        return terminal;
    },

    /**
     * On position update
     * @override
     */
    onUpdate: function($super, /** Number */ x, /** Number */ y) {
        $super();
        this.updateTerminals();
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Destroy the terminals
     */
    _destroyTerminals: function() {
        if (this._terminals) {
            this._terminals.values().each(function(terminalGroup){
                terminalGroup.values().each(function(terminal){
                    terminal.destroy();
                });
            });
            this._terminals = null;
        }
    },

        /**
     * Creates the preconditions terminals
     */
    _buildPreConditionsTerminals: function(handlers, instance) {
        var options = {
            direction:[0,1],
            wireConfig: { 'drawingMethod': 'arrows' },
            ddConfig: {
                type: 'input',
                allowedTypes: ['output']
            }
        };

        if (this._preOffsetPosition) {
            options.offsetPosition = this._preOffsetPosition;
        }

        this._buildingBlockDescription.actions.each(function(action) {
            var preconditions = action.preconditions;
            var actionTerminals = this._buildTerminals(
                preconditions,
                instance,
                options,
                handlers,
                action.name
            );
            this._terminals.set(action.name, actionTerminals);
        }.bind(this));
    },

    /**
     * Creates the postconditions terminals
     */
    _buildPostConditionsTerminals: function(handlers, instance) {
        var options = {
            direction:[0,1],
            wireConfig: { 'drawingMethod': 'arrows' },
            alwaysSrc: true,
            ddConfig: {
                type: 'output',
                allowedTypes: ['input']
            }
        };

        if (this._postOffsetPosition) {
            options.offsetPosition = this._postOffsetPosition;
        }

        var posts = this._buildingBlockDescription.postconditions;
        if (posts && posts[0] instanceof Array) {
            posts = this._buildingBlockDescription.postconditions[0];
        }

        var terminals = this._buildTerminals(posts, instance, options, handlers);
        this._terminals.set("postconditions", terminals);
    },

    /**
     * Build terminals Object
     * @type Hash<ConditionId, Terminal>
     */
    _buildTerminals: function(conditions, instance, options, handlers, _name) {
        var conditionTerminals = new Hash();
        conditions.each(function(condition) {
            var node = this._view.getConditionNode(condition.id, _name);
            var terminal = new Terminal(node, options, instance, condition.id, _name);
            terminal.onWireHandler(handlers);
            conditionTerminals.set(condition.id, terminal);
        }.bind(this));
        return conditionTerminals;
    }
});
