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
var Trigger = Class.create(
    /** @lends Trigger.prototype */ {

    /**
     * Triggers representation
     * @constructs
     */
    initialize: function (/** Object */ from, /** Object */ to) {

        /**
         * Trigger source
         * @private
         * @type Object
         */
        this._from = from;

        /**
         * Trigger destination
         * @prvate
         * @type Object
         */
        this._to = to;

        /**
         * Trigger id
         * @private
         * @type String
         */
        this._id = this._createId(from, to);
    },

    /**
     * Returns the trigger id
     * @type String
     */
    getId: function() {
        return this._id;
    },

    getDestinationId: function() {
        return this._to.instance.getId();
    },

    getDestinationAction: function() {
        return this._to.action;
    },

    getTriggerName: function() {
        return this._from.name;
    },

    getSourceId: function() {
        return this._from.instance.getId();
    },

    getSourceInstance: function() {
        return this._from.instance;
    },

    /**
     * Returns the JSON object representing the Trigger
     * @type Object
     */
    toJSON: function() {
        return {
            'from': {
                'buildingblock': this.getSourceId(),
                'name': this.getTriggerName()
            },
            'to': {
                'buildingblock': this.getDestinationId(),
                'action': this.getDestinationAction()
            }
        };
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Creates the trigger id
     * @private
     * @type String
     */
    _createId: function (/** Object */ from, /** Object */ to) {
        return from.instance.getId() + from.name +
                to.instance.getId() + to.action;
    }

});


// vim:ts=4:sw=4:et:
