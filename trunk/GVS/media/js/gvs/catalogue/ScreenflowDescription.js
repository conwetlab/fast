var ScreenflowDescription = Class.create(BuildingBlockDescription,
    /** @lends ScreenflowDescription.prototype */ {

    /**
     * Screenflow building block description.
     * TODO: replace with the object the remote catalogue will send
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        var mine = this;
        mine['screens'] = new Hash();
        mine['connectors'] = new Hash();
        mine['description'] = new Hash();
        mine['label'] = new Hash();
        mine['domainContext'] = [];
        mine['creator']='';
        mine['version']='';
        $super(properties);
    },

    /**
     * Creates a new screenflow component
     * @override
     */
    createPaletteComponent: function () {
        //TODO: create class ScreenflowComponent
        return new ScreenflowComponent(this);
    },

    /**
     * Creates a new screenflow view
     * @override
     */    
    createView: function () {
        //TODO: create class ScreenflowView
        return new ScreenflowView(this);
    },
    
    /**
     * Adds a new screen.
     * @param ScreenDescription
     *      Screen to be added to the
     *      Screenflow document.
     */
    addScreen: function (/** String */ id, /** String */ screen_uri, /**Object*/ position) {
        if(screen_uri!=null) {
            var screenInfo = {
                "screen":screen_uri,
                "position":position
            };
            this['screens'].set(id,screenInfo);
        }
    },

    /**
     * Delete a screen.
     * @param ScreenDescription
     *      Screen to be deleted from the
     *      Screenflow document.
     */
    deleteScreen: function(/** String */ id) {
        this.screens.unset(id);
    },

    /**
     * Returns the screens of the screenflowdescription
     * @type {ScreenDescription[]}
     */
    getScreens: function () {
        return this['screens'];
    },

    /**
     * Returns the screens of the screenflowdescription
     * @type {ScreenDescription[]}
     */
    getScreenDescriptions: function () {
        var screenUris = new Array();
        $H(this.getScreens()).each(function(pair){
            screenUris.push(pair.value.screen);
        });
        /* TODO: equal screensdescriptions are deleted for convenience
         * of the deployment. When "equal screens" can be deployed in 
         * the same gadget, fix this. */
        screenUris = screenUris.uniq();
        var screens = CatalogueSingleton.getInstance().getBuildingBlockFactory(Constants.BuildingBlock.SCREEN).getBuildingBlocks(screenUris);
        return screens;
    },

    /**
     * Adds a new Label.
     * @param Tag
     *      Tag to be labeled
     * @param Value
     *      Value 
     */      
    setLabel: function (tag, value) {
        this['label'].set(tag,value);
    },

    /**
     * Returns the Screenflow Label.
     */      
    getLabel: function () {
        return this['label'];
    },

    /**
     * Set the Screenflow Version.
     * @param Version
     */      
    setVersion: function (version) {
        this['version'] = version;
    },
    
    /**
     * Returns the Screenflow Version.
     */      
    getVersion: function () {
        return this['version'];
    },
    
    /**
     * Sets all the Domain Context.
     * @param domainContexts
     *      Strings containing the domain contexts
     */      
    setDomainContext: function (domainContexts) {
        var domainContext = "";
        var domainContextsArray = domainContexts.split(",");
        for(var i = 0; i < domainContextsArray.length ; i++) {
            domainContext = domainContextsArray[i].strip();
            if(domainContext && domainContext!=""){
                this.addDomainContext(domainContext);
            }
        }
    },
    
    /**
     * Adds a new Domain Context.
     * @param domainContext
     */
    addDomainContext: function (domainContext) {
        if(domainContext!=null) {
            this.domainContext.push(domainContext);
        }
    },
    
    /**
     * Returns the Screenflow Domain Contexts
     * @type {[]}
     */
    getDomainContext: function () {
        return this['domainContext'];
    },
    
    /**
     * Set the Screenflow Creator.
     * @param Creator
     */      
    setCreator: function (creator) {
        this['creator']=creator;
    },
    
    /**
     * Returns the Screenflow Creator.
     */      
    getCreator: function () {
        return this['creator'];
    },
    
    /**
     * Adds a new Description.
     * @param Tag
     * @param Value 
     */      
    setDescription: function (tag, value) {
        this['description'].set(tag,value);
    },
    
    /**
     * Returns the screenflow description.
     */      
    getDescription: function () {
        return this['description'];
    },
    
    /**
     * Sets the screenflow URI.
     * @param uri
     */      
    setUri: function (uri) {
        this['uri']=uri;
    },
    
    /**
     * Returns the screenflow URI.
     */      
    getUri: function () {
        return this['uri'];
    },

    /**
     * Adds a new connector.
     * @param Connector
     *      Connector to be added to the
     *      Screenflow description.
     */
    addConnector: function ( id, connector, position) {
        if(connector!=null) {
            var connectorInfo = {
                'connector': connector,
                'position': position
            };
            this['connectors'].set( id, connectorInfo);
        }
    },

    /**
     * Updates a connector.
     * @param Precondition
     *      Precondition to be added to the
     *      Screenflow description.
     */
    updateConnector: function ( id, connector, position) {
        if(connector!=null) {
            if (this['connectors'].get(id) != undefined){
                var connectorInfo = {
                    'connector': connector,
                    'position': position
                };
                this['connectors'].set( id, connectorInfo);
            }
        }
    },

    /**
     * Delete a precondition.
     * @param Precondition Id
     *      Precondition to be deleted from the
     *      Screenflow description.
     */
    deleteConnector: function( id ) {
        this['connectors'].unset(id);
    },
    
    /**
     * Returns the connectors of the screenflowdescription
     * @type {connectors[]}
     */
    getConnectors: function () {
        return this['connectors'];
    },

    /**
     * Returns the preconditions of the screenflowdescription
     * @type {Preconditions[]}
     */
    getPreconditions: function () {
        var precDescs = new Array();
        $H(this.getConnectors()).each(function(pair){
            if (pair.value.connector.getProperties().get('type')=='In'){
                precDescs.push(pair.value.connector.getProperties());
            }
        });
        precDescs = precDescs.uniq();
        return precDescs;
    },
    
    /**
     * Returns the postconditions of the screenflowdescription
     * @type {Postconditions[]}
     */
    getPostconditions: function () {
        var postDescs = new Array();
        $H(this.getConnectors()).each(function(pair){
            if (pair.value.connector.getProperties().get('type')=='Out'){
                postDescs.push(pair.value.connector.getProperties());
            }
        });
        postDescs = postDescs.uniq();
        return postDescs;
    },

    /**
     * Returns the screenflowDescription coded in JSON
     * @type {String}
     */    
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
        //data.definition.connectors = ;
        return Object.toJSON(data);
    },
    
    /**
     * Creates a gadget deployment from the ScreenflowDescription
     * @public
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
            //TODO: develop onError function
            var msg;
            if (e) {
                msg = "JavaScript exception on file #{errorFile} (line: #{errorLine}): #{errorDesc}".interpolate(
                                  {errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e});
            } else if (transport.responseXML) {
                msg = transport.responseXML.documentElement.textContent;
            } else if (transport.responseText){
                msg = transport.responseText;
            } else {
                msg = "HTTP Error " + transport.status + " - " + transport.statusText;
            }
            msg = "Error creating a gadget: #{errorMsg}.".interpolate({errorMsg: msg});
            
            //TODO create Logmanagerfactory
            //LogManagerFactory.getInstance().log(msg);
            alert (msg);
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