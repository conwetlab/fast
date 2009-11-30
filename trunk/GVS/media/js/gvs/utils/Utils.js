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
    
    ezWebDeploy: function(/** domNode */ buttonNode, /**String*/ templateUrl) {
        var button = dijit.byId(buttonNode.id);
        button.attr("label", "Done!");
        button.attr("disabled", true);
        window.open(URIs.ezweb + "interfaces/gadget?template_uri=" + templateUrl);
        console.log(URIs.ezweb + "interfaces/gadget?template_uri=" + templateUrl);
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
    },
    
    /**
     * This function extracts an uri from a rdf pattern
     * @type String
     */
    extractURIfromPattern: function(/** String */ pattern) {
        if (pattern) {
            var pieces = pattern.split(" ");
            return pieces[2];
        } else {
            return "";
        }      
    },
       
    /**
     * Logs an AJAX error
     */ 
    onAJAXError: function(transport, e){
        Logger.serverError(transport, e);
    },
    
    /**
    * This function returns the position of an object
    * @private
    * @type Object
    */
    getPosition: function (/** DOMNode */ node){
        var left = 0;
        var top  = 0;
    
        while (node.offsetParent){
            left += node.offsetLeft;
            top  += node.offsetTop;
            node  = node.offsetParent;
        }
    
        left += node.offsetLeft;
        top  += node.offsetTop;
    
        return {'left':left, 'top':top};
    }
}); 
