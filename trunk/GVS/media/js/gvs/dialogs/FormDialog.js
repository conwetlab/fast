var FormDialog = Class.create( /** @lends FormDialog.prototype */ {

    /**
     * Dialog class
     * This creates a modal dialog with three zones:
     *     * headerNode: containing the title
     *     * contentNode: containing all the fields of the form
     *     * buttonsNode: containing the different buttons: handled by this class
     * @constructs
     * @param Hash params
     * @abstract
     */
    initialize: function(properties) {
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
        
        
        var containerDiv = new Element ('div');
        
        
        containerDiv.insert (this._headerNode);
        containerDiv.insert (this._contentNode);
        containerDiv.insert (this._buttonNode);
        this._dialog.attr ('content', containerDiv);
        
        this._initialized = false;
    },

    
    // **************** PUBLIC METHODS **************** //

    getDialog: function() {
        return this._dialog;
    },
    
    /**
     * Gets the root node.
     * @type DOMNode
     * @public
     */
    getNode: function () {
        return this._dialog.domNode;
    },

    /**
     * Gets the content node.
     * @type DOMNode
     * @public
     */
    getContentNode: function () {
        return this._contentNode;
    },    
    /**
     * Gets the form node.
     * @type DOMNode
     * @public
     */
    getForm: function() {
        return this._formWidget.domNode;
    },
    
    getFormWidget: function() {
        return this._formWidget;
    },
    
    show: function() {
        if (!this._initialized) {
            this._initDialogInterface();
            this._initialized = true;
        }
        this._dialog.show();
    },
        
    hide: function() {
        this._dialog.hide();
    },
    /**
     * This function set the form content based on a array-like
     * structure, containing the different elements of the form,
     * and, optionally, form parameters
     */
    setContent: function (/** Array | DOMNode */ data, /** Hash */ formParams){
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
                        if (line.regExp) {
                            var input = new dijit.form.ValidationTextBox({
                                            'name' : line.name,
                                            'value': line.value,
                                            'regExp': line.regExp,
                                            'required': true,
                                            'invalidMessage': line.message
                                        });
                        } else {
                            var input = new dijit.form.TextBox({
                                            'name' : line.name,
                                            'value': line.value   
                                        });
                        }             
                        inputNode = input.domNode;
                        lineNode = this._createLine(line.label, inputNode);
                        break;
    
                    case 'freeText': // FIXME: crappy name
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
        
                    //TODO: Implement more when necessary
                        
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

        //Just in case
        dojo.parser.parse(this._contentNode);
    },
    
    /**
     * This function adds a button with an onclick handler
     * 
     */
    addButton: function (/** String */ label, /** Function */ handler){
        
        var button = new dijit.form.Button({
            'label': label,
            onClick: handler
        });
        
        this._buttonNode.insert (button.domNode);
    },
    
    /**
     * This function sets the header and a subtitle if passed
     */
    setHeader: function (/** String */ title, /** String */ subtitle){
        
        var titleNode = new Element("h2").update(title);
        this._headerNode.insert(titleNode);
        
        if (subtitle && subtitle != ""){
            var subtitleNode = new Element("div", {
                "class": "line"
            }).update(subtitle);
            this._headerNode.insert(subtitleNode);
        }
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
    
    _armEvents: function(/** DOMNode */ input, /** Hash */ events) {
        $H(events).each(function(pair) {
            Element.observe(input, pair.key, pair.value);
        });
    }
});

// vim:ts=4:sw=4:et:
