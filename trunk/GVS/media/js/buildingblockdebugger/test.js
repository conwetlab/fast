// Global vars
var bb;
var _bbClass;
var factBase;

function init () {
    $("send").observe("click", onSend);
    Logger.setLoggerNode($("log"));
    FactBase.setFactBase($("facts"));
    $("clearlog").observe("click", Logger.clearLog.bind(Logger));
}

function onSend (e) {
    var _buildingBlockCode = "_bbClass = Class.create(BuildingBlock, {\n";
    _buildingBlockCode += $("code").value + "\n";
    _buildingBlockCode += "});";
    eval (_buildingBlockCode);
    var params;
    if ($("params").value != "") {
        params = $("params").value.evalJSON();
    }
    bb = new _bbClass(params);

    // Adding the actions
    var validActions = $("actionList").value.split(/[\s]*,[\s]*/).without("");
    if (validActions.size() == 0) {
        $H(_bbClass.prototype).keys().each(function(method) {
            if (method != "constructor" && method != "initialize" &&
                method != "manageData") {
                validActions.push(method);
            }
        });
    }
    $("actions").update("");
    Logger.log("Creating action list");
    validActions.each(createAction);
}

function createAction (actionName) {
    var action = new Element('div', {
        'class': 'action'
    });
    var title = new Element('h4').update('function ' + actionName + '(');
    action.appendChild(title);
    if (_bbClass.prototype[actionName] == null) {
        Logger.log(sprintf("%s is not an operation", actionName), Logger.ERROR);
        return;
    }
    _bbClass.prototype[actionName].argumentNames().each(function(argumentName) {
        var argument = new Element('div', {
            'class': 'argument'
        }).update(argumentName);
        var ul = new Element('ul');
        var uri = new Element('li').update('uri');
        var uriField = new Element('input', {
            'type': 'text',
            'id': "uri_" + actionName + "_" + argumentName
        });
        uri.appendChild(uriField);

        var data = new Element('li').update('data');
        var dataField = new Element('input', {
            'type': 'text',
            'id': "data_" + actionName + "_" + argumentName
        });
        data.appendChild(dataField);

        ul.appendChild(uri);
        ul.appendChild(data);
        argument.appendChild(ul);
        action.appendChild(argument);
    });
    action.appendChild(document.createTextNode("); "));

    var execute = new Element('button').update("Execute");
    execute.observe('click', function() { executeAction(actionName);});
    action.appendChild(execute);
    $("actions").appendChild(action);
}

function executeAction(actionName) {
    var message = "Executing action: " + actionName;
    Logger.log(message);
    var args = [];
    var warning = false;
    _bbClass.prototype[actionName].argumentNames().each(function(argumentName) {
        try {
            var argument = {
                'uri': $("uri_" + actionName + "_" + argumentName).value,
                'data': ($("data_" + actionName + "_" +
                        argumentName).value).evalJSON()
            };
        } catch (e) {
            warning = true;
        }
        args.push(argument);
    });
    if (warning) {
        Logger.log("At least one parameter is empty", Logger.WARN);
    }
    try {
        bb[actionName].apply(bb, args);
    } catch (e) {
        Logger.log(e, Logger.ERROR);
    }
}
