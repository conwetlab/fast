package fast.servicescreen.client.gui.codegen_js;

import fast.common.client.BuildingBlock;

/**
 * This class represents the codegenerator for wrapper, which
 * request JSON and then transform it.
 * */
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
		
		//no need to change pre- or postHtml
		
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
		
		
		//change helper methods (add getJSONValue_byName)
		helperMethods +=
			depth + "function getJSONValue_byName(value, name) \n" + 
			depth + "{  \n" +
				depth2 + "var elements = value[name]; \n\n" +
				depth2 + "if(elements == null || elements == undefined) \n" +
				depth2 + "{ \n" +
					depth3 + "elements = new Array(); \n" +
					depth3 + "var count; \n" +
					depth3 + "var length = value.length; \n\n" +

					depth3 + "for(count = 0; count < length; count++) \n" +
					depth3 + "{ \n" +
						depth4 + "var subValue = value[count]; \n" +
						depth4 + "var realValue = subValue[name]; \n" +
						depth4 + "elements.push(realValue); \n" +
					depth3 + "} \n\n" +
				depth2 + "} \n" +

				depth2 + "return elements;\n" +
				
				depth + "} \n\n";
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