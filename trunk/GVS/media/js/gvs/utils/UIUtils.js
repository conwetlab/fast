function UIUtils()
{
    // *********************************
    //           STATIC CLASS
    // *********************************
}

// TODO: include comments

UIUtils.onKeyPressCanvas = function(e){
    if (e.keyCode == Event.KEY_DELETE) {
        var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
        if (currentDocument.getDocumentType() == Constants.DocumentType.SCREENFLOW) {
            var selectedElement = currentDocument.getSelectedElement();
            if (selectedElement != null) { //Delete an element from the canvas
                var title = null;
                var selectedElementType = null;
                var selectedElementBuildingBlockInstance = null;
                selectedElementBuildingBlockInstance = currentDocument.getBuildingBlockInstance(selectedElement.id);
                selectedElementType = selectedElementBuildingBlockInstance.getBuildingBlockType();
                switch (selectedElementType) {
                    case Constants.BuildingBlock.SCREEN:
                        var label = selectedElementBuildingBlockInstance.getBuildingBlockDescription().label['en-gb'];
                        title = (label) ? ('the screen "' + label + '"') : "the selected screen";
                        if (confirm("You are about to remove " + title + " from canvas. Are you sure?")) { //delete if ok
                            currentDocument.deleteScreen(selectedElement.id);
                            $(selectedElement.parentNode).removeChild(selectedElement);
                            currentDocument.emptyPropertiesPane();
                            currentDocument.setSelectedElement();
                        }
                        break;
                    case Constants.BuildingBlock.DOMAIN_CONCEPT:
                        var label = selectedElementBuildingBlockInstance.getBuildingBlockDescription().name;
                        title = (label) ? ('the domain concept "' + label + '"') : "the selected domain concept";
                        if (confirm("You are about to remove " + title + " from canvas. Are you sure?")) { //delete if ok
                            currentDocument.deleteDomainConcept(selectedElement.id);
                            $(selectedElement.parentNode).removeChild(selectedElement);
                            currentDocument.emptyPropertiesPane();
                            currentDocument.setSelectedElement();
                        }
                        break;
                    case Constants.BuildingBlock.CONNECTOR:
                        var label = selectedElementBuildingBlockInstance.getBuildingBlockDescription().name;
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
