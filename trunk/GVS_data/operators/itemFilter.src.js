
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
        var keyField = this.parameter.keyField;
        var searchValue = this.parameter.searchValue;
        var searchCondition = this.parameter.searchCondition;

        var items = list.data;
        var condition = conditions[searchCondition] || conditions.eq;

        for (var i = 0, item; item = items[i]; i++) {
            if (condition(item[keyField], searchValue)) {
                this.manageData([], [{id: 'filteredItem', data: item}], []);
                break;
            }
        }
    };
})()
