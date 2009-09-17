var FormDialog = Class.create( /** @lends FormDialog.prototype */ {

    /**
     * Dialog class
     * This creates a modal dialog with three zones:
     *     * headerNode: containing the title
     *     * contentNode: containing all the fields of the form
     *     * buttonsNode: containing the different buttons: handled by this class
     * @constructs
     * @param Hash params
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
        var containerDiv = new Element ('div');
        
        containerDiv.insert (this._headerNode);
        containerDiv.insert (this._contentNode);
        containerDiv.insert (this._buttonNode);
        this._dialog.attr ('content', containerDiv);
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
        if (this._dialog.domNode.getElementsByTagName('form')){
            return this._dialog.domNode.getElementsByTagName('form')[0];
        }
        else {
            return null;
        }
    },
    
    show: function() {
        return this._dialog.show();
    },
        
    hide: function() {
        return this._dialog.hide();
    },
    /**
     * This function set the form content based on a array-like
     * structure, containing the different elements of the form,
     * and, optionally, form parameters
     */
    setContent: function (/** Array */ data, /** Hash */ formParams){
        if (formParams){
            var form = new dijit.form.Form(formParams);
        }
        else {
            var form = new dijit.form.Form ({
                'method': 'post'
            });
        }

        $A(data).each (function(line){
            switch (line.type) {
                case 'title':
                    var title = new Element ('h3').update(line.value);
                    form.domNode.appendChild(title);
                    break;
                    
                case 'input':
                    var div = new Element('div', {
                                    'class' : 'line'
                                });
                    var label = new Element ('label').update(line.label);
                    div.appendChild(label);
                    var input = new dijit.form.TextBox({
                                    'name' : line.name,
                                    'value': line.value   
                                });
                    div.appendChild(input.domNode);
                    form.domNode.appendChild(div);
                    break;
                    
                case 'freeText':
                    var div = new Element('div', {
                                    'class': 'line'
                                }).update(line.value);
                    form.domNode.appendChild(div);
                    break;
                    
                case 'hidden':
                    var hidden = new Element('input',{
                                    'type': 'hidden',
                                    'name': line.name,
                                    'value': line.value
                                });
                    form.domNode.appendChild(hidden);
                    break;
                    
                case 'validation':
                    var div = new Element('div', {
                                    'class' : 'line'
                                });
                    var label = new Element ('label').update(line.label);
                    div.appendChild(label);
                    var input = new dijit.form.ValidationTextBox({
                                    'name' : line.name,
                                    'value': line.value,
                                    'regExp': line.regExp,
                                    'invalidMessage': line.message
                                });
                    div.appendChild(input.domNode);
                    form.domNode.appendChild(div);
                    break;   
                                 
                case 'comboBox':
                    var div = new Element('div', {'class': 'line'});
                    var label = new Element('label').update(line.label);
                    div.appendChild(label);
                    var comboBox = new Element('select', {
                        'name': line.name
                    });
                    div.appendChild(comboBox);
                    
                    $A(line.options).each(function(option) {
                        var optionNode = new Element('option', {
                             'value': option.value
                        }).update(option.label);
                        
                        if (option.value == line.value) {
                            optionNode.selected = "selected";
                        }
                        
                        comboBox.appendChild(optionNode);
                    });
                    form.domNode.appendChild(div);
                    break;
    
                //TODO: Implement more when necessary
                    
                default:
                    throw "Unimplemented form field type";
            } 
        });
        this._contentNode.appendChild(form.domNode);
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
        this._contentNode.insert(titleNode);
        
        if (subtitle && subtitle != ""){
            var subtitleNode = new Element("div", {
                "class": "line"
            }).update(subtitle);
            this._contentNode.insert(subtitleNode);
        }
    }
    
    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:
