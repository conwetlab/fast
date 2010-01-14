var PrePostInstance = Class.create(ComponentInstance,
    /** @lends PrePostInstance.prototype */ {

    /**
     * Pre or Post instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /** DomainConceptDescription */ domainConceptDescription, 
            /** InferenceEngine */ inferenceEngine, /** Boolean (optional) */ isConfigurable) {
        $super(domainConceptDescription, inferenceEngine);
        
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
        this._pattern = "?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type " + 
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
        this._dialog = null;
        
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
        
        /**
         * Terminal for screen design
         * @type Terminal
         * @private 
         */
        this._terminal = null;

        /**
         * It states if the instance
         * can be configured by the user
         * @type Boolean
         * @private
         */
        this._isConfigurable = true;
        if (isConfigurable !== undefined) {
            this._isConfigurable = isConfigurable;
        }
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Somehow something the user can comprehend
     * Implementing TableModel interface
     * @override
     */
    getTitle: function() {
        return this._label; 
    },
    
    /**
     * This function returns the relevant info
     * to the properties table
     * Implementing TableModel interface
     * @overrides
     */
    getInfo: function() {
        var info = new Hash();
        info.set('Title', this._label);  
        info.set('Uri', this._buildingBlockDescription.uri);
        info.set('Type', this._type);
        if (this._platformProperties.get('ezweb').get('binding')) {
            info.set('EzWeb Binding', this._platformProperties.get('ezweb').get('binding'));
            info.set('Friendcode', this._platformProperties.get('ezweb').get('friendcode'));
            info.set('Variable Name', this._platformProperties.get('ezweb').get('varname'));
        }
        
        return info;
    },
    
    /**
     * Returning the type in {pre|post}
     */
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
            'conditions': [this.getFactData()]
        }
        return Object.toJSON(json);
    },

    /**
     * Returns an object representing
     * the fact
     * @type Object
     */
    getFactData: function() {
        return {
                'label': {'en-gb': this._label},
                'pattern': this._pattern,
                'positive': true,
                'id': this.getId(),
                'name': this._label
            };
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
     * Set the type in pre | post
     */
    setType: function(/** String */ type) {
        this._isConfigurable = false;
        this._type = type;
        this._onClick();
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
     * This function shows the dialog to change
     * the instance properties
     */
    showPreviewDialog: function () {
        if (this._isConfigurable) {
            if (!this._dialog) {
                this._dialog = new PrePostDialog(this._onChange.bind(this),
                                                    this.getTitle());
            }
            this._dialog.show();
        }
    },
    
    /**
     * Returns a list the 
     * information about the instance
     * ready to be set in the FactPane
     * @type Array
     */
    getConditionTable: function(/** Boolean */ reachabilityInfo) {
        var factFactory = FactFactorySingleton.getInstance();
        var fact = factFactory.getFactIcon(this._getFactData(), "embedded").getNode();
        var reachable;
        if (reachabilityInfo !== undefined) {
            reachable = reachabilityInfo;
        } else {
            reachable = this._view.getNode().hasClassName("satisfeable");
        }
        Utils.setSatisfeabilityClass(fact, reachable);
        
        return [fact, this._label, this._buildingBlockDescription.uri]; 
    },
    
    /**
     * Creates the terminal
     */
    createTerminal: function(/** (Optional) Function */ handler) {
        var options = {
            'direction':[],
            'offsetPosition': {},
            'wireConfig': {
                'drawingMethod': 'arrows'
            }
        };
        if (this._type == 'pre') {
            options.alwaysSrc = true;
            options.direction = [1,0];
            options.offsetPosition = {
                'top': 2, 
                'left': 15
            };
            options.ddConfig = { // A precondition in screen design is an output (data to be consumed inside the screen)
                'type': 'output',
                'allowedTypes': ['input']
            }
        } else {
            options.direction = [-1,0];
            options.offsetPosition = {
                'top': 2, 
                'left': -8
            };
            options.ddConfig = { // Viceversa
                'type': 'input',
                'allowedTypes': ['output']
            }   
        }
        
        this._terminal = new Terminal(this._view.getNode(), options, this,
                                        this.getId());
        if (this._type == 'pre') {
            this._terminal.onWireHandler(handler);
        }
    },
    
    /**
     * Destroy the instance
     * @override
     */
    destroy: function($super, /** Boolean */ removeFromServer) {
        $super();
        if (this._uri && removeFromServer) {
            this._removeFromServer(this._uri, this._type);
        }
        if (this._terminal) {
            this._terminal.destroy();
        }
    },
    
    /**
     * On position update
     * @override
     */
    onUpdate: function(/** Number */ x, /** Number */ y) {
        if (this._terminal) {
            this._terminal.updatePosition();
        }
    },
    /**
     * @override
     */
    onFinish: function($super, changingZone) {
        $super(changingZone);
        this.onUpdate();
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
    _onDoubleClick: function (/** Event */ event) {
        this.showPreviewDialog();
    },
    
    /**
     * This function is called when the dialog is saved
     * @private
     */
    _onChange: function (/** Object */ data) {
        this._label = data.label;
        if (data.binding) {
            this._platformProperties.get('ezweb').set('binding', data.binding);
            this._platformProperties.get('ezweb').set('varname', data.varname);
            this._platformProperties.get('ezweb').set('friendcode', data.friendcode);
        }
        
        if (this._type != data.type) {
            if (this._uri) {
                this._removeFromServer(this._uri, this._type);    
            }
            this._type = data.type;
            
            // Calling the server to add the pre/post
            var catalogueResource = (this._type == 'pre') ? URIs.pre : URIs.post;
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendPost(catalogueResource,
                            null, this.toJSON(), this, 
                            this._onPostSuccess, Utils.onAJAXError); 
        } else {
            this._onClick();
        }
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
        
    },
    
    /**
     * onDeleteSucces
     * @private
     */
    _onDeleteSuccess: function(/** XMLHttpRequest */ transport){
        console.log('deleted');
    },
    
    
    /**
     * This function removes a pre/post from the server
     * @private
     */
    _removeFromServer: function(/** String */ uri, /** String */ type) {
        var catalogueResource = (type == 'pre') ? URIs.pre : URIs.post;
        var persistenceEngine = PersistenceEngineFactory.getInstance();
        // The proxy removes a URI encoding, so it is necessary to do it
        // twice
        persistenceEngine.sendDelete(catalogueResource + encodeURIComponent(encodeURIComponent(uri)),
            this, 
            this._onDeleteSuccess, Utils.onAJAXError);
    },

    /**
     * Returns an object representing
     * the fact
     * @type Object
     */
    _getFactData: function() {
        return {
                'label': {'en-gb': this._label},
                'pattern': this._pattern,
                'positive': true,
                'id': this._buildingBlockDescription.uri,
                'name': this._label
            };
    }

});

// vim:ts=4:sw=4:et:
