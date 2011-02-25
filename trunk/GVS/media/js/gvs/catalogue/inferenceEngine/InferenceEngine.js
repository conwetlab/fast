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
var InferenceEngine = Class.create( /** @lends InferenceEngine.prototype */ {
    /**
     * This abstract class represents an inference engine as a proxy for the
     * catalogue, handling the reachability and recommendation of building blocks
     * @constructs
     * @abstract
     */
    initialize: function() {
        /**
         * This stores the reachability data
         * @type Hash
         * @private @member
         */
        this._reachabilityData = new Hash();

        /**
         * Listeners list hashed by resource URI
         * @type Hash
         * @private @member
         */
        this._listeners = new Hash();
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * This function calls findAndCheck in the catalogue and calls a
     * callback upon completion.
     */
    findCheck: function (/**Array*/ canvas, /** Array*/ elements,
                         /** Array */ tags,
                         /** String*/ criteria,
                         /** Function */ callback) {

        var body = this._constructBody(canvas, elements, tags, criteria);
        var context = {
            'callback': callback,
            'mine': this
        };
        PersistenceEngine.sendPost(this._getUri("findCheck"), null, body,
                context, this._findCheckOnSuccess, this._onError);
    },

    /**
     * This function calls the check operation in the catalogue
     */
    check: function (/**Array*/ canvas, /** Object */ elements,
                    /** Array */ tags,
                    /** String*/ criteria,
                    /** Function */ callback) {
        var body = this._constructBody(canvas, elements, tags, criteria, "check");
        var context = {
            'callback': callback,
            'mine': this
        };
        PersistenceEngine.sendPost(this._getUri("check"), null, body, context,
                                    this._checkOnSuccess, this._onError);
    },

    /**
     * Register an object for interest on the reachability of a URI-identified
     * resources. The listener object must implement these methods:
     *
     *    void setReachability(Hash reachabilityData);
     *
     * Reachability data vary for different resource types:
     *   * Screens: TODO
     *   * ...
     */
    addReachabilityListener: function(/** String */ uri, /** Object */ listener) {
        this._getListenerList(uri).push(listener);

        if (this._reachabilityData.get(uri)) {
            listener.setReachability(this._reachabilityData.get(uri));
        }
    },

    /**
     * De-register an object from the reachability listeners
     */
    removeReachabilityListener: function (/** String  */uri, /** Object */ listener) {
        var index = this._getListenerList(uri).indexOf(listener);

        if (index >= 0) {
            //Remove the element
            this._listeners.get(uri)[index] = null;
            this._listeners.set(uri,this._listeners.get(uri).compact());
        }
    },

    /**
     * Returns the reachability information about
     * the preconditions of a given screen
     * @type Hash
     */
    getPreconditionReachability: function(/** String */ uri) {
        var reachabilityData = this._reachabilityData.get(uri);
        var result = new Hash();
        if (reachabilityData) {
            if (reachabilityData.preconditions) {
                var preconditions = reachabilityData.preconditions;
                $A(preconditions).each(function(pre) {
                    var uri = Utils.extractURIfromPattern(pre.pattern);
                    result.set(uri, pre.satisfied);
                });
            } else {
                if (reachabilityData.actions) {
                    $A(reachabilityData.actions).each(function(action) {
                        $A(action.preconditions).each(function(pre) {
                            var uri = Utils.extractURIfromPattern(pre.pattern);
                            result.set(uri,pre.satisfied);
                        });
                    });
                } else {
                    console.log("unknown reachability data format");
                }
            }
        }
        return result;
    },

    /**
     * Returns a boolean determining if a building block is reachable
     * by its uri
     * @type Boolean
     */
     isReachable: function (/** String */ uri) {
         var reachabilityData = this._reachabilityData.get(uri);
         if (reachabilityData) {
            return reachabilityData.reachability;
         } else {
            return null;
         }
     },

    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a body to be sent in an AJAX call to the
     * catalogue
     * @private @abstract
     * @type String
     */
    _constructBody: function(/**Array*/ canvas, /** Object */ elements,
                    /** Array */ tags,
                    /** String*/ criteria) {
        throw "Abstract Method invocation: InferenceEngine::_constructBody";
    },

    /**
     * Gets the uri to be called
     * @private @abstract
     * @type String
     */
    _getUri: function (/** String */ operation) {
        throw "Abstract Method invocation: InferenceEngine::_getUri";
    },


    /**
     * onSuccess callback
     * @private
     * @abstract
     */
    _findCheckOnSuccess: function(/**XMLHttpRequest*/ transport){
        throw "Abstract method invocation: InferenceEngine::_findCheckOnSuccess";
    },

    /**
     * onSuccess callback
     * @private
     * @abstract
     */
    _checkOnSuccess: function(transport){
        throw "Abstract method invocation: InferenceEngine::_CheckOnSuccess";
    },

    /**
     * Error handler
     * @private
     */
    _onError: function(transport, e) {
        var message;
        if (e) {
            message = e;
        } else {
            message = "Catalogue cannot load";
        }
        Utils.showMessage("Something went wrong: " + message, {
            'error': true,
            'hide': true
        });
        Logger.serverError(transport,e);
    },

    /**
     * Returns a list of listeners of an uri
     * @private
     */
    _getListenerList: function (/** String */ uri) {
        var list = this._listeners.get(uri);
        if (!list) {
            list = new Array();
            this._listeners.set(uri, list);
        }
        return list;
    },
    /**
     * Updates and notifies the reachability
     * of a list of elements
     * @private
     */
    _updateReachability: function(/** Array */ elements) {
        elements.each(function(element) {
            if (element instanceof Object) {
                this._reachabilityData.set(element.uri, element);
                this._notifyReachability(element.uri);
            } else {
                this._reachabilityData.set(element, true);
                this._notifyReachability(element);
            }
        }.bind(this));
    },

    /**
     * Notifies the reachability information to all the relevant
     * listeners
     * @private
     */
    _notifyReachability: function(/** String */ uri) {
        this._getListenerList(uri).each(function(listener) {
            listener.setReachability(this._reachabilityData.get(uri));
        }.bind(this));
    }
});

// vim:ts=4:sw=4:et:
