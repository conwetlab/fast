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
var ScreenflowInferenceEngine = Class.create(InferenceEngine /** @lends ScreenflowInferenceEngine.prototype */, {
    /**
     * This class handles the reachability and recommendation of building blocks
     * It communicates with the serverside catalogue to retrieve this information
     * @extends InferenceEngine
     * @constructs
     */
    initialize: function($super) {
        $super();
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * This function calls the catalogue to create a plan for a given screen
     */
    getPlans: function(/** Array */ canvas, /** Array */ goal,
                        /** Function */ handler) {
        var body = {
            "goal": goal,
            "canvas": canvas
        };
        var bodyJSON = Object.toJSON(body);
        PersistenceEngine.sendPost(URIs.cataloguePlanner, null, bodyJSON, {'handler': handler},
                                    this._planOnSuccess, this._onError);
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * plan onSuccess
     * @private
     */
    _planOnSuccess: function(transport) {
        var result = JSON.parse(transport.responseText);
        this.handler(result);
    },


    /**
     * Creates a body to be sent in an AJAX call to the
     * catalogue
     * @private
     * @overrides
     * @type String
     */
    _constructBody: function(/**Array*/ canvas, /** Array*/ elements,
                    /** Array */ tags,
                    /** String*/ criteria) {

        /*var domainContext = {
            'tags': tags,
            'user': GVS.getUser().getUserName()
        };*/

        var domainContext = {
            'tags': tags.collect(function(tag){ return tag.label['en-gb']}),
            'user': GVS.getUser().getUserName()
        }
        var body = {
            'domainContext': domainContext,
            'criterion': criteria
        };
        body = Object.extend(body, elements);
        body.canvas.screens = canvas;
        return Object.toJSON(body);
    },

    /**
     * Gets the uri for a given operation
     * @private
     * @overrides
     */
    _getUri:function (/** String */ operation) {
        switch(operation) {
            case "findCheck":
                return URIs.catalogueScreenflowFindCheck;
                break;
            case "check":
                return URIs.catalogueScreenflowCheck;
                break;
            default:
                return "";
        }
    },

    /**
     * onSuccess callback
     * @private
     * @overrides
     */
    _findCheckOnSuccess: function(/**XMLHttpRequest*/ transport){
        var result = JSON.parse(transport.responseText);
        if (result.results) {
            var paletteElements = result.results;
        } else {
            var paletteElements = [];
        }

        var allElements = paletteElements.clone();

        result.canvas.screens.each(function(bb) {
            var found = allElements.detect(function(element) {
                return (element.uri == bb.uri);
            });
            if (!found) {
                allElements.push(bb);
            }
        });
        result.palette.each(function(el) {
            var found = allElements.detect(function(element) {
                return (element.uri == el.uri);
            });
            if (!found) {
                allElements.push(el);
            }
        });


        this.mine._updateReachability(allElements);

        // Notifying about new uris
        var screenURIs = new Array();
        $A(paletteElements).each(function(element) {
           screenURIs.push(element.uri);
        });

        this.callback(screenURIs, result);
    },

    /**
     * onSuccess callback
     * @private
     * @overrides
     */
    _checkOnSuccess: function(transport){
        var result = JSON.parse(transport.responseText);
        var elements = result.palette.concat(result.canvas.screens).uniq();

        this.mine._updateReachability(elements);
        this.callback();
    }
});

// vim:ts=4:sw=4:et:
