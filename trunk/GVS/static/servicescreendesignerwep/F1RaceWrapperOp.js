   search: function (filter)
   {
      var season = filter.data.season;
      var prerequest = 'http://ergast.com/api/f1/<season>';
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
               var RaceTable_length = xmlResponse.getElementsByTagName('RaceTable').length;
               var RaceTable = xmlResponse.getElementsByTagName('RaceTable');

               for(var RaceTable_Count = 0; RaceTable_Count < RaceTable_length; ++RaceTable_Count)
               {
                  currentTags = RaceTable.item(RaceTable_Count);

                  currentCount = RaceTable_Count;

                  result += indent + '"F1RaceList" : [ \n';
                  indent = indent + '   ';
                  var Race_length = currentTags.getElementsByTagName('Race').length;
                  var Race = currentTags.getElementsByTagName('Race');

                  for(var Race_Count = 0; Race_Count < Race_length; ++Race_Count)
                  {
                     currentTags = Race.item(Race_Count);

                     currentCount = Race_Count;

                     result += indent + '{ \n';

                     result += indent + '   "raceName" : "' + Trim( getValue(currentTags, 'RaceName') ) + '", \n';
                     result += indent + '   "season" : "' + Trim( getValue(currentTags, 'season') ) + '", \n';
                     result += indent + '   "date" : "' + Trim( getValue(currentTags, 'Date') ) + '", \n';
                     result += indent + '   "location" : "' + Trim( getValue(currentTags, 'Locality') ) + ' ' + Trim( getValue(currentTags, 'Country') ) + '" \n' + indent + '}, \n';
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


