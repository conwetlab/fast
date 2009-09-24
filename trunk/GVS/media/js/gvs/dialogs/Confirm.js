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
            
            this._contentNode.addClassName("systemDialog"); 
            
            dojo.connect(this._dialog, "hide", function (){
                this._callback(false);
            }.bind(this));               
        },
        
        /**
         * This function shows a message
         */
        show: function  ($super, /** String */ message, /**Function*/ callback){
            this._contentNode.update(message);
            $super();
            this._callback = callback;
        },
        // *********************** PRIVATE METHODS ******************//
        /**
         * @override
         * @private
         */
        _onOk: function ($super) {
            $super();
            this._callback(true);
            this._callback = null;
        },
        /**
         * @override
         * @private
         */        
        _onCancel: function ($super){
            $super();
            this._callback(false);
            this._callback = null;    
        },
        /**
         * @override
         * @private
         */
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

// Browser confirm dialog override
if (document.getElementById) {
    //Note that confirm is not blocking anymore
    //so a callback function is needed
    var browserConfirm = window.confirm;             
    window.confirm = function(msg,callback) {
        if (callback) {
            ConfirmSingleton.getInstance().show(msg,callback);
        } else{ //In case you don't use the modified version
            browserConfirm(msg);
        }
    }    
}


// vim:ts=4:sw=4:et:
