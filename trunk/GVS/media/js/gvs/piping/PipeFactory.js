var PipeFactory = Class.create(
    /** @lends PipeFactory.prototype */ {

    /**
     * Handles all pipes for a given screenflow
     * @constructs
     */ 
    initialize: function () {
        /**
         * Hash containing all the pipes for the screen
         */
        this._pipes = new Hash();
    },

    /**
     * Returns a pipe instance from the wire element
     */
    getPipe: function (/** Variable Arguments */) {
        var pipe = null;
        var wire;
        var source;
        var destination;
        if (arguments.length == 1) {
            wire = arguments[0];
            source = wire.terminal1;
            destination = wire.terminal2;
           
        } else {
            // Get pipe by the terminals
            source = arguments[0];
            destination = arguments[1];
            wire = new WireIt.Wire(source, destination, document.body, source.options.wireConfig);
            wire.redraw();
        }
        var id = this._getPipeId(source, destination);
        pipe = new Pipe(wire, id);
        if (pipe.isValid()) {
            if (!this._pipes.get(id)) {
                this._pipes.set(id, pipe);
            }
        } else {
            pipe.destroy();
            pipe = null;
        }
        return pipe;
    },

    /**
     * Removes a pipe
     */
    removePipe: function(/** Pipe */ pipe) {
        this._pipes.unset(pipe.getId());
    },

    /**
     * Returns a pipe given its source and destination terminals
     * @type Pipe
     */
    getPipeFromTerminals: function(/** Terminal */ src, /** Terminal */ dst) {
        var values = this._pipes.values();
        
        for (var i = 0; i < values.size(); i++) {
            var pipe = values[i];
            var found = pipe.getSource() == src;
            found = found && pipe.getDestination() == dst;
            if (found) {
                return pipe;
            }
        }
        return null;
    },

    /**
     * Returns the list of pipes in which an instance is involved
     * (as the source or the destination)
     * @type Array
     */
    getPipes: function(/** ComponentInstance */ instance) {
        var result = new Array();
        this._pipes.values().each(function(pipe) {
            var found = pipe.getSource().getBuildingBlockId() == instance.getId();
            found = found || pipe.getDestination().getBuildingBlockId() == instance.getId();
            if (found) {
                result.push(pipe);
            }
        });
        return result;
    },

    /**
     * Hides all the pipes contained in the factory
     */
    hidePipes: function() {
        this._pipes.values().each(function(pipe) {
           pipe.setVisible(false);
        });
    },

    /**
     * Shows all the pipes contained in the screenflow
     */
    showPipes: function() {
         this._pipes.values().each(function(pipe) {
           pipe.setVisible(true);
        });
    },
    
    // **************** PRIVATE METHODS **************** //

    /**
     * Gets a pipe unique id from its endpoints
     * @private
     * @type String
     */
    _getPipeId: function(/** Terminal */ source, /** Terminal */ destination) {
        return source.getBuildingBlockId() + source.getConditionId() +
            destination.getBuildingBlockId() + destination.getActionId() +
            destination.getConditionId();
    }
});
