var Deployer = Class.create( /** @lends Deployer.prototype */ {
    /**
     * On charge of deploying screenflows to the mashup platform.
     * @constructs
     */ 
    initialize: function() {
        /** 
         * @type StoreGadgetDialog
         * @private @member
         */
        this._storeGadgetDialog = new StoreGadgetDialog(this._onStoreGadgetCallback.bind(this));
        
        /** 
         * @type DeployGadgetDialog
         * @private @member
         */
        this._deployGadgetDialog = new DeployGadgetDialog();       
        
        /**
         * @type ScreenflowDescription
         * @private @member
         */ 
        this._description = null;
    },
    

    // **************** PUBLIC METHODS **************** //

    /**
     * Creates a gadget deployment from the ScreenflowDescription
     * @public
     */
    deployGadget: function (/** ScreenflowDescription */ description) {
        this._description = description;
        this._storeGadgetDialog.show(description.label['en-gb']);
    }, 

    // **************** PRIVATE METHODS **************** //

    _onStoreGadgetCallback: function(/** Object */ data) {       
        // TODO: save screenflow / flush state
        // TODO: publish screenflow
        
        this._storeGadget(data);        
    },
    
    _storeGadget: function(/** Object */ data) {
        var label = {
            'en-GB': data.label
        };
        var storeParams = data;
        storeParams.label = label;
        
        storeParams.definition = new Object();
        storeParams.definition.screens = this._description.getScreenUris();
        
        // TODO: precondition list
        //storeParams.preconditions = ;
        
        // TODO: postcondition list
        //storeParams.postconditions = ;
        
        // Just in case
        storeParams = {
            'gadget': Object.toJSON(storeParams)
        };        
        
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.sendPost(URIs.store, storeParams, null, 
                this, this._onStoreSuccess, this._onError);
    },
    
    _onStoreSuccess: function(/** XMLHttpRequest */ transport) {
        this._deployGadgetDialog.show(new Element('div').update(transport.responseText));
    },
    
    _onError: function(/** XMLHttpRequest */ transport, /** Exception */ e) {
        Logger.serverError(transport, e);
    }
    
});

// vim:ts=4:sw=4:et:
