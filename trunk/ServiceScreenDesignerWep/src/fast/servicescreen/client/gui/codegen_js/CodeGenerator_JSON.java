package fast.servicescreen.client.gui.codegen_js;

import java.util.HashMap;

import fast.common.client.BuildingBlock;
import fast.mediation.client.gui.MediationRuleGUI;

public class CodeGenerator_JSON extends CodeGenerator
{
	MediationRuleGUI ruleGui = null;

	public CodeGenerator_JSON(BuildingBlock screen, MediationRuleGUI gui)
	{
		super(screen);
		
		this.ruleGui = gui;
	}
	
	/**
	 * This method now cut the hole sending mechanism,
	 * because we only get a JSON input instead of a request
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
	protected void transform(fast.common.client.FASTMappingRule rule, String codeIndent)
	{
		//Just a test at moment
		
		transCode +=
					"var test1 = getJSONValue_byName(json, 'F1Drivers'); \n" + 
					depth2 + "var test2 = getJSONValue_byName(test1, 'driverId'); \n\n" +
		
					depth2 + "alert('subValues are: ' + test2[0] + ' and ' + test2[1]); \n";
	}
	
	@Override
	protected void setTemplates()
	{	
		//change roottemplate
		rootTemplate = 
			//declare method rump 
			depth + "function transform(unparsedJSON)\n" +
			depth + "{\n" +
			
				depth2 + "var json = JSON.parse(unparsedJSON);\n" +
			
				//sending/recieving the request
				depth2 + "<<transformationCode>>\n" +
		
			depth + "}\n\n";
		
		
		//change input parameters in pre/postHtml
		posthtml = 
			"</script>\n" +
			"</head>\n" +
			"<body>\n" +
			"<form name=f1>\n" +
			"<textarea name=t2 cols=70 rows=20> <<JSON_ExampleCode>> </textarea>" +
			
			"<input type=button value='transform' \n" +
			
			"onclick='this.form.t1.value=transform(this.form.t2.value)'>	\n" +
			
			"<br><br><br><br> \n" +
			"<textarea name=t1 id='show' cols=70 rows=20> To see the results, press the button above.. </textarea>" +
			"</form>\n" +
			"</body>\n" +
			"</html>\n";
		
		
		//no sendrequest by wrapping incomming JSON
		
		
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