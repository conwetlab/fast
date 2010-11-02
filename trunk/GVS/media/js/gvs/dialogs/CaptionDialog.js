var CaptionDialog = Class.create(ConfirmDialog /** @lends CaptionDialog.prototype */, {
    /**
     * This class handles the dialog
     * to set a caption for a screen
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** String */ caption,
                            /** Function */ onChangeCallback) {

        $super("Add Screen caption");

        this._caption = caption;


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
                "Add Screen caption",
                "The caption will be shown in screen bottom when executing the"
                + " gadget.<br />You can use HTML tags to add formatting"
        );

        var formData = [
            {
                'type':'textarea',
                'label': 'Screen Caption:',
                'name': 'caption',
                'value': this._caption
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
        this._onChangeCallback(this._getForm().caption.value);
    }
});

// vim:ts=4:sw=4:et:
