/*...............................licence...........................................
 *
 *    (C) Copyright 2011 FAST Consortium
 *
 *     This file is part of FAST Platform.
 *
 *     FAST Platform is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     FAST Platform is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with FAST Platform.  If not, see <http://www.gnu.org/licenses/>.
 *
 *     Info about members and contributors of the FAST Consortium
 *     is available at
 *
 *     http://fast.morfeo-project.eu
 *
 *...............................licence...........................................*/
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

        /**
         * Valid pipe
         * @type Boolean
         * @private
         */
        this._isValid = true;
    },

    /**
     * Returns the WireIt wire object
     * @type WireIt.Wire
     */
    getWire: function() {
        return this._wire;
    },

    /**
     * Returns the pipe id
     * @type String
     */
    getId: function() {
        return this._id;
    },

    /**
     * Returns the source terminal of the pipe
     * @type Terminal
     */
    getSource: function() {
        return this._wire.terminal1;
    },


    /**
     * Returns the destination terminal of the pipe
     * @type Terminal
     */
    getDestination: function() {
        return this._wire.terminal2;
    },

    /**
     * Gets the JSON object representing the pipe for screen definition
     * @type Object
     */
    getJSONforScreen: function() {
        return {'from': {
                    'buildingblock': this.getSource().getBuildingBlockId(),
                    'condition': this.getSource().getConditionId()
                },
                'to': {
                    'buildingblock': this.getDestination().getBuildingBlockId(),
                    'action': this.getDestination().getActionId(),
                    'condition': this.getDestination().getConditionId()
                }
            };
    },

    /**
     * Gets the JSON object representing the pipe for catalogue check
     * @type Object
     */
    getJSONforCheck: function() {
        return {
                'from': {
                    'buildingblock': this.getSource().getBuildingBlockUri(),
                    'condition': this.getSource().getConditionId()
                },
                'to': {
                    'buildingblock': this.getDestination().getBuildingBlockUri(),
                    'action': this.getDestination().getActionId(),
                    'condition': this.getDestination().getConditionId()
                }
            };
    },

    /**
     * Sets the reachability coloring information of the pipe
     */
    setReachability: function(/** Object */ reachabilityData) {
        var options = this._wire.options;
        var satisfied = reachabilityData.satisfied;
        if (!reachabilityData.correct) {
            options = Object.extend(options, {
                'color': '#EAEAEA',
                'bordercolor': '#808080'
            });
        } else {
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
        }
        this._wire.setOptions(options);
        this._wire.redraw();

        if (!reachabilityData.correct) {
             this._wire.element.setStyle({'opacity': '0.5'});
             if (this._isValid) {
                 Utils.showMessage("The elements you have connected are not compatible." +
                            " It may not work", {
                            'hide': true,
                            'error': true
                            });
                 this._isValid = false;
             }

        }
    },

    /**
     * Is the pipe semantically correct
     * @type Boolean
     */
    isValid: function() {
        // TODO: check if there are more conditions
        return (this.getSource().getBuildingBlockId() != this.getDestination().getBuildingBlockId())
                && this._isValid;
    },


    /**
     * Destroys the wire
     */
    destroy: function() {
        this.getSource().removeWire(this._wire);
        this.getDestination().removeWire(this._wire);
    },


    /**
     * Sets the pipe visible or hidden. To be called whenever a document
     * is selected or deselected
     */
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
