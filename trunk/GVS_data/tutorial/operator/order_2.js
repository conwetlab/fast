/**
 * Order action
 */
order: function(list) {
    var unordered = list.data;

    var order = this.parameter ? this.parameter.order : "ascending";
    var sortFunc;

    switch (order) {
        case "descending":
            sortFunc = function(a, b) {
                return a < b;
            }
            break;
        case "ascending":
        default:
            sortFunc = function(a, b) {
                return a > b;
            }
            break;
    }
    var elementKey;

    if (this.parameter && this.parameter.elementKey) {
        elementKey = this.parameter.elementKey;
    } else {
        elementKey = "name";
    }

    var ordered = unordered.sort(function(element1, element2) {
        if (element1[elementKey] != null && element2[elementKey] != null) {
            return sortFunc(element1[elementKey], element2[elementKey]);
        } else {
            return 0;
        }
    });
    var outputList = {
        "id": "orderedList",
        "data": ordered
    };
    this.manageData([], [outputList], []);
}
