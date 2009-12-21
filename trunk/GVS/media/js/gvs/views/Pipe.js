var Pipe = Class.create(
    /** @lends Pipe.prototype */ {

    /**
     * Pipes graphical representation
     * @constructs
     */ 
    initialize: function (/** WireIt.Wire */ wire, /** String */ id) {

        /**
         * Pipe wire
         * @private
         * @type WireIt.Wire
         */
        this._wire = wire;

        /**
        * Pipe id
        * @private
        * @type String
        */
        this._id = id;
    },

    getWire: function() {
        return this._wire;
    },

    getId: function() {
        return this._id;
    },

    getSource: function() {
        return this._wire.terminal1;
    },

    getDestination: function() {
        return this._wire.terminal2;
    },

    getJSONforScreen: function() {
        return {'from': {
                    'buildingblock': this.getSource().getBuildingblockId(),
                    'condition': this.getSource().getConditionId()
                },
                'to': {
                    'buildingblock': this.getDestination().getBuildingblockId(),
                    'action': this.getDestination().getActionId(),
                    'condition': this.getDestination().getConditionId()
                }
            };
    },

    getJSONforCheck: function() {
        return {
                'from': {
                    'buildingblock': this.getSource().getBuildingblockUri(),
                    'condition': this.getSource().getConditionId()
                },
                'to': {
                    'buildingblock': this.getDestination().getBuildingblockUri(),
                    'action': this.getDestination().getActionId(),
                    'condition': this.getDestination().getConditionId()
                }
            };
    },

    setReachability: function(/** Boolean */ satisfied) {
        var options = this._wire.options;
        if (satisfied) {
            options = Object.extend(options, {
                'color': '#DDF7DD',
                'bordercolor': '#008000'
            });
        } else {
            options = Object.extend(options, {
                'color': '#F5D9D9',
                'bordercolor': '#B90000'
            });
        }
        this._wire.setOptions(options);
    },

    isValid: function() {
        // TODO: check if there are more conditions
        return this.getSource().getBuildingblockId() != this.getDestination().getBuildingblockId();
    },

    destroy: function() {
        this.getSource().removeWire(this._wire);
        this.getDestination().removeWire(this._wire);
    },

    setVisible: function(/** Boolean */ visible) {
        if (visible) {
            this.getSource().updatePosition();
            this.getDestination().updatePosition();
        }
        var style = {
            'visibility': visible ? 'visible': 'hidden'
        }
        this._wire.element.setStyle(style);
    }
    
    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:
