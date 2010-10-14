function getUrlCode() {
    var regex = new RegExp("[\\?&]url=([^&#]*)");
    var results = regex.exec(window.location.href);
    return results ? decodeURIComponent(results[1]) : null;
}

function loadCode() {
    var url = getUrlCode();
    if (url) {
        BB.loadCode(url);
    }
}

document.observe("dom:loaded", function() {
    Logger = new Logger($('log'));
    new TextAreaResizer($('params'));
    $('params').observe('blur', function(ev) {
        var params = ev.element().value;
        BB.setParams(params);
    });
    loadCode();
});

var Proxy = {
    get: function(url, options, context) {
        var arguments = Object.extend(options || {}, {
            'method': 'post',
            'parameters': { 'url':url, 'method':'get' }
        });
        Logger.groupCollapsed("Proxy request: " + url);
        Logger.dir(arguments);
        Logger.groupEnd();
        new Ajax.Request('/proxy', arguments);
    }
};

var BB = {
    loadCode: function(uri) {
        if (!uri) return;
        callbacks = {
            onSuccess: function(transport) {
                this.setCode(transport.responseText);
            }.bind(this),
            onFailure: function() {
                Logger.error("Can not open code of the element");
            }
        }
        var remoteUri = parseUri(uri);
        if (remoteUri.host+":"+remoteUri.port == window.location.host) {
            new Ajax.Request(uri, Object.extend(callbacks,{'method': 'get'}));
        } else {
            Proxy.get(uri, callbacks);
        }
    },
    setCode: function(srcCode) {
        eval("this.bbClass = Class.create(BuildingBlock,{\n" + srcCode + "\n});");
        this.bbInstance = new this.bbClass(this.params);
        this._notifyObservers();
    },
    setParams: function(params) {
        this.params = params;
        if (this['bbClass']) {
            this.bbInstance = new this.bbClass(this.params);
        }
    },
    execAction: function(name, args) {
        Logger.groupCollapsed("Executing action: " + name);
        Logger.dir(args);
        Logger.groupEnd();
        try {
            this.bbInstance[name].apply(this.bbInstance, args);
        } catch (ex) {
            Logger.error(ex);
        }
    },
    actionsEach: function(func, context) {
        context = context || window;
        for (var name in this.bbClass.prototype) {
            if (name != "constructor" && name != "initialize" && name != "manageData") {
                func.apply(context, [this.bbClass.prototype[name], name]);
            }
        }
    },
    _notifyObservers:function() {
        this.observer.update(this);
    }
};

var BBView = {
    getNode: function() {
        return $("actions");
    },
    update: function() {
        this.getNode().innerHTML = '';
        BB.actionsEach(function(action, actionName) {
            var argumentNames = action.argumentNames();
            var action = this._buildAction(actionName, argumentNames);
            this.getNode().appendChild(action);
        }, this);
    },
    _buildAction: function(actionName, argumentNames) {
        var action = document.createElement('li');
        action.setAttribute('class', 'action inactive');

        var name = document.createElement('span');
        name.setAttribute('class', 'name');
        name.appendChild(document.createTextNode(actionName));
        action.appendChild(name);

        var execute = new Element('button').update("Execute");
        execute.setAttribute('class', 'execute')
        execute.observe('click', function() {
            var args = argumentNames.map(function(argName) {
                var uri = $('uri_' + actionName + '_' + argName).value;
                var data = $('data_' + actionName + '_' + argName).value;
                if (! uri || uri.trim().empty()) {
                    Logger.warn('Url of argument ' + actionName + '#'+ argName + ' is empty.');
                }
                try {
                    data = data.evalJSON();
                } catch(ex) {
                    Logger.warn('Data of argument ' + actionName + '#'+ argName
                    + " is not JSON valid.");
                }
                return { uri: uri, data: data };
            });
            BB.execAction(actionName, args)
        });

        action.appendChild(execute);

        name.observe('click', function() {
            if (action.hasClassName('inactive')) {
                action.removeClassName('inactive');
            } else {
                action.addClassName('inactive');
            }
        });

        var params = document.createElement('ul');
        params.setAttribute('class', 'arguments');
        action.appendChild(params);

        if (argumentNames.length < 1) {
            params.appendChild(new Element('p'));
        }

        for (var i=0; i < argumentNames.length; i++) {
            var argumentName = argumentNames[i];

            var argument = document.createElement('li');
            argument.setAttribute('class', 'argument');

            var argName = document.createElement('div')
            argName.setAttribute('class', 'name');
            argName.appendChild(document.createTextNode(argumentName))
            argument.appendChild(argName);

            var list = document.createElement('ul');

            var item = document.createElement('li');

            var inputUri = document.createElement('input');
            inputUri.setAttribute('type', 'text');
            inputUri.setAttribute('id', 'uri_' + actionName + '_' + argumentName);
            item.appendChild(new Element('label', {
                class:'inside',
                for:inputUri.getAttribute('id')
            }).update('url'));
            item.appendChild(inputUri);
            list.appendChild(item);

            var item = document.createElement('li');

            var inputData = document.createElement('textarea');
            inputData.setAttribute('id', 'data_' + actionName + '_' + argumentName);
            inputData.setAttribute('rows', '3');
            inputData.setAttribute('cols', '40');
            item.appendChild(new Element('label',{
                class:'inside',
                for:inputData.getAttribute('id')
            }).update('data'));
            item.appendChild(inputData);
            list.appendChild(item);

            argument.appendChild(list);
            params.appendChild(argument);

            new TextAreaResizer(inputData);
        }

        return action;
    }
};

BB.observer = BBView;


if (JSON['formatJSON'] == null) {
    JSON['formatJSON'] = function(object) {
        var retval = '';
        var str = JSON.stringify(object);
        var pos = 0;
        var indentStr = "  ";
        var newLine = "\n";
        var char = '';

        for (var i=0; i < str.length; i++) {
            char = str.substring(i, i+1);
            if (char == '}' || char == ']') {
                retval += newLine;
                pos -= 1;
                for (var j=0; j<pos; j++) {
                    retval += indentStr;
                }
            }
            retval += char;
            if (char == '{' || char == '[' || char == ',') {
                retval += newLine;
                if (char == '{' || char == '[') {
                    pos += 1;
                }
                for (var k=0; k < pos; k++) {
                    retval += indentStr;
                }
            }
        }
        return retval;
    }
}

var stereolabels = Class.create();
stereolabels.prototype = {
    labels: [],

    initialize: function(options) {
        this.options = Object.extend({className : 'inside'}, options || {});

        this.labels = $$('label.'+this.options.className);
        $A(this.labels).each(function(label) {
            this.initLabel(label);
        }.bind(this));

        $A(document.forms).each(function(form) {
            Event.observe(form, "submit", function() { this.uninit() }.bind(this))
        }.bind(this));
  },

  // called on form submit
  // - clear all labels so they don't accidentally get submitted to the server
  // - WOULD CAUSE BUG IF FIELD CONTENTS WAS IN FACT MEANT TO EQUAL LABEL VALUE
    uninit: function() {
        $A(this.labels).each(function(label) {
        var el = $(label.htmlFor);
            if (el && el.value == el._labeltext) this.hide(el)
        }.bind(this));
  },

  // initialize a single label.
  // - only applicable to textarea and input[text] and input[password]
  // - arrange for label_focused and label_blurred to be called for focus and blur
  // - show the initial label
  // - for other element types, show the default label
    initLabel: function(label) {
        try {
            var input     = $(label.htmlFor);
            var inputTag  = input.tagName.toLowerCase();
            var inputType = input.type;
            if (inputTag == "textarea" || (inputType == "text" || inputType == "password")) {
                Element.setStyle(label, { position: 'absolute', visibility: 'hidden'});
                    Object.extend(input, {
                        _labeltext: label.childNodes[0].nodeValue,
                        _type: inputType
                    });
                Event.observe(input, 'focus', this.focused.bind(this));
                Event.observe(input, 'blur', this.blurred.bind(this));
                this.blurred({target:input});
            } else {
                Element.setStyle(label, { position: 'static', visibility: 'visible' });
            }
        } catch (e) {
            Element.setStyle(label, { position: 'static', visibility: 'visible' });
        }
    },

    focused: function(e) {
        var el = Event.element(e);
        if (el.value == el._labeltext) el = this.hide(el)
        el.select();
    },

    blurred: function(e) {
        var el = Event.element(e);
        if (el.value == "") el = this.show(el);
    },

    hide: function(el) {
        if (el._type == "password") el = this.setInputType(el, "password");
        el.value = "";
        Element.removeClassName(el, this.options.className);
        return el;
    },

    show: function(el) {
        if (el._type == "password") el = this.setInputType(el, "text");
        Element.addClassName(el, this.options.className);
        el.value = el._labeltext;
        return el;
    },

    setInputType: function (el, type) {
        try {
            el.type = type;
            return el;
        } catch (e) { //IE can't set the type parameter
            var newEl = document.createElement("input");
            newEl.type = type;
            for (prop in el) {
                try {
                  // crazy bug that still exists in ie 7 with width and heights, use class name if necessary instead!
                    if (prop != "type" && prop != "height" && prop != "width") {
                        newEl[prop] = el[prop];
                    }
                } catch(e) { }
            }
            Event.observe(newEl, 'focus', this.focused.bind(this));
            Event.observe(newEl, 'blur', this.blurred.bind(this));
            el.parentNode.replaceChild(newEl, el);
            return newEl;
        }
    }
}

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
