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
        this._propertiesTable = new Table(parentNode, 'Properties', 'left');
        
        this._propertiesTable.insertFieldTitles(['Property','Value']);
        
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * This function updates the table with data coming from
     * the currently selected element
     * @param element
     *          Something implementing TableModel interface
     *              * String getTitle()
     *              * Array getInfo()
     */
    fillTable: function (/** Object */ element) {
        this._clearElement();

        var title = element.getTitle();
       
        this._propertiesTable.insertDataValues(element.getInfo());
        this._propertiesTable.setTitle((title ? 'Properties of '  + title : 'Properties'));
    },

    // **************** PRIVATE METHODS **************** //
    
    /**
     * This function empties the table
     * @private
     */
    _clearElement: function (){
        this._propertiesTable.emptyTable();
        this._propertiesTable.setTitle('Properties');
        this._propertiesTable.insertFieldTitles(['Property','Value']);
    }

    
});

// vim:ts=4:sw=4:et:
