var FormDescription = Class.create(BuildingBlockDescription,
    /** @lends FormDescription.prototype */ {

    /**
     * Form building block description.
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);
    },

    /**
     * This method creates a DOM Node with the preview
     * of the Form
     * @type DOMNode
     */
    getPreview: function() {
        var node = new Element('div', {
            'class': 'preview'
        });
        var errorField = new Element('div', {
            'class': 'error'
        });
        node.appendChild(errorField);

        var image = new Element ('img', {
            'src': this.screenshot,
            'onerror': 'this.src = "/fast/images/gui/imageNotFound.png";'
        });

        node.appendChild(image);
        return node;
    }
});

// vim:ts=4:sw=4:et:
