/**
 * <p>This class implements the Singleton Design Pattern to make sure there is 
 * only one instance of the class GVS.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var gvs = GVSSingleton.getInstance();
 */ 
var GVSSingleton = function() {

    /**
     * Singleton instance
     * @private @member
     */
    var _instance = null;
    

    var GVS = Class.create(
        /** @lends GVSSingleton-GVS.prototype */ {

        /** 
         * GVS is the system facade.
         * @constructs
         */
        initialize: function() {
            /** 
             * @type DocumentController
             * @private @member
             */
            this._documentController = null;

            /** 
             * Hash keeping the action implementations.
             * @type Hash
             * @private @member
             */
            this._actions = null;
            
            /** 
             * User data object
             * @type User
             * @private @member
             */
            this._user = null;
        },
        

        // **************** PUBLIC METHODS **************** //
        

        /**
         * Creates all the other objects and installs the event 
         * handlers.
         * @public
         */
        init: function () {
            this._actions = {
                openScreenflow: function (){
                    alert("open");
                },
                newScreenflow: this._newScreenflow.bind(this),
                addScreen: this._addScreen.bind(this)
            };
            this._documentController = new DocumentController();
            //FIXME: This shouldn't be here
            Element.observe(document, "keypress",UIUtils.onKeyPressCanvas);
        },

        /**
         * Ask the GVS application to perform a high-level action.
         * @public
         */
        action: function (/** String */ actionName){
            if (this._actions[actionName]){
                // Execute the action
                this._actions[actionName]();
            } else{
                throw "Unexpected exception: GVS::action";
            }
        },

        /**
         * Gets the document controller
         * @type DocumentController
         * @public
         */
        getDocumentController: function () {
            return this._documentController;
        },
        
        /**
         * Gets the user account object
         * @type User
         * @public
         */
        getUser: function () {
            return this._user;
        },
        
        /**
         * Sets user account object
         * @public
         */
        setUser: function (username /**String */,realname /**String */, email /** String */) {
            this._user = new User (username, realname, email);
        },
        
        // **************** PRIVATE METHODS **************** //

        /** 
         * High-level action for creating a new screenflow.
         *
         * @private
         */
        _newScreenflow: function (){
            this.getDocumentController().showNewSFDocDialog();
        },
        
        /** 
         * High-level action for adding a new screen to the catalogue.
         *
         * @private
         */
        _addScreen: function (){
            CatalogueSingleton.getInstance().showAddScDialog();
        }
        
    });
    
  
    return new function(){
        /**
         * Returns the singleton instance
         * @type GVS
         */
        this.getInstance = function(){
            if (_instance == null) {
                _instance = new GVS();
            }
            return _instance;
        }
    }
}();

// vim:ts=4:sw=4:et:
