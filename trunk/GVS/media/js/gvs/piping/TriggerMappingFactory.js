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
var TriggerMappingFactory = Class.create(
    /** @lends TriggerMappingFactory.prototype */ {

    /**
     * It handles the connection and deconnection of actions and triggers
     * for a screen
     * @constructs
     */
    initialize: function () {
        /**
         * This contains all the triggers in the screen
         * @type Hash
         * @private
         */
        this._triggers = new Hash();
    },
    // **************** PUBLIC METHODS ***************** //

    /**
     * Creates a new trigger mapping coming from a created pipe.
     * @type Trigger
     */
    createTrigger: function (/** Object */ element) {
        var trigger = this._createFromJSON(element);
        this._triggers.set(trigger.getId(), trigger);
        return trigger;
    },

    /**
     * Removes a trigger from the list. The trigger can be passed as
     * parameter
     * @type Trigger
     */
    removeTrigger: function(/** Object */ element) {
        var trigger;
        if (element.constructor != Trigger && element.constructor != ScreenTrigger) {
            trigger = this._createFromJSON(element);
        } else {
            trigger = element;
        }
        this._triggers.unset(trigger.getId());
        return trigger;
    },

    /**
     * Returns a list of triggers that the instance has connected to each of its
     * actions
     * @type Hash
     */
    getTriggerList: function(/** ComponentInstance */ instance) {
        var result = new Hash();
        this._triggers.values().each(function(trigger) {
           if (trigger.getDestinationId() == instance.getId()) {
               var array = result.get(trigger.getDestinationAction());
               if (!array) {
                   array = new Array();
               }
               array.push(trigger);
               result.set(trigger.getDestinationAction(), array);
           }
        });
        return result;
    },

    /**
     * Returns a list with triggers related to a given instance
     */
    getRelatedTriggers: function(/** ComponentInstance */ instance) {
        var result = new Array();
        this._triggers.values().each(function(trigger) {
            if (trigger.getSourceId() == instance.getId() ||
                trigger.getDestinationId() == instance.getId()) {
                    result.push(trigger);
                }
        });
        return result;
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * @private
     */
    _createFromJSON: function(element) {
        var trigger;
        if (element.from.instance == ScreenTrigger.INSTANCE_NAME) {
            trigger = new ScreenTrigger(element.to);
        } else {
            trigger = new Trigger(element.from, element.to);
        }
        return trigger;
    }
});
