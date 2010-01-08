var TriggerDialog = Class.create(ConfirmDialog /** @lends TriggerDialog.prototype */, {
    /**
     * This class handles the dialog
     * to assign triggers to actions
     * @constructs
     * @extends ConfirmDialog
     */ 
    initialize: function($super, /** ComponentInstance */ element,
                        /** String */ actionName, /** Array */ initialTriggerList,
                        /** Array */  canvasInstances, /** Function */ onChangeCallback) {
        
        $super("Assign triggers to " + actionName);

        /**
         * @type Function
         * @private
         */
        this._onChangeCallback = onChangeCallback;

        /**
         * Action name
         * @type String
         * @private
         */
        this._actionName = actionName;

        /**
         * List of triggers that were initially assigned to the action
         * @type Array
         * @private
         */
        this._initialTriggerList = initialTriggerList;

        /**
         * List of canvas instances, to extract the available triggers
         * @type Hash
         * @private
         */
        this._canvasInstances = canvasInstances;

        /**
         * Button that shows the dialog
         * @type dijit.form.Button
         * @private
         */
        this._button = new dijit.form.Button({
            'label': '...',
            'onClick': this.show.bind(this)
        });
    },
    
    // **************** PUBLIC METHODS **************** //

    /**
     * This function returns the DOMNode of the button that shows the
     * dialog
     * @type DOMNode
     */
    getButtonNode: function() {
        return this._button.domNode;
    },

    // **************** PRIVATE METHODS **************** //


    /** 
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {
        // TODO
    },
    /**
     * Overriding onOk handler
     * @private
     * @override
     */
    _onOk: function($super){
    	$super();
        // TODO: build what is added and removed
        this._onChangeCallback(triggersAdded, triggersRemoved);
    }
});

// vim:ts=4:sw=4:et:
