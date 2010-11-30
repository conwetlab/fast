package fast.servicescreen.client.gui.codegen_js;

import java.util.ArrayList;
import java.util.Iterator;

import fast.common.client.FASTMappingRule;
import fast.common.client.ServiceScreen;
import fast.servicescreen.client.ServiceScreenDesignerWep;
import fast.servicescreen.client.gui.RuleUtil;
import fast.servicescreen.client.gui.parser.Kind;
import fast.servicescreen.client.gui.parser.Operation;
import fast.servicescreen.client.gui.parser.OperationHandler;

/**
 * This class represents the code generator for wrapper, which
 * request JSON and then transform it.
 * */
public class CodeGenerator_reqJSON extends CodeGenerator
{
	public CodeGenerator_reqJSON(ServiceScreenDesignerWep serviceDesigner)
	{
		super(serviceDesigner);
	}
	
	/**
	 * U should not use this constructor
	 * */
	public CodeGenerator_reqJSON(){}

	/**
	 * Overwrite this method, to get the request URL out of the right MediationGUI
	 * instead of the RuleGUI
	 * */
	@Override
	protected void add_PreRequest_toTable()
	{
		// lookup the gui request text field
		if (screen instanceof ServiceScreen)
		{
			String prerequestText = serviceDesigner.requestUrlBox.getText();
			table.put("<<prerequest>>", prerequestText);
		}
	}
	
	@Override
	protected void setTemplates()
	{	
		rootTemplate = 
			//declare method rump 
			depth + "search: function (filter)\n" +
			depth + "{\n" +
			    depth2 + "var <<inputportlist>> = filter.data.<<inputportlist>>;\n" +
			    
				//fill request url
				depth2 + "var prerequest = '<<prerequest>>';\n" +
				
				//should replace inports to real values in runtime!
				depth2 + "<<prerequestreplaces>>\n\n" +
				
				//save the complete url with an xmlHttp request (made for Ajax access to SameDomain Resources)
				depth2 + "var request = prerequest;\n" +
				
				//sending/recieving the request
				depth2 + "//Invoke the service\n" +
				depth2 + "    new FastAPI.Request(request,{\n" +
				depth2 + "        'method':       '<<methodType>>',\n" +
				depth2 + "        'content':      'json',\n" +
				depth2 + "        'context':      theOperator,\n" +
				depth2 + "        'onSuccess':    theOperator.addToList\n" +
				depth2 + "    });\n\n" +
			depth + "},\n" +
			depth + "\n" +
			//next method rump 
			depth + "addToList: function (transport) \n" +
			depth + "{ \n" +
				depth2 + "var " + value + " = transport;\n\n" +
				 
				depth2 + "var result = '';\n" +
			    depth2 + "var currentTags = null; \n" +
			    depth2 + "var currentCount = null; \n\n" +
		        
		        depth2 + "<<transformationCode>>\n\n" +
		        
			    depth2 + "var jsonResult = JSON.parse('{' + result + '}'); \n" +
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
				depth + "\n" +
			"\n";
	}
	
	static final String value = "json";
	@Override
	protected void transform(FASTMappingRule rule, String codeIndent)
	{
		boolean hasOpenSqareBracket = false;
		boolean hasOpenForLoop = false;
		
		//TODO dk Something like: if(Rule = DummyRule)
		// tmpCode += codeIndent + "value = getJSONValue_byName(" + value + ", '" + from + "'); \n";
		//Should change value -> value.get(from) to jump over unnecessary lines
		//Make the same changes in JSON & XML CodeGen, too!
		
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