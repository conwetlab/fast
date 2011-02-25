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
/**
 * <p>This class implements the Singleton Design Pattern to make sure there is
 * only one instance of the class %%CLASSNAME%%.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var instance = %%CLASNAME%%Singleton.getInstance();
 */
var %%CLASSNAME%%Singleton = function() {
    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;


    var %%CLASSNAME%% = Class.create( /** @lends %%CLASSNAME%%Singleton-%%CLASSNAME%%.prototype */ {
        /** @constructs */
        initialize: function() {

            /**
             * Private variable
             * @type String
             * @private @member
             */
            this._privateVar = null;
        },


        // **************** PUBLIC METHODS **************** //


        /**
         * foo
         */
        foo: function () {
        },


        // **************** PRIVATE METHODS **************** //


        /**
         * bar
         * @private
         */
        _bar: function () {
        }

    });


    return new function() {
        /**
         * Returns the singleton instance
         * @type %%CLASSNAME%%
         */
        this.getInstance = function() {
            if (_instance == null) {
                _instance = new %%CLASSNAME%%();
            }
            return _instance;
        }
    }
}();

// vim:ts=4:sw=4:et:
