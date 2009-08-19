/**
 * <p>This class implements the Singleton Design Pattern to make sure there is
 * only one instance of the class Catalogue.
 *
 * <p> It should be accessed as follows.
 *
 * @constructor
 * @example
 * var instance = CatalogueSingleton.getInstance();
 */
var CatalogueSingleton = function(){
    /**
     * Singleton instance
     * @private @member
     */
    var instance = null;
    
    var Catalogue = Class.create( /** @lends CatalogueSingleton-Catalogue.prototype */{
        /** @constructs */
        initialize: function(){
            /**
             * BuildingBlock factories
             * @type Hash
             * @private
             */
            this._factories = {
                'screen': new ScreenFactory(),
                'connector': new ConnectorFactory(),
                'domainConcept': new DomainConceptFactory()
            };
            
            /**
             * Dialog to add a new screen
             * @type FormDialog
             * @private
             */
            this._addScDialog = null;
        },
        
        // **************** PUBLIC METHODS **************** //
        
        /**
         * Gets a building block factory for a given type of building blocks
         * @type BuildingBlockFactory
         * @public
         */
        getBuildingBlockFactory: function(/** String */buildingBlockType){
            return this._factories[buildingBlockType];
        },
        
        getFacts: function(){
            var onSuccess = function(response){
                var factMetadata = response.responseText.evalJSON();
                FactFactorySingleton.getInstance().setFacts(factMetadata);
            }
            var onError = function(response, e){
                console.error(e);
            }
            
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendGet(URIs.catalogueGetFacts, this, onSuccess, onError);
        },
        
        getDomainConcepts: function(){
            var onDConceptsSuccess = function(response){
                var domainConceptMetadata = response.responseText.evalJSON();
                this.getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT).updateBuildingBlockDescriptions(domainConceptMetadata.domainConcepts);
                var paletteController = GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController();
                var domainConceptPalette = paletteController.getPalette(Constants.BuildingBlock.DOMAIN_CONCEPT);
                domainConceptPalette.paintComponents();
            }
            var onDConceptsError = function(response, e){
                console.error(e);
            }
            
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendGet(URIs.catalogueGetDomainConcepts, this, onDConceptsSuccess, onDConceptsError);
        },
        
        getMetadataAndCheckPalette: function(/**Array*/listElements){
            var getDataOnSuccess = function(response){
                var responseJSON = response.responseText;
                var screenMetadata = eval('(' + responseJSON + ')');
                //update the Screen Factory
                this.getBuildingBlockFactory(Constants.BuildingBlock.SCREEN).updateBuildingBlockDescriptions(screenMetadata.screens);
                //repaint the Screen Palette
                var paletteController = GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController();
                var screenPalette = paletteController.getPalette(Constants.BuildingBlock.SCREEN);
                screenPalette.paintComponents();
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().updateReachability(listElements);
            }
            
            var getDataOnError = function(transport, e){
                console.log("getMetadataError");
                //TODO error handling
            }
            
            var listElementUris = new Array();
            for (var i = 0; i < listElements.length; i++) {
                listElementUris.push(listElements[i].uri);
            }
            
            var newListElements = listElementUris.clone();
            // get the uris list and call get_metadata
            var screenDescriptions = this.getBuildingBlockFactory(Constants.BuildingBlock.SCREEN).getBuildingBlockDescriptions();
            newListElements.each(function(uri, index){
                screenDescriptions.each(function(screen){
                    if (uri == screen.uri) {
                        newListElements[index] = null;
                        throw $break;
                    }
                });
            });
            
            newListElements = newListElements.compact();
            if (newListElements.size() > 0) {
                //TODO get the uris from the screenList argument in order to do the get_metadata request to the catalogue
                var postData = newListElements;
                postData = Object.toJSON(postData);
                var persistenceEngine = PersistenceEngineFactory.getInstance();
                persistenceEngine.sendPost(URIs.catalogueGetMetadata, null, postData, this, getDataOnSuccess, getDataOnError);
            }
            else {
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().getPalette(Constants.BuildingBlock.SCREEN).paintComponents();
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().updateReachability(listElements);
            }
        },
        
        getMetadataAndCheckCanvas: function(/**Array*/listCanvas){
            var getDataOnSuccess = function(response){
                console.log("getMetadataSuccess");
                var responseJSON = response.responseText;
                var screenMetadata = eval('(' + responseJSON + ')');
                console.log(screenMetadata);
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateReachability(listCanvas);
            }
            
            var getDataOnError = function(transport, e){
                console.log("getMetadataError");
                //TODO error handling
            }
            var listElementUris = new Array();
            for (var i = 0; i < listCanvas.length; i++) {
                listElementUris.push(listCanvas[i].uri);
            }
            
            var newListElements = listElementUris.clone();
            // get the uris list and call get_metadata
            var screenDescriptions = this.getBuildingBlockFactory(Constants.BuildingBlock.SCREEN).getBuildingBlockDescriptions();
            newListElements.each(function(uri, index){
                screenDescriptions.each(function(screen){
                    if (uri.uri == screen.uri) {
                        newListElements[index] = null;
                        throw $break;
                    }
                });
            });
            newListElements = newListElements.compact();
            if (newListElements.size() > 0) {
                //TODO get the uris from the screenList argument in order to do the get_metadata request to the catalogue
                var postData = newListElements;
                postData = Object.toJSON(postData);
                var persistenceEngine = PersistenceEngineFactory.getInstance();
                persistenceEngine.sendPost(URIs.catalogueGetMetadata, null, postData, this, getDataOnSuccess, getDataOnError);
            }
            else {
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateReachability(listCanvas);
            }
        },
        
        // FIXME: Adequate this method for Find requests
        getMetadata: function(/** Array*/screenUris){
            var getDataOnSuccess = function(response){
                console.log("getMetadataSuccess");
                var responseJSON = response.responseText;
                var screenMetadata = eval('(' + responseJSON + ')');
                console.log(screenMetadata);
                //update the Screen Factory
                this.getBuildingBlockFactory(Constants.BuildingBlock.SCREEN).updateBuildingBlockDescriptions(screenMetadata.screens);
                //repaint the Screen Palette
                var paletteController = GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController();
                var screenPalette = paletteController.getPalette(Constants.BuildingBlock.SCREEN);
                screenPalette.paintComponents();
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().updateReachability(screenUris);
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateReachability(screenUris);
            }
            
            var getDataOnError = function(transport, e){
                console.log("getMetadataError");
                //TODO error handling
            }
            
            var newScreenUris = screenUris.clone();
            // get the uris list and call get_metadata
            var screenDescriptions = this.getBuildingBlockFactory(Constants.BuildingBlock.SCREEN).getBuildingBlockDescriptions();
            newScreenUris.each(function(uri, index){
                screenDescriptions.each(function(screen){
                    if (uri.uri == screen.uri) {
                        newScreenUris[index] = null;
                        throw $break;
                    }
                });
            });
            newScreenUris = newScreenUris.compact();
            if (newScreenUris.size() > 0) {
                //TODO get the uris from the screenList argument in order to do the get_metadata request to the catalogue
                var postData = newScreenUris;
                postData = Object.toJSON(postData);
                var persistenceEngine = PersistenceEngineFactory.getInstance();
                persistenceEngine.sendPost(URIs.catalogueGetMetadata, null, postData, this, getDataOnSuccess, getDataOnError);
            }
            else {
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().getPalette(Constants.BuildingBlock.SCREEN).paintComponents();
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().updateReachability(screenUris);
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateReachability(screenUris);
            }
        },
        
        // TODO: When is this method useful?
        find: function(/** json*/postData){
        
            var findOnSuccess = function(response){
                var responseJSON = response.responseText;
                var listUris = eval('(' + responseJSON + ')');
                console.log("FindSuccess");
                console.log(listUris);
                this.getMetadata(listUris);
            }
            
            var findOnError = function(transport, e){
                //TODO error handling
            }
            
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendPost(URIs.catalogueFind, null, postData, this, findOnSuccess, findOnError);
            
        },

        check: function(/**Array*/canvas, /** Hash*/ domainContext, /** Array*/ elements,/** String*/ criteria){
        
            var checkOnSuccess = function(response){
                var responseJSON = response.responseText;
                var screenList = eval('(' + responseJSON + ')');
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().updateReachability(screenList.elements);
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateReachability(screenList.canvas);
            }
            
            var checkOnError = function(transport, e){
                //TODO error handling
            }
            //construct the data to be sent
            var body = {
                'canvas': canvas,
                'domainContext': domainContext,
                'elements': elements,
                'criterion': criteria
            };
            body = Object.toJSON(body);
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendPost(URIs.catalogueCheck, null, body, this, checkOnSuccess, checkOnError);
        },

        findAndCheck: function(/**Array*/canvas, /** Hash*/ domainContext, /** Array*/ elements,/** String*/ criteria){
            var findAndCheckOnSuccess = function(transport){
                var responseJSON = transport.responseText;
                var screenList = eval('(' + responseJSON + ')');
                
                var listElements = screenList.elements;
                this.getMetadataAndCheckPalette(listElements);
                
                var listCanvas = screenList.canvas;
                //TODO: interchange next lines?
                //this.getMetadataAndCheckCanvas(listCanvas);
                GVSSingleton.getInstance().getDocumentController().getCurrentDocument().updateReachability(listCanvas);
            }
            var findAndCheckOnError = function(transport, e){
                //TODO error handling
            }

            //construct the data to be sent
            var body = {
                'canvas': canvas,
                'domainContext': domainContext,
                'elements': elements,
                'criterion': criteria
            };
            body = Object.toJSON(body);

            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendPost(URIs.catalogueFindAndCheck, null, body, this, findAndCheckOnSuccess, findAndCheckOnError);
        },

        createScreen: function(/**String*/screenJson){
            var createScreenOnSuccess = function(response){
                var responseJSON = response.responseText;
                var screen = eval('(' + responseJSON + ')');
                //FIXME the catalogue should response with an http error
                if (screen.uri == undefined || screen.uri == null) {
                    console.log("createScreenOnError");
                    alert("Server error in the Screen creation");
                }
                else {
                    var alertMsg = "Screen correctly created!\nLabel: " + screen.label['en-GB'] + "\nURI: " + screen.uri;
                    alert(alertMsg);
                }
            }
            
            var createScreenOnError = function(transport, e){
                alert(e.message);
                //TODO error handling
            }
            
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.sendPost(URIs.catalogueCreateScreen, null, screenJson, this, createScreenOnSuccess, createScreenOnError);
        },
        
        showAddScDialog: function(){
            if (this._addScDialog == null) {
                this._addScDialog = new FormDialog({
                    "title": "Add Screen",
                    "style": "display:none;"
                });
                var dialogDiv = new Element("div");
                var h2 = new Element("h2").update("Fulfill Screen Information");
                dialogDiv.insert(h2);
                var divScInfo = new Element("div", {
                    "class": "line"
                }).update("Please fulfill the required information in order to" +
                " add a new screen to the catalogue.");
                
                dialogDiv.insert(divScInfo);
                
                var form = new Element('form', {
                    method: "post"
                });
                
                var hScreenInformation = new Element('h3').update("Screen information");
                form.insert(hScreenInformation);
                
                var divScLabel = new Element("div", {
                    "class": "line"
                });
                var labelScLabel = new Element("label").update("Label:");
                divScLabel.insert(labelScLabel);
                var inputScLabel = new Element("input", {
                    type: "text",
                    "class": "input_AddScreenCatalog",
                    Name: "label",
                    value: "Label of the screen..."
                });
                divScLabel.insert(inputScLabel);
                form.insert(divScLabel);
                
                var divScDesc = new Element("div", {
                    "class": "line"
                });
                var labelScDesc = new Element("label").update("Description:");
                divScDesc.insert(labelScDesc);
                var inputScDesc = new Element("input", {
                    type: "text",
                    "class": "input_AddScreenCatalog",
                    name: "description",
                    value: "Short description of the screen..."
                });
                divScDesc.insert(inputScDesc);
                form.insert(divScDesc);
                
                var divScCreator = new Element("div", {
                    "class": "line"
                });
                var labelScCreator = new Element("label").update("Creator URL (*):");
                divScCreator.insert(labelScCreator);
                var inputScCreator = new Element("input", {
                    type: "text",
                    "class": "input_AddScreenCatalog",
                    name: "creator",
                    value: "creator URL..."
                });
                divScCreator.insert(inputScCreator);
                form.insert(divScCreator);
                
                var divScRights = new Element("div", {
                    "class": "line"
                });
                var labelScRights = new Element("label").update("Rights URL (*):");
                divScRights.insert(labelScRights);
                var inputScRights = new Element("input", {
                    type: "text",
                    "class": "input_AddScreenCatalog",
                    name: "rights",
                    value: "rights URL..."
                });
                divScRights.insert(inputScRights);
                form.insert(divScRights);
                
                var divScVersion = new Element("div", {
                    "class": "line"
                });
                var labelScVersion = new Element("label").update("Version:");
                divScVersion.insert(labelScVersion);
                var inputScVersion = new Element("input", {
                    type: "text",
                    "class": "input_AddScreenCatalog",
                    name: "version",
                    value: "1.0"
                });
                divScVersion.insert(inputScVersion);
                form.insert(divScVersion);
                
                var inputScCreationDate = new Element("input", {
                    type: "hidden",
                    "class": "input_AddScreenCatalog",
                    name: "creationDate",
                    value: ""
                });
                form.insert(inputScCreationDate);
                
                var divScIcon = new Element("div", {
                    "class": "line"
                });
                var labelScIcon = new Element("label").update("Icon URL (*):");
                divScIcon.insert(labelScIcon);
                var inputScIcon = new Element("input", {
                    type: "text",
                    "class": "input_AddScreenCatalog",
                    name: "icon",
                    value: "icon URL..."
                });
                divScIcon.insert(inputScIcon);
                form.insert(divScIcon);
                
                var divScScshot = new Element("div", {
                    "class": "line"
                });
                var labelScScshot = new Element("label").update("Screenshot URL (*):");
                divScScshot.insert(labelScScshot);
                var inputScScshot = new Element("input", {
                    type: "text",
                     "class": "input_AddScreenCatalog",
                    name: "screenshot",
                    value: "screenshot URL..."
                });
                divScScshot.insert(inputScScshot);
                form.insert(divScScshot);
                
                var divScDomainContext = new Element("div", {
                    "class": "line"
                });
                var labelScDomainContext = new Element("label").update("Domain Context:");
                divScDomainContext.insert(labelScDomainContext);
                var inputScDomainContext = new Element("input", {
                    type: "text",
                    "class": "input_AddScreenCatalog",
                    name: "domainContext",
                    value: "Write domain context as tags separated by ','..."
                });
                divScDomainContext.insert(inputScDomainContext);
                form.insert(divScDomainContext);
                
                var divScHomepage = new Element("div", {
                    "class": "line"
                });
                var labelScHomepage = new Element("label").update("Homepage (*):");
                divScHomepage.insert(labelScHomepage);
                var inputScHomepage = new Element("input", {
                    type: "text",
                    "class": "input_AddScreenCatalog",
                    name: "homepage",
                    value: "homepage URL..."
                });
                divScHomepage.insert(inputScHomepage);
                form.insert(divScHomepage);
                
                var divScPrecs = new Element("div", {
                    "class": "line"
                });
                var labelScPrecs = new Element("label").update("Preconditions:");
                divScPrecs.insert(labelScPrecs);
                var inputScPrecs = new Element("input", {
                    type: "text",
                    "class": "input_AddScreenCatalog",
                    name: "preconditions",
                    value: "If any, write preconditions separated by ','..."
                });
                divScPrecs.insert(inputScPrecs);
                form.insert(divScPrecs);
                
                var divScPosts = new Element("div", {
                    "class": "line"
                });
                var labelScPosts = new Element("label").update("Postconditions:");
                divScPosts.insert(labelScPosts);
                var inputScPosts = new Element("input", {
                    type: "text",
                    "class": "input_AddScreenCatalog",
                    name: "postconditions",
                    value: "If any, write postconditions separated by ','..."
                });
                divScPosts.insert(inputScPosts);
                form.insert(divScPosts);
                
                var divScCode = new Element("div", {
                    "class": "line"
                });
                var labelScCode = new Element("label").update("Screen code URL (*):");
                divScCode.insert(labelScCode);
                var inputScCode = new Element("input", {
                    type: "text",
                    "class": "input_AddScreenCatalog",
                    name: "code",
                    value: "Screencode URL..."
                });
                divScCode.insert(inputScCode);
                form.insert(divScCode);
                
                dialogDiv.insert(form);
                
                var labelExplanation = new Element("label").update("(*): Required Field");
                dialogDiv.insert(labelExplanation);
                
                var divScButtons = new Element("div");
                var mine = this;
                var acceptScButton = new dijit.form.Button({
                    "label": "Accept",
                    onClick: function(){
                        var creationDate = new Date();
                        form.creationDate.setValue(Utils.getIsoDateNow(creationDate));
                        
                        var formToSend = form.serialize(true);
                        formToSend.label = {
                            "en-GB": form.label.getValue()
                        };
                        formToSend.description = {
                            "en-GB": form.description.getValue()
                        };
                        
                        var domainContextArray = form.domainContext.getValue().split(',');
                        for (var i = 0; i < domainContextArray.length; i++) {
                            var aux = domainContextArray[i].strip();
                            if (aux && aux != "") {
                                domainContextArray[i] = aux;
                            }
                            else {
                                domainContextArray[i] = null;
                            }
                        }
                        domainContextArray = domainContextArray.compact();
                        formToSend.domainContext = {
                            "tags": domainContextArray,
                            "user": null
                        };
                        
                        var preconditionsArray = form.preconditions.getValue().split(',');
                        for (var i = 0; i < preconditionsArray.length; i++) {
                            var aux = preconditionsArray[i].strip();
                            if (aux && aux != "") {
                                preconditionsArray[i] = aux;
                            }
                            else {
                                preconditionsArray[i] = null;
                            }
                        }
                        preconditionsArray = preconditionsArray.compact();
                        formToSend.preconditions = preconditionsArray;
                        
                        var postconditionsArray = form.postconditions.getValue().split(',');
                        for (var i = 0; i < postconditionsArray.length; i++) {
                            var aux = postconditionsArray[i].strip();
                            if (aux && aux != "") {
                                postconditionsArray[i] = aux;
                            }
                            else {
                                postconditionsArray[i] = null;
                            }
                        }
                        postconditionsArray = postconditionsArray.compact();
                        formToSend.postconditions = postconditionsArray;
                        
                        console.log("Before json");
                        console.log(formToSend);
                        console.log("After json");
                        console.log(Object.toJSON(formToSend));
                        
                        var catalogueInstance = CatalogueSingleton.getInstance().createScreen(Object.toJSON(formToSend));

                        FormDialog.prototype.hide.apply(mine._addScDialog,arguments);
                    }
                });
                divScButtons.insert(acceptScButton.domNode);
                
                var cancelScButton = new dijit.form.Button({
                    label: "Cancel",
                    onClick: function(){
                        FormDialog.prototype.hide.apply(mine._addScDialog,arguments);
                    }
                });
                divScButtons.insert(cancelScButton.domNode);
                dialogDiv.insert(divScButtons);

                this._addScDialog.getDialog().setContent(dialogDiv);
            }
            this._addScDialog.show();
        }
        
        // **************** PRIVATE METHODS **************** //
    });
    
    
    return new function(){
        /**
         * Returns the singleton instance
         * @public
         * @type Catalogue
         */
        this.getInstance = function(){
            if (instance == null) {
                instance = new Catalogue();
            }
            return instance;
        }
    }
}();

// vim:ts=4:sw=4:et: 
