var InspectorPane = Class.create( /** @lends InspectorPane.prototype */ {
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
        this._propertiesTable = new Table (parentNode, 'Fact Inspector', 'right');
        
        this._propertiesTable.insertFieldTitles(['','Name','Description', 'Semantics']);
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * This function adds a new fact
     */
    addFact: function () {
        //TODO
    },

    /**
     * This function removes a fact
     */
    removeFact: function (){
    }
    // **************** PRIVATE METHODS **************** //

    
});

// vim:ts=4:sw=4:et:
