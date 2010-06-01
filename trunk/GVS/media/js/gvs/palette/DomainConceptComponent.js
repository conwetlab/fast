var DomainConceptComponent = Class.create(PaletteComponent,
    /** @lends DomainConceptComponent.prototype */ {

    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription domainConceptBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        var view = new DomainConceptView(this._buildingBlockDescription);
        this._createTooltip(view.getNode(), this._buildingBlockDescription);
        return view;
    },

    /**
     * Creates a new Tooltip for the component view
     * @type BuildingBlockView
     * @override
     */
    _createTooltip: function (/*DomNode View*/ node) {
        var conceptName = this._buildingBlockDescription.getTitle();

        var content = document.createElement('div');
        var title = document.createElement('h3');
        title.appendChild(document.createTextNode(conceptName+' '));
        content.appendChild(title);

        if (this._buildingBlockDescription['description']) {
            var languages = $H(this._buildingBlockDescription['description']).keys();
            if (languages.size() > 0) {
                var description = this._buildingBlockDescription['description'][languages[0]];
            } else {
                var description = this._buildingBlockDescription['description'];
            }
            var descriptionElement = document.createElement('p');
            descriptionElement.appendChild(document.createTextNode(description));
            content.appendChild(descriptionElement);
        }

        if (this._buildingBlockDescription['subClassOf']) {
            var subClassOf = document.createElement('h4');
            subClassOf.appendChild(document.createTextNode('Subclass of:'));
            content.appendChild(subClassOf);
            content.appendChild(document.createTextNode(this._buildingBlockDescription['subClassOf']));
        }

        if (this._buildingBlockDescription['uri']) {
            var subClassOf = document.createElement('h4');
            subClassOf.appendChild(document.createTextNode('URI:'));
            content.appendChild(subClassOf);
            content.appendChild(document.createTextNode(this._buildingBlockDescription['uri']));
        }

        var tip = new dijit.Tooltip({connectId:[node],
            label:'<div style="max-width:300px">'+content.innerHTML+'</div>'});
        tip.startup();
    },

    /**
     * Creates a new domain concept to be dragged.
     * @type DomainConceptInstance
     * @override
     */
    _createInstance: function () {
        return new PrePostInstance(this._buildingBlockDescription, this._inferenceEngine);
    },

    /**
     * @type String
     * @override
     */
    _getTitle: function () {
        return this._buildingBlockDescription.getTitle();
    }
});

// vim:ts=4:sw=4:et:
