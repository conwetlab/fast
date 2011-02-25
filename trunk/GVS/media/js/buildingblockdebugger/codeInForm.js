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
