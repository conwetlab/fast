function UIUtils()
{
    // *********************************
    //           STATIC CLASS
    // *********************************
}

// TODO: include comments

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
    var resourceType = "unknown";
    if(!UIUtils.checkCanvas(clickedElement)){
        var elementClass = $w(clickedElement.className);
        elementClass = elementClass.without("unknown").without("satisfeable").without("unsatisfeable").without("selected").without("view");
        resourceType = (elementClass.size()>=1)?elementClass[0] : "unknown";
    } else {
        resourceType = "canvas";
    }
    return resourceType;
}

UIUtils.getResourceDiv = function(clickedElement) {
    var parentElement = clickedElement; 
    var aux = 0;
    while (!UIUtils.checkCanvas(parentElement) && aux < 10) {
        clickedElement = parentElement;
        parentElement = parentElement.parentNode;
        aux++;
    }
    return clickedElement;
}

UIUtils.onKeyPressCanvas = function(e){
    if (e.keyCode == Event.KEY_DELETE) {
        var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
        if (currentDocument.getDocumentType() == 'screenflow') {
            var selectedElement = currentDocument.getSelectedElement();
            if (selectedElement != null) { //Delete an element from the canvas
                var title = null;
                var selectedElementType = null;
                var selectedElementResourceInstance = null;
                selectedElementResourceInstance = currentDocument.getResourceInstance(selectedElement.id);
                selectedElementType = selectedElementResourceInstance.getBuildingBlockType();
                switch (selectedElementType) {
                    case 'screen':
                        var label = selectedElementResourceInstance.getResourceDescription().label['en-gb'];
                        title = (label) ? ('the screen "' + label + '"') : "the selected screen";
                        if (confirm("You are about to remove " + title + " from canvas. Are you sure?")) { //delete if ok
                            currentDocument.deleteScreen(selectedElement.id);
                            $(selectedElement.parentNode).removeChild(selectedElement);
                            currentDocument.emptyPropertiesPane();
                            currentDocument.setSelectedElement();
                        }
                        break;
                    case 'domainConcept':
                        var label = selectedElementResourceInstance.getResourceDescription().name;
                        title = (label) ? ('the domain concept "' + label + '"') : "the selected domain concept";
                        if (confirm("You are about to remove " + title + " from canvas. Are you sure?")) { //delete if ok
                            currentDocument.deleteDomainConcept(selectedElement.id);
                            $(selectedElement.parentNode).removeChild(selectedElement);
                            currentDocument.emptyPropertiesPane();
                            currentDocument.setSelectedElement();
                        }
                        break;
                    case 'connector':
                        var label = selectedElementResourceInstance.getResourceDescription().name;
                        title = (label) ? ('the connector "' + label + '"') : "the selected connector";
                        if (confirm("You are about to remove " + title + " from canvas. Are you sure?")) { //delete if ok
                            currentDocument.deleteConnector(selectedElement.id);
                            $(selectedElement.parentNode).removeChild(selectedElement);
                            currentDocument.emptyPropertiesPane();
                            currentDocument.setSelectedElement();
                        }
                        break;
                    default:
                        console.error("Element not possible to be deleted ");
                        break;
                }
            }
        }
    }
}
