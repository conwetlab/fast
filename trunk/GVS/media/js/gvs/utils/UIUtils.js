function UIUtils()
{
    // *********************************
    //           STATIC CLASS
    // *********************************
}

// TODO: comments

UIUtils.prueba = null;

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

UIUtils.propertiesPaneUpdate = function(screen){
    var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
    var resourceDescription = currentDocument.getScreenDescription(screen);
    $(currentDocument._detailsTitle['detailsTitle']).innerHTML = "Properties of " + resourceDescription.name;
    $(currentDocument._detailsTitle['title']).innerHTML = resourceDescription.name;
    $(currentDocument._detailsTitle['id']).innerHTML = resourceDescription.uri;
    $(currentDocument._detailsTitle['desc']).innerHTML = resourceDescription.description;
    $(currentDocument._detailsTitle['tags']).innerHTML = resourceDescription.domainContext;
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

UIUtils.show = function(dijitObject) {
    dijitObject.show();
}

UIUtils.hide = function(dijitObject) {
    dijitObject.hide();
}

UIUtils.sendDeployGadgetDialog = function() {
    GVSSingleton.getInstance().getDocumentController().deployCurrentDocument();
}


UIUtils.updateSFDocAndScreenPalette = function(/** map id->value*/ screenList) {
    UIUtils.updateScreenPaletteReachability(screenList);
    UIUtils.updateSFDocumentReachability(screenList);
}

UIUtils.updateScreenPaletteReachability = function(/** map id->value*/ screenList) {
    var screens = GVSSingleton.getInstance().getDocumentController().getCurrentDocument().getPaletteController().getPalette("screen")._components;
    for (var i=0; i<screens.length; i++) {
        for (var j=0; j<screenList.length; j++) {
            if ((screens[i]._resourceDescription.uri==screenList[j].uri) && (screenList[j].value=='true')) {
                screens[i]._resourceDescription.satisfeable=true;
                break;
            } else {
                screens[i]._resourceDescription.satisfeable=false;
            }
        }
        UIUtils.colorizeScreen(screens[i]);
    }
}

UIUtils.updateSFDocumentReachability = function(/** map id->value*/ screenList) {
    var screens = GVSSingleton.getInstance().getDocumentController()._currentDocument.getScreens();
    for (var i=0; i<screens.length; i++) {
        for (var j=0; j<screenList.length; j++) {
            if ((screens[i]._resourceDescription.uri==screenList[j].uri) && (screenList[j].value=='true')) {
                screens[i]._resourceDescription.satisfeable=true;
                break;
            } else {
                screens[i]._resourceDescription.satisfeable=false;
            }
        }
        UIUtils.colorizeScreen(screens[i]);
    }
}

UIUtils.colorizeScreen = function(screen){

    var globalColor = (screen._resourceDescription.satisfeable)? "green" : "#B90000";  

    // border and posts
    $(screen._view._id).style.borderColor = globalColor;
    $$("#" + screen._view._id + " .screenTitle")[0].style.backgroundColor = globalColor;

    $$("#" + screen._view._id + " .postArea .fact").each (function(node){
        if (screen._resourceDescription.satisfeable) {
            node.removeClassName("unsatisfeable");
            node.addClassName("satisfeable");
        } else {
            node.removeClassName("satisfeable");
            node.addClassName("unsatisfeable");
        }
    });

    //pres
    $$("#" + screen._view._id + " .preArea .fact").each (function(node){
        if (screen._resourceDescription.satisfeable){
            node.removeClassName("unsatisfeable");
            node.addClassName("satisfeable");
        } else {
            node.removeClassName("satisfeable");
            node.addClassName("unsatisfeable");
        }
    });

    // Screen Class
    if (screen._resourceDescription.satisfeable) {
        $(screen._view._id).removeClassName("unsatisfeable");
        $(screen._view._id).addClassName("satisfeable");
    } else {
        $(screen._view._id).removeClassName("satisfeable");
        $(screen._view._id).addClassName("unsatisfeable");
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
            //Delete the element
            $(selectedElement.parentNode).removeChild (selectedElement);
            UIUtils.emptyPropertiesPane(currentDocument);
            UIUtils.selectElement(null);
        }
    }
}

UIUtils.emptyPropertiesPane = function(currentDocument){
    $(currentDocument._detailsTitle['detailsTitle']).innerHTML = "Properties";
    $(currentDocument._detailsTitle['title']).innerHTML = "&nbsp;";
    $(currentDocument._detailsTitle['id']).innerHTML = "&nbsp;";
    $(currentDocument._detailsTitle['desc']).innerHTML = "&nbsp;";
    $(currentDocument._detailsTitle['tags']).innerHTML = "&nbsp;";
}
