var BuildingBlockDocument;

(function() {

var Observable = {
    subscribe: function subcribe(object) {
        var observers = this._observers || (this._observers = []);
        observers.push(object);
        return this;
    },
    emit: function notify() {
        var observers = this._observers || (this._observers = []);
        for (var i = observers.length; i--;) {
            observers[i].update.call(observers[i]);
        }
        return this;
    }
}

function Collection(objects, options) {
    options || (options = {});
    this.objects = objects || [];
    this.model = options.model;
    this.primaryKey = this.model.key || 'id';
}
Object.extend(Collection.prototype, Observable);
Collection.prototype.find = function find(value) {
    var object,
        key = this.primaryKey,
        array = this.objects;

    for (var i = array.length; i--;) {
        object = array[i];
        if (object[key] === value) {
            return object;
        }
    }
    return null;
};
Collection.prototype.insert = function insert(object) {
    var key = object[this.primaryKey];
    if (this.find(key)) return;
    this.objects.push(object);
    object._collection = this;
    return object;
};
Collection.prototype.remove = function remove(/* objects */) {
    var index,
        array = this.objects,
        result = [];

    for (var i = arguments.length; i--;) {
        index = array.indexOf(arguments[i]);
        if (index >= 0) {
            result.push(array.splice(index, 1));
        }
    }
    return result;
};
Collection.prototype.create = function create(properties) {
    var object = (this.model) ?
        new this.model(properties):
        Object.clone(properties);
    return this.insert(object);
};
Collection.prototype.toJSON = function toJOSN() {
    return this.objects;
};
Collection.prototype.each = function each(iterator, context) {
    return this.objects.each(iterator, context);
};
Collection.prototype.map = function(iterator, context) {
    return this.objects.map(iterator, context);
};
Collection.prototype.empty = function() {
    return this.objects.length === 0;
};

function Condition(properties) {
    this.setProperties(properties);
}
Condition.key = 'id';
Condition.prototype.get = function(key) {
    return this[key];
};
Condition.prototype.set = function(key, value) {
    this[key] = value;
};
Condition.prototype.getProperties = function getPropperties() {
    var result = {};
    for (var key in this) {
        result[key] = this[key];
    }
    delete result._collection;
    return result;
};
Condition.prototype.setProperties = function setProperties(properties) {
    for (var key in properties) {
        this[key] = properties[key];
    }
};
Condition.prototype.remove = function remove() {
    this._collection.remove(this);
};
Condition.prototype.toJSON = function toJSON() {
    var result = {};
    for (var key in this) {
        result[key] = this[key];
    }
    delete result._collection;
    return result;
};

function Action(properties) {
    this.setProperties(properties);
    this.preconditions = new Collection([], {model: Condition});
    if (properties && properties.preconditions) {
        properties.preconditions.each(function(properties) {
            var condition = new Condition(properties);
            this.preconditions.insert(condition);
        }, this);
    }
}
Action.key = 'name';
Action.prototype.getProperties = function getPropperties() {
    var result = {};
    for (var key in this) {
        result[key] = this[key];
    }
    delete result._collection;
    delete result.preconditions;
    return result;
};
Action.prototype.setProperties = function setProperties(properties) {
    var conditions = this.preconditions;
    for (var key in properties) {
        this[key] = properties[key];
    }
    this.preconditions = conditions;
};
Action.prototype.remove = function remove() {
    this._collection.remove(this);
};
Action.prototype.toJSON = function toJSON() {
    var result = {};
    for (var key in this) {
        result[key] = this[key];
    }
    delete result._collection;
    return result;
};

var INITIAL_CODE = {};
INITIAL_CODE['resource'] =
    "serviceFunction: function(inputFacts) {\n}";
INITIAL_CODE['operator'] =
    "operatorFunction: function(inputFacts) {\n}";
INITIAL_CODE['form'] =
    "<html>\n<head>\n<script type=\"text/javascript\">\n" +
    "var {{buildingblockId}} = Class.create(BuildingBlock, {\n" +
        "\tinit: function (){}\n" +
    "});\n</script>\n</head>\n<body>\n</body>\n</html>";

BBDescription = Class.create(BuildingBlockDescription, Observable, {
    initialize: function($super, props) {
        $super(Object.extend({
            'label': {'en-gb': props.name},
            'version': "0.1",
            'tags': [],
            'creator': GVS.getUser().getUserName(),
            'description': {"en-gb": "Please fill the description..."},
            'rights': "http://creativecommons.org/",
            'icon': "http://fast.morfeo-project.eu/icon.png",
            'screenshot': "http://fast.morfeo-project.eu/screenshot.png",
            'homepage': "http://fast.morfeo-project.eu/",
            'actions': [],
            'postconditions':[]
        }, props));

        var actions = new Collection([], {model: Action});
        this.actions.each(function(properties) {
            var action = new Action(properties);
            actions.insert(action);
        });
        this.actions = actions;

        var postconditions = new Collection([], {model:Condition});
        this.postconditions.each(function(properties) {
            var condition = new Condition(properties);
            postconditions.insert(condition);
        });
        this.postconditions = postconditions;
    },
    toJSON: function toJSON() {
      var object = this.getProperties();
      object.actions = this.actions;
      object.postconditions = this.postconditions;
      return object;
    },
    getProperties: function() {
        var props = Object.clone(this);
        delete props._observers;
        delete props.actions;
        delete props.postconditions;
        for (var key in props) {
            if (props[key] instanceof Function) {
                delete props[key];
            }
        }
        return props;
    },
    addProperties: function(properties) {
        this.setProperties(properties);
    },
    setProperties: function(properties) {
        var props = Object.clone(properties);
        delete props.actions;
        delete props.postconditions;
        Object.extend(this, props);
        this.emit();
    },
    getCode: function() {
        if (this.codeInline) {
            return this.codeInline;
        }
        if (!this.code) {
            var codeText = INITIAL_CODE[this.type] || "";
            this.setProperties({'codeInline': codeText});
            return codeText;
        }
        new Ajax.Request('/proxy', {
            method: 'post',
            parameters: {url:this.code, method:'get'},
            onSuccess: function(transport) {
                var codeText = transport.responseText;
                this.setProperties({'codeInline': codeText});
                this.emit();
            }.bind(this),
            onFailure: function() {
                Utils.showErrorMessage("Can not open code of the selected element", {'hide': true});
            }
        });
        return INITIAL_CODE[this.type] || "";
    }
});


var FormBuilder = (function() {
    _createLine = function(/** String */ label, /** DOMNode */ inputNode) {
        var lineNode = new Element('div', {'class': 'line'});
        if (label) {
            lineNode.appendChild(new Element ('label').update(label));
        }
        lineNode.appendChild(inputNode);
        return lineNode;
    };

    _buildLine = function(line, events) {
        var lineNode;
        var inputNode;

        switch (line.type) {
            case 'title':
                lineNode = new Element ('h3').update(line.value);
                break;

            case 'input':
                var input;
                if (line.regExp || line.required) {
                    input = new dijit.form.ValidationTextBox({
                                    'name' : line.name,
                                    'value': line.value,
                                    'regExp': (line.regExp) ? line.regExp : '.*',
                                    'required': (line.required) ? line.required : false,
                                    'invalidMessage': (line.message) ? line.message : 'This field cannot be blank'
                                });
                } else {
                    input = new dijit.form.TextBox({
                                    'name' : line.name,
                                    'value': line.value
                                });
                }
                if (line.disabled) {
                    input.attr('disabled', line.disabled);
                }
                inputNode = input.textbox;
                lineNode = _createLine(line.label, input.domNode);
                break;

            case 'checkbox':
                var checkbox = new dijit.form.CheckBox({
                            'name' : line.name,
                            'value': line.value
                        });
                if (line.disabled) {
                    checkbox.attr('disabled', line.disabled);
                }

                if (line.checked) {
                    checkbox.attr('checked', line.checked);
                }

                inputNode = checkbox.domNode;
                lineNode = _createLine(line.label, checkbox.domNode);
                break;

            case 'label':
                lineNode = new Element('div', {
                                'class': 'line',
                                'style': line.style
                            }).update(line.value);
                break;

            case 'pre':
                lineNode = new Element('pre', {
                                'class': 'line',
                                'style': line.style
                            }).update(line.value);
                break;

            case 'hidden':
                lineNode = new Element('input',{
                                'type': 'hidden',
                                'name': line.name,
                                'value': line.value
                            });
                break;

            case 'comboBox':
                inputNode = new Element('select', {
                    'name': line.name
                });

                $A(line.options).each(function(option) {
                    var optionNode = new Element('option', {
                         'value': option.value
                    }).update(option.label);

                    if (option.value == line.value) {
                        optionNode.selected = "selected";
                    }

                    inputNode.appendChild(optionNode);
                });

                lineNode = _createLine(line.label, inputNode);
                break;

            case 'textarea':
                var textArea = new dijit.form.SimpleTextarea({
                    'name': line.name
                });
                textArea.attr("value", line.value);

                inputNode = textArea.domNode;
                lineNode = _createLine(line.label, inputNode);
                break;

            default:
                throw "Unimplemented form field type";
        }
        if (inputNode) {
            $H(events).each(function(pair) {
                Element.observe(input, pair.key, pair.value);
            });
        }
        return lineNode;
    };

    return {
        build: function(data, params) {
            var form = new dijit.form.Form(Object.extend({method:'post'}, params));
            $A(data).each(function(line) {
                var lineNode = _buildLine(line);
                form.domNode.appendChild(lineNode);
            }.bind(this));
            return form;
        }
    }
})();

var FormEditor = Class.create({
    initialize: function(data) {
        this.data = data;
        this.domNode = new Element('div')
            .setStyle({
                display:'none',
                overflow:'auto',
                height:'100%',
                padding:'5px 20px'
            });
         this.update();
    },

    save: function() {
        var form = this._form.domNode;
        var name = Utils.sanitize($F(form.name))
        var description = Object.extend({
            'name': name,
            'tags': $F(form.tags).split(/[\s,]+/).without(''),
            'triggers': $F(form.triggers).split(/[\s,]+/).without(''),
            'libraries': $F(form.libraries).split(/[\s,]+/).without(''),
            'label': { 'en-gb': name },
            'description': { 'en-gb': $F(form.description) },
        }, Form.serializeElements([
            form.version,
            form.creator,
            form.rights,
            form.icon,
            form.screenshot,
            form.homepage,
            form.parameterTemplate], {'hash': true})
        );
        this.data.addProperties(description);
    },

    update: function(data) {
        data = data || this.data;
        this._form = FormBuilder.build([
            {'type':'title', 'value': 'Basic information'},
            {'type':'input', 'label': 'Building block name:','name': 'name',
                    'value': data.name,
                    'required': true,
                    'events': {
                        'blur': function(){ form.name.value = Utils.sanitize($F(form.name)); }
                    }
            },
            {'type':'input', 'label': 'Version:','name': 'version',
                    'value': data.version},
            {'type':'input', 'label': 'Tags:','name': 'tags',
                    'value': data.tags.collect(function(tag) { return tag.label['en-gb']; }).join(", ")},
            {'type': 'title', 'value': 'Sharing information'},
            {'type':'textarea', 'label': 'Description:','name': 'description',
                    'value': data.description['en-gb'],
                    'required': true},
            {'type':'input', 'label': 'Creator:','name': 'creator',
                    'value': data.creator,
                    'required': true,
                    'disabled': true},
            {'type':'input', 'label': 'Licence information:','name': 'rights',
                    'value': data.rights,
                    'required': true},
            {'type':'input', 'label': 'Icon:','name': 'icon',
                    'value': data.icon,
                    'regExp': '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*',
                    'message': 'Invalid URL'},
            {'type':'input', 'label': 'Screenshot:','name': 'screenshot',
                    'value': data.screenshot,
                    'regExp': '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*',
                    'message': 'Invalid URL'},
            {'type':'input', 'label': 'Homepage:','name': 'homepage',
                    'value': data.homepage,
                    'regExp': '([hH][tT][tT][pP][sS]?)://[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*(:\d+)?(/[a-zA-Z0-9\.\?=/#%&\+-]*)*',
                    'message': 'Invalid URL'},
            {'type':'input', 'label': 'Triggers:','name': 'triggers',
                    'value': data.triggers.join(', ')},
            {'type':'textarea', 'label': 'Parameter Template:','name':'parameterTemplate',
                    'value': data.parameterTemplate },
            {'type':'textarea', 'label': 'Libraries:','name':'libraries',
                    'value': data.libraries.join(",\n")}
        ]);
        this.domNode.update(this._form.domNode);
    },

    validate: function() {
        return this._form.validate();
    },

    show: function() {
        return this.domNode.show();
    },

    hide: function() {
        this.save();
        return this.domNode.hide();
    },

    visible: function() {
        return this.domNode.visible();
    },

    toElement: function() {
        return this.domNode;
    }
});


var ConditionView = Class.create(DragSource, {
    initialize: function($super, condition, controller) {
        $super();
        this.condition = condition;
        this.controller = controller;
    },
    toElement: function() {
        if (!this.node) {
            this.node = new DomainConceptView(this.condition);
            this.menu = new MenuOptions(this.node.toElement());
            this.menu.addOption('Delete Condition', function() {
                this.controller.remove(this.condition);
            }.bind(this));
        }
        return this.node.toElement();
    },
    getHandlerNode: function() {
        return this.node.getNode();
    },
    getDraggableObject: function() {
        return this;
    },
    onFinish: function(cz, /** Object */ position) {
        this.controller.update(this.condition, {'position': position});
    },
    setPosition: function(position) {
        this.node.setPosition(position);
    },
    insertInArea: function(area) {
      area.insert(this, this.condition.position);
      this.enableDragNDrop(area, [area]);
    }
});

function PrecondsController(actions) {
    this.actions = actions;
}
PrecondsController.prototype.create = function create(properties, actionName) {
    var actions = this.actions,
        attrs   = {'name': actionName, 'uses': []},
        action  = (actions.find(actionName) || actions.create(attrs));

    if (action.preconditions.create(properties)) {
        actions.emit();
    }
};
PrecondsController.prototype.remove = function remove(condition) {
    condition.remove();
    this.actions.each(function(action){
        if (action.preconditions.empty()) {
            action.remove();
        }
    });
    this.actions.emit();
};
PrecondsController.prototype.update = function update(condition, properties) {
    condition.setProperties(properties);
    this.actions.emit();
};

function PreconditionsView(actions) {
    this.actions    = actions;
    this.controller = new PrecondsController(actions);

    var self = this;
    this.area = new Area('pre', [Constants.BuildingBlock.DOMAIN_CONCEPT],
        function(area, instance, position) {
            var description = instance.getBuildingBlockDescription();
            self.dropInstance(description, position);
            return true;
        }, {splitter: true, region: 'left', minWidth: 35});

    this.actions.subscribe(this);
}
PreconditionsView.prototype.update = function update() {
    var area       = this.area,
        controller = this.controller,
        actions    = this.actions;

    area.getNode().update();
    actions.each(function(action) {
        action.preconditions.each(function(condition) {
            view = new ConditionView(condition, controller);
            view.insertInArea(area);
        });
    });
};
PreconditionsView.prototype.init = PreconditionsView.prototype.update;
PreconditionsView.prototype.dropInstance = function(description, position) {
    var actionName = prompt('Action Name:', 'default');
    if (!actionName) return;
    var conditonName = prompt('Condition Name:', 'default');
    if (!conditonName) return;

    this.controller.create({
        'id': conditonName,
        'label': description.label,
        'pattern': description.pattern,
        'position': position
    }, actionName);
};

function PostcondsController(conditions) {
    this.conditions = conditions;
}
PostcondsController.prototype.create = function create(properties) {
    if (this.conditions.create(properties)) {
        this.conditions.emit();
    }
};
PostcondsController.prototype.remove = function remove(condition) {
    condition.remove();
    this.conditions.emit();
};
PostcondsController.prototype.update = function update(condition, properties) {
    condition.setProperties(properties);
    this.conditions.emit();
};

function PostconditionsView(conditions) {
    this.conditions = conditions;
    this.controller = new PostcondsController(conditions);

    var self = this;
    this.area = new Area('post', [Constants.BuildingBlock.DOMAIN_CONCEPT],
        function onDropInstanceInArea(area, instance, position) {
            var description = instance.getBuildingBlockDescription();
            self.dropInstance(description, position);
            return true;
        }, {splitter: true, region: 'right', minWidth:35});

    this.conditions.subscribe(this);
}
PostconditionsView.prototype.update = function update() {
    var area       = this.area,
        controller = this.controller,
        conditions = this.conditions;

    area.getNode().update();
    conditions.each(function(condition) {
        var view = new ConditionView(condition, controller);
        view.insertInArea(area);
    }, this);
};
PostconditionsView.prototype.init = PostconditionsView.prototype.update;
PostconditionsView.prototype.dropInstance = function(description, position) {
    var conditionName = prompt('Condition Name:', 'default');
    if (!conditionName) return;

    this.controller.create({
        'id': conditionName,
        'label': description.label,
        'pattern': description.pattern,
        'position': position
    });
};

PropertiesEditorView = Class.create({
    initialize: function(model) {
        this.model = model;
        this.JSONEditor = new JSONEditor(this.model);
        this.FormEditor = new FormEditor(this.model);
        this.area = new Area('json', [], null,
            {splitter: true, region: 'top', minHeight:300});
        this.element = this.area.getNode()
            .insert(this.JSONEditor)
            .insert(this.FormEditor);

        this.showFormEditor();

        model.subscribe(this);
        model.actions.subscribe(this);
        model.postconditions.subscribe(this);
    },
    init: function() {
        this.JSONEditor.init();
    },
    toElement: function() {
        return this.element;
    },
    save: function() {
        this.active.save();
    },
    update: function() {
        this.active.update();
    },
    changeView: function() {
        if (this.active === this.JSONEditor) {
            this.showFormEditor();
        } else {
            this.showJSONEditor();
        }
    },
    showJSONEditor: function() {
        this.active = this.JSONEditor;
        this.FormEditor.hide();
        this.JSONEditor.show();
        this.update();
    },
    showFormEditor: function() {
        this.active = this.FormEditor;
        this.JSONEditor.hide();
        this.FormEditor.show();
        this.update();
    }
});

function JSONEditor(model) {
    this._model = model;
    this._onSave = true;
    this._onRepaint = false;
    this._element = new Element('div', {'class':'codeContainer'});
}

JSONEditor.prototype = {
    init: function() {
        var self = this;
        this._codeEditor = new CodeMirror(this._element, {
            'readOnly': false,
            'height': "100%",
            'parserfile': ["tokenizejavascript.js", "parsejavascript.js"],
            'parserConfig': {'json': true },
            'stylesheet': ["fast/js/lib/codemirror/css/jscolors.css"],
            'path': "fast/js/lib/codemirror/js/",
            'lineNumbers': true,
            'tabMode': "shift",
            'reindentOnLoad': false,
            'onLoad': function() {
                self._onRepaint = true;
                self.update();
            },
            'onChange': this.save.bind(this)
        });
    },
    save: function() {
        if (!this._onSave) return;

        var object,
            text = this._codeEditor.getCode();

        try {
          object = JSON.parse(text);
        } catch (e) {
          Utils.showErrorMessage("The properties are not well formed. It will not work");
        }
        if (object) {
          this._onRepaint = false;
          updateProperties(object, this._model);
          this._onRepaint = true;
        }
    },
    update: function(model) {
        if (!this._onRepaint) return;
        var model = this._model,
            object = formatDescription(model),
            text = JSON.stringify(object, null, 2);
        this._onSave = false;
        this._codeEditor.setCode(text);
        this._onSave = true;
    },
    show: function() {
        return this._element.show();
    },
    hide: function() {
        return this._element.hide();
    },
    toElement: function() {
        return this._element;
    }
};

function CodeEditorView(model) {
    this._model = model;
    this._onSave = true;
    this._onRepaint = false;
    this._element = new Element('div', {'class':'codeContainer'});

    this.area = new Area('code', [], null,
        {splitter: true, region: 'center'});

    this.area.getNode().insert(this._element);
}

CodeEditorView.prototype = {
    init: function() {
        var self = this,
            parsers = ["tokenizejavascript.js", "parsejavascript.js"],
            stylesheet = ["fast/js/lib/codemirror/css/jscolors.css"];

        if (this._model.type === BuildingBlockDocument.FORM) {
            Array.prototype.push.apply(parsers, [
                "parsexml.js",
                "parsecss.js",
                "parsehtmlmixed.js",
            ]);
            Array.prototype.push.apply(stylesheet, [
                "fast/js/lib/codemirror/css/jscolors.css",
                "fast/js/lib/codemirror/css/xmlcolors.css",
            ]);
        }
        this._codeEditor = new CodeMirror(this._element, {
            'height': "100%",
            'parserfile': parsers,
            'stylesheet': stylesheet,
            'path': "fast/js/lib/codemirror/js/",
            'lineNumbers': true,
            'tabMode': "shift",
            'reindentOnLoad': false,
            'onLoad': function() {
                self._onRepaint = true;
                self.update();
            },
            'onChange': this.save.bind(this)
        });
    },
    toElement: function() {
        return this._element;
    },
    save: function() {
        if (!this._onChange) return;
        var code = this._codeEditor.getCode();
        this._onRepaint = false;
        this._model.setProperties({'codeInline': code});
        this._model.emit();
        this._onRepaint = true;

    },
    update: function() {
        if (!this._onRepaint) return;
        var code = this._model.getCode();
        this._onChange = false;
        this._codeEditor.setCode(code);
        this._onChange = true;
    }
};

var formatDescription = (function(){
    function formatDescription(description) {
        var object = description.getProperties();
        delete object.id;
        delete object.type;
        delete object.code;
        delete object.codeInline;
        delete object.creationDate;
        object.actions = formatActions(description.actions);
        object.postconditions = formatConditions(description.postconditions);
        return object;
    }
    function formatActions(actions) {
        return actions.map(function(action){
            var object = action.getProperties();
            object.preconditions = formatConditions(action.preconditions);
            return object;
        });
    }
    function formatConditions(conditions) {
        return conditions.map(function(condition) {
            var object = condition.getProperties();
            delete object.position;
            return object;
        });
    }
    return formatDescription;
})();


var updateProperties = (function() {

    function updateConditions(objects, conditions) {
        objects || (objects = []);

        conditions.each(function(condition) {
            var props,
                object = objects.find(function(e){ return e.id == condition.id });

            if (!object) {
                conditions.remove(condition);
            } else {
                props = condition.getProperties();
                object.position = props.position;
                for (var key in props) {
                    if (!(key in object)) {
                        delete condition[key];
                    }
                }
                condition.setProperties(object);
            }
        });

        objects.each(function(properties) {
            conditions.create(properties)
        });

        conditions.emit();
    }

    function updateActions(objects, actions) {
        objects || (objects = []);

        actions.each(function(action) {
            var props,
                object = objects.find(function(e){ return e.name == action.name; });

            if (!object) {
                actions.remove(action);
            } else {
                props = action.getProperties();
                for (var key in props) {
                    if (!(key in object)) {
                        delete action[key];
                    }
                }
                updateConditions(object.preconditions, action.preconditions);
                action.setProperties(object);
            }
        });

        objects.each(function(properties) {
            actions.create(properties);
        });

        actions.emit();
    }

    function updateProperties(object, model) {

        updateActions(object.actions, model.actions);
        updateConditions(object.postconditions, model.postconditions);

        props = model.getProperties();
        object.id           = props.id;
        object.type         = props.type;
        object.code         = props.code;
        object.codeInline   = props.codeInline;
        object.creationDate = props.creationDate;

        object.name = (object.name && object.name.trim()) || props.name;

        for (key in props) {
            if (!(key in object)) {
                delete model[key];
            }
        }

        model.setProperties(object);
    }

    return updateProperties;
})();

BuildingBlockDocument = Class.create(PaletteDocument, /** @lends BuildingBlockDocument.prototype */ {
    /**
     * @abstract
     * @extends PaletteDocument
     * @constructs
     */
    initialize: function ($super,/** Object */ properties) {
        $super("Building Block", properties, new DumbInferenceEngine());
        this._start();
    },

    /**
     * Create the CodeMirror text editors
     * To be called after the document has been added into the GVS
     * CodeMirror needs to be instantiated into Elements already
     * added to the DOM
     */
    createTextEditors: function init() {
        this._preView.init();
        this._postView.init();
        this._propsView.init();
        this._codeView.init();

        var description = this._description;
        description.subscribe(this);
        description.actions.subscribe(this);
        description.postconditions.subscribe(this);
    },
    update: function() {
        this._setDirty(true);
    },

    // **************** PRIVATE METHODS **************** //
    _save: function(/** Boolean (Optional) */ _showMessage) {
        this._propsView.save();
        this._codeView.save();

        var showMessage = Utils.variableOrDefault(_showMessage, true);
        var params = {
            'buildingblock': JSON.stringify(this._description)
        }
        if (showMessage) {
            Utils.showMessage("Saving " + this._typeName);
        }
        if (this._description.getId() == null) {
            PersistenceEngine.sendPost(this._getSaveUri(), params, null,
                this, this._onSaveSuccess, this._onSaveError);
        } else {
            var uri = URIs.buildingblock + this._description.getId();
            PersistenceEngine.sendUpdate(uri, params, null,
                this, this._onSaveSuccess, this._onSaveError);
        }
    },

    /**
     * Returns the save uri
     * @type String
     * @private
     * @override
     */
    _getSaveUri: function() {
        return URIs[this._description.type]
    },

    /**
     * @private
     * @override
     */
    _start: function($super) {
        $super();
        if (this._description.type in ['operator', 'resource']) {
            this._toolbarElements.get('debugger').setEnabled(true);
        }
    },

    /**
     * Returns the areas of the document
     * @override
     * @private
     * @type Hash
     */
    _getAreas: function() {
        var description    = this._description;
        var actions        = description.actions
        var postconditions = description.postconditions;

        this._preView  = new PreconditionsView(actions);
        this._postView = new PostconditionsView(postconditions);
        this._propsView = new PropertiesEditorView(description);
        this._codeView = new CodeEditorView (description);

        return $H({
            'pre' : this._preView.area,
            'post': this._postView.area,
            'prop': this._propsView.area,
            'code': this._codeView.area
        });
    },

    /**
     * @private
     * @override
     */
    _getSets: function() {
        // Palette sets
        var domainConceptSet = new DomainConceptSet(this._tags, Catalogue.
                            getBuildingBlockFactory(Constants.BuildingBlock.DOMAIN_CONCEPT));

        return [domainConceptSet];
    },

    /**
     * Gets the document description
     * @override
     * @private
     * @type BuildingBlockDescription
     */
    _getDescription: function(/** Object */ properties) {
        if (!properties.id) {
            Object.extend(properties, {
                'libraries': [],
                'triggers': [],
                'parameterTemplate': ""
            });
        }
        return new BBDescription(properties);
    },

    /**
     * This function creates the area containing the canvas
     * and the inspectors
     * @private
     * @override
     */
    _renderCenterContainer: function() {
        var centerContainer = new dijit.layout.BorderContainer({
            design:"headline",
            liveSplitters:"false",
            region:"center"
        });
        this._designContainer.domNode.addClassName('canvas');
        centerContainer.addChild(this._designContainer);

        return centerContainer;
    },

        /**
     * Get the canvas cache for loading
     * @override
     * @private
     * @type String
     */
    _getCanvasCache: function(/** Object */ properties) {
        // TODO
        return null;
    },
    /**
     * Returns the empty palette status
     * @type Object
     * @private
     * @override
     */
    _getEmptyPalette: function() {
        return [];
    },
    /**
     * Starts the sharing process
     * @private
     * @overrides
     */
     _share: function() {
        if (this._isDirty) {
            this._pendingOperation = this._share.bind(this);
            this._save(false);
        } else {
            var text = new Element('div', {
                'style': 'text-align:center; width: 30em; margin: 0 auto;'
            }).update("You are about to share the building blokc. After that, " +
                     "you will not be able to edit it anymore. " +
                     "You can either close it or create a clone " +
                     "(Save with another name/version)");
            var dialog = new ConfirmDialog("Warning",
                                           ConfirmDialog.CUSTOM,
                                           {
                                            'callback': this._onShareDialogEvent.bind(this),
                                            'contents': text,
                                            'buttons': {
                                                'clone': 'Share and create a clone',
                                                'close': 'Share and close',
                                                'cancel': 'Cancel'
                                                }
                                            });
            dialog.show();
        }
     },

    /**
     * This function will be called whenever an event is triggered in the
     * share dialog
     * @private
     */
    _onShareDialogEvent: function(/** String */ status) {
        if (status != "cancel") {
            var uri = URIs.share.replace("<id>", this._description.getId());
            PersistenceEngine.sendPost(uri, null, null,
                                      {'mine': this, 'status': status},
                                      this._onShareSuccess, Utils.onAJAXError);
        }
    },

    /**
     * On share success
     * @private
     */
    _onShareSuccess: function(/** XMLHttpRequest */ transport) {
        Utils.showMessage("Building block successfully shared", {'hide': true});
        switch(this.status) {
            case 'clone':
                this.mine._saveAs(true);
                break;
            case 'close':
                this.mine._effectiveCloseDocument(ConfirmDialog.DISCARD);
                break;
        }
    },
        /*
     * @override
     */
    _onSaveSuccess: function($super, /** XMLHttpRequest */ transport) {
        if (this._description.getId() == null) {
            var data = JSON.parse(transport.responseText);
            this._description.addProperties({
                    "id": data.id,
                    "version": data.version,
                    "creationDate": data.creationDate,
                    "code": data.code
            });
            this._save(false);
        } else {
            $super(transport);
        }
    },

    /**
     * Returns the uri of code
     * @private
     * @type URI
     */
    _getCodeURI: function() {
        return this._description['code'];
    },

    /**
     * @private
     */
    _configureToolbar: function() {
        this._addToolbarElement('save', new ToolbarButton(
                'Save the current screenflow',
                'save',
                this._save.bind(this),
                false // disabled by default
            ));
        this._addToolbarElement('share', new ToolbarButton(
                'Share the current building block with the community',
                'share',
                this._share.bind(this),
                true
            ));
        this._addToolbarElement('debugger', new ToolbarButton(
                'Debugger the current building block code',
                'debugger',
                function() {
                    this._pendingOperation = function() {
                        var url = URIs.bbDebugger + '?url=' + encodeURIComponent(this._getCodeURI());
                        var title = "BuildingBlockTest " + this.getTitle();
                        var options = 'menubar=no,toolbar=no,width=800,height=600';
                        window.open(url, title, options);
                    }.bind(this);
                    this._save(true);
                }.bind(this),
                false
            ));
        this._addToolbarElement('properties', new ToolbarButton(
                'Edit Building Block properties',
                'changeview',
                function() {
                    this._propsView.changeView();
                }.bind(this),
                true
            ));
    },
    _findCheckCallback: function() {
        // Do nothing
    },
    _refreshReachability: function() {
        // Do nothing
    }
});
BuildingBlockDocument.FORM = "form";
BuildingBlockDocument.OPERATOR = "operator";
BuildingBlockDocument.RESOURCE = "resource";

})();

/**
 * This class is included here due to PaletteDocument restrictions,
 * which need an instance of an InferenceEngine. As this document
 * does not need any kind of inference, the class does nothing
 */
var DumbInferenceEngine = (function() {
    var DumbInferenceEngineSingleton = {
        initialize: function(){},
        findCheck: function(){},
        addReachabilityListener: function(){},
        removeReachabilityListener: function(){}
    };
    return function DumbInferenceEngine() {
        return DumbInferenceEngineSingleton;
    };
})();

// vim:ts=4:sw=4:et:
