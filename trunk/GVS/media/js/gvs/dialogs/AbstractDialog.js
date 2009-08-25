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
        //FIXME: This shouldn't be here
        //Removing the keypress event handling to avoid deleting elements
        //of the canvas when being in a dialog
        Element.stopObserving(document, 'keypress', UIUtils.onKeyPressCanvas);
        this._form.show();
    },
    
    /**
     * hide
     */
    hide: function () {
        //FIXME: This shouldn't be here
        //Arming the event again
        Element.stopObserving(document, 'keypress', UIUtils.onKeyPressCanvas);
        this._form.hide();
        
        //If there is a reset method, call it
        if (this._reset){
            this._reset();
        }
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
