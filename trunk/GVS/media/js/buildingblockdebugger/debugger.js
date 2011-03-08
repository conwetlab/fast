/*...............................licence...........................................
 *
 *    (C) Copyright 2011 FAST Consortium
 *
 *     This file is part of FAST Platform.
 *
 *     FAST Platform is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     FAST Platform is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with FAST Platform.  If not, see <http://www.gnu.org/licenses/>.
 *
 *     Info about members and contributors of the FAST Consortium
 *     is available at
 *
 *     http://fast.morfeo-project.eu
 *
 *...............................licence...........................................*/
var logger = new Logger();


function parseUri (str) {
    var o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

  return uri;
};

parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q: {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};



BuildingBlock = Class.create({
    initialize: function(params) {
        this.parameter = params;
    },
    manageData: function() {}
});

BuildingBlockDebugger = (function() {
    var params = {},
        actions = [],
        facts = new Hash(),
        triggers = [],
        observers = [],
        srcCode,
        bbInstance,
        bbClass;

    function getUrlCode() {
        var regex = new RegExp("[\\?&]url=([^&#]*)");
        var results = regex.exec(window.location.href);
        return results ? decodeURIComponent(results[1]) : null;
    }

    function proxyGet(url, options, context) {
        var arguments = Object.extend(options || {}, {
            'method': 'post',
            'parameters': { 'url':url, 'method':'get' }
        });
        logger.groupCollapsed("Proxy request: " + url);
        logger.dir(arguments);
        logger.groupEnd();
        new Ajax.Request('/proxy', arguments);
    }

    function loadSrcCode() {
        var uri = getUrlCode();
        var callbacks = {
            onSuccess: function(transport) {
                srcCode = transport.responseText;
            },
            onFailure: function() {
                logger.error("Can not open code of the element");
            }
        };
        var remoteUri = parseUri(uri),
            localUri = parseUri(window.location);
        if (remoteUri.authority == localUri.authority) {
            new Ajax.Request(uri, Object.extend(callbacks, {method:'get'}));
        } else {
            proxyGet(uri, callbacks);
        }
    }
    loadSrcCode();

    function reload() {
        eval("bbClass = Class.create(BuildingBlock,{\n" + srcCode + "\n});");
        changed('actions');
        bbInstance = new bbClass(params);
    }

    function setParams(value) {
        params = value;
        reload();
    }

    function addObserver(observer) {
        if (!observers.include(observer)) {
            observers.push(observer);
        }
    }

    function broadcast(/* methodName , [arguments] */) {
        var observer,
            i = observers.length;
            methodName = Array.prototype.shift.call(arguments);
        while(i--) {
            observer = observers[i];
            observer[methodName].apply(observer, arguments);
        }
    }

    function changed(value) {
        broadcast('update', value);
    }

    function getActionList() {
        var n
            actions = [],
            prototype = bbClass.prototype;
        for (n in prototype) {
            if (n != 'constructor' &&
                n != 'initialize' &&
                n != 'manageData') {
                actions.push({
                    name: n,
                    arguments: prototype[n].argumentNames()
                });
            }
        }
        return actions;
    }

    function execAction(actionName, args) {
        logger.groupCollapsed("Executing action: " + actionName);
        logger.dir(args);
        logger.groupEnd();
        try {
            bbInstance[actionName].apply(bbInstance, args);
        } catch (ex) {
            logger.error(ex);
        }
    }

    function manageData(triggers, addedFacts, deletedFacts) {
        if (triggers && triggers.length > 0) {
            triggers.forEach(function(trigger) {
                logger.log("Triggers thrown: ", trigger);
                triggers.push(trigger);
            });
            changed('triggers');
        }
        if ((addedFacts && addedFacts.length > 0) ||
            (deletedFacts && deletedFacts.length > 0)) {
            (addedFacts || []).forEach(function(fact) {
                logger.groupCollapsed("Added fact: ", fact.id);
                logger.dir(fact);
                logger.groupEnd();
                facts.set(fact.id, fact);
            });
            (deletedFacts || []).forEach(function(fact) {
                logger.log("Deleted fact: ", fact);
                facts.unset(fact);
            });
            changed('facts');
        }
    }

    BuildingBlock.prototype.manageData = manageData;

    return {
        facts: facts,
        triggers: triggers,
        setParams: setParams,
        addObserver: addObserver,
        getActionList: getActionList,
        execAction: execAction
    };
})();


dojo.addOnLoad(function() {

dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.TitlePane");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.Dialog");

dojo.addOnLoad(function() {
    var aContainer = leftSidebar = new dijit.layout.AccordionContainer({
        style:'width:50%',
        region:'left',
        splitter:'true'
    });
    aContainer.update = function update(aspect) {
        if ('actions' !== aspect) return;
        var actions = BuildingBlockDebugger.getActionList();
        aContainer.destroyDescendants();

        actions.each(function(action) {
            var actionName = action.name,
                argumentNames = action.arguments;

            function execAction() {
                var error = false;
                var args = argumentNames.map(function(argName) {
                    var nameSpace = '_' + actionName + '_' + argName,
                        uri_id = 'uri' + nameSpace,
                        data_id = 'data' + nameSpace,
                        uri = $(uri_id).value.escapeHTML(),
                        data = $(data_id).value;
                    if (! uri || uri.trim().empty()) {
                        logger.warn('Url of argument ' +
                            actionName + '#' + argName +
                            ' is empty.');
                    }
                    try {
                        data = data.evalJSON();
                    } catch(ex) {
                        logger.warn('Data of argument ' +
                            actionName + '#' + argName +
                            ' is not JSON valid.');
                        error = true;
                    }
                    return { uri: uri, data: data };
                });
                if (!error) {
                  BuildingBlockDebugger.execAction(actionName, args);
                }
            }
            var content = [
                Element('div', {align:'right'}).insert(
                    new dijit.form.Button({
                        label: 'Execute',
                        onClick: execAction
                    }).domNode)
            ,
                argumentNames.reduce(function(element, argumentName) {
                    var name_space = '_' + actionName + '_' + argumentName,
                        uri_id = 'uri' + name_space,
                        data_id = 'data' + name_space;
                    return element.insert(Element('p')
                        .insert(Element('strong', {'class': 'name'})
                        .insert(argumentName))
                        .insert(Element('br'))
                        .insert(new dijit.form.TextBox({
                            id: uri_id,
                            placeHolder: 'Url',
                            style: { width: '100%' }
                        }).domNode)
                        .insert(Element('br'))
                        .insert(new dijit.form.Textarea({
                            id: data_id,
                            placeHolder: 'Parameters',
                            value: "{\n\  \n}",
                            style: { width: '100%' }
                        }).domNode) );
                }, Element('div', {'class': 'arguments'}))
            ];
            aContainer.addChild(new dijit.layout.ContentPane({
                title: action.name + '(' + argumentNames.join(', ') + ')',
                content: content
            }));
        });
    };
    BuildingBlockDebugger.addObserver(aContainer);

    var rightSidebar = new dijit.layout.ContentPane({
        "region": "center",
        "style": "padding: 3px",
        "splitter": "true",
    });
    rightSidebar.update = function update(aspect) {
        if ('facts' !== aspect) return;
        var domNode = this.domNode;
        domNode.innerHTML = '';
        BuildingBlockDebugger.facts.each(function(pair) {
            var fact = pair[1];
            new dijit.TitlePane({
                title: fact.id,
                content: Element('pre').update(JSON.stringify(fact.data, null, '   ')),
                open: false
            }).placeAt(domNode);
        });
    };
    BuildingBlockDebugger.addObserver(rightSidebar);

    var bottomContent = new dijit.layout.ContentPane({
        "region": "bottom",
        "style": "height: 120px; padding: 0",
        "splitter": "true"
    });
    bottomContent.setContent(logger.toElement());


    var globalContent = new dijit.layout.BorderContainer({
        "design": "sidebar",
        "style": "height: 100%;"
    });
    globalContent.addChild(leftSidebar);
    globalContent.addChild(rightSidebar);
    globalContent.addChild(bottomContent);
    globalContent.placeAt(dojo.body());
    globalContent.startup();

    var paramsTextArea;
    var paramDialog = new dijit.Dialog({
        title: "Default parameter",
        closable: 'False',
        style: "width: 300px",
        content: [
            new dijit.form.Textarea({
                id: 'paramsDialogTextArea',
                value: "{\n\  \n}",
                style: { width: '100%' }
            }).domNode,
            Element('div', {align:'center'})
                .insert(new dijit.form.Button({
                    label: 'Accept',
                    onClick: function() {
                        var params
                            textObj = dijit.byId('paramsDialogTextArea').getValue();
                        try {
                            params = JSON.parse(textObj);
                        } catch (e) {
                            alert('JSON is not valid.');
                        }
                        if (params) {
                            BuildingBlockDebugger.setParams(params);
                            paramDialog.hide();
                        }
                    }
                }).domNode)
                .insert(new dijit.form.Button({
                    label: 'Cancel',
                    onClick: function() {
                        BuildingBlockDebugger.setParams({});
                        paramDialog.hide();
                    }
                }).domNode)
        ]
    });
    paramDialog.show();
});

});
