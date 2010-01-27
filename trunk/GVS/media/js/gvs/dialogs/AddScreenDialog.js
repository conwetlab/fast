var AddScreenDialog = Class.create(ConfirmDialog /** @lends AddScreenDialog.prototype */, {
    /**
     * This class handles the dialog to add a new screen
     * TODO: redesign
     * @constructs
     * @extends ConfirmDialog
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
        
        this._setHeader("Fulfill Screen Information", 
                             "Please fulfill the required information in order to" +
                             " add a new screen to the catalogue.");
                             
        var formData = [
            {'type':'title', 'value': 'Screen information'},
            {'type':'input', 'label': 'Label:','name': 'label', 'value': 'Label of the screen...'},
            {'type':'input', 'label': 'Description:','name': 'description', 'value': 'Short description of the screen...'},
            {'type':'input', 'label': 'Creator URL (*):','name': 'creator', 'value': 'Creator URL...'}, //TODO: validation
            {'type':'input', 'label': 'Rights URL (*):','name': 'rights', 'value': 'Rights URL...'}, 
            {'type':'input', 'label': 'Version:','name': 'version', 'value': '1.0'}, 
            {'type':'input', 'label': 'Icon URL (*):','name': 'icon', 'value': 'icon URL...'}, 
            {'type':'input', 'label': 'Screenshot URL (*):','name': 'screenshot', 'value': 'Screenshot URL...'}, 
            {'type':'input', 'label': 'Domain Context:','name': 'tags', 'value': 'Write domain context as tags separated by ","...'},
            {'type':'input', 'label': 'Homepage (*):','name': 'homepage', 'value': 'Homepage URL...'},  
            {'type':'input', 'label': 'Preconditions:','name': 'preconditions', 'value': 'If any, write preconditions separated by ","...'},  
            {'type':'input', 'label': 'Postconditions:','name': 'postconditions', 'value': 'If any, write postconditions separated by ","...'},   
            {'type':'input', 'label': 'Screen code URL (*):','name': 'code', 'value': 'Screencode URL...'},   
            {'type':'hidden', 'name': 'creationDate', 'value': ''},   
            {'type':'label', 'value': '(*): Required Field'}
        ];
        
        this._setContent(formData);
        
    },

    /**
     * Overriding onOk handler
     * @overrides
     * @private
     */
    _onOk: function($super){
        $super();
        var creationDate = new Date();
        var form = this._getForm(); 
        
        
        form.creationDate.setValue(Utils.getIsoDateNow(creationDate));
        
        var formToSend = form.serialize(true);
        formToSend.label = {
            "en-GB": form.label.getValue()
        };
        formToSend.description = {
            "en-GB": form.description.getValue()
        };

        // TODO: Review this
        var tagsArray = form.tags.getValue().split(',');
        for (var i = 0; i < tagsArray.length; i++) {
            var aux = tagsArray[i].strip();
            if (aux && aux != "") {
                tagsArray[i] = aux;
            }
            else {
                tagsArray[i] = null;
            }
        }
        tagsArray = tagsArray.compact();
        formToSend.tags = Utils.getCatalogueTags(tagsArray, null);
        
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
