var ScreenflowDescription = Class.create(ResourceDescription,
    /** @lends ScreenflowDescription.prototype */ {

    /**
     * Screenflow resource description.
     * TODO: replace with the object the remote catalogue will send
     * @constructs
     * @extends ResourceDescription
     */
    initialize: function($super, /** Hash */ properties) {
        var mine = this;
        mine['screens'] = [];
        mine['connectors'] = [];
        mine['description'] = new Hash();
        mine['label'] = new Hash();
        mine['domainContext'] = [];
        mine['creator']='';
        mine['version']='';
        mine['preconditions']='';
        mine['postconditions']='';
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
    addScreen: function (/** ScreenDescription */ screen) {
        if(screen!=null) {
            this['screens'].push(screen);
        }
    },
    
    /**
     * Returns the screens of the screenflowdescription
     * @type {ScreenDescription[]}
     */
    getScreens: function () {
        return this['screens'];
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
    setDomainContexts: function (domainContexts) {
        var domainContext = "";
        var domainContexts_array = domainContexts.split(",");
        for(var i = 0; i < domainContexts_array.length ; i++) {
            domainContext = domainContexts_array[i].strip();
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
    getDomainContexts: function () {
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
     * Adds a new precondition.
     * @param Precondition
     *      Precondition to be added to the
     *      Screenflow document.
     */
    addPrecondition: function (precondition) {
        if(precondition!=null) {
            this['preconditions'].push(precondition);
        }
    },
    
    /**
     * Returns a precondition of the screenflowdescription
     * @type {Precondition[]}
     */
    getPreconditions: function () {
        return this['preconditions'];
    },
    
    /**
     * Adds a new postcondition.
     * @param Postcondition
     *      Postcondition to be added to the
     *      Screenflow document.
     */
    addPostcondition: function (postcondition) {
        if(postcondition!=null) {
            this['postconditions'].push(postcondition);
        }
    },
    
    /**
     * Returns a postcondition of the screenflowdescription
     * @type {Postcondition[]}
     */
    getPostconditions: function () {
        return this['postconditions'];
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
        data.definition.screens = this.getScreens();
        //data.definition.connectors = ;
        return Object.toJSON(data);
    },
    
    /**
     * Creates a gadget deployment from the ScreenflowDescription
     * @public
     */
    deployGadget: function () {
        UIUtils.hideDeployGadgetDialog();
        console.log("gadget deployment");
        var screensdesc = this.getScreens();
        var screenList = '';
        for(i=0;i<screensdesc.length;i++){
            console.log(screensdesc[i].name);
            screenList += screensdesc[i].name + ",";
        }

        function onSuccess(transport) {
            var gvs = GVSSingleton.getInstance();
            gvs.deployScreenflow(transport.responseText);
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
        var form = $('gadgetDeployForm');
        //TODO: deal with en-GB tags and so on
        this.setLabel("en-GB",form.name.value);
        this.setVersion(form.version.value);
        this.setDescription("en-GB",form.info.value);
        this.setCreator(form.author.value);
        var datajson = this.toJSON();
        var result = {gadget: datajson};
        console.log(result);
        console.log(datajson);
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.send_post(URIs.GET_POST_SCREENFLOW, result, null, this, onSuccess, onError);
    }
});

// vim:ts=4:sw=4:et: 