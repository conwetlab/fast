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
    

    var Confirm = Class.create(
        /** @lends ConfirmSingleton-Confirm.prototype */ {

        /** 
         * Confirm dialog
         * @constructs
         */
        initialize: function() {
            this._dialog = new FormDialog({
               'title': 'Warning',
               'style': 'display:none', 
            }); 
            
            //Callback function to be called
            this._callback = null;
            
            this._dialog.addButton ('Ok', this.onOk.bind(this));
            this._dialog.addButton ('Cancel', this.onCancel.bind(this));
           
        },
        /**
         * This function shows a message
         */
        show: function  (/** String */ message, /**Function*/ callback){
            this._dialog.getContentNode().update(message);
            this._dialog.show();
            this._callback = callback;
        },
        
        onOk: function (){
            this._dialog.hide();
            this._callback(true);
            this._callback = null;

        },
        onCancel: function (){
            this._dialog.hide();
            this._callback(false);
            this._callback = null;
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
