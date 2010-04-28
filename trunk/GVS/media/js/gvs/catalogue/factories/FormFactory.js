var FormFactory = Class.create(BuildingBlockFactory,
    /** @lends FormFactory.prototype */ {

    /**
     * Factory of Form building blocks.
     * @constructs
     * @extends BuildingBlockFactory
     */
    initialize: function($super) {
        $super();

         /**
         * Hash table (organized by URI)
         * containing all the BB descriptions
         * @type Hash
         * @private @member
         */
        this._buildingBlockDescriptions = new Hash();

    },

    // **************** PUBLIC METHODS **************** //
    /**
     * Gets the type of building block this factory mades.
     * @type String
     * @override
     */
    getBuildingBlockType: function (){
        return Constants.BuildingBlock.FORM;
    },


    /**
     * Gets building block descriptions by URI
     * @type {BuildingBlockDescription[]}
     * @override
     */
    getBuildingBlocks: function (/** Array */ uris) {
        var result = new Array();
        $A(uris).each(function(uri){
            if(this._buildingBlockDescriptions.get(uri)) {
                result.push(this._buildingBlockDescriptions.get(uri));
            } else {
                throw "Ooops. Something went wrong. " +
                    "BuildingBlockFactory::getBuildingBlocks";
            }
        }.bind(this));
        return result;
    },

    /**
     * This function retrieves the pending elements from the serverside
     * catalogue
     */
    cacheBuildingBlocks: function (/** Array */ uris, /** Function */ callback){
        //URIs not already retrieved
        var pendingURIs = new Array();
        $A(uris).each (function (uri){
            if (!this._buildingBlockDescriptions.get(uri)){
                pendingURIs.push (uri);
            }
        }.bind(this));

        if (pendingURIs.size() > 0) {
            var postData = Object.toJSON(pendingURIs);
            PersistenceEngine.sendPost(URIs.catalogueGetMetadata,
                null, postData,
                {
                    'mine': this,
                    'callback': callback
                },
                this._onSuccess, Utils.onAJAXError);
        } else {
            callback();
        }
    },

    /**
     * Gets a new instance of the type of the factory
     * @override
     * @type FormInstance
     */
    getInstance: function(/** BuildingBlockDescription */description, /** InferenceEngine */ engine) {
        return new FormInstance(description, engine);
    },

    // **************** PRIVATE METHODS **************** //



    /**
     * Callback function
     */
    _onSuccess: function(/**XMLHttpRequest*/ transport) {
        var metadata = transport.responseText.evalJSON();
        //update the Form Factory
        this.mine._updateBuildingBlockDescriptions(metadata.forms);
        //call the callback function passed as argument
        this.callback();
    },

    /**
     * This function creates the different Form Descriptions
     * @private
     */
    _updateBuildingBlockDescriptions: function (/** Array */ formDescriptions) {

        for (var i=0; i< formDescriptions.length ; i++) {
            this._buildingBlockDescriptions.set(formDescriptions[i].uri,
                                        new FormDescription (formDescriptions[i]));
        }
    }
});

// vim:ts=4:sw=4:et:
