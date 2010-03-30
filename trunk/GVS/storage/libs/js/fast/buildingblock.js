var BuildingBlock = Class.create({
    initialize: function(screenId, buildingBlockId, parameter) {
        this.screenId = screenId;
        this.buildingBlockId = buildingBlockId;

        try {
            var json = parameter.replace(new RegExp('/\\*([^\\*]|\\*[^/]).*\\*/', 'g'), '');
            json = json.replace(new RegExp('//[^\n\r]*', 'g'), '');

            this.parameter = json.evalJSON(json);
        } catch (e) {
            this.parameter = parameter;
        }
        ScreenEngineFactory.getInstance(screenId).addBuildingBlock(this.buildingBlockId, this);
    },

    manageData: function(triggers, addedFacts, deletedFacts) {
        ScreenEngineFactory.getInstance(this.screenId).manageData(triggers, addedFacts,deletedFacts, this.buildingBlockId);
    }
});