<script type="text/javascript" language="javascript">
    var menu = null;

    var _debugger = null;

    var screens = [
{% for screen in gadgetScreens %}
            {
                id:"{{screen.id}}",
                title: "{{ screen.label|cut:" " }}",
                contentEl:"__{{screen.id}}",
                pre: [{% for pre in screen.preconditions %}
                        [{% for ands in pre %}
                            {pattern:'{{ ands.pattern }}', positive:{{ands.positive|lower}}}{% if not forloop.last %}, {% endif %}
                         {% endfor %}]{% if not forloop.last %},{% endif %}
                      {% endfor %}]
            }{% if not forloop.last %},{% endif %}
{% endfor %}
        ];

    var _io = new FastAPI.IO();
{% ifequal platform 'ezweb' %}
    {% for slot in gadgetSlots %}
    var {{ slot.variableName }} = _io.createInVariable("{{ slot.variableName }}", set{{ slot.variableName }});
    function set{{ slot.variableName }}(val){
        var fact = ScreenflowEngineFactory.getInstance().transformFact("{{ slot.semantics }}", "{{ slot.factAttr }}", val);
        ScreenflowEngineFactory.getInstance().manageVarFacts([fact],[]);
    }
    {% endfor %}
{% endifequal %}

    var events = [
{% ifequal platform 'ezweb' %}
    {% for event in gadgetEvents %}
            {variable: _io.createOutVariable("{{ event.variableName }}"), fact_uri: "{{ event.semantics }}", fact_attr: "{{ event.factAttr }}"}{% if not forloop.last %},{% endif %}
    {% endfor %}
{% endifequal %}
        ];

    function loadMenu(){
        var debugging = (getURLparam("debugging") == "true") ? true : false;
        if (debugging) {
            _debugger = new Debugger();
        }
        menu = new FASTMenu({renderTo: "menu"});
        ScreenflowEngineFactory.getInstance().setEngine(screens, events, menu, {% if gadgetPersistent %}true{% else %}false{% endif %});
        ScreenflowEngineFactory.getInstance().run();
    }
    function getURLparam(name) {
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null) {
            return null;
        }
        else {
            return results[1];
        }
    }
</script>
