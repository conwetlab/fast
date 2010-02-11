var PropertiesDialog = Class.create(ConfirmDialog /** @lends PropertiesDialog.prototype */, {
    /**
     * This class handles the dialog
     * that shows the screen/screenflow properties
     * @constructs
     * @extends ConfirmDialog
     */ 
    initialize: function($super, /** String */ type,
                        /** BuildingBlockDescription */ description,
                        /** Function */ onChangeHandler) {
        
        /**
         * Title of the dialog
         * @private
         * @type String
         */
        this._title = type + " Properties";

        /**
         * Building block description
         * @private
         * @type String
         */
        this._description = description;

        /**
         * Handler to be called when the dialog finishes
         * @private
         * @type Function
         */
        this._onFinishHandler = null;

        /**
         * Handler to be called when the dialog finishes with changes
         * @private
         * @type Function
         */
        this._onChangeHandler = onChangeHandler;

        $super(this._title);
        
    },
    
    
    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    show: function($super, /** Function(Optional) */ _handler) {
        var handler = Utils.variableOrDefault(_handler, null);      
        this._onFinishHandler = handler;
        $super();
    },

    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function () {
 
        this._setHeader(this._title);
             
        var formData = [
            {'type': 'title', 'value': 'Basic information'},
            {'type':'input', 'label': 'Building block name:','name': 'name',
                    'value': this._description.name,
                    'required': true},
            {'type':'input', 'label': 'Version:','name': 'version',
                    'value': this._description.version},
            {'type':'input', 'label': 'Tags:','name': 'tags',
                    'value': this._description.tags.collect(function(tag) {
                                    return tag.label['en-gb'];
                               }).join(", ")},
            {'type': 'title', 'value': 'Sharing information'},
            {'type':'input', 'label': 'Description:','name': 'description',
                    'value': this._description.description['en-gb'],
                    'required': true},
            {'type':'input', 'label': 'Creator:','name': 'creator',
                    'value': this._description.creator,
                    'required': true,
                    'disabled': true},
            {'type':'input', 'label': 'Licence information:','name': 'rights',
                    'value': this._description.rights,
                    'required': true},
            {'type':'input', 'label': 'Icon:','name': 'icon',
                    'value': this._description.icon,
                    'regExp': '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*', 
                    'message': 'Invalid URL'},
            {'type':'input', 'label': 'Screenshot:','name': 'screenshot',
                    'value': this._description.screenshot,
                    'regExp': '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*',
                    'message': 'Invalid URL'},
            {'type':'input', 'label': 'Homepage:','name': 'homepage',
                    'value': this._description.homepage,
                    'regExp': '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*',
                    'message': 'Invalid URL'}
        ];
        
        this._setContent(formData);

    },
    /**
     * Overriding onOk handler
     * @override
     * @private
     */
    _onOk: function($super){        
        if (this._getFormWidget().validate()) {
        
            var tags = $F(this._getForm().tags).split(/[\s,]+/).without("");
            var description = {
                'tags': Utils.getCatalogueTags(tags, null),
                'description': {
                    'en-gb': $F(this._getForm().description)
                }
            };
            var form = this._getForm();
            var elements = [form.name, form.version, form.creator, form.rights,
                form.icon, form.screenshot, form.homepage];
            Object.extend(description, Form.serializeElements(elements, {'hash': true}));
            var changed = false;
            $H(description).each(function(pair) {
                if (this._description[pair.key] != pair.value) {
                    changed = true;
                }
            }.bind(this));

            this._description.addProperties(description);
            $super();
            if (changed) {
                this._onChangeHandler();
            }
            if (this._onFinishHandler && this._onFinishHandler instanceof Function) {
                this._onFinishHandler();
                this._onFinishHandler = null;
            }
        }
    },
    
    /**
     * Reset method to leave the form as initially
     * @override
     * @private
     */
    _reset: function ($super){
        this._handler = null;
        $super();
    }
});

// vim:ts=4:sw=4:et:
