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
                
                var label = null;
                if (selectedElement.getBuildingBlockDescription().label){
                    label = selectedElement.getBuildingBlockDescription().label['en-gb'];
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
                default:
                    alert("Element cannot be deleted");
                    break;
            }
        }
    }
}

UIUtils.setSatisfeabilityClass = function (/** DOMNode */ node, /** Boolean */ satisfeable) {
    if (satisfeable === null || satisfeable === undefined) { //Unknown satisfeability
        node.removeClassName('satisfeable');
        node.removeClassName('unsatisfeable');
    } else {
        node.removeClassName(satisfeable ? 'unsatisfeable' : 'satisfeable');
        node.addClassName(satisfeable ? 'satisfeable' : 'unsatisfeable');
    }
}

