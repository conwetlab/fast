package fast.servicescreen.client.gui.codegen_js;

import java.util.HashMap;

import fast.common.client.BuildingBlock;
import fast.mediation.client.gui.MediationRuleGUI;

public class CodeGenerator_JSON extends CodeGenerator_reqJSON
{
	MediationRuleGUI ruleGui = null;
	static final String value = "json";

	public CodeGenerator_JSON(BuildingBlock screen, MediationRuleGUI gui)
	{
		this.screen = screen;
		
		this.ruleGui = gui;
		
		setTemplates();
	}
	
	/**
	 * This method adds a example value, to make it easy for users to test wrapper
	 * */
	@Override
	public String generateJS()
	{
		table = new HashMap<String, String>();		
		
		//create rulesCode. After that, there is a table entry for "<<transformationCode>>"
		add_Translation_toTable();
		
		//create JSON Example value
		add_JSON_ExampleValue_toTable();
		
		//fill founded values into the <keywords> in rootTemplate
		rootTemplate = expandTemplateKeys(rootTemplate);
		
		//fill founded JSON example values into posthtml
		posthtml = expandTemplateKeys(posthtml);

		return rootTemplate;
	}
	
	@Override
	protected void setTemplates()
	{	
		//change root template
		rootTemplate = 
			//declare method rump 
			depth + "addToList: function (transport) \n" +
			depth + "{ \n" +
				depth2 + "var unparsedJSON = transport; \n\n" +
				 
				depth2 + "var firstIndex = unparsedJSON.indexOf('{'); \n" +
				depth2 + "var lastIndex = unparsedJSON.lastIndexOf('}'); \n" +
				depth2 + "if(firstIndex >= 0 && lastIndex >= 0) \n" +
				depth2 + "{ \n" +
				depth2 + "		unparsedJSON = unparsedJSON.substring(firstIndex, lastIndex + 1); //CHEAT??\n" +
				depth2 + "} \n" +
				depth2 + "var " + value + " = JSON.parse(unparsedJSON);\n\n" +
				 
				depth2 + "var result = '';\n" +
			    depth2 + "var currentTags = null; \n" +
			    depth2 + "var currentCount = null; \n\n" +
		        
		        depth2 + "<<transformationCode>>\n\n" +
		        
		        depth2 + "result = '{' + result + '}'; \n" +
			    depth2 + "var jsonResult = JSON.parse(result); \n" +
			    depth2 + "var factResult = {data: {productList: jsonResult}}\n" +
			    depth2 + "if (this.manageData) {\n" +
			    depth2 + "   this.manageData([\"itemList\"], [factResult], [])\n" +
			    depth2 + "}\n" +
			    depth2 + "else {\n" +
			    depth2 + "   document.getElementById('show').value = result;\n" +
			    depth2 + "}\n" +
				depth + "}, \n" +
				depth + "\n" +
				//next method rump
				depth + "onError: function (transport){} \n" +
				depth + "}\n" +
			"\n";
		
		
		//change input parameters in pre/postHtml
		posthtml = 
			"function transform (param) {\n" + 
			"   var result = theOperator.addToList (param); \n" + 
			"}\n" + 
			"</script>\n" +
			"</head>\n" +
			"<body>\n" +
			"<form name=f1>\n" +
			"<textarea name=t2 cols=70 rows=20> <<JSON_ExampleCode>> </textarea>" +
			
			"<input type=button value='transform' \n" +
			"onclick='transform(this.form.t2.value)'>	\n" +
			
			"<br><br><br><br> \n" +
			"<textarea name=t1 id='show' cols=70 rows=20> To see the results, press the button above.. </textarea>" +
			"</form>\n" +
			"</body>\n" +
			"</html>\n";
	}
	
	/**
	 * Adds the example JSON value given by user into test value
	 * for the wrapper (replace in post html). So the user does not
	 * have to copy vales to test his wrapper operator
	 * */
	protected void add_JSON_ExampleValue_toTable()
	{
		String code = ruleGui.getJSONValue().toString();
		
		table.put("<<JSON_ExampleCode>>", code);
	}
	
	/**
	 * Specific CodeGen is returned.
	 * That makes the resetTemplates method work
	 * */
	@Override
	protected CodeGenerator createEmptyGenerator()
	{
		return new CodeGenerator_JSON(null, null);
	}
}