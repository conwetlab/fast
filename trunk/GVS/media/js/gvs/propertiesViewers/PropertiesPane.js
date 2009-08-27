var PropertiesPane = Class.create( /** @lends PropertiesPane.prototype */ {
    /**
     * This class handles the properties pane
     * @constructs
     */ 
    initialize: function(/** DOMNode */ parentNode) {
        /** 
         * Variable
         * @type Table
         * @private @member
         */
        this._propertiesTable = new Table (parentNode, 'Properties', 'left');
        
        this._propertiesTable.insertFieldTitles(['Property','Value']);
        
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * This function updates the table with data coming from
     * the currently selected element
     */
    selectElement: function (/** BuildingBlockInstance */ buildingBlockInstance) {
        this.clearElement();
        
        var buildingBlockDescription = buildingBlockInstance.getBuildingBlockDescription();
        var buildingBlockType = buildingBlockInstance.getBuildingBlockType();
        
        //Data to be set
        var propertiesHash = new Hash();
        var title = "";
        var elementType = "";

        switch(buildingBlockType){
            case Constants.BuildingBlock.SCREEN:

                propertiesHash.set('title',buildingBlockDescription.label['en-gb']);
                propertiesHash.set('id',buildingBlockDescription.uri);
                propertiesHash.set('desc',buildingBlockDescription.description['en-gb']);
                propertiesHash.set('tags',buildingBlockDescription.domainContext.tags);
                title = buildingBlockDescription.label['en-gb'];
                elementType = "screen";
                //this._propertiesPane.selectElement(propertiesHash,"screen",);
                break;

            case Constants.BuildingBlock.CONNECTOR:
                propertiesHash = buildingBlockInstance.getProperties().clone();
                title = propertiesHash.get('type');
                elementType = "connector";
                break;

            case Constants.BuildingBlock.DOMAIN_CONCEPT:
                propertiesHash.set('name',buildingBlockDescription.name);
                propertiesHash.set('description',buildingBlockDescription.description);
                propertiesHash.set('semantics',buildingBlockDescription.semantics);
                title = buildingBlockDescription.name;
                elementType = "domain concept";
                break;

        }
        this._propertiesTable.insertDataValues(propertiesHash);
        this._propertiesTable.setTitle('Properties of ' + elementType + ': ' + title);
    },

    /**
     * This function empties the table 
     */
    clearElement: function (){
        this._propertiesTable.emptyTable();
        this._propertiesTable.setTitle('Properties');
        this._propertiesTable.insertFieldTitles(['Property','Value']);
    }
    // **************** PRIVATE METHODS **************** //

    
});

// vim:ts=4:sw=4:et:
