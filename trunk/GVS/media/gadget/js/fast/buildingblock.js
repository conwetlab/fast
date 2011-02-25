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
var BuildingBlock = Class.create({
    initialize: function(screenId, buildingBlockId, parameter) {
        this.screenId = screenId;
        this.buildingBlockId = buildingBlockId;

        try {
            this.parameter = cjson_parse(json);
        } catch (e) {
            this.parameter = parameter;
        }
        ScreenEngineFactory.getInstance(screenId).addBuildingBlock(this.buildingBlockId, this);
    },

    manageData: function(triggers, addedFacts, deletedFacts) {
        ScreenEngineFactory.getInstance(this.screenId).manageData(triggers, addedFacts,deletedFacts, this.buildingBlockId);
    }
});
