var FormDialog = Class.create( /** @lends FormDialog.prototype */ {

    /**
     * Dialog class
     * This creates a modal dialog with three zones:
     *     * headerNode: containing the title
     *     * contentNode: containing all the fields of the form
     *     * buttonsNode: containing the different buttons: handled by this class
     * @constructs
     * @param properties Hash
     * @param _buttonPosition String(Optional) Sets the layout of the dialog,
     *         stablishing the position of the button zone (top, bottom, left, right)
     * @abstract
     */
    initialize: function(properties, _buttonPosition){

        var position = Utils.variableOrDefault(_buttonPosition, FormDialog.POSITION_BOTTOM);
        this._dialog = new dijit.Dialog(properties);
        
        this._headerNode = new Element ('div',{
            'class': 'dialogHeader'
        });
        
        this._contentNode = new Element ('div',{
            'class': 'dialogContent'
        });
        this._buttonNode = new Element ('div',{
            'class': 'dialogButtonZone'
        });
        this._formWidget = null;
               
        var containerDiv = new Element ('div', {
            'class': position
        });
        
        containerDiv.appendChild (this._headerNode);
        switch (position) {
            case FormDialog.POSITION_TOP:
                containerDiv.appendChild (this._buttonNode);
                containerDiv.appendChild (this._contentNode);
                break;
            default:
                containerDiv.appendChild (this._contentNode);
                containerDiv.appendChild (this._buttonNode);
                break;
        }
       
        this._dialog.attr ('content', containerDiv);
        
        this._initialized = false;
        dojo.connect(this._dialog,"hide", this._hide.bind(this));
        
    },

    
    // **************** PUBLIC METHODS **************** //  

    /**
     * Shows the dialog
     * @public
     */
    show: function() {
        if (!this._initialized) {
            this._initDialogInterface();
            this._initialized = true;
        } else {
            this._reset();
        }
        GVSSingleton.getInstance().setEnabled(false);
        this._dialog.show();
    },
    
    // **************** PRIVATE METHODS **************** //
    /** 
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @abstract
     */
    _initDialogInterface: function(){
        throw "Abstract method invocation FormDialog :: _initDialogInterface"
    },
    
    _hide: function() {
        GVSSingleton.getInstance().setEnabled(true);
    },
        
    /**
     * Gets the form node.
     * @type DOMNode
     * @private
     */
    _getForm: function() {
        return this._formWidget.domNode;
    },
    /**
     * Gets the form Widget
     * @type dijit.form.Form
     * @private
     */
    _getFormWidget: function() {
        return this._formWidget;
    },

    /**
     * This function adds a button with an onclick handler
     * @type dijit.form.Button
     * @private
     */
    _addButton: function (/** String */ label, /** Function */ handler) {
        var button = new dijit.form.Button({
            'label': label,
            onClick: handler
        });

        
        this._buttonNode.appendChild(button.domNode);
        return button;
    },

    /**
     * Remove all buttons
     * @private
     */
    _removeButtons: function() {
        this._buttonNode.update("");
    },
    
    /**
     * This function sets the header and a subtitle if passed
     * @private
     */
    _setHeader: function (/** String */ title, /** String */ subtitle){
        
        this._headerNode.update("");
        var titleNode = new Element("h2").update(title);
        this._headerNode.appendChild(titleNode);
        
        if (subtitle && subtitle != ""){
            var subtitleNode = new Element("div", {
                "class": "line"
            }).update(subtitle);
            this._headerNode.appendChild(subtitleNode);
        }
    },

    /**
     * This function set the form content based on a array-like
     * structure, containing the different elements of the form,
     * and, optionally, form parameters
     * @private
     */
    _setContent: function (/** Array | DOMNode */ data, /** Hash */ formParams){
        if (data instanceof Array) {
            // Form
            if (formParams){
                this._formWidget = new dijit.form.Form(formParams);
            } else {
                this._formWidget = new dijit.form.Form ({
                    'method': 'post'
                });
            }
            
            // Instantiate form elements
            $A(data).each (function(line){
                var lineNode;
                var inputNode;
                
                switch (line.type) {
                    case 'title':
                        lineNode = new Element ('h3').update(line.value);
                        break;
                        
                    case 'input':
                        if (line.regExp || line.required) {
                            var input = new dijit.form.ValidationTextBox({
                                            'name' : line.name,
                                            'value': line.value,
                                            'regExp': (line.regExp) ? line.regExp : '.*',
                                            'required': (line.required) ? line.required : false,
                                            'invalidMessage': (line.message) ? line.message : 'This field cannot be blank'
                                        });
                        } else {
                            var input = new dijit.form.TextBox({
                                            'name' : line.name,
                                            'value': line.value
                                        });
                        }
                        if (input.disabled) {
                            input.attr('disabled', input.disabled);
                        }
                        inputNode = input.domNode;
                        lineNode = this._createLine(line.label, inputNode);
                        break;
    
                    case 'label':
                        lineNode = new Element('div', {
                                        'class': 'line'
                                    }).update(line.value);
                        break;
                        
                    case 'hidden':
                        lineNode = new Element('input',{
                                        'type': 'hidden',
                                        'name': line.name,
                                        'value': line.value
                                    });
                        break;                    
                                     
                    case 'comboBox':
                        inputNode = new Element('select', {
                            'name': line.name
                        });
                        
                        $A(line.options).each(function(option) {
                            var optionNode = new Element('option', {
                                 'value': option.value
                            }).update(option.label);
                            
                            if (option.value == line.value) {
                                optionNode.selected = "selected";
                            }
                            
                            inputNode.appendChild(optionNode);
                        });
                        
                        lineNode = this._createLine(line.label, inputNode);
                        break;
                        
                    default:
                        throw "Unimplemented form field type";
                }
                      
                this._formWidget.domNode.appendChild(lineNode);   
                
                this._armEvents(inputNode, line.events);
            }.bind(this));
            
            this._contentNode.update(this._formWidget.domNode);  
                        
        } else {
            // Data is a DOMNode
            this._contentNode.update(data);
        }        

        // Just in case
        dojo.parser.parse(this._contentNode);
    },    
    
    
    /**
     * Construct a form line provided the label text and the input node.
     * @type DOMNode
     * @private
     */
    _createLine: function(/** String */ label, /** DOMNode */ inputNode) {
        var lineNode = new Element('div', {
                        'class' : 'line'
                    });
        var labelNode = new Element ('label').update(label);
        lineNode.appendChild(labelNode);
        lineNode.appendChild(inputNode);
        
        return lineNode;
    },
    
    
    /**
     * Attach the event handlers to the input DOM node
     * @private
     */
    _armEvents: function(/** DOMNode */ input, /** Hash */ events) {
        $H(events).each(function(pair) {
            Element.observe(input, pair.key, pair.value);
        });
    },

    /**
     * This method is called for reseting the dialog fields.
     * Overload when necessary.
     * @private
     */
    _reset: function() {
        if (this._getFormWidget()) {
            this._getFormWidget().validate();
        }
    }  
     
});

// STATIC ATTRIBUTES
FormDialog.POSITION_LEFT = "left";
FormDialog.POSITION_RIGHT = "right";
FormDialog.POSITION_BOTTOM = "bottom";
FormDialog.POSITION_TOP = "top";

FormDialog.EMAIL_VALIDATION = '[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}';
FormDialog.URL_VALIDATION = '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*';

FormDialog.INVALID_EMAIL_MESSAGE = 'Invalid email address';
FormDialog.INVALID_URL_MESSAGE = 'Invalid URL';

// vim:ts=4:sw=4:et:
