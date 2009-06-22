function UIUtils()
{
    // *********************************
    //           STATIC CLASS
    // *********************************
}

// TODO: include comments

UIUtils.hide = function(dijitObject) {
    dijitObject.hide();
}

UIUtils.selectElement = function(resourceId) {
    var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
    if (currentDocument.getSelectedElement()) {
        currentDocument.getSelectedElement().removeClassName("selected");
    }
    if (resourceId) {
        currentDocument.setSelectedElement($(resourceId));
        currentDocument.getSelectedElement().addClassName("selected");
    } else {
        currentDocument.setSelectedElement(null);
    }
}

UIUtils.showConnectorDialog = function() {
    var connectorDialog = UIUtils.createConnectorDialog();
    var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
    var selectedElement = currentDocument.getSelectedElement();
    var selectedElementType = null;
    var selectedElementResourceInstance = null;
    [selectedElementResourceInstance, selectedElementType] = currentDocument.getResourceInstance(selectedElement.id);
    console.log(selectedElementResourceInstance);
    console.log(selectedElementType);
    var selectedElemProps = selectedElementResourceInstance.getProperties();
    UIUtils.updateConnectorDialog(selectedElemProps);
    connectorDialog.show();
}

UIUtils.hideConnectorDialog = function(){
    UIUtils.hide(dijit.byId('connectorDialog'));
}

UIUtils.createConnectorDialog = function() {
    if (dijit.byId("connectorDialog") == null) {
        var dialog = new dijit.Dialog({
            "id" : "connectorDialog",
            "title" : "Connector properties",
            "style" : "display:none;"
        });
        
        var dialogDiv = new Element("div", {
            "id" : "connectorDialogDiv"
        });
        var h2 = new Element("h2").update("Check connector details");
        dialogDiv.insert(h2);
        var divConnectorInfo = new Element("div", {
            "class" : "line"
        }).update("Please fulfill the required information in order to"
            + " set up the connector.");
        dialogDiv.insert(divConnectorInfo);
        
        var form2 = new Element('form', {
            "id" : "checkConnectorForm",
            method : "post"
        });
        
        var divConnectorType = new Element("div", {
            "class" : "line"
        });
        var labelConnType = new Element("label").update("Type:");
        divConnectorType.insert(labelConnType);
        var inputConnType = new Element("select", {
            id : 'ConnType',
            name : 'type'
        });
        
        var option_none = new Element("option", {
            value : "None"
        });
        option_none.innerHTML = "Choose a type...";
        inputConnType.insert(option_none);
        
        var option_in = new Element("option", {
            value : "In"
        });
        option_in.innerHTML = 'In';
        inputConnType.insert(option_in);
        var option_out = new Element("option", {
            value : "Out"
        });
        option_out.innerHTML = 'Out';

        inputConnType.insert(option_out);
        divConnectorType.insert(inputConnType);
        
        var errorConnType = new Element("span", {
            'id' : 'errorConnType'
        }).update('Please choose one valid type');
        divConnectorType.insert(errorConnType);
        
        form2.insert(divConnectorType);

        var divConnectorKind = new Element("div", {
            "class" : "line"
        });
        var labelConnKind = new Element("label").update("Kind of connection:");
        divConnectorKind.insert(labelConnKind);
        var inputConnKind = new Element("select", {
            id : 'ConnKind',
            name : 'kind'
        });
        
        var option_event_slot = new Element('option', {
            value : 'event_slot'
        });
        option_event_slot.innerHTML = 'Event/slot';
        inputConnKind.insert(option_event_slot);
        
        var option_user_context = new Element('option', {
            value : 'user_context'
        });
        option_user_context.innerHTML = 'User context';
        inputConnKind.insert(option_user_context);
        
        var option_application_context = new Element('option', {
            value : 'application_context'
        });
        option_application_context.innerHTML = 'Application context';
        inputConnKind.insert(option_application_context);
        
        divConnectorKind.insert(inputConnKind);
        form2.insert(divConnectorKind);
        
        var divConnectorFact = new Element("div", {
            "class" : "line"
        });
        var labelConnFact = new Element("label").update("Fact:");
        divConnectorFact.insert(labelConnFact);
        var inputConnFact = new Element("select", {
            id : 'ConnFact',
            name : 'fact',
            onChange : 'UIUtils.onChangeFact($F("ConnFact"));'
        });
        
        var option_none = new Element("option", {
            value : "none"
        });
        option_none.innerHTML = "Choose a fact...";
        inputConnFact.insert(option_none);
        
        var descs = CatalogueSingleton.getInstance().getResourceFactory('domainConcept').getResourceDescriptions();
        $A(descs).each(
            function(desc) {
                var option = new Element("option", {
                    value : desc.name
                });
                option.innerHTML = desc.name;
                inputConnFact.insert(option);
            }
        );

        divConnectorFact.insert(inputConnFact);
        
        var inputConnFactShortcut = new Element("input", {
            id : 'ConnFactShortcut',
            name : 'shortcut',
            type : 'hidden'
        });
        form2.insert(inputConnFactShortcut);

        var errorConnFact = new Element("span", {
            'id' : 'errorConnFact'
        }).update('Please choose one valid fact');
        divConnectorFact.insert(errorConnFact);

        form2.insert(divConnectorFact);
        
        var inputConnFactSemantics = new Element("input", {
            id : 'ConnFactSemantics',
            name : 'semantics',
            type : 'hidden'
        });
        form2.insert(inputConnFactSemantics);
        
        var divConnectorFactAttr = new Element("div", {
            "class" : "line"
        });
        var labelConnFactAttr = new Element("label").update("Fact attribute:");
        divConnectorFactAttr.insert(labelConnFactAttr);
        var inputConnFactAttr = new Element("select", {
            id : "ConnFactAttr",
            name : "factAttr"
        });
        
        var option_all = new Element("option", {
            value : ""
        });
        option_all.innerHTML = "All attributes";
        inputConnFactAttr.insert(option_all);
        
        divConnectorFactAttr.insert(inputConnFactAttr);
        form2.insert(divConnectorFactAttr);

        var divConnectorVariableName = new Element("div", {
            "class" : "line"
        });
        var labelConnVariableName = new Element("label").update("Variable name:");
        divConnectorVariableName.insert(labelConnVariableName);
        var inputConnVariableName = new Element("input", {
            type : "text",
            id : "ConnVariableName",
            name : "variableName",
            value : "variableName"
        });
        divConnectorVariableName.insert(inputConnVariableName);
        form2.insert(divConnectorVariableName);
        
        var divConnectorLabel = new Element("div", {
            "class" : "line"
        });
        var labelConnLabel = new Element("label").update("Label:");
        divConnectorLabel.insert(labelConnLabel);
        var inputConnLabel = new Element("input", {
            type : "text",
            id : "ConnLabel",
            name : "label",
            value : "Variable Label"
        });
        divConnectorLabel.insert(inputConnLabel);
        form2.insert(divConnectorLabel);

        var divConnectorFriendCode = new Element("div", {
            "class" : "line"
        });
        var labelConnFriendCode = new Element("label").update("Friend Code:");
        divConnectorFriendCode.insert(labelConnFriendCode);
        var inputConnFriendCode = new Element("input", {
            type : "text",
            id : "ConnFriendCode",
            name : "friendcode",
            value : "friendcode"
        });
        divConnectorFriendCode.insert(inputConnFriendCode);
        form2.insert(divConnectorFriendCode);

        dialogDiv.insert(form2);

        var divConnButtons = new Element("div", {
            "id" : "ScButtons"
        });
        var acceptConnButton = new dijit.form.Button({
            "id" : "acceptConnButton",
            "label" : "Accept",
            onClick : function() {
                // If no fact is selected, an error message is shown
                if ($F("ConnType") == "None"){
                    $("errorConnType").setStyle({opacity:"100"});
                    dojo.fadeOut({node:"errorConnType",duration:750,delay:750}).play();
                    return;
                }

                if ($F("ConnFact") == "none"){
                    $("errorConnFact").setStyle({opacity:"100"});
                    dojo.fadeOut({node:"errorConnFact",duration:750,delay:750}).play();
                    return;
                }

                var formu = $('checkConnectorForm');
                var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
                var selectedElement = currentDocument.getSelectedElement();
                
                var resourceInstance = null;
                var resourceType = null;
                [resourceInstance, resourceType] = currentDocument.getResourceInstance(selectedElement.id);
                if (resourceType=='connector'){
                    resourceInstance.setProperties(formu.serialize(true))
                    currentDocument.updateConnector(resourceInstance);
                }
                UIUtils.onClickCanvas(null, selectedElement);
                UIUtils.hideConnectorDialog();
            }
        });
        divConnButtons.insert(acceptConnButton.domNode);
        
        var cancelConnButton = new dijit.form.Button({
            id : "cancelConnButton",
            label : "Cancel",
            onClick : function() {
                //dijit.byId("connectorDialog").destroyRecursive();
                UIUtils.hideConnectorDialog();
            }
        });
        divConnButtons.insert(cancelConnButton.domNode);
        dialogDiv.insert(divConnButtons);
        dialog.setContent(dialogDiv);
        return dialog;
    } else {
        return dijit.byId("connectorDialog");
    }
}

UIUtils.updateConnectorDialog = function(properties) {
    $A($('ConnType').options).each(
        function(option, index){
            console.log(option.value);
            console.log(properties.get('type'));
            if(properties.get('type') == option.value){
                $('ConnType').selectedIndex = index;
            }
        }
    )
    
    $A($('ConnFact').options).each(
        function(option, index){
            if(properties.get('fact') == option.value){
                $('ConnFact').selectedIndex = index;
            }
        }
    )
    
    UIUtils.onChangeFact(properties.get('fact'));
}

UIUtils.onChangeFact = function (/** String */ value) {
    if (value == 'none') {
        UIUtils.updateConnectorFactAttr(null);
    }
    var descs = CatalogueSingleton.getInstance().getResourceFactory('domainConcept').getResourceDescriptions();
    $A(descs).each(
        function(desc) {
            if(desc.name == value) {
                UIUtils.updateConnectorFactAttr(desc);
                UIUtils.updateConnectorFactShortcut(desc);
            }
        }
    );
    console.log(value);
}

UIUtils.updateConnectorFactShortcut = function (desc) {
     $('ConnFactShortcut').setValue(desc.shortcut);
}

UIUtils.updateConnectorFactAttr = function ( /** Domain Concept Description */ desc) {
    var connFactAttr = $('ConnFactAttr');
    while( connFactAttr.length > 0 ){
        connFactAttr.remove(connFactAttr.length-1);
    }
    
    var option_all = new Element("option", {
        value : ""
    });
    option_all.innerHTML = "All attributes";
    connFactAttr.insert(option_all);
    if(desc != null){
        $A(desc.attributes).each(
            function(attr) {
                var option = new Element("option", {
                    value : attr
                });
                option.innerHTML = attr;
                connFactAttr.insert(option);
            }
        )
        var connFactSemantics = $('ConnFactSemantics');
        connFactSemantics.setValue(desc.semantics);
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

UIUtils.checkCanvas = function(element) {
    var elementClass = $w(element.className);
    elementClass = elementClass.without("unknown").without("satisfeable").without("unsatisfeable").without("selected").without("view");
    var checking = 0;
    for (var i = 0; i < elementClass.length; i++) {
        switch (elementClass[i]){
            case "document":
            case "canvas":
                checking++;
                break;
        }
    }
    if (checking == 2){
        return true;
    } else {
        return false;
    }
}

UIUtils.getResourceType = function(clickedElement) {
    var parentElement = clickedElement; 
    var resourceType = "unknown";

    var aux = 0;
    if(!UIUtils.checkCanvas(parentElement)){
        while(!UIUtils.checkCanvas(parentElement)&&aux<10){
            clickedElement = parentElement;
            parentElement = parentElement.parentNode;
            aux++;
        }
        var elementClass = $w(clickedElement.className);
        elementClass = elementClass.without("unknown").without("satisfeable").without("unsatisfeable").without("selected").without("view");
        resourceType = (elementClass.size()>=1)?elementClass[0] : "unknown";
    } else {
        resourceType = "canvas";
    }
    return [clickedElement, resourceType];
}

UIUtils.onClickCanvas = function(e, /**Optional element*/element){
    var clickedElement = null;
    if(element){
        clickedElement = element;
    } else {
        clickedElement = e.element();
    }
    var resourceType = "unknown";
    [clickedElement, resourceType] = UIUtils.getResourceType(clickedElement);
    var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
    switch(resourceType){
        case "screen":
            console.log("screen clicked");
            UIUtils.selectElement(clickedElement.id);
            currentDocument.updatePropertiesPane(clickedElement.id, "screen");
            break;
        case "domainConcept":
            console.log("domain concept clicked");
            UIUtils.selectElement(clickedElement.id);
            currentDocument.updatePropertiesPane(clickedElement.id, "domainConcept");
            break;
        case "connector":
            console.log("connector clicked");
            UIUtils.selectElement(clickedElement.id);
            currentDocument.updatePropertiesPane(clickedElement.id, "connector");
            break;
        case "canvas":
            console.log("canvas clicked");
            UIUtils.selectElement(null);
            UIUtils.emptyPropertiesPane(currentDocument);
            break;
        case "unknown":
        default:
            console.log("unknown clicked");
            UIUtils.selectElement(null);
            UIUtils.emptyPropertiesPane(currentDocument);
            break;
    }
}

UIUtils.onDblClickCanvas = function(e){
    var clickedElement = Event.element(e);
    var resourceType = "unknown";
    [clickedElement, resourceType] = UIUtils.getResourceType(clickedElement);
    var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
    switch(resourceType){
        case "screen":
            console.log("screen dbl-clicked");
            UIUtils.updatePreviewTab(clickedElement.id);
            break;
        case "domainConcept":
            console.log("domain concept dbl-clicked");
            break;
        case "connector":
            console.log("connector dbl-clicked");
            UIUtils.showConnectorDialog(clickedElement.id);
            break;
        case "canvas":
            console.log("canvas dbl-clicked");
            break;
        case "unknown":
        default:
            console.log("unknown dbl-clicked");
            break;
    }
}

UIUtils.onKeyPressCanvas = function(e){
    var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
    if(currentDocument.getDocumentType() == 'screenflow') {
        var selectedElement = currentDocument.getSelectedElement();
        if (e.keyCode == Event.KEY_DELETE && selectedElement){ //Delete an element from the canvas
            var title = null;
            var selectedElementType = null;
            var selectedElementResourceInstance = null;
            [selectedElementResourceInstance, selectedElementType] = currentDocument.getResourceInstance(selectedElement.id);
            UIUtils.getResourceType(selectedElement)[1];
            switch(selectedElementType){
                case 'screen':
                    var label = selectedElementResourceInstance.getResourceDescription().label['en-gb'];
                    title = (label)?('the screen "' + label + '"'):"the selected screen";
                    if(confirm("You are about to remove " + title + " from canvas. Are you sure?")) { //delete if ok
                        currentDocument.deleteScreen(selectedElement.id);
                        $(selectedElement.parentNode).removeChild(selectedElement);
                        UIUtils.emptyPropertiesPane(currentDocument);
                        UIUtils.selectElement(null);
                    }
                    break;
                case 'domainConcept':
                    var label = selectedElementResourceInstance.getResourceDescription().name;
                    title = (label)?('the domain concept "' + label + '"'):"the selected domain concept";
                    if(confirm("You are about to remove " + title + " from canvas. Are you sure?")) { //delete if ok
                        currentDocument.deleteDomainConcept(selectedElement.id);
                        $(selectedElement.parentNode).removeChild(selectedElement);
                        UIUtils.emptyPropertiesPane(currentDocument);
                        UIUtils.selectElement(null);
                    }
                    break;
                case 'connector':
                    var label = selectedElementResourceInstance.getResourceDescription().name;
                    title = (label)?('the connector "' + label + '"'):"the selected connector";
                    if(confirm("You are about to remove " + title + " from canvas. Are you sure?")) { //delete if ok
                        currentDocument.deleteConnector(selectedElement.id);
                        $(selectedElement.parentNode).removeChild(selectedElement);
                        UIUtils.emptyPropertiesPane(currentDocument);
                        UIUtils.selectElement(null);
                    }
                    break;
                default:
                    console.error("Element not possible to be deleted ");
                    break;
            }
        }
    }
}

UIUtils.emptyPropertiesPane = function(doc){
    doc.emptyPropertiesPane();
}

UIUtils.updatePreviewTab = function(screenId){
    var documentController = GVSSingleton.getInstance().getDocumentController();
    var screenInstance = documentController.getCurrentDocument().getResourceInstance(screenId)[0];
    var screenDescription = screenInstance.getResourceDescription();
    var screenflowDoc = documentController.createPreviewDocument(screenDescription);
}
