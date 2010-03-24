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

    return function (item) {
        var it = item.data;
        var params = this.parameter;
        for (var j = 0, condition; condition = params[j]; j++) {
        	var filter = conditions[condition.searchCondition] || conditions.eq;
            if (!filter(it[condition.keyField], condition.searchValue)) {
            	return;
            }
        }
        this.manageData([], [{id: 'filteredItem', data: it}], []);
    };
})()
