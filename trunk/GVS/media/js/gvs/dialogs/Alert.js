/**
 * <p>This class implements the Singleton Design Pattern to make sure there is 
 * only one instance of the class Preferences.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var alert = AlertSingleton.getInstance();
 */ 
var AlertSingleton = function() {

    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;
    

    var Alert = Class.create(
        /** @lends AlertSingleton-Alert.prototype */ {

        /** 
         * Alert dialog
         * @constructs
         */
        initialize: function() {
            this._dialog = new FormDialog({
               'title': 'Warning',
               'style': 'display:none'
            });
            this._dialog.getContentNode().addClassName("systemDialog"); 
            
            this._dialog.addButton ('Ok', this.hide.bind(this));
        },
        /**
         * This function shows a message
         */
        show: function  (/** String */ message){
            this._dialog.getContentNode().update(message);
            this._dialog.show();
        },
        
        hide: function (){
            this._dialog.hide();
        }
        
    });

    return new function(){
        /**
         * Returns the singleton instance
         * @type Preferences
         */
        this.getInstance = function(){
            if (_instance == null) {
                _instance = new Alert();
            }
            return _instance;
        }
    }
}();

// vim:ts=4:sw=4:et:
