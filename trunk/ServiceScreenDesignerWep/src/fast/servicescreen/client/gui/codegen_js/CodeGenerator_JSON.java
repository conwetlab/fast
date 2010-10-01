package fast.servicescreen.client.gui.codegen_js;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import fast.common.client.BuildingBlock;
import fast.common.client.FASTMappingRule;
import fast.mediation.client.gui.MediationRuleGUI;
import fast.servicescreen.client.gui.RuleUtil;
import fast.servicescreen.client.gui.parser.Kind;
import fast.servicescreen.client.gui.parser.Operation;
import fast.servicescreen.client.gui.parser.OperationHandler;

public class CodeGenerator_JSON extends CodeGenerator
{
	MediationRuleGUI ruleGui = null;
	
	static final String value = "json";

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
	protected void transform(FASTMappingRule rule, String codeIndent)
	{
		boolean hasOpenSqareBracket = false;
		boolean hasOpenForLoop = false;
		
		if(RuleUtil.isCompleteRule(rule) && rule.getOperationHandler() != null)
		{
			//get the current operationList 
			OperationHandler opHandler = (OperationHandler) rule.getOperationHandler();
			Iterator<ArrayList<Operation>> opList_iter = opHandler.getOperationlistIterator();
			ArrayList<Operation> current_opList = null;
			
			String kind = rule.getKind();
						
			if ("createObject".equals(kind))
			{
				String tmpCode = "";
				
				//from to
				String from = rule.getSourceTagname();
				String target = rule.getTargetElemName();
				
				//If it is not just a strukture tag ( = tags insert by us, so user see JSON strukture better)
				if(! from.endsWith("_Item"))
				{
					//create indent for n1 JSON output
					if(firstOperation)
					{
						tmpCode += "var indent = ''; \n";
						
						firstOperation = false;
					}
					else
					{
						tmpCode += codeIndent + "indent = indent + '   '; \n";
					}
					
					
					//create a elementcount variable name
					String lengthName =  from + "_length";
					
					//get searched elementsList out of json value
					tmpCode += codeIndent + "var " + from + " = getJSONValue_byName(" + value + ", '" + from + "'); \n";
					
					//fill element count variable
					tmpCode += codeIndent + "var " + lengthName + " = " + from + ".length; \n\n";
					
					//increment var for loop
					String countVar = from + "_Count";
					
					
					//créate loop - code				
					tmpCode += 
						//declare loop rump
						codeIndent + "for(var " + countVar + " = 0; " + countVar + " < " + lengthName + "; ++" + countVar + ")\n" +
						codeIndent + "{\n" +
								
						//declare loop body
						codeIndent + depth + currentTags + " = " + from + "[" + countVar + "];\n\n" +
								
						 //adds a current index variable
						codeIndent + depth + "currentCount = " + countVar + "; \n\n";		
					
					hasOpenForLoop = true;
							
					 //adds a 'new object' in the result, jumps over types that are needles in JSON
					if(target.endsWith("List"))
					{
						tmpCode += codeIndent + depth + "result += indent + '\"" + target + "\" : [ \\n'; \n";
						hasOpenSqareBracket = true;
					}
					else
					{
						tmpCode += codeIndent + depth + "result += indent + '{ \\n'; \n\n";
					}

					//overtake loop in real transcode
					transCode += tmpCode;
				}
			}
			
			else if ("fillAttributes".equals(kind))
			{
				String tmpCode;
				
				//Iterate over any opList entry
				while(opList_iter.hasNext())
				{
					tmpCode = "";
					String lastSourceTagname = "";
					String attrName = rule.getTargetElemName();
					
					current_opList = opList_iter.next();
					
					//if constant
					if(current_opList.size() > 0 && current_opList.get(0).kind == Kind.constant)
					{
						//add a constant
						tmpCode += "'" + current_opList.get(0).value + "'";
					}
					//if operations
					else
					{
						Operation lastTagnameOperation = opHandler.getLastTagnameOf(current_opList);
						lastSourceTagname = lastTagnameOperation.value;
						
						//create code for getting the current (working)element list
						tmpCode += trimBoth +  " currentTags['" + lastSourceTagname + "'] )";
						
						//create code for the hole operation list
						int count = current_opList.indexOf(lastTagnameOperation) + 1;
						for(; count < current_opList.size(); ++count)
						{
							Operation currentOp = current_opList.get(count);
							
							//create code for executing the currentOperation
							tmpCode = createOperationCode(tmpCode, currentOp);
						}
					}
					
					
					//overtake operation code in real transcode
					if(operationStart)
					{
						transCode += codeIndent + "result += indent + '   \"" + attrName + "\" : \"' + " + tmpCode;
						
						operationStart = false;
					}
					else
					{
						transCode += tmpCode;	
					}
					
					
					//if there are more operationLists, add a '+' , else a ';'
					if(opList_iter.hasNext())
					{
						transCode += " + ";
					}
					else
					{
						//means, we reach the last fillAttr. rule!
						if(rule.getParent().getLastOfKids() == rule)
						{
							transCode += " + '\" \\n' + indent + '}, \\n'; \n";
						}
						else
						{
							transCode += " + '\", \\n'; \n";
						}
						
						operationStart = true;
					}
				}
			}
			
			callTransformForKids(rule, codeIndent + depth);
			
			if (hasOpenForLoop)
			{
				transCode += codeIndent + "} \n";
			}
			
			if (hasOpenSqareBracket)
			{
				transCode += codeIndent + "result += ' ]\\n';";
			}
		}
	}
	
	@Override
	protected void setTemplates()
	{	
		//change roottemplate
		rootTemplate = 
			//declare method rump 
			depth + "function transform(unparsedJSON)\n" +
			depth + "{\n" +
				depth5 + "var result = ''; \n" +
				depth5 + "var " + value + " = JSON.parse(unparsedJSON);\n" +
			
				depth5 + "var currentTags;\n" +
				depth5 + "var currentCount;\n" +
				
				//transform code
				depth5 + "<<transformationCode>>\n\n" +
		
				//return result 
				depth5 +  "return result; \n" + 
				
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
			depth + "String.prototype.endsWith = function(str)\n" +
			depth + "{\n" +
				depth2 + "return (this.match(str + '$')==str)\n" +
			depth + "}\n\n" +

			depth + "function getJSONValue_byName(val, name)\n" +
			depth + "{ \n" +
				depth2 + "//if(name.endsWith('_Item'))\n" +
				depth2 + "//{\n" +
					depth3 + "//name = name.substring(0, name.length - 5)\n" +
					depth3 + "//var parentValue = getJSONValue_byName(val, name);\n" +
					depth3 + "//return parentValue[0];\n" +
				depth2 + "//}\n\n" +

				depth2 + "var searchList = new Array();\n" + 
				depth2 + "searchList.push(val);\n\n" +

				depth2 + "//Breadth First Search over the list searchList\n" +
				depth2 + "while(searchList.length != 0)\n" +
				depth2 + "{\n" +
					depth3 + "//get and pop first element\n" +
					depth3 + "var value = searchList[0];	\n" +
					depth3 + "searchList.shift();\n" +

					depth3 + "//if value was found, return\n" +
					depth3 + "if(isOn_nextLayer(value, name))\n" +
					depth3 + "{\n" +
						depth4 + "//in case of value[name] is an object, form in array\n" +
						depth4 + "//if(typeof value[name] == 'object')\n" +
						depth4 + "//{\n" +
							depth5 + "//var elements = new Array();\n" +
							depth5 + "//elements.push(value[name]);\n" +

							depth5 + "//return elements;\n" +
						depth4 + "//}\n\n" +
						
						depth4 + "return value[name]\n\n" +

					depth3 + "//in case of value[name] is an array\n" +
					depth3 + "return value[name];\n" +
				depth2 + "}\n" +
				depth2 + "//else attemp any sub-subValue to the searhList\n" +
				depth2 + "else\n" +
				depth2 + "{\n" +
					depth3 + "var attributeNames = getAttributeNameArray(value);\n" +
					depth3 + "for (var i = 0; i < attributeNames.length; ++i)\n" +
					depth3 + "{\n" +
						depth4 + "attribute = value[attributeNames[i]];\n\n" +
						
						depth4 + "//only save further objects\n" +
						depth4 + "if(typeof attribute == 'object')\n" +
						depth4 + "{\n" +
							depth5 + "searchList.push(attribute);\n" +	
						depth4 + "}\n" +
					depth3 + "}\n" +
				depth2 + "}\n" +
			depth + "}\n\n" +

			depth + "return null; //not found\n" +
			depth + "}\n\n" +

		depth + "function isOn_nextLayer(value, name)\n" +
		depth + "{\n" +
			depth2 + "var attributes = new Array();\n" + 
			depth2 + "for(var aName in value)\n" +
			depth2 + "{\n" +
				depth3 + "if(aName == name)	//found!\n" +
				depth3 + "{\n" +
					depth4 + "return true;\n" + 
				depth3 + "}\n" +
			depth2 + "}\n\n" +

			depth2 + "return false;\n" +
		depth + "}\n\n" +

		depth + "function getAttributeNameArray(value)\n" +
		depth + "{\n" +
			depth2 + "var attributes = new Array();\n" + 
			depth2 + "for(var aName in value)\n" +
			depth2 + "{\n" +
				depth3 + "attributes.push(aName);\n" +
			depth2 + "}\n\n" +

			depth2 + "return attributes;\n" +
	depth + "}\n" ;
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