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
     * a JSON-like object
     * @type Object
     */
    toJSON: function() {
        var result = {};
        $H(this).each(function(pair) {
            if (!(pair.value instanceof Function)) {
                result[pair.key] = pair.value;
            }
        });

        return result;

    },

    /**
     * Return the field to order the building block in the catalogue
     * @type String
     */
    getOrder: function() {
        return this.getTitle();
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
    },

    /**
     * For document descriptions, return the existing canvas instancies
     */
    getCanvasInstances:function() {
        return [];
    },

    /**
     * For document descriptions, return the existing canvas instancies
     */
    getConditionInstances:function() {
        return [];
    },

    getPreconditionsList: function() {
        if (! this.actions) {
            return this._getConditionsList("preconditions");
        }
        var result = [];
        $A(this.actions).each(function(action) {
            $A(action.preconditions).each(function(p){ result.push(p); });
        });
        return result;
    },

    getPostconditionsList: function() {
        return this._getConditionsList("postconditions");
    },

    // **************** PRIVATE METHODS **************** //

    _getConditionsList: function(type){
        if (this[type].length > 1){ //More than one set of conditions
            console.log("OR support not implemented yet");
            return null;
        }
        return this[type][0];
    }

});

// vim:ts=4:sw=4:et:
