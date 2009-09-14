var BuildingBlockDescription = Class.create(
    /** @lends BuildingBlockDescription.prototype */ {
    
    /**
     * Generic building block description. All the building block classes extends
     * this one.
     * @constructs
     */
    initialize: function(/** Hash */ properties) {
        // copying all the properties
        $H(properties).each(
            function (pair){
                this[pair.key] = pair.value;
            }.bind(this)
        );
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
    }


    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
