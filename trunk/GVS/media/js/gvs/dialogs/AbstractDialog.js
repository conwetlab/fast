var AbstractDialog = Class.create( /** @lends AbstractDialog.prototype */ {
    /**
     * This class handles dialogs
     * @abstract
     * @constructs
     */ 
    initialize: function(/** String */ title) {
        /** 
         * Variable
         * @type FormDialog
         * @private @member
         */
        this._form = new FormDialog({
            'title': title,
            'style': 'display:none;'
        });
        
        /**
         * Determines if the dialog has been initialized
         * @type Boolean
         * @private @member
         */
        this._initialized = false;
        
        //Initializing buttons
        this._form.addButton ('Ok', this._onOk.bind(this));
        this._form.addButton ('Cancel', this._onCancel.bind(this));
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * show
     */
    show: function () {
        if (!this._initialized){
            this._initialized = true;
            this._initDialogInterface();
        }
        GVSSingleton.getInstance().setEnabled(false);
        
        this._reset();
        this._form.show();
    },
    
    /**
     * hide
     */
    hide: function () {
        GVSSingleton.getInstance().setEnabled(true);
        this._form.hide();
    },
    
    /**
     * getForm
     * @type DOMNode
     *
     */
    getForm: function () {
        return this._form.getForm();
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
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @abstract
     */
    _initDialogInterface: function(){
        throw "Abstract method invocation AbstractDialog :: _initDialogInterface"
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
