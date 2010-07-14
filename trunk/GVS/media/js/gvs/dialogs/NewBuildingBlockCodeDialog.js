var NewBuildingBlockCodeDialog = Class.create(ConfirmDialog /** @lends NewBuildingBlockDialog.prototype */, {

    /**
     * This class handles building block creation dialogs
     * @abstract
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, buildingblockName) {
        /**
         * Current building block availability
         * @private
         * @type Boolean
         */
        this._available = true;

        $super("New Building Block", ConfirmDialog.OK_CANCEL, {'createMessageZone': true});
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function () {

        this._setHeader(
                "Fulfill Building Block Information",
                "Please fulfill the required information in order to " +
                "create a new building block."
        );

        var callback = this._scheduleAvailabilityCheck.bind(this);
        var formData = [
            {
                'type':'comboBox',
                'label': 'Type',
                'name':'bBType',
                'required': true,
                'options': [
                    {
                        'label':'Form',
                        'value':BuildingBlockDocument.FORM
                    },
                    {
                        'label':'Operator',
                        'value':BuildingBlockDocument.OPERATOR
                    },
                    {
                        'label':'Resource',
                        'value':BuildingBlockDocument.RESOURCE
                    }
                ]
            },
            {
                'type':'input',
                'label': 'Name:',
                'name': 'name',
                'value': '',
                'message': this._buildingblockName + 'Name cannot be blank',
                'required': true,
                'events': {
                    'keypress': callback,
                    'blur': function() {
                                this._getForm().name.value = Utils.sanitize($F(this._getForm().name));
                            }.bind(this)
                }
            },
            {
                'type':'input',
                'label': 'Version:',
                'name': 'version',
                'value': '',
                'message': 'Version cannot be blank',
                'events': {
                    'keypress': callback
                }
            },
            {
                'type':'input',
                'label': 'Tags:',
                'name': 'tags',
                'value': ''
            }
        ];

        this._setContent(formData);
    },

    /**
     * This function updates this dialog taking into account the availability
     * status. For example, if current building block name/version is not available, this
     * dialog will be disabled.
     *
     * @private
     */
    _updateAvailabilityStatus: function() {
        if (this._available) {
            this._setMessage();
        } else {
            this._setMessage('Please, use a diferent Version or ' + this._buildingblockName + ' Name.',
                             FormDialog.MESSAGE_ERROR);
        }
        this._setDisabled(!this._available);
    },

    /**
     * Callback function
     *
     * @private
     */
    _onAvailabilityCheckSuccess: function(/**XMLHttpRequest*/ transport) {
        var metadata = transport.responseText.evalJSON();
        this._available = metadata.length == 0
        this._updateAvailabilityStatus();
    },

    /**
     * Updates the availability status. This is an asynchronous operation.
     *
     * @private
     */
    _availabilityCheck: function() {
        var type = $F(this._getForm().bBType)
        var name = Utils.sanitize($F(this._getForm().name));
        var version = $F(this._getForm().version);

        if (type == "" || name == "" || version == "") {
            this._available = name != "";
            this._updateAvailabilityStatus();
            return;
        }

        var query = {
            "query": {
                "type": "and",
                "operands": [
                    {
                        "type": "field",
                        "condition": "is",
                        "field": "name",
                        "value": name
                    },
                    {
                        "type": "field",
                        "condition": "is",
                        "field": "version",
                        "value": version
                    }
                ]
            },
            "fields": ["version"],
            "limit": 1
        }

        var searchURI = URIs[type.toLowerCase() + 'Search'];
        PersistenceEngine.sendPost(searchURI, null,
                Object.toJSON(query), this, this._onAvailabilityCheckSuccess,
                Utils.onAJAXError);
    },

    /**
     * Callback function.
     *
     * Invalidates current availability info and schedules the retreiving of the
     * availability status.
     *
     * @private
     */
    _scheduleAvailabilityCheck: function(e) {
        // Ignore "control" keys, except "backspace" and "delete"
        if ((e.charCode == 0) && (e.keyCode != 8 && e.keyCode != 46))
            return;

        this._available = false;
        try {
            clearTimeout(this._timeout);
        } catch (e) {}

        this._setMessage('Checking if the ' + this._buildingblockName + ' already exists...');
        this._timeout = setTimeout(this._availabilityCheck.bind(this), 1000);
        this._setDisabled(true);
    },

    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super) {
        if (this._validate()) {
            $super();

            var type = $F(this._getForm().bBType);
            var name = Utils.sanitize($F(this._getForm().name));
            var tags = $F(this._getForm().tags).split(/[\s,]+/).without("");
            var version = $F(this._getForm().version);

            var processedTags = Utils.getCatalogueTags($A(tags), null);

            this._create(name, processedTags, version, type);
        }
    },

    /**
     * Creates the building block
     * @override
     * @private
     */
    _create: function(name, processedTags, version, type) {
        var documentController = GVS.getDocumentController();
        var type = type.substr(0, 1).toUpperCase() + type.substr(1);
        documentController['create' + type](name, processedTags, version);
    },

     /**
     * Overriding onCancel handler
     * @override
     * @private
     */
    _onCancel: function($super) {
        try {
            clearTimeout(this._timeout);
        } catch (e) {}

        $super();
    },

    /**
     * Reset method to leave the form as initially
     * @private
     */
    _reset: function ($super) {
        $super();

        this._getForm().name.value = "";
        this._getForm().tags.value = "";
        this._getForm().version.value = "";
        this._available = false;
        this._setDisabled(true);
        this._setMessage();
    }
});

// vim:ts=4:sw=4:et:
