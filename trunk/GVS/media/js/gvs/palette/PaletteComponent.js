var PaletteComponent = Class.create(DragSource,
    /** @lends PaletteComponent.prototype */ {

    /**
     * GUI element that represents a palette element.
     * @constructs
     * @extends DragSource
     */
    initialize: function($super,/** BuildingBlockDescription */ buildingBlockDescription,
            /** Array */ dropZones, /** InferenceEngine */ inferenceEngine) {
        $super();

        /**
         * Component and instance Drop zone
         * @type Array
         * @private
         */
        this._dropZones = dropZones;

        /**
         * BuildingBlock in which this component is based.
         * @type BuildingBlockDescription
         * @private
         */
        this._buildingBlockDescription = buildingBlockDescription;

        /**
         * @type InferenceEngine
         * @private @member
         */
        this._inferenceEngine = inferenceEngine;

        /**
         * BuildingBlock view
         * @type BuildingBlockView
         * @private
         */
        this._view = this._createView();

        /**
         * Node of the component.
         * @type DOMNode
         * @private
         */
        this._node = this._createSlot();
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Gets the component root node.
     * @type DOMNode
     * @public
     */
    getNode: function() {
        return this._node;
    },


    /**
     * Returns the node that can be clicked to start a drag-n-drop operation.
     * @type DOMNode
     * @override
     */
    getHandlerNode: function() {
        return this._view.getNode();
    },

    /**
     * Creates a new palette component to be dragged.
     * Returned object must have a getNode() method.
     * @type Object
     * @override
     */
    getDraggableObject: function() {
        var instance = this._createInstance();
        var node = instance.getHandlerNode();
        document.body.appendChild(node);
        node.setStyle({
            'top': this._getContentOffsetTop() + 'px',
            'left':  this._getContentOffsetLeft() + 'px',
            'position': 'absolute'
        });
        return instance;
    },

    getBuildingBlockDescription: function() {
        return this._buildingBlockDescription;
    },

    /**
     * Returns the root node
     * @type DOMNode
     * @public
     */
    getView: function() {
        return this._view;
    },


    // **************** PRIVATE METHODS **************** //
    /**
     * Creates an slot (GUI frame around a component) with a given title.
     *
     * @private
     */
    _createSlot: function () {
        var node = new Element("div", {"class": "slot"});
        node.appendChild(this._view.getNode());
        var titleNode = new Element("div", {"class": "slotTitle"}).update(this._getTitle());
        node.appendChild(titleNode);
        this.enableDragNDrop(null, this._dropZones);

        return node;
    },

    /**
     * Gets the title of the palette component
     * @type String
     * @abstract
     */
    _getTitle: function () {
        throw "Abstract Method invocation: PaletteComponent::_getTitle"
    },

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @abstract
     */
    _createView: function () {
        throw "Abstract Method invocation: PaletteComponent::_createView"
    },


    /**
     * Creates a new component to be dragged.
     * @type ComponentInstance
     * @abstract
     */
    _createInstance: function () {
        throw "Abstract Method invocation: PaletteComponent::_createInstance"
    },

    /**
     * Calculates the distance from the window top to the palette component.
     * @type Integer
     * @private
     */
    _getContentOffsetTop: function() {

        return this.getView().getNode().cumulativeOffset().top -
                this.getView().getNode().cumulativeScrollOffset().top;
    },

    /**
     * Calculates the distance from the window left border to the palette
     * component.
     * @type Integer
     * @private
     */
    _getContentOffsetLeft: function() {

       return this.getView().getNode().cumulativeOffset().left -
                this.getView().getNode().cumulativeScrollOffset().left;
    },

    /**
     * Creates a new Tooltip for the component view
     * @type BuildingBlockView
     * @private
     */
    _createTooltip: function (/*DomNode View*/ node) {
        var screenName =this._buildingBlockDescription.getTitle();
        var screenVersion =  this._buildingBlockDescription.version;
        var screenDescription =  this._buildingBlockDescription.description['en-gb'];

        var pres =  this._getPreConditions();
        var posts =  this._getPostConditions();

        var content = document.createElement('div');
        var title = document.createElement('h3');
        title.appendChild(document.createTextNode(screenName+' '));
        var version = document.createElement('span');
        version.style.color = '#444';
        version.appendChild(document.createTextNode(screenVersion));
        title.appendChild(version);
        content.appendChild(title);

        var description = document.createElement('p');
        description.appendChild(document.createTextNode(screenDescription));
        content.appendChild(description);

        function buildTableConditions(conditions) {
            var table = document.createElement('table');
            for (var i=0;conditions && i < conditions.length; i++) {
                var condition = conditions[i];
                var label = condition.label['en-gb'];
                var preFact = FactFactory.getFactIcon(condition, "embedded");

                var td1 = document.createElement('td');
                td1.style.border = 'none';
                td1.style.width = '10%';
                td1.appendChild(preFact.getNode());

                var td2 = document.createElement('td');
                td2.style.border = 'none';
                td2.appendChild(document.createTextNode(label));

                var tr = document.createElement('tr');
                tr.appendChild(td1);
                tr.appendChild(td2);

                table.appendChild(tr);
            }
            return table;
        }

        if (pres && pres.length > 0) {
            var inputFacts = document.createElement('h4');
            inputFacts.appendChild(document.createTextNode('Input Facts:'));
            content.appendChild(inputFacts);
            content.appendChild(buildTableConditions(pres));
        }
        if (posts && posts.length > 0) {
            var inputFacts = document.createElement('h4');
            inputFacts.appendChild(document.createTextNode('Output Facts:'));
            content.appendChild(inputFacts);
            content.appendChild(buildTableConditions(posts));
        }

        var tip = new dijit.Tooltip({connectId:[node],
            label:'<div style="max-width:300px">'+content.innerHTML+'</div>'});
        tip.startup();
    },

    /**
     * This function returns a list with all the
     * preconditions of the component.
     * @private
     * @type Array
     */
    _getPreConditions: function() {
        return this._getConditions("preconditions")
    },

    /**
     * This function returns a list with all the
     * postconditions of the component.
     * @private
     * @type Array
     */
    _getPostConditions: function() {
        return this._getConditions("postconditions")
    },

    /**
     * This function returns a list with all the
     * conditions of the component.
     * @private
     * @type Array
     */
    _getConditions: function(/*String*/type) {
        var result = [];
        var conditions = this._buildingBlockDescription[type][0];
        for (var i=0; conditions && i < conditions.length; i++) {
            result.push(conditions[i]);
        }
        return result;
    }

});

// vim:ts=4:sw=4:et:
