package fast.servicescreen.client.gui.codegen_js;

import fast.common.client.BuildingBlock;

public class CodeGenerator_reqJSON extends CodeGenerator
{

	public CodeGenerator_reqJSON(BuildingBlock screen)
	{
		super(screen);
	}

	@Override
	protected void setTemplates()
	{
		//no need to change root template
		
		//change sendRequest for generating JSON wrapping with request
		sendrequest = 
			depth2 + "var jsonRespone = null;\n" + 
			depth2 + "var requestServletUrl = window.location.protocol + '//' + window.location.host  + '/ServiceDesignerWep/servicescreendesignerwep/requestServlet?url=';\n" +
			depth2 + "var holeRequest = requestServletUrl + encodeURIComponent(request); \n\n" + 
			
			depth2 + "var ajaxRequest = new ajaxObject(holeRequest); \n\n" + 
			
			depth2 + "ajaxRequest.callback = function (responseText) { \n" + 
				depth3 + "jsonRespone = responseText.parseJSON(); \n" + 
				depth3 + "" + 
			depth2 + "} \n\n" +
			
			depth2 + "return 'waiting for response...'; \n" + 
			depth + "} \n";
	}
	
	/**
	 * Specific CodeGen is returned.
	 * That makes the resetTemplates method work
	 * */
	@Override
	protected CodeGenerator createEmptyGenerator()
	{
		return new CodeGenerator_reqJSON(null);
	}
}