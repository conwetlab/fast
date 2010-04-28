var TriggerDialog = Class.create(ConfirmDialog /** @lends TriggerDialog.prototype */, {
    /**
     * This class handles the dialog
     * to assign triggers to actions
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super,
                        /** String */ actionName, /** Array */ initialTriggerList,
                        /** Array */  canvasInstances, /** Function */ onChangeCallback) {

        $super("Assign triggers to " + actionName);

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


        this._addTriggerButton = null;

        this._removeTriggerButton = null;
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * This function returns the DOMNode of the button that shows the
     * dialog
     * @type DOMNode
     */
    getButtonNode: function() {
        return new Element('div', {
            'class': 'triggerButton'
        }).update(this._button.domNode);
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

        var subtitleZone = new Element('div', {
            'class': 'subtitle'
        });

        var selectedNode = new Element('div', {
            'style': 'float:left'
        }).update("Selected triggers");
        subtitleZone.appendChild(selectedNode);

        var unselectedNode = new Element('div', {
            'style': 'float:right'
        }).update("Unselected triggers");
        subtitleZone.appendChild(unselectedNode);

        content.appendChild(subtitleZone);

        this._selectedTriggerListNode = new Element('select', {
           'multiple': 'multiple'
        });
        this._selectedTriggerListNode.observe('change', this._onListChange.bind(this));
        var onLoadFound = false;
        if (this._initialTriggerList) {
             this._initialTriggerList.each(function(trigger) {
                var option = new Element('option', {
                    'value': trigger.getSourceInstance().getId() + "#" + trigger.getTriggerName()
                }).update(trigger.getSourceInstance().getTitle() + ": " + trigger.getTriggerName());
                this._selectedTriggerListNode.appendChild(option);
                if (trigger.constructor == ScreenTrigger) {
                    onLoadFound = true;
                }
            }.bind(this));
        }

        content.appendChild(this._selectedTriggerListNode);

        var addRemoveZone = new Element('div', {
            'class': 'addRemoveZone'
        });
        this._addTriggerButton = new dijit.form.Button({
            'iconClass': 'plusIcon',
            'showLabel': true,
            'label': '<',
            'style': 'width:25px',
            'onClick': this._onAddTrigger.bind(this)
        });
        addRemoveZone.appendChild(this._addTriggerButton.domNode);

        this._removeTriggerButton = new dijit.form.Button({
            'iconClass': 'minusIcon',
            'showLabel': true,
            'label': '>',
            'style': 'width:25px',
            'onClick': this._onRemoveTrigger.bind(this)
        });
        addRemoveZone.appendChild(this._removeTriggerButton.domNode);

        content.appendChild(addRemoveZone);

        this._unselectedTriggerListNode = new Element('select', {
           'multiple': 'multiple'
        });
        this._unselectedTriggerListNode.observe('change', this._onListChange.bind(this));

        if (!onLoadFound) {
            var option = new Element('option', {
                'value': ScreenTrigger.INSTANCE_NAME + "#" + ScreenTrigger.ONLOAD
            }).update(ScreenTrigger.INSTANCE_NAME + ": " + ScreenTrigger.ONLOAD);
            this._unselectedTriggerListNode.appendChild(option);
        }
        this._canvasInstances.each(function(instance){
            instance.getBuildingBlockDescription().triggers.each(function(trigger) {
                var triggerFound = false;
                if (this._initialTriggerList) {
                        triggerFound = this._initialTriggerList.detect(function(element) {
                        return (instance.getId() + trigger) == (element.getSourceId() +
                                                                element.getTriggerName());
                    });
                }
                if (!triggerFound) {
                    var option = new Element('option', {
                        'value': instance.getId() + "#" + trigger
                    }).update(instance.getTitle() + ": " + trigger);
                    this._unselectedTriggerListNode.appendChild(option);
                }
            }.bind(this));
        }.bind(this));

        content.appendChild(this._unselectedTriggerListNode);

        this._setContent(content);

        this._onListChange();
    },

    /**
     * Called when the add trigger button is clicked
     * @private
     */
    _onAddTrigger: function() {
        var selectionList = this._getSelectionItems(this._unselectedTriggerListNode);
        selectionList.each(function(option) {
            option.parentNode.removeChild(option);
            this._selectedTriggerListNode.appendChild(option);
        }.bind(this));
        this._onListChange();
    },

    /**
     * Called when the remove trigger button is clicked
     */
    _onRemoveTrigger: function() {
       var selectionList = this._getSelectionItems(this._selectedTriggerListNode);
        selectionList.each(function(option) {
            option.parentNode.removeChild(option);
            this._unselectedTriggerListNode.appendChild(option);
        }.bind(this));
        this._onListChange();
    },


    /**
     * Overriding onOk handler
     * @private
     * @override
     */
    _onOk: function($super){
    	$super();
        var triggersAdded = new Array();
        $A(this._selectedTriggerListNode.options).each(function(option) {
            if (this._initialTriggerList) {
                var triggerFound = this._initialTriggerList.detect(function(element) {
                    return (option.value) == (element.getSourceId() + '#' +
                                                            element.getTriggerName());
                });
                if (triggerFound == null) {
                    triggersAdded.push(option.value);
                }
            } else {
                triggersAdded.push(option.value);
            }
        }.bind(this));
        var triggersRemoved = new Array();
        $A(this._unselectedTriggerListNode.options).each(function(option) {
            if (this._initialTriggerList) {
                var triggerFound = this._initialTriggerList.detect(function(element) {
                    return (option.value) == (element.getSourceId() + '#' +
                                                            element.getTriggerName());
                });
                if (triggerFound) {
                    triggersRemoved.push(option.value);
                }
            }
        }.bind(this));
        this._onChangeCallback(this._actionName, triggersAdded, triggersRemoved);
    },

    /**
     * Called whenever a list is changed
     * @private
     */
    _onListChange: function(/** Event */ event) {
        var clickedList = null;
        if (event) {
            clickedList = event.element();
        }
        if (this._unselectedTriggerListNode == clickedList) {
            this._unselectAll(this._selectedTriggerListNode);
        }
        if (this._selectedTriggerListNode == clickedList) {
            this._unselectAll(this._unselectedTriggerListNode);
        }
        if (this._selectedTriggerListNode.selectedIndex == -1) {
            this._removeTriggerButton.attr("disabled", true);
        } else {
            this._removeTriggerButton.attr("disabled", false);
        }
        if (this._unselectedTriggerListNode.selectedIndex == -1) {
            this._addTriggerButton.attr("disabled", true);
        } else {
            this._addTriggerButton.attr("disabled", false);
        }
    },

    /**
     * Returns the list of selected elements from a selectionList
     * @type Array
     * @private
     */
    _getSelectionItems: function(/** DOMNode */ selectNode) {
        var selectionList = new Array();
        while (selectNode.selectedIndex != -1) {
            selectionList.push(selectNode.
                    options[selectNode.selectedIndex]);
            selectNode.options[selectNode.selectedIndex].selected = false;
        }
        return selectionList;
    },

    /**
     * Unselect all the elements from a list
     * @private
     */
    _unselectAll: function(/** DOMNode */ selectNode) {
        while (selectNode.selectedIndex != -1) {
            selectNode.options[selectNode.selectedIndex].selected = false;
        }
    }
});

// vim:ts=4:sw=4:et:
