var SaveAsDialog = Class.create(ConfirmDialog /** @lends SaveAsDialog.prototype */, {
    /**
     * This class handles the dialog
     * to save as a new document
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** String */ buildingBlockType,
                        /** String */ name, /** String */ version,
                        /** Function */ onOkHandler, /** Boolean(optional) */ _cloned) {

        /**
         * Building block type of the element being saved
         * @private
         * @type String
         */
        this._type = buildingBlockType;

        /**
         * Current name/version availability
         * @private
         * @type Boolean
         */
        this._available = true;

        /**
         * Name of the document
         * @private
         * @type String
         */
        this._name = name;

        /**
         * Version of the document
         * @private
         * @type String
         */
        this._version = version;

        /**
         * On ok handler
         * @private
         * @type Function
         */
        this._onOkHandler = onOkHandler;

        var buttons = ConfirmDialog.OK_CANCEL;
        var options = {'createMessageZone': true};
        if(_cloned) {
            buttons = ConfirmDialog.OK;
            options.closable = false;
        }

        $super("Choose new name/version", buttons, options);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function (){


        var callback = this._scheduleAvailabilityCheck.bind(this);
        var formData = [
            {
                'type':'input',
                'label': 'New Name:',
                'name': 'name',
                'value': this._name,
                'message': 'Name cannot be blank',
                'required': true,
                'events': {
                    'keypress': callback
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
                'type': 'label',
                'value': '(Previous version was ' + this._version + ')',
                'style': 'font-size: 95%; color: #555; padding-left: 130px'
            }
        ];

        this._setContent(formData);
        this._setDisabled(true);
        this._availabilityCheck();
    },

    /**
     * This function updates this dialog taking into account the availability
     * status. For example, if the screen name/version is not available, this
     * dialog will be disabled.
     *
     * @private
     */
    _updateAvailabilityStatus: function() {
        if (this._available) {
            this._setMessage();
        } else {
            this._setMessage('Please, use a different ' +  this._type +
                            ' Version or Name.',
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
        var name = $F(this._getForm().name);
        var version = $F(this._getForm().version);

        if (name == "" || version == "") {
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
        PersistenceEngine.sendPost(URIs[this._type + "Search"], null,
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

        this._setMessage('Checking if the name/version already exists...');
        this._timeout = setTimeout(this._availabilityCheck.bind(this), 1000);
        this._setDisabled(true);
    },

    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super){
        if (this._getFormWidget().validate() && this._available) {
            var name = $F(this._getForm().name);

            var version = $F(this._getForm().version);

            this._onOkHandler(name, version);

            $super();
        }
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
    }
});

// vim:ts=4:sw=4:et:
