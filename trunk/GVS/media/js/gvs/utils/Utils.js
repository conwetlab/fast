function Utils()
{
    // *********************************
    //           STATIC CLASS
    // *********************************
}

// TODO: include comments

Utils.getIsoDateNow = function(/**Date*/ dateObject) {
    var dateString = dateObject.toJSON();
    dateString = dateString.replace(/"/,'');
    if(dateString.endsWith('Z"')){
        dateString=dateString.truncate(-2,'');
        dateString=dateString+'+0000';
    }
    return dateString;
}

Utils.ezWebDeploy = function(/**String*/ uri) {
    var onEzwebDeploySuccess = function(response) {
        var responseXML = response.responseXML;
        //TODO: finish this event management
        alert("ezWeb Deployment service being developed");
    }

    var onEzwebDeployError = function(response, e) {
        console.error(e);
    }
    
    var params = {"template_uri": uri}; 
    var persistenceEngine = PersistenceEngineFactory.getInstance();
    persistenceEngine.sendPost(URIs.deployEzwebGadget, params, null, this, onEzwebDeploySuccess, onEzwebDeployError);
}

Utils.igoogleDeploy = function(/**String*/ uri) {
    alert("iGoogle Deployment service being developed ( " + uri + " )");
} 
