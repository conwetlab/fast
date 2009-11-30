var BuildingBlock = Class.create({
    initialize: function(screenId, buildingBlockId){
		this.screenId = screenId;
		this.buildingBlockId = buildingBlockId;
		ScreenEngineFactory.getInstance(screenId).addBuildingBlock(this.buildingBlockId, this);
    },
    
    manageData: function(triggers, addedFacts, deletedFacts){
    	ScreenEngineFactory.getInstance(this.screenId).manageData(triggers, addedFacts,deletedFacts, this.buildingBlockId);
    }
});