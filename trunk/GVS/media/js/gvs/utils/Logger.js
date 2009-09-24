var Logger = Class.create();

Object.extend(Logger, {
    serverError: function(/** XmlHttpRequest */ transport, /** Exception */ e){
        var msg;
        if (e) {
            msg = "JavaScript exception on file #{errorFile} (line: #{errorLine}): #{errorDesc}".interpolate({errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e});
        } else if (transport.responseXML) {
            msg = transport.responseXML.documentElement.textContent;
        } else {
            try {
                m = JSON.parse(transport.responseText);
                msg = m.message;
            } catch (e) {}
            if(!msg){
                msg = "HTTP Error #{status} - #{text}".interpolate({status: transport.status, text: transport.statusText});
            }
        }
        console.log(msg);
    }
    
});