BuildingBlock = Class.create({
    initialize: function(params) {
        this.parameter = params;
    },
    manageData: function() {}
});

document.observe('dom:loaded', function() {
    var bb;

    function sendMsg(recipient, name, args) {
        recipient.postMessage(Object.toJSON({
            name: name,
            arguments: args
        }), '*')
    }

    window.addEventListener('message', function (e) {
        var source = e.source,
            data = e.data,
            message = JSON.parse(data),
            methodName = message.name,
            args = message.arguments || [];

        if (methodName === 'initialize') {
            bb = new FORM(args[0]);
            BuildingBlock.prototype.manageData = function manageDataProxy(t,a,d) {
                sendMsg(source, 'manageData', [t, a, d]);
            };

            var n,
                actions = [];
                prototype = FORM.prototype;
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
            sendMsg(source, 'setActionList', [actions]);
        } else {
            bb[methodName].apply(bb, args);
        }
    }, false);
});
