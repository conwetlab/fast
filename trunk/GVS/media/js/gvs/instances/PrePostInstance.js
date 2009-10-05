var PrePostInstance = Class.create(ComponentInstance,
    /** @lends PrePostInstance.prototype */ {

    /**
     * Pre or Post instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /** DomainConceptDescription */ domainConceptDescription, 
            /** DropZone */ dropZone, /** InferenceEngine */ inferenceEngine) {
        $super(domainConceptDescription, dropZone, inferenceEngine);
        
        /**
         * Uri of the pre or post in the catalogue
         * @type String
         * @private @member
         */
        this._uri = null;
        
        /**
         * Pattern of the *-condition
         * @type String
         * @private @member
         */
        this._pattern = "?x  http://www.w3.org/1999/02/22-rdf-syntax-ns#type " + 
            this._buildingBlockDescription.uri;
        /**
         * @type String
         * @private @member
         */
        this._label = this._buildingBlockDescription.title;
        
        /**
         * @type DomainConceptDialog
         * @private @member
         */
        this._dialog = new PrePostDialog(this._onChange.bind(this), this.getTitle());
        
        /**
         * This stores the platform-dependent properties
         * @type Hash
         * @private @member
         */
        this._platformProperties = new Hash();
        this._platformProperties.set('ezweb', new Hash());
        
        /**
         * @private @member
         * @type Function
         */
        this._changeHandler = null;
        /**
         * Type pre/post
         * @private @member
         * @type String
         */
        this._type = null;
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Somehow something the user can comprehend
     * @override
     */
    getTitle: function() {
        return this._label; 
    },
    
    getType: function() {
        return this._type;
    },
    
    /**
     * Transform the instance into JSON-like
     * string
     * @type String
     */
    toJSON: function() {
        var json = {
            'conditions': [{
                'label': {'en-gb': this._label},
                'pattern': this._pattern,
                'scope': 'design time'
            }]
        }
        return Object.toJSON(json);
    },
    
    /**
     * Returns an object with the relevant
     * information to the screenflow description
     * @type Object
     */
    getProperties: function() {
        var result = {
            'semantics': this._buildingBlockDescription.uri,
            'label': this._label,
            'friendcode': this._platformProperties.get('ezweb').get('friendcode'),
            'variableName': this._platformProperties.get('ezweb').get('varname'),
            'binding': this._platformProperties.get('ezweb').get('binding'),
            'uri': this._uri
        };
        return result;
    },
    
    /**
     * @override
     */
    getUri: function() {
        return this._uri;    
    },
    
    /**
     * Due to the slopy catalogue implementation, uri changes can
     * be notified via handler.
     * @public
     */
    setChangeHandler: function(/** Function */ handler) {
        this._changeHandler = handler;        
    },
    
    /**
     * This function returns the relevant info
     * to the properties table
     * @overrides
     */
    getInfo: function() {
        var info = new Hash();
        info.set('Title', this._label);
        info.set('Type', this._type);
        info.set('EzWeb Binding', this._platformProperties.get('ezweb').get('binding'));
        info.set('Friendcode', this._platformProperties.get('ezweb').get('friendcode'));
        info.set('Variable Name', this._platformProperties.get('ezweb').get('varname'));
        return info;
    },
    /**
     * This function shows the dialog to change
     * the instance properties
     */
    showPreviewDialog: function () {
        this._dialog.show();        
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new DomainConceptView(this._buildingBlockDescription);
    },
    
    /**
     * This function is called when the attached view is dbl-clicked
     * @private
     * @override
     */
    _onDoubleClick: function (/** Event */ event){
        this._dialog.show();
    },
    
    /**
     * This function is called when the dialog is saved
     * @private
     */
    _onChange: function (/** Object */ data) {
        
        this._type = data.type;
        this._label = data.label;
        this._platformProperties.get('ezweb').set('binding', data.binding);
        this._platformProperties.get('ezweb').set('varname', data.varname);
        this._platformProperties.get('ezweb').set('friendcode', data.friendcode);
        
        var catalogueResource = URIs.catalogue + 
                ((this._type == 'pre') ? '/slots' : '/events');
                
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        persistenceEngine.sendPost(catalogueResource,
            null, this.toJSON(), this, 
            this._onPostSuccess, Utils.onAJAXError);
    },
    /**
     * onSuccess callback
     * @private
     */
    _onPostSuccess: function (/** XMLHttpRequest */ transport) {
        var result = JSON.parse(transport.responseText);
        var previousUri = this._uri;
        this._uri = result.uri;
        
        // Update notification listeners
        if (previousUri) {
            this._inferenceEngine.removeReachabilityListener(previousUri, this._view);
        }
        this._inferenceEngine.addReachabilityListener(this._uri, this._view);
        
        // Notify change
        this._changeHandler(previousUri, this);
    }
});

// vim:ts=4:sw=4:et:
