var AddScreenDialog = Class.create(AbstractDialog /** @lends AddScreenDialog.prototype */, {
    /**
     * TODO: describe this class
     * @constructs
     */ 
    initialize: function() {
        /** 
         * Variable
         * @type FormDialog
         * @private @member
         */
        this._form = null;
    },
    
    /**
     * show
     */
    show: function () {
        if (this._form == null){
            this._initDialogInterface();
        }
        
        this._form.show();
    },
    
    /**
     * hide
     */
    hide: function () {
        this._form.hide();
    },
    /**
     * getForm
     * @type DOMNode
     */
    getForm: function () {
        return this._form.getForm();
    },

    // **************** PUBLIC METHODS **************** //

    
    /**
     * foo
     */
    foo: function () {
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
    },

    // **************** PRIVATE METHODS **************** //


    /** 
     * bar
     * @private
     */
    _bar: function (){
    }
    
});

// vim:ts=4:sw=4:et:
