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
    selectElement: function (/** Hash */ data, /** String */ elementType, /** String */ title) {
        this.clearElement();
        this._propertiesTable.insertDataValues(data);
        this._propertiesTable.setTitle('Properties of ' + elementType + 
                                       ': ' + title);
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
