var PrePostPane = Class.create( /** @lends PrePostPane.prototype */ {
    /**
     * This class handles the pre/post inspector
     * @constructs
     */ 
    initialize: function(/** DOMNode */ parentNode) {
        /** 
         * Variable
         * @type Table
         * @private @member
         */
        this._propertiesTable = new Table (parentNode, 'PRE/POST', 'center');
        
        this._propertiesTable.insertFieldTitles(['','PRE Name','Description', 'Semantics']);
        this._propertiesTable.insertFieldTitles(['','POST Name','Description', 'Semantics']);
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * This function updates the table with data coming from
     * the currently selected element
     */
    selectElement: function () {
        //TODO
    },

    /**
     * This function empties the table 
     */
    clearElement: function (){
        this._propertiesTable.emptyTable();

        this._propertiesTable.insertFieldTitles(['','PRE Name','Description', 'Semantics']);
        this._propertiesTable.insertFieldTitles(['','POST Name','Description', 'Semantics']);
    }
    // **************** PRIVATE METHODS **************** //

    
});

// vim:ts=4:sw=4:et:
