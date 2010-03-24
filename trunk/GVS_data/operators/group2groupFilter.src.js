filter: (function(){

    var conditions = {
        "eq": function(left, right) { return left == right; },
        "ne": function(left, right) { return left != right; },
        "lt": function(left, right) { return left < right; },
        "le": function(left, right) { return left <= right; },
        "gt": function(left, right) { return left > right; },
        "ge": function(left, right) { return left >= right; },
        "match": function(left, right) {
            var regExp = new RegExp(right);
            return left.match(regExp);
        }
    };

    return function (list) {
    	var filteredList = new Array();
        var items = list.data;
        for (var i = 0, item; item = items[i]; i++) {
            var found = true;
            var params = this.parameter;
            for (var j = 0, condition; condition = params[j]; j++) {
            	found = true;
            	var filter = conditions[condition.searchCondition] || conditions.eq;
                if (!filter(item[condition.keyField], condition.searchValue)) {
                    found = false;
                    break;
                }
            }
            if (found){
            	filteredList.push(item);
            }
        }
        this.manageData([], [{id: 'filteredGroup', data: filteredList}], []);
    };
})()
