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
 * only one instance of the class Preferences.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var confirm = ConfirmSingleton.getInstance();
 */
var ConfirmSingleton = function() {

    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;


    var Confirm = Class.create(ConfirmDialog,
        /** @lends ConfirmSingleton-Confirm.prototype */ {

        /**
         * Confirm dialog
         * @constructs
         * @extends ConfirmDialog
         */
        initialize: function($super) {
            $super('Warning');

            /**
             * Callback function to be called
             * @type Function
             * @private @member
             */
            this._callback = null;

            this._contentNode.addClassName("systemDialog");
        },

        /**
         * This function shows a message
         */
        show: function  ($super, /** String */ message, /**Function*/ callback){
            this._contentNode.update(message);
            $super();
            this._callback = callback;
        },
        // *********************** PRIVATE METHODS ******************//
        /**
         * @override
         * @private
         */
        _onOk: function ($super) {
            this._callback(true);
            this._callback = null;
            $super();
        },
        /**
         * @override
         * @private
         */
        _onCancel: function ($super){
            this._callback(false);
            this._callback = null;
            $super();
        },
        /**
         * @override
         * @private
         */
        _initDialogInterface: function () {
            // Do Nothing
        },
        /**
         * @private
         * @override
         */
        _hide: function($super) {
            $super();
            if (this._callback) {
                this._callback(false);
                this._callback = null;
            }
        }
    });

    return new function(){
        /**
         * Returns the singleton instance
         * @type Preferences
         */
        this.getInstance = function(){
            if (_instance == null) {
                _instance = new Confirm();
            }
            return _instance;
        }
    }
}();

// Browser confirm dialog override
if (document.getElementById) {
    //Note that confirm is not blocking anymore
    //so a callback function is needed
    var browserConfirm = window.confirm;
    window.confirm = function(msg, _callback) {
        if (_callback) {
            ConfirmSingleton.getInstance().show(msg,_callback);
        } else{ //In case you don't use the modified version
            browserConfirm(msg);
        }
    }
}


// vim:ts=4:sw=4:et:
