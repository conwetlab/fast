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
         * Element whose action the dialog is going to configure
         * @type ComponentInstance
         * @private
         */
        this._element = element;

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
         * @type Function
         * @private
         */
        this._onChangeCallback = onChangeCallback;

        /**
         * Button that shows the dialog
         * @type dijit.form.Button
         * @private
         */
        this._button = new dijit.form.Button({
            'label': '...',
            'onClick': this.show.bind(this)
        });

        /**
         * Node of the selection list that contains the
         * unselected triggers
         * @type DOMNode
         * @private
         */
        this._unselectedTriggerListNode = null;


        /**
         * Node of the selection list that contains the
         * selected triggers
         * @type DOMNode
         * @private
         */
        this._selectedTriggerListNode = null;
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
        var content = new Element('div', {
            'class': 'triggerDialog'
        });
        var title = new Element('h2').update("Choose triggers for action: " +
                                            this._actionName);
        content.appendChild(title);

        this._selectedTriggerListNode = new Element('select', {
           'multiple': 'multiple'
        });
        if (this._initialTriggerList) {
             this._initialTriggerList.each(function(trigger) {
                var option = new Element('option', {
                    'value': trigger.getSourceId() + trigger.getTriggerName()
                }).update(trigger.getSourceInstance().getTitle() + ": " + trigger.getTriggerName());
                this._selectedTriggerListNode.appendChild(option);
            }.bind(this));
        }
       
        content.appendChild(this._selectedTriggerListNode);

        var addRemoveButton = new Element('div', {
            'class': 'addRemoveZone'
        });
        var addTrigger = new dijit.form.Button({
            'iconClass': 'plusIcon',
            'showLabel': true,
            'label': '+',
            'style': 'width:25px',
            'onClick': this._onAddTrigger.bind(this)
        });
        addRemoveButton.appendChild(addTrigger.domNode);

        var removeTrigger = new dijit.form.Button({
            'iconClass': 'minusIcon',
            'showLabel': true,
            'label': '-',
            'style': 'width:25px',
            'onClick': this._onRemoveTrigger.bind(this)
        });
        addRemoveButton.appendChild(removeTrigger.domNode);

        content.appendChild(addRemoveButton);

        this._unselectedTriggerListNode = new Element('select', {
           'multiple': 'multiple'
        });

        this._canvasInstances.each(function(instance){
            instance.getBuildingBlockDescription().triggers.each(function(trigger){
            var option = new Element('option', {
                'value': instance.getId() + trigger
            }).update(instance.getTitle() + ": " + trigger);
            this._unselectedTriggerListNode.appendChild(option);
            }.bind(this));

        }.bind(this));

        content.appendChild(this._unselectedTriggerListNode);
        
        this._setContent(content);
    },

    _onAddTrigger: function() {
        alert("added");
    },

    _onRemoveTrigger: function() {
        alert("removed");
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
