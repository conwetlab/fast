function Utils()
{
    // *********************************
    //           STATIC CLASS
    // *********************************
}

// TODO: include comments

Utils.getIsoDateNow = function(/**Date*/ dateObject) {
    var dateString = dateObject.toJSON();
    dateString = dateString.replace(/"/,'');
    if(dateString.endsWith('Z"')){
        dateString=dateString.truncate(-2,'');
        dateString=dateString+'+0000';
    }
    return dateString;
}
