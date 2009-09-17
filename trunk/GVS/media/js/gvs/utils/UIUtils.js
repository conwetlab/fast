function UIUtils()
{
    // *********************************
    //           STATIC CLASS
    // *********************************
}


UIUtils.setSatisfeabilityClass = function (/** DOMNode */ node, /** Boolean */ satisfeable) {
    if (satisfeable === null || satisfeable === undefined) { //Unknown satisfeability
        node.removeClassName('satisfeable');
        node.removeClassName('unsatisfeable');
    } else {
        node.removeClassName(satisfeable ? 'unsatisfeable' : 'satisfeable');
        node.addClassName(satisfeable ? 'satisfeable' : 'unsatisfeable');
    }
}

