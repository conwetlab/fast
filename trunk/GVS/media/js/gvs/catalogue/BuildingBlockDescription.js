var BuildingBlockDescription = Class.create(
    /** @lends BuildingBlockDescription.prototype */ {
    
    /**
     * Generic building block description. All the building block classes extends
     * this one.
     * @constructs
     */
    initialize: function(/** Hash */ properties) {
        Utils.addProperties(this, properties);
    },


    // **************** PUBLIC METHODS **************** //
    
    /**
     * Adds properties to the ScreenflowDescription
     */
    addProperties: function(properties) {
        Utils.addProperties(this, properties);
    },
    
    /**
     * This function translate the stored properties into 
     * a JSON-like string
     * @type String
     */
    toJSON: function() {
        var result = {};
        $H(this).each(function(pair) {
            if (!(pair.value instanceof Function)) {
                result[pair.key] = pair.value;                    
            }
        });
        
        return Object.toJSON(result);
        
    },

    /**
     * Implementing the TableModel interface
     * @type String
     */
    getTitle: function() {
        return this.label ? this.label['en-gb'] : this.name;
    },

    /**
     * Returns the id of the building block
     * @type String
     */
    getId: function() {
        return this.id;
    },

    /**
     * This function returns if the data inside the description is valid
     * @type Boolean
     */
    isValid: function() {
        return true;
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
