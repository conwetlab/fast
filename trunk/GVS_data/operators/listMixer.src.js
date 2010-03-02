mix: function (list1, list2) {
    //var result = Object.clone(list1.data);
    var mixedList = [];

    if (this.params && this.params.keyField) {
        var keyField = this.params.keyField;
        var mixedListHash = new Hash();
        //var mixedList = [];

        /*for (var i = 0; i < list1.data.productList.length; i++) {
            var item = list1.data.productList[i];
            mixedListHash.set(item[keyField], item);
        }
        for (var i = 0; i < list2.data.productListlength; i++) {
            var item = list2.data.productList[i];
            mixedListHash.set(item[keyField], item);
        }*/

        for (var i = 0; i < list1.data.length; i++) {
            var item = list1.data[i];
            mixedListHash.set(item[keyField], item);
        }
        for (var i = 0; i < list2.data.length; i++) {
            var item = list2.data[i];
            mixedListHash.set(item[keyField], item);
        }

        mixedListHash.each(function (element) {
            mixedList.push(element.value);
        });

        //result.productList = mixedList;

    } else {
        //result.productList = list1.data.productList.concat(list2.data.productList);
        mixedList = list1.data.concat(list2.data);
    }

    var facts = [{id: 'mixedList', data: result}];

    this.manageData([], facts, []);
}
