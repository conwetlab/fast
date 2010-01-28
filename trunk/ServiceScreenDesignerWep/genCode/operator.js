run: function (<<inputportlist>>) 
{
   //fill imput data into request template 
   var prerequest = '<<prerequest>>'; 

  //search and replace (Operator - Time replacement) 
  <<prerequestreplaces>>
  var request = prerequest; 

  //the code for sending a request to same domain resource 
  <<sendrequest>> 
  var xmlResponse =  response; 

  //the outputPort variable 
  <<outputport>> 

  //the transformation code 
  <<transformation>>; 

}
