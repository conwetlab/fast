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
    selectElement: function (/** ComponentInstance */instance) {
        this.clearElement();
        
        var buildingBlockDescription = instance.getBuildingBlockDescription();
        

        var title = "";

        if (buildingBlockDescription.label && buildingBlockDescription.label['en-gb']) {
            title = buildingBlockDescription.label['en-gb'];
        } else if (buildingBlockDescription.name) {
            title = buildingBlockDescription.name;
        }
        this._propertiesTable.insertDataValues(buildingBlockDescription.getInfo());
        this._propertiesTable.setTitle((title ? 'Properties of: '  + title : 'Properties'));
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
