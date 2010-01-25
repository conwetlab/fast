
run: function (filter, appid)
{
	
	// fill imput data into request template
	var prerequest = 'http://open.api.sandbox.ebay.com/shopping?appid=<appid>&version=517&callname=FindItems&ItemSort=EndTime&QueryKeywords=<filter>&responseencoding=XML';
	
	// search and replace
	prerequest = prerequest.replace(/<filter>/g, filter.data.keyword);
	prerequest = prerequest.replace(/<appid>/g, appid.data.keyword);
	              
	var request = prerequest;
	
	
	//Invoke the service
    new FastAPI.Request(request,{
    	'method':       'get',
    	'content':      'xml',
    	'context':      this.context,
    	'onSuccess':    this.forwardResult.bind(this)
    });
        
     
    // forward result function
    Operators.Ebaywrapper.forwardResult = function (transport)
    {
    	var xml = transport;
    	ScreenflowEngineFactory.getInstance().putFact('xmlproductlist', transport);
    };
    
};