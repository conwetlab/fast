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