	function processData(JSONData) {
		alert(JSONData.color);
	}

	var ajaxRequest = new ajaxObject('http://www.somedomain.com/getdata.php');

    ajaxRequest.callback = function (responseText) {
       JSONData = responseText.parseJSON();
       processData(JSONData);
    }
    
    ajaxRequest.update();
