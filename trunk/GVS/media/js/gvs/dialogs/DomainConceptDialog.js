var DomainConceptDialog = Class.create(AbstractDialog /** @lends DomainConceptDialog.prototype */, {
    /**
     * This class handles the dialog
     * to update the domain concept properties
     * @constructs
     * @extends AbstractDialog
     */ 
    initialize: function($super,
            /** Function */ onChangeCallback, /** String */ label) {
        $super("Domain concept");
        
        /**
         * @type String
         * @private @member
         */
        this._label = label;

        this._onChangeCallback = onChangeCallback;
    },
    
    
    // **************** PUBLIC METHODS **************** //

    
    /**
     * show
     * @overrides
     */
    show: function ($super) {
        $super();
    },

    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @overrides
     */
    _initDialogInterface: function (){
 
        this._form.setHeader("Check domain concept details", 
                             "Please fulfill the required information in order to" +
                             " set up the connector.");

        var formData = [
            {
                'type':'comboBox',
                'label': 'Type:',
                'name': 'type',
                'value': '0',
                'options': [{
                    'value': 'undefined',
                    'label': 'Choose a type...'
                }, {
                    'value': 'pre',
                    'label': 'Precondition'
                }, {
                    'value': 'post',
                    'label': 'Postcondition'
                }],
                'onChange': this._onTypeChange.bind(this) 
            },
            {
                'type': 'input',
                'label': 'Label:',
                'name': 'label',
                'value': this._label 
            },
            {
                'type': 'title',
                'value': 'EzWeb properties'
            },
            {
                'type': 'comboBox',
                'label': 'Binding',
                'name': 'binding',
                'value': '0',
                'options': [{
                    'value': 'undefined',
                    'label': 'Choose a binding...'
                }]
            },
            {
                'type': 'input',
                'label': 'Variable name',
                'name': 'varname',
                'value': ''
            },
            {
                'type': 'input',
                'label': 'Friendcode',
                'name': 'friendcode',
                'value': ''
            }
        ];
        
        this._form.setContent(formData);               
        
    },
    /**
     * Overriding onOk handler
     * @overrides
     */
    _onOk: function($super){
        
    },
    
    /**
     * Reset method to leave the form as initially
     */
    _reset: function() {
    },
    
    _onTypeChange: function() {
        alert("implement it!")
    }
});

// vim:ts=4:sw=4:et:
