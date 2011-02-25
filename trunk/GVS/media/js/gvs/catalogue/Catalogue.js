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
 * Local catalogue
 * @constructs
 * @static
 */
var Catalogue = Class.create();

// **************** STATIC ATTRIBUTES **************** //

Object.extend(Catalogue, {
    /**
     * BuildingBlock factories
     * @type Hash
     * @private
     */
    _factories: {
        'screen': new ScreenFactory(),
        'screenflow': new ScreenflowFactory(),
        'domainConcept': new DomainConceptFactory(),
        'form': new FormFactory(),
        'resource': new ResourceFactory(),
        'operator': new OperatorFactory()
    }
});

// **************** STATIC METHODS ******************* //

Object.extend(Catalogue, {

    // **************** PUBLIC METHODS **************** //

    /**
     * Gets a building block factory for a given type of building blocks
     * @type BuildingBlockFactory
     * @public
     */
    getBuildingBlockFactory: function(/** String */buildingBlockType) {
        return this._factories[buildingBlockType];
    },

    getFacts: function() {
        var onSuccess = function(response) {
            var factMetadata = response.responseText.evalJSON();
            FactFactory.setFacts(factMetadata);
        };
        var onError = function(response, e) {
            console.error(e);
        };

        PersistenceEngine.sendGet(URIs.catalogueGetFacts, this, onSuccess, onError);
    },

    getDomainConcepts: function() {
        var onDConceptsSuccess = function(response){
            var domainConceptMetadata = response.responseText.evalJSON();
            this.getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT).
                updateBuildingBlockDescriptions(domainConceptMetadata.domainConcepts);
            var paletteController = GVS.getDocumentController().getCurrentDocument().
                getPaletteController();
            var domainConceptPalette = paletteController.
                getPalette(Constants.BuildingBlock.DOMAIN_CONCEPT);
            domainConceptPalette.paintComponents();
        };
        var onDConceptsError = function(response, e) {
            console.error(e);
        };

        PersistenceEngine.sendGet(URIs.catalogueGetDomainConcepts,
            this, onDConceptsSuccess, onDConceptsError);
    }
});

// vim:ts=4:sw=4:et:
