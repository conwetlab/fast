var AddScreenDialog = Class.create(AbstractDialog /** @lends AddScreenDialog.prototype */, {
    /**
     * TODO: describe this class
     * @constructs
     */ 
    initialize: function($super) {
        $super("Add Screen");
    },
    // **************** PUBLIC METHODS **************** //
    
    
    // **************** PRIVATE METHODS **************** //    
    /** 
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @overrides
     */
    _initDialogInterface: function (){
        
        this._form.setHeader("Fulfill Screen Information", 
                             "Please fulfill the required information in order to" +
                             " add a new screen to the catalogue.");
                             
        var dialogDiv = this._form.getContentNode();
        
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
            name: "version",
            value: "1.0"
        });
        divScVersion.insert(inputScVersion);
        form.insert(divScVersion);
        
        var inputScCreationDate = new Element("input", {
            type: "hidden",
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
            name: "code",
            value: "Screencode URL..."
        });
        divScCode.insert(inputScCode);
        form.insert(divScCode);
        
        dialogDiv.insert(form);
        
        var labelExplanation = new Element("label",{
            'style': 'width: 100%'
        }).update("(*): Required Field");
        dialogDiv.insert(labelExplanation);
        
    },

    /**
     * Overriding onOk handler
     * @overrides
     */
    _onOk: function($super){
        $super();
        var creationDate = new Date();
        var form = this._form.getForm(); 
        
        
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
        
        CatalogueSingleton.getInstance().createScreen(Object.toJSON(formToSend));

    }
});

// vim:ts=4:sw=4:et:
