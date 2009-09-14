var ScreenflowDescription = Class.create(BuildingBlockDescription,
    /** @lends ScreenflowDescription.prototype */ {

    /**
     * Screenflow building block description.
     * TODO: replace with the object the remote catalogue will send
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        this.screens = new Hash();
        this.description = new Hash();
        this.label = new Hash();
        this.domainContext = new Array();
        
        $super(properties);
    },
    
    /**
     * Adds a new screen.
     * @param ScreenDescription
     *      Screen to be added to the
     *      Screenflow document.
     */
    addScreen: function (/** String */ uri, /**Object*/ position) {
        this.screens.set(uri,{
            "screen": uri,
            "position":position
        });
    },

    /**
     * Delete a screen.
     * @param ScreenDescription
     *      Screen to be deleted from the
     *      Screenflow document.
     */
    removeScreen: function(/** String */ id) {
        this.screens.unset(id);
    },

    /**
     * Returns the screenflowDescription coded in JSON
     * @type {String}
     */    
    // TO BE REFACTORIZED TO SEVERAL METHODS
    /*
    toJSON: function () {
        // TODO: Include all the fields
        var data = new Object();
        //data.uri = this.getUri();
        data.label = this.getLabel();
        data.description = this.getDescription();
        data.creator = this.getCreator();
        data.version = this.getVersion();
        data.preconditions = this.getPreconditions();
        data.postconditions = this.getPostconditions();
        data.definition = new Object();
        data.definition.screens = this.getScreenDescriptions();
        return Object.toJSON(data);
    },
    */
   
    /**
     * Creates a gadget deployment from the ScreenflowDescription
     * @public
     * FIXME: FF. Move to another place
     */
    deployGadget: function () {
        console.log("gadget deployment");
        var screensdesc = this.getScreenDescriptions();
        var screenList = '';
        for(i=0;i<screensdesc.length;i++){
            console.log(screensdesc[i].label['en-gb']);
            screenList += screensdesc[i].label['en-gb'] + ",";
        }

        function onSuccess(transport) {
            GVSSingleton.getInstance().getDocumentController().createDeploymentDocument(transport.responseText);
        }

        function onError(transport, e) {
            Logger.serverError(transport,e);
        }

        var datajson = this.toJSON();
        var result = {gadget: datajson};
        console.log(result);
        console.log(datajson);
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.sendPost(URIs.deploy, result,null, this, onSuccess, onError);
    }
});

// vim:ts=4:sw=4:et: 