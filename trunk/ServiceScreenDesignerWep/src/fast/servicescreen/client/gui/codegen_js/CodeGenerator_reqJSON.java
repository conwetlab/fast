package fast.servicescreen.client.gui.codegen_js;

import java.util.ArrayList;
import java.util.Iterator;

import fast.common.client.BuildingBlock;
import fast.common.client.FASTMappingRule;
import fast.common.client.ServiceScreen;
import fast.servicescreen.client.ServiceScreenDesignerWep;
import fast.servicescreen.client.gui.RuleUtil;
import fast.servicescreen.client.gui.parser.Kind;
import fast.servicescreen.client.gui.parser.Operation;
import fast.servicescreen.client.gui.parser.OperationHandler;

/**
 * This class represents the codegenerator for wrapper, which
 * request JSON and then transform it.
 * */
public class CodeGenerator_reqJSON extends CodeGenerator
{
	ServiceScreenDesignerWep serviceDesigner;
	
	public CodeGenerator_reqJSON(ServiceScreenDesignerWep serviceDesigner, BuildingBlock screen)
	{
		super(screen);
		
		this.serviceDesigner = serviceDesigner;
	}

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
		//no need to change root template
		
		//no need to change pre- or postHtml
		
		//change sendRequest for generating JSON wrapping with request		
		sendrequest = 
			depth2 + "var xmlHttp = null; \n" + 
			depth2 + "try \n" +
			depth2 + "{ \n" + 
			   depth3 + "xmlHttp = new XMLHttpRequest(); \n" + 
			depth2 + "} \n" +
			depth2 + "catch(e) \n" +
			depth2 + "{ \n" + 
			   depth3 + "try \n" +
			   depth3 + "{ \n" + 
			      depth4 + "xmlHttp  = new ActiveXObject('Microsoft.XMLHTTP'); \n" + 
			   depth3 + "} \n" +
			   depth3 + "catch(e) \n" +
			   depth3 + "{ \n" + 
			      depth4 + "try \n" +
			      depth4 + "{ \n" + 
			         depth5 + "xmlHttp  = new ActiveXObject('Msxml2.XMLHTTP'); \n" + 
			      depth4 + "} \n" +
			      depth4 + "catch(e) \n" +
			      depth4 + "{ \n" + 
			         depth5 + "xmlHttp  = null; \n" + 
			      depth4 + "} \n" + 
			   depth3 + "} \n" + 
			depth2 + "} \n\n" + 
			
			depth2 + "if (xmlHttp) \n" +
			depth2 + "{ \n" + 
	  	       depth3 + "var requestServletUrl = window.location.protocol + '//' + window.location.host  + '/ServiceDesignerWep/servicescreendesignerwep/requestServlet?url='; \n" +
			   depth3 + "xmlHttp.open('GET', requestServletUrl + encodeURIComponent(request), true); \n" + 
			   depth3 + "xmlHttp.onreadystatechange = function () { \n" + 
			      depth4 + "if (xmlHttp.readyState == 4) \n" +
			      depth4 + "{ \n" + 
					 depth5 + "var unparsedJSON = xmlHttp.responseText; \n" +
					 depth5 + "var firstIndex = unparsedJSON.indexOf('{'); \n" +
					 depth5 + "var lastIndex = unparsedJSON.lastIndexOf('}'); \n" +
					 depth5 + "if(firstIndex >= 0 && lastIndex >= 0) \n" +
					 depth5 + "{ \n" +
					 depth5 + "		unparsedJSON = unparsedJSON.substring(firstIndex, lastIndex + 1); //CHEAT??\n" +
					 depth5 + "} \n" +
					 depth5 + "var " + value + " = JSON.parse(unparsedJSON);\n" + 
					 depth5 + "var result = '';\n" +
			         depth5 + "<<transformationCode>>\n\n" +

	   	             depth5 + "document.getElementById('show').value = '{' + result + '}'; \n" + 
			      depth4 + "} \n" + 
			   depth3 + "} \n" + 
			depth2 + "}\n\n" +
			depth2 + "xmlHttp.send(null); \n\n" + 
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
	
	
	static final String value = "json";
	@Override
	protected void transform(FASTMappingRule rule, String codeIndent)
	{
		boolean hasOpenSqareBracket = false;
		boolean hasOpenForLoop = false;
		
		
		//TODO: Something like: if(Rule = DummyRule)
		// tmpCode += codeIndent + "value = getJSONValue_byName(" + value + ", '" + from + "'); \n";
		//Should change value -> value.get(from) to jump over unnessesary lines
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
	
	/**
	 * Specific CodeGen is returned.
	 * That makes the resetTemplates method work
	 * */
	@Override
	protected CodeGenerator createEmptyGenerator()
	{
		return new CodeGenerator_reqJSON(null, null);
	}
}