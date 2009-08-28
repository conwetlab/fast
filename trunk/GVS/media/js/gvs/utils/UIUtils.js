function UIUtils()
{
    // *********************************
    //           STATIC CLASS
    // *********************************
}

//FIXME: This class must dissapear
//       or adapted to the class conventions

UIUtils.onKeyPressCanvas = function(e){
    
    if (e.keyCode == Event.KEY_DELETE) {
    
        var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
        
        if (currentDocument.getSelectedElement){
        
            var selectedElement = currentDocument.getSelectedElement();
            
            if (selectedElement != null) { //Delete an element from the canvas
                
                if (selectedElement.getBuildingBlockDescription().label){
                    var label = selectedElement.getBuildingBlockDescription().label['en-gb'];
                }
                else {//FIXME: workaround for connectors
                    var label = selectedElement.getBuildingBlockDescription().name;
                }
                title = (label) ? ('the element "' + label + '"') : "the selected element";
                confirm("You are about to remove " + title + " from canvas. Are you sure?", 
                        UIUtils.deleteHandler);
            }
        }
    }
}

UIUtils.deleteHandler = function (/** Boolean */ remove){
    if (remove) {
        
        var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
        var selectedElement = currentDocument.getSelectedElement();
        
        if (selectedElement != null) {
            type = selectedElement.getBuildingBlockType();

            switch (type) {
                case Constants.BuildingBlock.SCREEN:
                    currentDocument.deleteScreen(selectedElement);                       
                    break;
                case Constants.BuildingBlock.DOMAIN_CONCEPT:
                    currentDocument.deleteDomainConcept(selectedElement);
                    break;
                case Constants.BuildingBlock.CONNECTOR:      
                    currentDocument.deleteConnector(selectedElement);
                    break;
                default:
                    alert("Element cannot be deleted");
                    break;
            }
        }
    }
}

