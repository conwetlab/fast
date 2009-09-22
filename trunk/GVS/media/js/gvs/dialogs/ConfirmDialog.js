var ConfirmDialog = Class.create(FormDialog, /** @lends ConfirmDialog.prototype */ {
    /**
     * This class handles dialogs
     * @abstract
     * @extends FormDialog
     * @constructs
     * @param buttons
     *     ['ok_cancel' (default) | 'ok']
     */ 
    initialize: function($super, /** String */ title, /** String */ buttons) {
        $super({
            'title': title,
            'style': 'display:none;'
        });

        //Initializing buttons
        switch(buttons) {
            case 'ok':
                this.addButton ('Ok',     this._onOk.bind(this));
                break;
            
            case 'ok_cancel':
            default:
                this.addButton ('Ok',     this._onOk.bind(this));
                this.addButton ('Cancel', this._onCancel.bind(this));
                break;
        }
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * show
     */
    show: function ($super) {
        $super();
        GVSSingleton.getInstance().setEnabled(false);
        this._reset();
    },
    
    /**
     * hide
     */
    hide: function ($super) {
        GVSSingleton.getInstance().setEnabled(true);
        $super();
    },
    
    // **************** PRIVATE METHODS **************** //

    /**
     * This method is called for reseting the dialog fields.
     * Overload when necessary.
     */
    _reset: function() {
        // Do nothing
    },
    
    /** 
     * onOK
     * This function is called when ok button is pressed (if any)
     * @private
     * @abstract
     */
    _onOk: function(){
        this.hide();
    },
    
    /** 
     * onCancel
     * This function is called when ok button is pressed (if any)
     * @private
     */
    _onCancel: function(){
        this.hide();
    }
});

// vim:ts=4:sw=4:et:
