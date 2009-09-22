var Utils = Class.create();

// **************** STATIC METHODS **************** //

Object.extend(Utils, {
    
    getIsoDateNow: function(/**Date*/ dateObject) {
        var dateString = dateObject.toJSON();
        dateString = dateString.replace(/"/,'');
        if(dateString.endsWith('Z"')){
            dateString=dateString.truncate(-2,'');
            dateString=dateString+'+0000';
        }
        return dateString;
    },
    
    ezWebDeploy: function(/**String*/ ezWebUri,/**String*/ templateUri) {
        var button = dijit.byId("ezwebButton");
        button.attr("label", "Done!");
        button.attr("disabled", true);
        window.open(ezWebUri + "?template_uri=" + templateUri);
    },
    
    igoogleDeploy: function(/**String*/ uri) {
        alert("iGoogle Deployment service being developed (<a href='" + uri + "'>" + uri +"</a>)");
    },
    
    /**
     * Copy the properties of an object into another. 
     */
    addProperties: function(/** Object */ to, /** Object */ properties) {
        if (properties) {
            $H(properties).clone().each(function(pair) {
                to[pair.key] = pair.value;
            });
        }
    },
    
    setSatisfeabilityClass: function (/** DOMNode */ node, /** Boolean */ satisfeable) {
        if (satisfeable === null || satisfeable === undefined) {
            //Unknown satisfeability
            node.removeClassName('satisfeable');
            node.removeClassName('unsatisfeable');
        } else {
            node.removeClassName(satisfeable ? 'unsatisfeable' : 'satisfeable');
            node.addClassName(satisfeable ? 'satisfeable' : 'unsatisfeable');
        }
    }
}); 
