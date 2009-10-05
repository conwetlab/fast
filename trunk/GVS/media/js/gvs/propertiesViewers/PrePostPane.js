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
        this._propertiesTable = new Table(parentNode, 'PRE/POST', 'center');
        
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * This function updates the table with data coming from
     * the currently selected element
     */
    selectElement: function (/** BuildingBlockDescription */ description) {
        this._propertiesTable.emptyTable();
        
        var pres = this._getDataValues('preconditions', description);
        if (pres.size() > 0) {
            this._propertiesTable.insertFieldTitles(['PRE','Description', 'Semantics']);
            this._propertiesTable.insertDataValues(pres);             
        }
        
        var posts = this._getDataValues('postconditions', description);
        if (posts.size() > 0) {
            this._propertiesTable.insertFieldTitles(['POST','Description', 'Semantics']);
            this._propertiesTable.insertDataValues(posts);            
        }
    },

    /**
     * This function empties the table 
     */
    clearElement: function (){
        this._propertiesTable.emptyTable();
    },
    // **************** PRIVATE METHODS **************** //
    /**
     * Creates the data hash to be passed to the
     * table
     * @private
     * @type Hash
     */
    _getDataValues: function(/** String */ type, /** BuildingBlockDescription */ description) {
        var conditions = null;
        if (description[type].length > 1){ //More than one set of conditions
            console.log("OR support not implemented yet");
            return null;
        }
        else {
            conditions = description[type][0];
            
            var factFactory = FactFactorySingleton.getInstance();     
    
            var result = new Array();  
            $A(conditions).each( 
                function(condition) {
                    var fact = factFactory.getFactIcon(condition, "embedded").getNode();
                    var description = condition.label['en-gb'];
                    var semantics = factFactory.getFactUri(condition)
                    result.push([fact, description, semantics]);
                    
                }.bind(this)
            );
            return result;         
        }
    }    
    
});

// vim:ts=4:sw=4:et:
