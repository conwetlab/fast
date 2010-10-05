   search: function (filter)
   {
      var season = filter.data.season;
      var prerequest = 'http://ergast.com/api/f1/drivers?season=<season>';
      prerequest = prerequest.replace(/<season>/g,encodeURIComponent(season));


      var request = prerequest;
      //Invoke the service
          new FastAPI.Request(request,{
              'method':       'get',
              'content':      'xml',
              'context':      theOperator,
              'onSuccess':    theOperator.addToList
          });

   },

   addToList: function (transport)
   {
      var xmlResponse = transport;
      var currentTags = null;

      var currentCount = null;

      var result = new String('{ ');

      var indent = '';
               var DriverTable_length = xmlResponse.getElementsByTagName('DriverTable').length;
               var DriverTable = xmlResponse.getElementsByTagName('DriverTable');

               for(var DriverTable_Count = 0; DriverTable_Count < DriverTable_length; ++DriverTable_Count)
               {
                  currentTags = DriverTable.item(DriverTable_Count);

                  currentCount = DriverTable_Count;

                  result += indent + '"F1DriverList" : [ \n';
                  indent = indent + '   ';
                  var Driver_length = currentTags.getElementsByTagName('Driver').length;
                  var Driver = currentTags.getElementsByTagName('Driver');

                  for(var Driver_Count = 0; Driver_Count < Driver_length; ++Driver_Count)
                  {
                     currentTags = Driver.item(Driver_Count);

                     currentCount = Driver_Count;

                     result += indent + '{ \n';

                     result += indent + '   "driverId" : "' + Trim( getValue(currentTags, 'driverId') ) + '", \n';
                     result += indent + '   "givenName" : "' + Trim( getValue(currentTags, 'GivenName') ) + '", \n';
                     result += indent + '   "familyName" : "' + Trim( getValue(currentTags, 'FamilyName') ) + '", \n';
                     result += indent + '   "dateOfBirth" : "' + Trim( getValue(currentTags, 'DateOfBirth') ) + '", \n';
                     result += indent + '   "nationality" : "' + Trim( getValue(currentTags, 'Nationality') ) + '", \n';
                     result += indent + '   "url" : "' + Trim( getValue(currentTags, 'url') ) + '" \n' + indent + '}, \n';
                  }
               }
               result += ' ]\n';

      result += ' }';
      var jsonResult = JSON.parse(result);
      var factResult = {data: {productList: jsonResult}}
      if (this.manageData) {
         this.manageData(["itemList"], [factResult], [])
      }
      else {
         document.getElementById('show').value = result;
      }
   },

   onError: function (transport){}


