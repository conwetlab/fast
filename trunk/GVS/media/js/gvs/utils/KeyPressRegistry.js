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
var KeyPressRegistry = Class.create( /** @lends KeyPressRegistry.prototype */ {
    /**
     * This class handles the different
     * onKeyPressed listeners, and the enabling and disabling of these events
     * @constructs
     */
    initialize: function() {
        /**
         * Hash of registered handlers
         * @type Hash
         * @private
         */
        this._handlers = new Hash();

        /**
         * The Keypress events are enabled
         */
        this._enabled = true;

        this.setEnabled(this._enabled);
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * This function adds a listener to a specific key
     * or key combination.
     */
    addHandler: function (/** String  */ accelKey, /** Function */ handler) {
        var key = accelKey.toLowerCase();
        if (this._handlers.get(key)) {
            shortcut.remove(key);
        }
        this._handlers.set(key, handler);
        shortcut.add(key, this._executeHandler.bind(this), {'disable_in_input': true});
    },

    /**
     * Asks if a key stroke is being used
     * @type Boolean
     */
    isRegistered: function(/** String */ key) {
        return (this._handler.get(key) ? true : false);
    },

    /**
     * This function removes the handler for a key combination
     */
    removeHandler: function(/** String */ accelKey) {
        var key = accelKey.toLowerCase();
        this._handlers.unset(key);
        //shortcut.remove(key);
    },

    /**
     * This function enables or disables the onkeypress events
     */
    setEnabled: function(/** Boolean */ enabled) {
        this._enabled = enabled;
    },

    // ********************** PRIVATE METHODS ********************* //

    /**
     * This function actually receives the keypress events and calls
     * the handlers when necessary
     * @private
     */
    _executeHandler: function(/** Event */ e, /** String */ key) {
        if (this._enabled && this._handlers.get(key)) {
            this._handlers.get(key)(key);
        }
    }
});

// vim:ts=4:sw=4:et:
