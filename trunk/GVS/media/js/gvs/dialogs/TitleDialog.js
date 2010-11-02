var TitleDialog = Class.create(ConfirmDialog /** @lends ParamsDialog.prototype */, {
    /**
     * This class handles the dialog
     * to assign triggers to actions
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** String */ title,
                            /** Function */ onChangeCallback) {

        $super("Change Screen title");

        this._title = title;


        this._onChangeCallback = onChangeCallback;

    },

    // **************** PUBLIC METHODS **************** //

    /**
     * This function returns the DOMNode of the button that shows the
     * dialog
     * @type DOMNode
     */
    getButtonNode: function() {

    	var button = new dijit.form.Button({
            'label': '...',
            'onClick': this.show.bind(this)
        });

        return new Element('div', {
            'class': 'triggerButton'
        }).update(button.domNode);
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {
        this._setHeader(
                "Change Screen title",
                "This title will be shown when executing the gadget"
        );

        var formData = [
            {
                'type':'input',
                'label': 'Screen Title:',
                'name': 'title',
                'value': this._title,
                'message': 'Title cannot be blank',
                'required': true
            }
        ];

        this._setContent(formData);
    },

    /**
     * Overriding onOk handler
     * @private
     * @override
     */
    _onOk: function($super) {
    	$super();
        this._onChangeCallback(this._getForm().title.value);
    }
});

// vim:ts=4:sw=4:et:
