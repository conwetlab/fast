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

        var message = "Try Reloading";
        if (e) {
            message = e;
        }
        Utils.showMessage("Ooops. Something unexpected happened: " + message,{
            "error": true,
            "hide": true
        });
    },

    /**
    * This function returns the position of a node
    * @type Object
    */
    getPosition: function (/** DOMNode */ node){
        var left = 0;
        var top  = 0;

        while (node.offsetParent){
            left += node.offsetLeft - node.scrollLeft;
            top  += node.offsetTop - node.scrollTop;
            node  = node.offsetParent;
        }

        left += node.offsetLeft;
        top  += node.offsetTop;

        return {'left':left, 'top':top};
    },

    /**
     * Shows a message on top of the GVS
     */
    showMessage: function(/** String */ text, /** Object(optional) */ options) {
        $("messages").removeClassName("error");
        $("messages").removeClassName("hidden");
        $("messages").update(text);

        var position = Math.floor(($("header").clientWidth / 2) -
                                    ($("messages").clientWidth / 2));
        $("messages").setStyle({'opacity': '1', 'left': position + 'px'});
        if (options) {
            if (options.error) {
                $("messages").addClassName("error");
            }
            if (options.hide) {
                 dojo.fadeOut({
                    'duration': 2500,
                    'node': $("messages")
                }).play(options.error ? 2500 : 1500);
            }
        }
    },

    /**
     * This function returns the value of a variable, or a default one if it
     * is undefined
     * @type Object
     */
    variableOrDefault: function(/** Object */ variable, /** Object */ defaultValue){
        var result = variable;
        if (result === undefined) {
            result = defaultValue;
        }
        return result;
    },

    /**
     * Converts an Array of strings into an array
     * of objects representing the tag structure of
     * the catalogue
     */
    getCatalogueTags: function(/** Array */ tags, /** String */ user) {
        var result = new Array();
        tags.each(function(tag) {
            result.push({
                'label': {
                    'en-gb': tag
                }
            });
        });
        return result;
    },

    /**
     * This function sanitizes a string, removing:
     *    - Heading and trailing white spaces, and extra white spaces
     *    - Tabs
     *    - Carrier return
     * @type String
     */
    sanitize: function(/** String */ text) {
        var result = text.replace(/^\s+|\n|\s+$/g,"");
        result = result.replace(/\s+/g, " ");
        return result;
    }
});
