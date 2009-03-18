var ScreenflowDocument = Class.create(AbstractDocument,
    /** @lends ScreenflowDocument.prototype */ {

    /**
     * Screenflow document.
     * @constructs
     * @extends AbstractDocument
     */
    initialize: function($super, /** String */ title) {
        $super(title);
        this._tabContent.addClassName('screenflow');
        this._validResources = ['screen','flowControl','connector', 'domainConcept'];
        this._populate();
        this._documentType='screenflow';
        /*Screenflow Definition*/
        // TODO: comment these properties and delete initial values
        this._resourceDescription = new ScreenflowDescription();
        this._screens = [];

        //find Screens and check
        // the canvas is empty because it is a new document
        // this is a proof
        var canvas = [];
        var domainContext = {'tags':this._resourceDescription.getDomainContexts(), 'user':null};
        //element list is empty TODO get the actual element list from the palette
        var elements = [];

        CatalogueSingleton.getInstance().get_screens(canvas, domainContext, elements, 'reachability');
    },


    // **************** PUBLIC METHODS **************** //
    /**
     * Returns the Resource Description for the screenflow document
     * @type {ScreenflowDescription}
     */
    getResourceDescription: function () {
        return this._resourceDescription;
    },

    /**
     * Returns the list of screens for the screenflow document
     * @type {String[]}
     */
    getScreens: function () {
        return this._screens;
    },
    
    /**
     * Adds a new screen.
     * @param screen
     *      Screen to be added to the
     *      Screenflow document.
     */
    addScreen: function (screen) {
        if(screen!=null) {
            this._screens.push(screen);
            this.getResourceDescription().addScreen(screen.getResourceDescription());
        }
    },
    
    /**
     * Creates a gadget deployment for the screenflow
     * @public
     */
    deployGadget: function () {
        this.getResourceDescription().deployGadget();
    },
    
    // **************** PRIVATE METHODS **************** //
    /**
     * Constructs the document content.
     * @private
     */
    _populate: function(){
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var borderContainerId = uidGenerator.generate("borderContainer");
        var borderContainer = new dijit.layout.BorderContainer({
            id:borderContainerId,
            design:"sidebar",
            liveSplitters:"false",
        });

        var documentContent = new Element("div", {
            "id": this._tabContentId,
            "class": "document screenflow"
        });
        var documentPaneId = uidGenerator.generate("documentPane");
        var documentPane = new dijit.layout.ContentPane({
            id:documentPaneId,
            region:"center",
        });
        documentPane.setContent(documentContent);

        /* Properties pane*/
        var propertiesPane = this._createPropertiesPane();

        /* Pre/Post pane*/
        var prePostPane = this._createPrePostPane();

        /* Facts pane*/
        var factsPane = this._createFactsPane();

        var inspectorArea = this._createInspectorArea();
        inspectorArea.addChild(propertiesPane);
        inspectorArea.addChild(prePostPane);
        inspectorArea.addChild(factsPane);
        borderContainer.addChild(documentPane);
        borderContainer.addChild(inspectorArea);
        this._tab.setContent(borderContainer.domNode);
    },
    
    _createInspectorArea: function(){
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var inspectorAreaId = uidGenerator.generate("inspectorArea");
        var inspectorArea = new dijit.layout.SplitContainer({
            id:inspectorAreaId,
            region:"bottom",
            orientation:"horizontal",
            activeSizing:"false",
            style:"height: 180px;",
            persist:"false",
            splitter:true
            });
        return inspectorArea;
    },
    
    _createPropertiesPane: function(){
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var propertiesPaneId = uidGenerator.generate("propertiesPane");
        var propertiesPane = new dijit.layout.ContentPane({
            id:propertiesPaneId,
            minSize:"100px",
            sizeShare:"10"
        });
        this._detailsTitle = uidGenerator.generate("detailsTitle");
        this._title = uidGenerator.generate("details")+".title";
        this._id = uidGenerator.generate("details")+".id";
        this._desc = uidGenerator.generate("details")+".desc";
        this._tags = uidGenerator.generate("details")+".tags";

        var content = "<div class='dijitAccordionTitle properties' id='"+this._detailsTitle +"'>Properties</div>";
        content += "<div id="+uidGenerator.generate("properties")+">";
        content += "<table>";
        content += "<tr class='tableHeader'><td class='left'>Property</td><td class='left'>Value</td></tr>";
        content += "<tr><td class='left'>Title</td><td class='right'><span id='"+this._title+"'></span></td></tr>";
        content += "<tr><td class='left'>Identifier</td><td class='right'><span id='"+this._id+"'></span></td></tr>";
        content += "<tr><td class='left'>Description</td><td class='right'><span id='"+this._desc+"'></td></tr>";
        content += "<tr><td class='left'>Tags</td><td class='right'><span id='"+this._tags+"'></td></tr>";
        content += "<tr><td class='left'>&nbsp;</td><td class='right'>&nbsp;</td></tr>";
        content += "</table>";
        content += "</div>";
        propertiesPane.setContent(content);
        return propertiesPane;
    },

    _createPrePostPane: function() {
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var prePostPaneId = uidGenerator.generate("prePostPane");
        var prePostPane = new dijit.layout.ContentPane({
            id:prePostPaneId,
            minSize:"100px",
            sizeShare:"10"
        });
        content = "<div class='dijitAccordionTitle properties'>PRE / POST</div>";
        content += "<table id='"+uidGenerator.generate("prepostContainer")+"'>";
        content += '<tr class="tableHeader"><td class="inspectorIcon bold">&nbsp;</td>';
        content += '<td class="inspectorName bold">PRE Name</td>';
        content += '<td class="inspectorDesc bold">Description</td>';
        content += '<td class="inspectorSem bold">Semantics</td></tr>';
        content += '<tr class="tableHeader"><td class="inspectorIcon bold">&nbsp;</td>';
        content += '<td class="inspectorName bold">POST Name</td>';
        content += '<td class="inspectorDesc bold">Description</td>';
        content += '<td class="inspectorSem bold">Semantics</td></tr>';
        content += "</table>";
        prePostPane.setContent(content);
        return prePostPane;
    },

    _createFactsPane: function() {
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        var factsPaneId = uidGenerator.generate("factsPane");
        var factsPane = new dijit.layout.ContentPane({
            id:factsPaneId,
            minSize:"100px",
            sizeShare:"10"
        });
        content = "<div class='dijitAccordionTitle properties'>Fact Inspector</div>";
        content += "<div id='"+uidGenerator.generate("inspector")+"'>";
        content += "<table>";
        content += "<tr class='tableHeader'><td class='inspectorIcon bold'>&nbsp;</td><td class='inspectorName bold'>Name</td><td class='inspectorDesc bold'>Description</td><td class='inspectorSem bold'>Semantics</td></tr>";
        content += "<tbody id='"+uidGenerator.generate("inspectorContainer")+"' style='overflow:auto'>";
        content += "</tbody>";
        content += "</table>";
        content += "</div>";
        factsPane.setContent(content);
        return factsPane;
    }
});

// vim:ts=4:sw=4:et:
