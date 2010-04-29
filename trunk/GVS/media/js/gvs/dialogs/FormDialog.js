var FormDialog = Class.create( /** @lends FormDialog.prototype */ {

    /**
     * Dialog class
     * This creates a modal dialog with three zones:
     *     * headerNode: containing the title
     *     * contentNode: containing all the fields of the form
     *     * buttonsNode: containing the different buttons: handled by this class
     * @constructs
     * @param properties Hash
     * @param _options Hash(Optional)
     *         * (String) buttonPosition: Sets the layout of the dialog,
     *         stablishing the position of the button zone (top, bottom, left,
     *         right). Default: FormDialog.POSITION_BOTTOM
     *         * (Boolean) createMessageZone: Adds a new zone "messageNode" that
     *         can be used to show dinamic messages. Default: false
     *         * (Numeric) minMessageLines: This option allows you to define a
     *         minimum number of lines to reserve for the messageNode zone. This
     *         option is ignored if createMessageZone == false. Default: 1
     * @abstract
     */
    initialize: function(properties, _options) {
        _options = Utils.variableOrDefault(_options, {});
        this._options = Object.extend ({
            'buttonPosition': FormDialog.POSITION_BOTTOM,
            'createMessageZone': false,
            'minMessageLines': 1,
            'closable': true
        }, _options);


        var position = this._options.buttonPosition;
        this._dialog = new dijit.Dialog(properties);

        if (!this._options.closable) {
            this._dialog.closeButtonNode.style.display = 'none';
        }

        this._headerNode = new Element ('div',{
            'class': 'dialogHeader'
        });

        this._contentNode = new Element ('div',{
            'class': 'dialogContent'
        });
        this._messageNode = new Element ('div',{
            'class': 'dialogMessageZone hidden'
        });
        var messageWrapper = new Element ('div',{
            'class': 'dialogMessageWrapper'
        });
        messageWrapper.appendChild(this._messageNode);
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

                if (this._options.createMessageZone)
                    containerDiv.appendChild (messageWrapper);

                containerDiv.appendChild (this._contentNode);
                break;
            default:
                containerDiv.appendChild (this._contentNode);

                if (this._options.createMessageZone)
                    containerDiv.appendChild (messageWrapper);

                containerDiv.appendChild (this._buttonNode);
                break;
        }
        messageWrapper.style.minHeight = ((this._options.minMessageLines * 18) + 2) + 'px';

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
        GVS.setEnabled(false);
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
        GVS.setEnabled(true);

        // Dojo lets you move the dialog anywhere you like
        // but does not restore the window scroll when the dialog is closed.
        // Force window scroll restore.
        document.documentElement.scrollTop = 0;
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
                        if (line.disabled) {
                            input.attr('disabled', line.disabled);
                        }
                        inputNode = input.textbox;
                        lineNode = this._createLine(line.label, input.domNode);
                        break;

                    case 'label':
                        lineNode = new Element('div', {
                                        'class': 'line',
                                        'style': line.style
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
                if (inputNode) {
                    this._armEvents(inputNode, line.events);
                }
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
     * Sets the message area content.
     *
     * @private
     */
    _setMessage: function(/** String */ message, type) {
        if (arguments.length == 0) {
            this._messageNode.className = 'dialogMessageZone hidden';
            this._messageNode.update('&nbsp;');
            return;
        }

        this._messageNode.className = 'dialogMessageZone';
        switch (type) {
            case FormDialog.MESSAGE_WARNING:
                this._messageNode.addClassName('warning');
                break;
            case FormDialog.MESSAGE_ERROR:
                this._messageNode.addClassName('error');
                break;
            default:
        }

        this._messageNode.innerHTML = message;
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
     * This method is called to validate user input
     * Overwrite when necessary.
     * @private
     */
    _validate: function() {
        return this._getFormWidget().validate();
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

FormDialog.POSITIVE_VALIDATION = '[1-9][0-9]*';
FormDialog.EMAIL_VALIDATION = '[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}';
FormDialog.URL_VALIDATION = '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*';

FormDialog.INVALID_POSITIVE_MESSAGE = 'Invalid number';
FormDialog.INVALID_EMAIL_MESSAGE = 'Invalid email address';
FormDialog.INVALID_URL_MESSAGE = 'Invalid URL';

FormDialog.MESSAGE_INFO = "info";
FormDialog.MESSAGE_WARNING = "warning";
FormDialog.MESSAGE_ERROR = "error";

// vim:ts=4:sw=4:et:
