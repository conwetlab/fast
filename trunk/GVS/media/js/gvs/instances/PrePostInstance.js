var PrePostInstance = Class.create(ComponentInstance,
    /** @lends PrePostInstance.prototype */ {

    /**
     * Pre or Post instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /** BuildingBlockDescription */ domainConceptDescription,
            /** InferenceEngine */ inferenceEngine, /** Boolean (Optional) */ _isConfigurable) {

        $super(domainConceptDescription.clone(), inferenceEngine);

        if (!this._buildingBlockDescription.pattern) {
            this._buildingBlockDescription.pattern = "?x " +
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type " +
                this._buildingBlockDescription.uri;
        }


        if (!this._buildingBlockDescription.label) {
            this._buildingBlockDescription.label = {
                'en-gb': this._buildingBlockDescription.title
            };
        }

        if (this._buildingBlockDescription.id) {
            this._id = this._buildingBlockDescription.id;
        }

        /**
         * @type DomainConceptDialog
         * @private @member
         */
        this._dialog = null;


        /**
         * @private @member
         * @type Function
         */
        this._changeHandler = null;


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
        this._isConfigurable = Utils.variableOrDefault(_isConfigurable, true);
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * This function returns the relevant info
     * to the properties table
     * Implementing TableModel interface
     * @overrides
     */
    getInfo: function() {
        var info = new Hash();
        info.set('Title', this.getTitle());
        info.set('Uri', this._buildingBlockDescription.uri);
        info.set('Type', this.getType());
        if (this._buildingBlockDescription.properties) {
            info.set('EzWeb Binding', this._buildingBlockDescription.properties.ezweb.binding);
            info.set('Friendcode', this._buildingBlockDescription.properties.ezweb.friendcode);
            info.set('Variable Name',this._buildingBlockDescription.properties.ezweb.variableName);
        }
        return info;
    },

    /**
     * Returning the type in {pre|post}
     */
    getType: function() {
        return this._buildingBlockDescription.type;
    },


    /**
     * Returns an object representing
     * the fact
     * @type Object
     */
    toJSONForScreen: function() {
        return {
                'label': this._buildingBlockDescription.label,
                'pattern': this._buildingBlockDescription.pattern,
                'positive': true,
                'uri': this._buildingBlockDescription.uri,
                'id': this.getId(),
                'type': this._buildingBlockDescription.type
            };
    },


    /**
     * Returns an object representing
     * the fact
     * @type Object
     */
    toJSONForScreenflow: function() {
        return {
            'conditions': [this._getCondition()],
            'id': this.getId(),
            'catalogueUri': this._buildingBlockDescription.catalogueUri,
            'semantics': this._buildingBlockDescription.uri,
            'binding': this._buildingBlockDescription.properties.ezweb.binding,
            'friendcode': this._buildingBlockDescription.properties.ezweb.friendcode,
            'variableName': this._buildingBlockDescription.properties.ezweb.variableName,
            'label': this.getTitle(),
            'type': this._buildingBlockDescription.type,
            'uri': this._buildingBlockDescription.uri
        };
    },

    /**
     * @override
     */
    getUri: function() {
        return this._buildingBlockDescription.catalogueUri;
    },

    /**
     * Set the type in pre | post
     */
    setType: function(/** String */ type) {
        this._buildingBlockDescription.type = type;
        if (this._isConfigurable) {
            var data = {
                'label': this.getTitle()
            };
            if (this._buildingBlockDescription.properties) {
                data = Object.extend(data, this._buildingBlockDescription.properties.ezweb)
            } else {
                if (this._buildingBlockDescription.binding) {
                    data = Object.extend (data, {
                        'binding': this._buildingBlockDescription.binding,
                        'variableName': this._buildingBlockDescription.variableName,
                        'friendcode': this._buildingBlockDescription.friendcode
                    });
                } else {
                     data = Object.extend(data, {
                        'binding': this._buildingBlockDescription.type == 'pre' ? 'slot' : 'event',
                        'variableName': this.getTitle().replace(" ",""),
                        'friendcode': this.getTitle().replace(" ", "")
                    });
                }

            }
            this._onChange(data);
        } else {
            this._onClick();
        }
    },

    /**
     * Sets the configurable status
     */
    setConfigurable: function(/** Boolean */ configurable) {
        this._isConfigurable = configurable;
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
                                                 this.getTitle(),
                                                 this._buildingBlockDescription.type);
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
        var fact = FactFactory.getFactIcon(this._getCondition(), "embedded").getNode();
        var reachable;
        if (reachabilityInfo !== undefined) {
            reachable = reachabilityInfo;
        } else {
            reachable = this._view.getNode().hasClassName("satisfeable");
        }
        Utils.setSatisfeabilityClass(fact, reachable);

        return [fact, this.getTitle(), this._buildingBlockDescription.uri];
    },

    /**
     * Creates the terminal
     */
    createTerminal: function(/** Function (Optional) */ _handler) {
        var options = {
            'direction':[],
            'offsetPosition': {},
            'wireConfig': {
                'drawingMethod': 'arrows'
            }
        };
        if (this._buildingBlockDescription.type == 'pre') {
            options.alwaysSrc = true;
            options.direction = [1,0];
            options.offsetPosition = {
                'top': 2,
                'left': 15
            };
            options.ddConfig = {// A precondition in screen design is an output
                                // (data to be consumed inside the screen)
                'type': 'output',
                'allowedTypes': ['input']
            };
        } else {
            options.direction = [-1,0];
            options.offsetPosition = {
                'top': 2,
                'left': -8
            };
            options.ddConfig = { // Viceversa
                'type': 'input',
                'allowedTypes': ['output']
            };
        }

        this._terminal = new Terminal(this._view.getNode(), options, this,
                                        this.getId());
        if (this._buildingBlockDescription.type == 'pre') {
            this._terminal.onWireHandler(_handler);
        }
    },

    /**
     * Gets the terminal
     * @type Terminal
     */
    getTerminal: function() {
        return this._terminal;
    },

    /**
     * Destroy the instance
     * @override
     */
    destroy: function($super, /** Boolean */ removeFromServer) {
        if (this._buildingBlockDescription.catalogueUri && removeFromServer) {
            var catalogueResource = (this._buildingBlockDescription.type == 'pre') ?
                                    URIs.pre : URIs.post;
            this._removeFromServer(catalogueResource + this.getId());
        }
        if (this._terminal) {
            this._terminal.destroy();
            this._terminal = null;
        }
        $super();
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
     * Returns an object representing
     * a single fact
     * @type Object
     * @private
     */
    _getCondition: function() {
        return {
                'label': {
                    'en-gb': this.getTitle()
                },
                'pattern': this._buildingBlockDescription.pattern,
                'positive': true,
                'uri': this._buildingBlockDescription.uri
            };
    },

    /**
     * Returns an object representing
     * the fact
     * @type Object
     * @private
     */
    _toJSONForCatalogue: function() {
        return {
            'conditions': [this._getCondition()],
            'id': this.getId(),
            'name': this.getTitle()
        };
    },

    /**
     * This function is called when the dialog is saved
     * @private
     */
    _onChange: function (/** Object */ data) {
        this._buildingBlockDescription.title = data.label;
        if (data.binding) {
            this._buildingBlockDescription.properties = {
                'ezweb': {
                    'binding': data.binding,
                    'variableName': data.variableName,
                    'friendcode': data.friendcode
                }
            }
        }

        if (!this._buildingBlockDescription.catalogueUri) {
            // Calling the server to add the pre/post
            var catalogueResource = (this._buildingBlockDescription.type == 'pre') ? URIs.pre : URIs.post;
            this._id = new Date().valueOf();
            PersistenceEngine.sendPost(catalogueResource,
                            null, Object.toJSON(this._toJSONForCatalogue()), this,
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
        this._buildingBlockDescription.catalogueUri = result.uri;


        this._inferenceEngine.addReachabilityListener(result.uri, this._view);

        // Notify change
        this._changeHandler(this);

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
    _removeFromServer: function(/** String */ uri) {
        PersistenceEngine.sendDelete(uri,
            this,
            this._onDeleteSuccess, Utils.onAJAXError);
    }

});

// vim:ts=4:sw=4:et:
