var logger = new Logger();

BuildingBlockDebugger = (function() {
    var params = {},
        actions = [],
        facts = new Hash(),
        triggers = [],
        observers = [];

    var iframe = Element('iframe', {
        frameborder: '0',
        width: '100%',
        height: '100%'
    }).observe('load', function(e) {
        this.contentWindow.postMessage(JSON.stringify({
            name:'initialize',
            arguments:[params]
        }), '*');
    }, false);

    function getUrlCode() {
        var regex = new RegExp("[\\?&]url=([^&#]*)");
        var results = regex.exec(window.location.href);
        return results ? decodeURIComponent(results[1]) : null;
    }

    function reload() {
        iframe.src = getUrlCode();
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

    function setActionList(actionList) {
        actions = actionList;
        changed('actions');
    }

    function getActionList() {
        return actions;
    }

    function execAction(actionName, args) {
        logger.groupCollapsed("Executing action: " + actionName);
        logger.dir(args);
        logger.groupEnd();
        iframe.contentWindow.postMessage(JSON.stringify({
            name: actionName,
            arguments: args
        }), '*');
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

    document.observe("dom:loaded", function() {
        window.addEventListener('message', function (e) {
            var data = e.data;
                message = JSON.parse(data),
                name = message.name,
                args = message.arguments;
            if (name === 'manageData') {
                manageData(args[0] || [] , args[1] || [] , args[2] || []);
                return;
            }
            if (name === 'setActionList') {
                setActionList(args[0]);
                return;
            }
        }, false);
    });

    return {
        iframe: iframe,
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

    var globalContent = new dijit.layout.BorderContainer({
        "design": "sidebar",
        "style": "height: 100%;"
    });

    var aContainer = leftSidebar = new dijit.layout.AccordionContainer({
        style:'width:300px',
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
    globalContent.addChild(leftSidebar);

    var rightSidebar = new dijit.layout.ContentPane({
        "region": "right",
        "style": "width: 300px; padding: 3px",
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
    globalContent.addChild(rightSidebar);

    var topContent = new dijit.layout.ContentPane({
        "region": "center",
        "splitter": "true",
        "style": "padding: 0"
    });
    globalContent.addChild(topContent);

    var bottomContent = new dijit.layout.ContentPane({
        "region": "bottom",
        "style": "height: 120px; padding: 0",
        "splitter": "true"
    });
    globalContent.addChild(bottomContent);

    globalContent.placeAt(dojo.body());
    globalContent.startup();

    bottomContent.setContent(logger.toElement());

    var iframe = BuildingBlockDebugger.iframe;
    topContent.setContent(Element('div').insert(iframe));

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
