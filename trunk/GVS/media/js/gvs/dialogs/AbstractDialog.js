var AbstractDialog = Class.create( /** @lends AbstractDialog.prototype */ {
    /**
     * This class handles dialogs
     * @abstract
     * @constructs
     */ 
    initialize: function() {
        /** 
         * Variable
         * @type FormDialog
         * @private @member
         */
        this._form = null;
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * show
     */
    show: function () {
        if (this._form == null){
            this._initDialogInterface();
        }
        
        this._form.show();
    },
    
    /**
     * hide
     */
    hide: function () {
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
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @abstract
     */
    _initDialogInterface: function(){
        throw "Abstract method invocation AbstractDialog :: _initDialogInterface"
    }
});

// vim:ts=4:sw=4:et:
