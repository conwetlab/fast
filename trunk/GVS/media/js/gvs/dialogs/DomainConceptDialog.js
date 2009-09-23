var DomainConceptDialog = Class.create(ConfirmDialog /** @lends DomainConceptDialog.prototype */, {
    /**
     * This class handles the dialog
     * to update the domain concept properties
     * @constructs
     * @extends ConfirmDialog
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

    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @overrides
     */
    _initDialogInterface: function (){
 
        this.setHeader("Check domain concept details", 
                             "Please fulfill the required information in order to" +
                             " set up the Domain Concept");

        var formData = [
            {
                'type':'comboBox',
                'label': 'Type:',
                'name': 'type',
                'value': 'undefined',
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
                'events': {
                    'change': this._onTypeChange.bind(this)                    
                }
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
                'label': 'Binding:',
                'name': 'binding',
                'value': 'undefined',
                'options': [{
                    'value': 'undefined',
                    'label': 'Choose type first...'
                }]
            },
            {
                'type': 'input',
                'label': 'Variable name:',
                'name': 'varname',
                'value': ''
            },
            {
                'type': 'input',
                'label': 'Friendcode:',
                'name': 'friendcode',
                'value': ''
            }
        ];
        
        this.setContent(formData);               
        
    },
    /**
     * Overriding onOk handler
     * @overrides
     */
    _onOk: function($super){
        this._onChangeCallback(this.getForm().serialize({'hash':true}));
        $super();
    },
    
    _onTypeChange: function() {
        var bindings = new Array();
        switch ($F(this.getForm().type)) {
            case 'pre':
                bindings.push({'value':'slot','label':'Slot'});
                bindings.push({'value':'pref','label':'User Preference'});
                bindings.push({'value':'context','label':'Platform Context'});
                break;
            case 'post':
                bindings.push({'value':'event','label':'Event'});
                break;
            default:
                //Undefined
                bindings.push({'value': 'undefined','label': 'Choose type first...'});
                break;
        } 
        var bindingNode = $(this.getForm().binding);
        bindingNode.update("");
        bindings.each(function(binding) {
           var optionNode = new Element('option', {
                             'value': binding.value
                        }).update(binding.label);
           bindingNode.appendChild(optionNode);                      
        });
    }
});

// vim:ts=4:sw=4:et:
