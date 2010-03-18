var ConfirmDialog = Class.create(FormDialog, /** @lends ConfirmDialog.prototype */ {
    /**
     * This class handles dialogs
     * @abstract
     * @extends FormDialog
     * @constructs
     * @param buttons
     *     ['ok_cancel' (default) | 'ok']
     * @param _options
     */ 
    initialize: function($super, /** String */ title, /** String */ buttons, /** Hash */_options) {
        $super({
            'title': title,
            'style': 'display:none;'
        }, _options);

        //Initializing buttons
        switch(buttons) {
            case ConfirmDialog.OK:
                this._okButton = this._addButton ('Ok',     this._onOk.bind(this));
                break;

            case ConfirmDialog.SAVE_DISCARD_CANCEL:
                if (_options && _options.callback) {

                    this._addButton('Save', this._onButtonPressed.bind({
                        'mine': this,
                        'pressedButton': ConfirmDialog.SAVE,
                        'callback': _options.callback
                    }));
                    this._addButton('Discard changes', this._onButtonPressed.bind({
                        'mine': this,
                        'pressedButton': ConfirmDialog.DISCARD,
                        'callback': _options.callback
                    }));
                    this._addButton('Cancel', this._onButtonPressed.bind({
                        'mine': this,
                        'pressedButton': ConfirmDialog.CANCEL,
                        'callback': _options.callback
                    }));
                } else {
                    throw "Cannot create a confirm dialog with that configuration. " +
                          "ConfirmDialog::initialize";
                }
                break;
            case ConfirmDialog.OK_CANCEL:
            default:
                this._okButton = this._addButton ('Ok', this._onOk.bind(this));
                this._addButton ('Cancel', this._onCancel.bind(this));
                break;
        }
    },
    

    // **************** PUBLIC METHODS **************** //

    
    
    // **************** PRIVATE METHODS **************** //

    /**
     * Inits the user interface
     * It may be overriden
     * @private
     */
    _initDialogInterface: function() {
        if (this._options.contents) {
            this._setContent(this._options.contents);
        }
    },

    /**
     * Enables/disables the ok button allowing/disallowing users to continue.
     *
     * @private
     */
    _setDisabled: function(disabled) {
        this._okButton.setDisabled(disabled);
    },

    /** 
     * onOK
     * This function is called when ok button is pressed (if any)
     * @private
     */
    _onOk: function(){
        this._dialog.hide();
    },
    
    /** 
     * onCancel
     * This function is called when ok button is pressed (if any)
     * @private
     */
    _onCancel: function(){
        this._dialog.hide();
    },

    /**
     * On button pressed
     * @private
     */
    _onButtonPressed: function() {
        this.mine._dialog.hide();
        this.callback(this.pressedButton);
    },

    /**
     * Reset method to leave the form as initially
     * @private
     */
    _reset: function ($super) {
        this._setDisabled(false);
        $super();
    }
});


// Static attributes
ConfirmDialog.OK = 'ok';
ConfirmDialog.OK_CANCEL = 'ok_cancel';
ConfirmDialog.SAVE_DISCARD_CANCEL = 'save_discard_cancel';
ConfirmDialog.SAVE = 'save';
ConfirmDialog.DISCARD = 'discard';
ConfirmDialog.CANCEL = 'cancel';

// vim:ts=4:sw=4:et:
