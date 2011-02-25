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
var ScreenTrigger = Class.create(Trigger,
    /** @lends ScreenTrigger.prototype */ {

    /**
     * Screen onload Triggers representation
     * @constructs
     * @extends Trigger
     */
    initialize: function ($super, /** Object */ to) {
        var from = {
            'instance': ScreenTrigger.INSTANCE_NAME,
            'name': ScreenTrigger.ONLOAD
        };
        $super(from, to);
    },

    /**
     * @override
     */
    getSourceId: function() {
        return this._from.instance;
    },

    /**
     * @override
     */
    getSourceInstance: function() {
        var fakeInstance = {
            getTitle: function() {
                return ScreenTrigger.INSTANCE_NAME;
            },
            getId: function() {
                return ScreenTrigger.INSTANCE_NAME;
            }
        };
        return fakeInstance;
    },


    /**
     * Returns the JSON object representing the Trigger
     * @type Object
     * @override
     */
    toJSON: function() {
        return {
            'from': {
                'buildingblock': "",
                'name': "_onload"
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
     * @override
     * @type String
     */
    _createId: function (/** Object */ from, /** Object */ to) {
        return from.instance + from.name + to.instance.getId() + to.action;
    }
});

// Class attributes
ScreenTrigger.INSTANCE_NAME = "Screen";
ScreenTrigger.ONLOAD = "onload";
// vim:ts=4:sw=4:et:
