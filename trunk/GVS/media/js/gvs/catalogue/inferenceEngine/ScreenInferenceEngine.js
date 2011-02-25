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
var ScreenInferenceEngine = Class.create( /** @lends ScreenInferenceEngine.prototype */ InferenceEngine, {
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



    // **************** PRIVATE METHODS **************** //
     /**
     * Creates a body to be sent in an AJAX call to the
     * catalogue
     * @private
     * @overrides
     * @type String
     */
    _constructBody: function(/**Array*/ canvas, /** Object */ elements,
                    /** Array */ tags,
                    /** String*/ criteria, /** String(Optional) */ _method) {
        var method = Utils.variableOrDefault(_method, "findcheck");
        /*var domainContext = {
            'tags': tags,
            'user': GVS.getUser().getUserName()
        };*/

        var domainContext = {
            'tags': tags.collect(function(tag){ return tag.label['en-gb']; }),
            'user': GVS.getUser().getUserName()
        };
        var body = {
            'canvas': canvas,
            'domainContext': domainContext,
                'criterion': criteria
        };
        var actions = ["check"];

        if (method == "findcheck") {
            actions.push("find");
            if (GVS.getUser().getiServe()) {
                actions.push("iserve");
            }

        }
        body.actions = actions;
        body = Object.extend(body, elements);
        return Object.toJSON(body);
    },

    /**
     * Gets the uri for a given operation
     * @private
     * @overrides
     */
    _getUri:function (/** String */ operation) {
        return URIs.catalogueScreenFindCheck;
    },

    /**
     * onSuccess callback
     * @private
     * @overrides
     */
    _findCheckOnSuccess: function(/** XMLHttpRequest */ transport){
        var result = JSON.parse(transport.responseText);

        if (result.canvas && result.canvas.length > 0) {
            // There is some reachability information
            this.mine._updateReachability(result.canvas);
            if (!GVS.getUser().getCatalogueMagic()) {
                var paletteComponents = result.forms.concat(result.operators,
                result.backendservices);
                this.mine._updateReachability(paletteComponents);
            }
        }

        this.callback(result);
    },

    /**
     * onSuccess callback
     * @private
     * @overrides
     */
    _checkOnSuccess: function(transport){
        try {
             var result = JSON.parse(transport.responseText);
             this.mine._updateReachability(result.canvas);
             this.callback(result);
        }
        catch (e) {

        }
    }
});

// vim:ts=4:sw=4:et:
