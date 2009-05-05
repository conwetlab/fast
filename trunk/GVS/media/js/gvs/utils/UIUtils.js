function UIUtils()
{
    // *********************************
    //           STATIC CLASS
    // *********************************
}

// TODO: include comments

UIUtils.show = function(dijitObject) {
    dijitObject.show();
}

UIUtils.hide = function(dijitObject) {
    dijitObject.hide();
}

UIUtils.selectElement = function(screen) {
    var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
    if (currentDocument.getSelectedElement()) {
        currentDocument.getSelectedElement().removeClassName("selected");
    }
    if (screen) {
        currentDocument.setSelectedElement($(screen));
        currentDocument.getSelectedElement().addClassName("selected");
        UIUtils.inspectorAreaUpdate(screen);
    } else {
        currentDocument.setSelectedElement(null);
    }
}


UIUtils.inspectorAreaUpdate = function(screen){
    //UIUtils.propertiesPaneUpdate(screen);
    //UIUtils.prePostPaneUpdate(screen);
    //UIUtils.factsPaneUpdate(screen);
}

UIUtils.prePostPaneUpdate = function(screen){
}

UIUtils.factsPaneUpdate = function(screen){
}

UIUtils.showNewSFDocDialog = function() {
    UIUtils.show(UIUtils.createNewSFDocDialog());
}

UIUtils.hideNewSFDocDialog = function() {
    UIUtils.hide(dijit.byId('newSFDocDialog'));
}

UIUtils.createNewSFDocDialog = function() {
    if (dijit.byId("newSFDocDialog") == null) {
        var dialog = new dijit.Dialog({
            "id" : "newSFDocDialog",
            "title" : "New Screenflow",
            "style" : "display:none;"
        });
        var dialogDiv = new Element("div", {
            "id" : "newSFDocDialogDiv"
        });
        var h2 = new Element("h2").update("Fulfill Screenflow Information");
        dialogDiv.appendChild(h2);
        
        var divSFInfo = new Element("div", {
            "class" : "line"
        }).update("Please fulfill the required information in order to"
            + " create a new screenflow.");
        dialogDiv.insert(divSFInfo);
        
        var divSFName = new Element("div", {
            "class" : "line"
        });
        var labelSFName = new Element("label").update("Screenflow Name:");
        divSFName.insert(labelSFName);
        var inputSFName = new Element("input", {
            type : "text",
            id : "SFName",
            name : "SFName",
            value : "New Screenflow"
        });
        divSFName.insert(inputSFName);
        dialogDiv.insert(divSFName);
        
        var divSFDomainContext = new Element("div", {
            "class" : "line"
        });
        var labelSFDomainContext = new Element("label").update("Domain Context:");
        divSFDomainContext.insert(labelSFDomainContext);
        var inputSFDomainContext = new Element("input", {
            type : "text",
            id : "SFDomainContext",
            name : "SFDomainContext",
            value : ""
        });
        divSFDomainContext.insert(inputSFDomainContext);
        dialogDiv.insert(divSFDomainContext);
        
        var divSFButtons = new Element("div", {
            "id" : "SFButtons"
        });
        var acceptSFButton = new dijit.form.Button({
            "id" : "acceptSFButton",
            "label" : "Accept",
            onClick : function() {
                var name = $('SFName').getValue(); 
                if(name && name != "") {
                    var domainContext = $("SFDomainContext").getValue();
                    var screenflowDoc = GVSSingleton.getInstance().getDocumentController().createSFDocument(name, domainContext);
                    UIUtils.hideNewSFDocDialog();
                }else{
                    alert("A Screenflow name must be provided");
                }
            }
        });
        divSFButtons.insert(acceptSFButton.domNode);
        var cancelSFButton = new dijit.form.Button({
            id : "cancelSFButton",
            label : "Cancel",
            onClick : function() {
                UIUtils.hideNewSFDocDialog();
            }
        });
        divSFButtons.appendChild(cancelSFButton.domNode);
        dialogDiv.insert(divSFButtons);
        dialog.setContent(dialogDiv);
        return dialog;
        
    } else {
        return dijit.byId("newSFDocDialog");
    }
}

UIUtils.showDeployGadgetDialog = function() {
    var currentDoc = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
    if(currentDoc.getDocumentType() == "screenflow") {
        var deployDialog = UIUtils.createDeployGadgetDialog();
        var form = $('gadgetDeployForm');
        form.name.value = currentDoc.getTitle();
        UIUtils.show(deployDialog);
    } else {
        alert("Current document is not deployable");
    }
}

UIUtils.hideDeployGadgetDialog = function() {
    UIUtils.hide(dijit.byId('deployGadgetDialog'));
}

UIUtils.createDeployGadgetDialog = function() {
    if (dijit.byId("deployGadgetDialog") == null) {
        var dialog = new dijit.Dialog({
            "id" : "deployGadgetDialog",
            "title" : "Deploy Gadget",
             "style" : "display:none;"
        });
        var dialogDiv = new Element("div", {
            "id" : "deployGadgetDialogDiv"
        });
        var h2 = new Element("h2").update("Fulfill Gadget Information");
        dialogDiv.appendChild(h2);
        var divWizardInfo = new Element("div", {
            "id" : "wizardInfo"
        });
        var divInfo = new Element("div", {
            "class" : "line"
        }).update("Please fulfill the required information in order to"
            + " deploy a gadget.");
        divWizardInfo.insert(divInfo);
        var form1 = new Element('form', {
            "id" : "gadgetDeployForm",
            method : "post"
        });
        var hGadgetInformation = new Element('h3').update("Gadget information");
        form1.insert(hGadgetInformation);

        var divGadgetName = new Element("div", {
            "class" : "line"
        });
        var labelGadgetName = new Element("label").update("Gadget Name:");
        divGadgetName.insert(labelGadgetName);
        var inputGadgetName = new Element("input", {
            type : "text",
            id : "name",
            name : "name",
            value : "FAST Gadget"
        });
        divGadgetName.insert(inputGadgetName);
        form1.insert(divGadgetName);

        var divVendor = new Element("div", {
            "class" : "line"
        });
        var labelVendor = new Element("label").update("Vendor:");
        divVendor.insert(labelVendor);
        var inputVendor = new Element("input", {
            type : "text",
            id : "vendor",
            name : "vendor",
            value : "Morfeo"
        });
        divVendor.insert(inputVendor);
        form1.insert(divVendor);

        var divVersion = new Element("div", {
            "class" : "line"
        });
        var labelVersion = new Element("label").update("Version:");
        divVersion.insert(labelVersion);
        var inputVersion = new Element("input", {
            type : "text",
            id : "version",
            name : "version",
            value : "1.0"
        });
        divVersion.insert(inputVersion);
        form1.insert(divVersion);

        var divGadgetDescription = new Element("div", {
            "class" : "line"
        });
        var labelGadgetDescription = new Element("label")
            .update("Gadget Description:");
        divGadgetDescription.insert(labelGadgetDescription);
        var inputGadgetDescription = new Element("input", {
            type : "text",
            id : "info",
            name : "info",
            value : "Write your description here..."
        });
        divGadgetDescription.insert(inputGadgetDescription);
        form1.insert(divGadgetDescription);

        var hAuthorInformation = new Element('h3').update("Author information");
        form1.insert(hAuthorInformation);

        var divAuthorName = new Element("div", {
            "class" : "line"
        });
        var labelAuthorName = new Element("label").update("Author Name:");
        divAuthorName.insert(labelAuthorName);
        var inputAuthorName = new Element("input", {
            type : "text",
            id : "author",
            name : "author",
            value : "Your Author name"
        });
        divAuthorName.insert(inputAuthorName);
        form1.insert(divAuthorName);

        var divEmail = new Element("div", {
            "class" : "line"
        });
        var labelEmail = new Element("label").update("E-Mail:");
        divEmail.insert(labelEmail);
        var inputEmail = new Element("input", {
            type : "text",
            id : "email",
            name : "email",
            value : "email@yourcompany.com"
        });
        divEmail.insert(inputEmail);
        form1.insert(divEmail);

        var inputDeployScreens = new Element("input", {
            type : "hidden",
            id : "deployScreens",
            name : "screens"
        });
        form1.insert(inputDeployScreens);

        var inputDeploySlots = new Element("input", {
            type : "hidden",
            id : "deploySlots",
            name : "slots"
        });
        form1.insert(inputDeploySlots);

        var inputDeployEvents = new Element("input", {
            type : "hidden",
            id : "deployEvents",
            name : "events"
        });
        form1.insert(inputDeployEvents);

        divWizardInfo.insert(form1);
        dialogDiv.appendChild(divWizardInfo);

        var divWizardButtons = new Element("div", {
            "id" : "wizardButtons"
        });
        var sendButton = new dijit.form.Button({
            "id" : "sendButton",
            "label" : "Send",
            onClick : function() {
                UIUtils.sendDeployGadgetDialog();
            }
        });
        divWizardButtons.insert(sendButton.domNode);
        var cancelButton = new dijit.form.Button({
            id : "cancelButton",
            label : "Cancel",
            onClick : function() {
                UIUtils.hideDeployGadgetDialog();
            }
        });
        divWizardButtons.appendChild(cancelButton.domNode);
        dialogDiv.appendChild(divWizardButtons);
        dialog.setContent(dialogDiv);
        return dialog;
    } else {
        return dijit.byId("deployGadgetDialog");
    }
}

UIUtils.sendDeployGadgetDialog = function() {
    GVSSingleton.getInstance().getDocumentController().deployCurrentDocument();
}

UIUtils.showAddScDialog = function() {
    var addScDialog = UIUtils.createAddScDialog();
    UIUtils.show(addScDialog);
}

UIUtils.hideAddScDialog = function(){
    UIUtils.hide(dijit.byId('addScDialog'));
}

UIUtils.createAddScDialog = function() {
    if (dijit.byId("addScDialog") == null) {
        var dialog = new dijit.Dialog({
            "id" : "addScDialog",
            "title" : "Add Screen",
            "style" : "display:none;"
        });

        var dialogDiv = new Element("div", {
            "id" : "addScDialogDiv"
        });
        var h2 = new Element("h2").update("Fulfill Screen Information");
        dialogDiv.insert(h2);
        var divScInfo = new Element("div", {
            "class" : "line"
        }).update("Please fulfill the required information in order to"
            + " add a new screen to the catalogue.");
        dialogDiv.insert(divScInfo);
        
        var form2 = new Element('form', {
            "id" : "addScreenForm",
            method : "post"
        });
        
        var hScreenInformation = new Element('h3').update("Screen information");
        form2.insert(hScreenInformation);
        
        var divScLabel = new Element("div", {
            "class" : "line"
        });
        var labelScLabel = new Element("label").update("Label:");
        divScLabel.insert(labelScLabel);
        var inputScLabel = new Element("input", {
            type : "text",
            id : "ScLabel",
            Name : "label",
            value : "Label of the screen..."
        });
        divScLabel.insert(inputScLabel);
        form2.insert(divScLabel);

        var divScDesc = new Element("div", {
            "class" : "line"
        });
        var labelScDesc = new Element("label").update("Description:");
        divScDesc.insert(labelScDesc);
        var inputScDesc = new Element("input", {
            type : "text",
            id : "ScDesc",
            name : "description",
            value : "Short description of the screen..."
        });
        divScDesc.insert(inputScDesc);
        form2.insert(divScDesc);

        var divScCreator = new Element("div", {
            "class" : "line"
        });
        var labelScCreator = new Element("label").update("Creator URL (*):");
        divScCreator.insert(labelScCreator);
        var inputScCreator = new Element("input", {
            type : "text",
            id : "ScCreator",
            name : "creator",
            value : "creator URL..."
        });
        divScCreator.insert(inputScCreator);
        form2.insert(divScCreator);
        
        var divScRights = new Element("div", {
            "class" : "line"
        });
        var labelScRights = new Element("label").update("Rights URL (*):");
        divScRights.insert(labelScRights);
        var inputScRights = new Element("input", {
            type : "text",
            id : "ScRights",
            name : "rights",
            value : "rights URL..."
        });
        divScRights.insert(inputScRights);
        form2.insert(divScRights);

        var divScVersion = new Element("div", {
            "class" : "line"
        });
        var labelScVersion = new Element("label").update("Version:");
        divScVersion.insert(labelScVersion);
        var inputScVersion = new Element("input", {
            type : "text",
            id : "ScVersion",
            name : "version",
            value : "1.0"
        });
        divScVersion.insert(inputScVersion);
        form2.insert(divScVersion);

        var inputScCreationDate = new Element("input", {
            type : "hidden",
            id : "ScCreationDate",
            name : "creationDate",
            value : ""
        });
        form2.insert(inputScCreationDate);

        var divScIcon = new Element("div", {
            "class" : "line"
        });
        var labelScIcon = new Element("label").update("Icon URL (*):");
        divScIcon.insert(labelScIcon);
        var inputScIcon = new Element("input", {
            type : "text",
            id : "ScIcon",
            name : "icon",
            value : "icon URL..."
        });
        divScIcon.insert(inputScIcon);
        form2.insert(divScIcon);

        var divScScshot = new Element("div", {
            "class" : "line"
        });
        var labelScScshot = new Element("label").update("Screenshot URL (*):");
        divScScshot.insert(labelScScshot);
        var inputScScshot = new Element("input", {
            type : "text",
            id : "ScScshot",
            name : "screenshot",
            value : "screenshot URL..."
        });
        divScScshot.insert(inputScScshot);
        form2.insert(divScScshot);

        var divScDomainContext = new Element("div", {
            "class" : "line"
        });
        var labelScDomainContext = new Element("label").update("Domain Context:");
        divScDomainContext.insert(labelScDomainContext);
        var inputScDomainContext = new Element("input", {
            type : "text",
            id : "ScDomainContext",
            name : "domainContext",
            value : "Write domain context as tags separated by ','..."
        });
        divScDomainContext.insert(inputScDomainContext);
        form2.insert(divScDomainContext);

        var divScHomepage = new Element("div", {
            "class" : "line"
        });
        var labelScHomepage = new Element("label").update("Homepage (*):");
        divScHomepage.insert(labelScHomepage);
        var inputScHomepage = new Element("input", {
            type : "text",
            id : "ScHomepage",
            name : "homepage",
            value : "homepage URL..."
        });
        divScHomepage.insert(inputScHomepage);
        form2.insert(divScHomepage);

        var divScPrecs = new Element("div", {
            "class" : "line"
        });
        var labelScPrecs = new Element("label").update("Preconditions:");
        divScPrecs.insert(labelScPrecs);
        var inputScPrecs = new Element("input", {
            type : "text",
            id : "ScPrecs",
            name : "preconditions",
            value : "If any, write preconditions separated by ','..."
        });
        divScPrecs.insert(inputScPrecs);
        form2.insert(divScPrecs);

        var divScPosts = new Element("div", {
            "class" : "line"
        });
        var labelScPosts = new Element("label").update("Postconditions:");
        divScPosts.insert(labelScPosts);
        var inputScPosts = new Element("input", {
            type : "text",
            id : "ScPosts",
            name : "postconditions",
            value : "If any, write postconditions separated by ','..."
        });
        divScPosts.insert(inputScPosts);
        form2.insert(divScPosts);

        var divScCode = new Element("div", {
            "class" : "line"
        });
        var labelScCode = new Element("label").update("Screen code URL (*):");
        divScCode.insert(labelScCode);
        var inputScCode = new Element("input", {
            type : "text",
            id : "ScCode",
            name : "code",
            value : "Screencode URL..."
        });
        divScCode.insert(inputScCode);
        form2.insert(divScCode);

        dialogDiv.insert(form2);

        var labelExplanation = new Element("label").update("(*): Required Field");
        dialogDiv.insert(labelExplanation);

        var divScButtons = new Element("div", {
            "id" : "ScButtons"
        });
        var acceptScButton = new dijit.form.Button({
            "id" : "acceptScButton",
            "label" : "Accept",
            onClick : function() {
                var formu = $('addScreenForm');
                var creationDate = new Date();
                formu.creationDate.setValue(Utils.getIsoDateNow(creationDate));

                var formToSend = formu.serialize(true);
                formToSend.label = {"en-GB":formu.label.getValue()};
                formToSend.description = {"en-GB":formu.description.getValue()};
                
                var domainContextArray = formu.domainContext.getValue().split(',');
                for(var i = 0; i < domainContextArray.length ; i++) {
                    var aux = domainContextArray[i].strip();
                    if(aux && aux != ""){
                        domainContextArray[i] = aux;
                    }else{
                        domainContextArray[i] = null;
                    }
                }
                domainContextArray = domainContextArray.compact();
                formToSend.domainContext = {"tags":domainContextArray,"user":null};
                
                var preconditionsArray = formu.preconditions.getValue().split(',');
                for(var i = 0; i < preconditionsArray.length ; i++) {
                    var aux = preconditionsArray[i].strip();
                    if(aux && aux != ""){
                        preconditionsArray[i] = aux;
                    }else{
                        preconditionsArray[i] = null;
                    }
                }
                preconditionsArray = preconditionsArray.compact();
                formToSend.preconditions = preconditionsArray;

                var postconditionsArray = formu.postconditions.getValue().split(',');
                for(var i = 0; i < postconditionsArray.length ; i++) {
                    var aux = postconditionsArray[i].strip();
                    if(aux && aux != ""){
                        postconditionsArray[i] = aux;
                    }else{
                        postconditionsArray[i] = null;
                    }
                }
                postconditionsArray = postconditionsArray.compact();
                formToSend.postconditions = postconditionsArray;

                console.log("Before json");
                console.log(formToSend);
                console.log("After json");
                console.log(Object.toJSON(formToSend));
                
                var catalogueInstance = 
                CatalogueSingleton.getInstance().createScreen(Object.toJSON(formToSend));
                
                UIUtils.hideAddScDialog();
            }
        });
        divScButtons.insert(acceptScButton.domNode);
        
        var cancelScButton = new dijit.form.Button({
            id : "cancelScButton",
            label : "Cancel",
            onClick : function() {
                UIUtils.hideAddScDialog();
            }
        });
        divScButtons.insert(cancelScButton.domNode);
        dialogDiv.insert(divScButtons);
        dialog.setContent(dialogDiv);
        return dialog;
    } else {
        return dijit.byId("addScDialog");
    }
}

UIUtils.updateSFDocAndScreenPalette = function(/** map id->value*/ screenList) {
    UIUtils.updateScreenPaletteReachability(screenList);
    UIUtils.updateSFDocumentReachability(screenList);
}

UIUtils.updateScreenPaletteReachability = function(/** map id->value*/ screenList) {
    var screens = GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().getPalette("screen").getComponents();
    for (var i=0; i<screens.length; i++) {
        for (var j=0; j<screenList.length; j++) {
            if (screens[i].getResourceDescription().uri==screenList[j].uri) {
                if (screenList[j].reachability==true){
                    screens[i].getResourceDescription().satisfeable=true;
                    break;
                } else {
                    screens[i].getResourceDescription().satisfeable=false;
                }
            }
        }
        UIUtils.colorizeScreen(screens[i]);
    }
}

UIUtils.updateSFDocumentReachability = function(/** map id->value*/ screenList) {
    var screens = GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getScreens();
    for (var i=0; i<screens.length; i++) {
        for (var j=0; j<screenList.length; j++) {
            if (screens[i].getResourceDescription().uri==screenList[j].uri) {
                if (screenList[j].reachability==true){
                    screens[i].getResourceDescription().satisfeable=true;
                    break;
                } else {
                    screens[i].getResourceDescription().satisfeable=false;
                }
            }
        }
        UIUtils.colorizeScreen(screens[i]);
    }
}

UIUtils.colorizeScreen = function(screen){

    var globalColor = (screen.getResourceDescription().satisfeable)? "green" : "#B90000";

    // border and posts
    $(screen.getView().getId()).style.borderColor = globalColor;
    $$("#" + screen.getView().getId() + " .screenTitle")[0].style.backgroundColor = globalColor;

    $$("#" + screen.getView().getId() + " .postArea .fact").each (function(node){
        if (screen.getResourceDescription().satisfeable) {
            node.removeClassName("unsatisfeable");
            node.addClassName("satisfeable");
        } else {
            node.removeClassName("satisfeable");
            node.addClassName("unsatisfeable");
        }
    });

    //pres
    $$("#" + screen.getView().getId() + " .preArea .fact").each (function(node){
        if (screen.getResourceDescription().satisfeable){
            node.removeClassName("unsatisfeable");
            node.addClassName("satisfeable");
        } else {
            node.removeClassName("satisfeable");
            node.addClassName("unsatisfeable");
        }
    });

    // Screen Class
    if (screen.getResourceDescription().satisfeable) {
        $(screen.getView().getId()).removeClassName("unsatisfeable");
        $(screen.getView().getId()).addClassName("satisfeable");
    } else {
        $(screen.getView().getId()).removeClassName("satisfeable");
        $(screen.getView().getId()).addClassName("unsatisfeable");
    }
}

UIUtils.onClickCanvas = function(e){
    var canvas = Event.element(e);
    if (canvas.id.startsWith("tabContent"))
    {
        //Element.childElements(canvas).each(function(s){s.style.borderWidth = "1px"});
        var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
        UIUtils.emptyPropertiesPane(currentDocument)
        //previousElement = null;
        UIUtils.selectElement(null);
    }

}

UIUtils.onClick = function(e, el){
    if (!el)
        var element = Event.element(e);
    else
        var element = $(el);

    var elementClass = $w(element.className);
    elementClass = elementClass.without("unknown").without("satisfeable").without("unsatisfeable").without("selected").without("view");
    var resourceType = (elementClass.size()>=1)?elementClass[0] : "unknown";
    var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
    switch (resourceType){
        case "img":
        case "fact":
        case "medium_fact":
            element = element.parentNode;
        case "screenTitle":
        case "preArea":
        case "postArea":
        case "prepostSeparator":
        case "screenImage":
            //Workaround for title bar
            element = element.parentNode;
        case "screen":
            UIUtils.propertiesPaneUpdate(element.id);
            break;
        default:
            UIUtils.emptyPropertiesPane(currentDocument);
            break;
    }
    UIUtils.selectElement(element.id);
}

UIUtils.onDblClick = function(e, el){
    if (!el)
        var element = Event.element(e);
    else
        var element = $(el);
    var elementClass = $w(element.className);
    elementClass = elementClass.without("unknown").without("satisfeable").without("unsatisfeable").without("selected").without("view");
    var resourceType = (elementClass.size()>=1)?elementClass[0] : "unknown";
    var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
    switch (resourceType){
        case "img":
        case "fact":
        case "medium_fact":
            element = element.parentNode;
        case "screenTitle":
        case "preArea":
        case "postArea":
        case "prepostSeparator":
        case "screenImage":
            //Workaround for title bar
            element = element.parentNode;
        case "screen":
            UIUtils.updatePreviewTab(element.id);
            break;
        default:
            //UIUtils.emptyPropertiesPane(currentDocument);
            break;
    }
    //UIUtils.selectElement(element.id);
}

UIUtils.onKeyPressCanvas = function(e){
    var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
    var selectedElement = currentDocument.getSelectedElement();
    if (e.keyCode == Event.KEY_DELETE && selectedElement){ //Delete an element from the canvas
        var title = (selectedElement.title)?selectedElement.title:"the selected element";
        if(confirm("You are about to remove " + title + " from canvas. Are you sure?")) { //delete if ok
            //if it is a screen, Delete it from the screen list
            if (currentDocument.getScreenDescription(selectedElement.id)){
                currentDocument.deleteScreen(selectedElement.id);
                //If there are no screens in the screenflow, hide the generate button
                //if (screens.length == 0){
                    //screenflowButton(false);
                //}
            }
            //Delete the element from the canvas
            $(selectedElement.parentNode).removeChild(selectedElement);
            UIUtils.emptyPropertiesPane(currentDocument);
            UIUtils.selectElement(null);
        }
    }
}

UIUtils.propertiesPaneUpdate = function(screenId){
    var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
    var resourceDescription = currentDocument.getScreenDescription(screenId);
    $(currentDocument.getDetailsTitle('detailsTitle')).innerHTML = "Properties of " + resourceDescription.name;
    $(currentDocument.getDetailsTitle('title')).innerHTML = resourceDescription.name;
    $(currentDocument.getDetailsTitle('id')).innerHTML = resourceDescription.uri;
    $(currentDocument.getDetailsTitle('desc')).innerHTML = resourceDescription.description;
    $(currentDocument.getDetailsTitle('tags')).innerHTML = resourceDescription.domainContext;
}

UIUtils.emptyPropertiesPane = function(currentDocument){
    $(currentDocument.getDetailsTitle('detailsTitle')).innerHTML = "Properties";
    $(currentDocument.getDetailsTitle('title')).innerHTML = "&nbsp;";
    $(currentDocument.getDetailsTitle('id')).innerHTML = "&nbsp;";
    $(currentDocument.getDetailsTitle('desc')).innerHTML = "&nbsp;";
    $(currentDocument.getDetailsTitle('tags')).innerHTML = "&nbsp;";
}

UIUtils.updatePreviewTab = function(screenId){
    var documentController = GVSSingleton.getInstance().getDocumentController();
    var screenDescription = documentController.getCurrentDocument().getScreenDescription(screenId);
    var screenflowDoc = documentController.createPreviewDocument(screenDescription);
}
