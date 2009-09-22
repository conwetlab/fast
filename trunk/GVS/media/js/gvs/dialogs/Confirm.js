/**
 * <p>This class implements the Singleton Design Pattern to make sure there is 
 * only one instance of the class Preferences.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var confirm = ConfirmSingleton.getInstance();
 */ 
var ConfirmSingleton = function() {

    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;
    

    var Confirm = Class.create(ConfirmDialog,
        /** @lends ConfirmSingleton-Confirm.prototype */ {

        /** 
         * Confirm dialog
         * @constructs
         * @extends ConfirmDialog
         */
        initialize: function($super) {
            $super('Warning');
            
            /**
             * Callback function to be called
             * @type Function
             * @private @member
             */
            this._callback = null;
            
            this.getContentNode().addClassName("systemDialog"); 
            
            dojo.connect(this.getDialog(), "hide", function (){
                this._callback(false);
            }.bind(this));               
        },
        
        /**
         * This function shows a message
         */
        show: function  ($super, /** String */ message, /**Function*/ callback){
            this.getContentNode().update(message);
            $super();
            this._callback = callback;
        },
        // *********************** PRIVATE METHODS ******************//
        _onOk: function ($super) {
            $super();
            this._callback(true);
            this._callback = null;
        },
        
        _onCancel: function ($super){
            $super();
            this._callback(false);
            this._callback = null;    
        },
        
        _initDialogInterface: function () {
            // Do Nothing
        }
    });

    return new function(){
        /**
         * Returns the singleton instance
         * @type Preferences
         */
        this.getInstance = function(){
            if (_instance == null) {
                _instance = new Confirm();
            }
            return _instance;
        }
    }
}();

// vim:ts=4:sw=4:et:
