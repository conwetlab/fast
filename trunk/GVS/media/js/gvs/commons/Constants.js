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
var Constants = {
    BuildingBlock: {
        SCREEN: 'screen',
        SCREENFLOW: 'screenflow',
        DOMAIN_CONCEPT: 'domainConcept',
        FORM: 'form',
        OPERATOR: 'operator',
        RESOURCE: 'resource'
    },
    BuildingBlockNames: {
        'screen': 'Screens',
        'domainConcept': 'Domain Concepts',
        'form': 'Forms',
        'operator': 'Operators',
        'resource': 'Services & Resources'
    },
    CatalogueCopies: {
        'screen': 'screens',
        'form': 'forms',
        'operator': 'operators',
        'resource': 'backendservices'
    }
};
Constants.CatalogueRelationships =  {
    "backendservices": Constants.BuildingBlock.RESOURCE,
    "forms": Constants.BuildingBlock.FORM,
    "operators": Constants.BuildingBlock.OPERATOR
};


