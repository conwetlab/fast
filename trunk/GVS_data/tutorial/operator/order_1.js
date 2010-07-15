/**
 * Order action
 */
order: function(list) {
    var unordered = list.data;
    var ordered = unordered.sort(function(element1, element2) {
        if (element1.name != null && element2.name != null) {
            return element1.name > element2.name;
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
