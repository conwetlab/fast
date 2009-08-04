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

Utils.ezWebDeploy = function(/**String*/ ezWebUri,/**String*/ templateUri) {
   document.Deploy.action = ezWebUri;
   document.Deploy.template_uri.value = templateUri;
   document.Deploy.submit();
}

Utils.igoogleDeploy = function(/**String*/ uri) {
    alert("iGoogle Deployment service being developed ( " + uri + " )");
} 
