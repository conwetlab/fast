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
var DomainConceptFactory = Class.create(BuildingBlockFactory,
    /** @lends DomainConceptFactory.prototype */ {

    /**
     * Factory of domain concept building blocks.
     * @constructs
     * @extends BuildingBlockFactory
     */
    initialize: function($super) {
        $super();

    },

    /**
     * Gets the type of building block this factory mades.
     * @type String
     * @override
     */
    getBuildingBlockType: function (){
        return Constants.BuildingBlock.DOMAIN_CONCEPT;
    },

    // **************** PUBLIC METHODS **************** //
    /**
     * @override
     */
    getBuildingBlocks: function(/** Array */ tags, /** Function */ callback){
        var url = this._createUrl(tags);
        PersistenceEngine.sendGet(url,
                {
                    'callback': callback
                },
                this._onSuccess, this._onError);
    },

    // **************** PUBLIC METHODS **************** //

    _createUrl: function(/** Array */ tags){
        if (tags.size() > 0) {
            var processedTags = tags.collect(function(tag) {
                return tag.label['en-gb'];
            }).join("+");
            return URIs.catalogueTagConcepts.replace('<tags>', processedTags);
        } else {
            return URIs.catalogueAllConcepts;
        }
    },

    _onSuccess: function (/** XMLHttpRequest */ transport) {
        var metadata = transport.responseText.evalJSON();
        var result = new Array();

        $A(metadata).each(function(conceptProperties) {
            result.push(new PrePostDescription(conceptProperties));
        });
        this.callback(result);
    },

    _onError: function (/**XMLHttpRequest*/ transport, /** Exception */ e) {
        Logger.serverError(transport, e);
    }

});

// vim:ts=4:sw=4:et:
