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
     * This function returns an array of lines representing the
     * key information of the building block, in order to be shown in
     * a table
     * @type Hash
     */
    getInfo: function () {
        throw 'Abstract Method invocation. ' +
            'BuildingBlockDescription :: getInfo';    
    },
    
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
        
    }

    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
