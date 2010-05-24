package fast.servicescreen.client.gui.codegen_js;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import com.google.gwt.core.client.GWT;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.rpc.AsyncCallback;

import fast.common.client.BuildingBlock;
import fast.common.client.FASTMappingRule;
import fast.common.client.FactPort;
import fast.common.client.ServiceScreen;
import fast.servicescreen.client.RequestService;
import fast.servicescreen.client.RequestServiceAsync;
import fast.servicescreen.client.gui.RuleUtil;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer.WrappingType;
import fast.servicescreen.client.gui.parser.Kind;
import fast.servicescreen.client.gui.parser.Operation;
import fast.servicescreen.client.gui.parser.OperationHandler;

/**
 * Use the constructor to create the first template
 * 
 * TODO s: generate dynamic input ports in html /save template changes into cdr
 * */
public class CodeGenerator
{
	public BuildingBlock screen = null;
	protected HashMap<String, String> table = null;
	
	//the reqestet source type
	WrappingType reqType;
	
	protected boolean firstOperation = true;
	
	//Operation names
	protected String trimBoth 	 = "Trim(";
	protected String charsFromTo = "charsFromTo(";
	protected String wordsFromTo = "wordsFromTo(";
	protected String until 		 = "until(";
	protected String _from 		 = "from(";
	
	protected String depth  = "   ";
	protected String depth2 = "      ";
	protected String depth3 = "         ";
	protected String depth4 = "            ";
	protected String depth5 = "               ";
	
	
	public CodeGenerator(BuildingBlock screen)
	{
		this.screen = screen;
		
		//set up the templates for the specific code generator
		setTemplates();
	}
	
	public String resetTemplates()
	{
		//resets the templates
		CodeGenerator tmp = createEmptyGenerator();
		rootTemplate = tmp.rootTemplate;
		prehtml = tmp.prehtml;
		posthtml = tmp.posthtml;
		helperMethods = tmp.helperMethods;
		
		//resets some state variables
		firstOperation = true;
		operationStart = true;
		
		return rootTemplate;
	}
	
	/**
	 * This method returns an empty CodeGenerator.
	 * 
	 * Overwrite this method to create a spezific CodeGenerator, 
	 * it will be used to reset the Generator and make the resetTemplates()
	 * method work!
	 * */
	protected CodeGenerator createEmptyGenerator()
	{
		return new CodeGenerator(null);
	}
	
	/**
	 * Code generation order
	 * */
	public String generateJS()
	{
		table = new HashMap<String, String>();		
		
		//Build the input port list
		add_InPorts_toTable();
		
		//Build the request
		add_PreRequest_toTable();
		add_PreRequestReplaces_toTable();
		
		//Build the request - code
		add_SendRequest_toTable();
		
		//Build the exRules - feature
		add_Translation_toTable();
		
		//fill founded values into the <keywords> in rootTemplate
		rootTemplate = expandTemplateKeys(rootTemplate);

		return rootTemplate;
	}

	protected void add_PreRequest_toTable()
	{	
		// lookup the gui request text field
		if (screen instanceof ServiceScreen)
		{
			String prerequestText = ((ServiceScreen)screen).getRequestTemplate();
			table.put("<<prerequest>>", prerequestText);
		}
	}
	
	@SuppressWarnings("unchecked")
	protected void add_PreRequestReplaces_toTable()
	{	
		// lookup the gui input ports
		FactPort currentInpPort = null;
		String preReqRepText = "";
		String indent = "";
		
		for (Iterator<FactPort> iterator = screen.iteratorOfPreconditions(); iterator.hasNext();)
		{
			currentInpPort = iterator.next();
			
			//build prerequestreplaces
			preReqRepText += indent + "prerequest = prerequest.replace(/<";
			preReqRepText += currentInpPort.get("name");
			preReqRepText += ">/g,encodeURIComponent("; 
			preReqRepText += currentInpPort.get("name");
			preReqRepText += ")); \n ";
			indent = depth2;
		}
		
		//add result lines in the table
		table.put("<<prerequestreplaces>>", preReqRepText);
	}
	
	@SuppressWarnings("unchecked")
	protected void add_InPorts_toTable()
	{	
		// lookup the gui input ports
		String inputPortText = "";
		FactPort currentInPort = null;
		
		for (Iterator<FactPort> iterator = screen.iteratorOfPreconditions(); iterator.hasNext();)
		{
			currentInPort = iterator.next();
			
			inputPortText += currentInPort.get("name") + ",";
		}
		
		//if we add one "," to much, cut it here
		if(inputPortText.lastIndexOf(",") == inputPortText.length()-1)
		{
			inputPortText = inputPortText.substring(0, inputPortText.length()-1);
		}

		table.put("<<inputportlist>>", inputPortText);
	}

	protected void add_SendRequest_toTable()
	{
		//add result in the table
		table.put("<<sendrequest>>", sendrequest);
	}
	
	protected String transCode = "";
	protected String currentTags = "currentTags";
	protected void add_Translation_toTable()
	{
		transCode = "";
		
		//take rootRule
		FASTMappingRule rootRule = (FASTMappingRule) screen.iteratorOfMappingRules().next();
		
		//run threw all rules and append js code. Returns js code    
		transform(rootRule, depth5);
		
		table.put("<<transformationCode>>", transCode);
	}
	
	protected boolean operationStart = true;
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
				
				//In first case we have to access from the root Tag
				String curTag = currentTags;
				if(firstOperation)
				{
					firstOperation = false;
					
					curTag = "xmlResponse";
					
					tmpCode += "var indent = ''; \n";
				}
				else
				{
					tmpCode += codeIndent + "indent = indent + '   '; \n";
				}

				//element count
				String lengthName =  from + "_length";
				
				//create element count variable
				tmpCode += codeIndent + "var " + lengthName + " = " + curTag + ".getElementsByTagName('" + from + "').length; \n";
				
				//increment var for loop
				String countVar = from + "_Count";
				
				//créate loop - code				
				tmpCode += 
					//get searched elementsList out of xmlResponse 
					codeIndent + "var " + from + " = " + curTag + ".getElementsByTagName('" + from + "'); \n\n" +
							
					//declare loop rump
					codeIndent + "for(var " + countVar + " = 0; " + countVar + " < " + lengthName + "; ++" + countVar + ")\n" +
					codeIndent + "{\n" +
							
					//declare loop body
					codeIndent + depth + currentTags + " = " + from + ".item(" + countVar + ");\n\n" +
							
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
						tmpCode += trimBoth +  " getValue(currentTags, '" + lastSourceTagname + "') )";
						
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
	 * append code for given operation into tmpCode and return that
	 * */
	protected String createOperationCode(String tmpCode, Operation op)
	{
		switch(op.kind)
		{
			case chars: 	tmpCode = charsFromTo + tmpCode + ", ";
							break;
				
			case words:     tmpCode = wordsFromTo + tmpCode + ", ";
							break;
				
			case Param: 	String signs = op.signs;
							if(signs != null && ! "".equals(signs))
							{
								tmpCode += "'" + signs + "', ";
							}
							
							tmpCode += op.value.replace("-", ", ") + ")";
							break;
				
			case from: 		tmpCode = _from + tmpCode + ", ";
							break;

				
			case until: 	tmpCode = until + tmpCode + ", ";
							break;
		}
		
		return tmpCode;
	}
	
	/**
	 * Should call transformation method for any child of given rule
	 * to add code into transCode
	 * */
	@SuppressWarnings("unchecked")
	protected void callTransformForKids(FASTMappingRule rule, String codeIndent)
	{
		for (Iterator<FASTMappingRule> kidIter = rule.iteratorOfKids(); kidIter.hasNext();)
		{
			FASTMappingRule kid = (FASTMappingRule) kidIter.next();
			transform(kid, codeIndent);
		}
	}

	/**
	 * Replace any <key> with a value, if the table contains it.
	 * 
	 * Returns the filled template.
	 * */
	protected String expandTemplateKeys(String template)
	{
		for (String key : table.keySet()) 
		{
			String value = table.get(key);
			// template = template.replaceAll(key, value);
			template = replaceKey(template, key, value);
		}
		
		return template;
	}
	
	
	protected String replaceKey(String text, String key, String value) 
	{
		// find key and replace by value
		String result = text;
		int pos = text.indexOf(key);
		if (pos >= 0)
		{
			result = text.substring(0, pos) + value + text.substring(pos + key.length());
		}
		return result;
	}

	protected static RequestServiceAsync service;
	/**
	 * This method send the current template to
	 * an service which writes a js and a html file with it as content. 
	 * */
	public void write_JS_File()
	{
		if (service == null)
		{ 
			service = GWT.create(RequestService.class);
		}

		//send pre - trans - post code to server
		service.saveJsFileOnServer(screen.getName(), prehtml, helperMethods + rootTemplate, posthtml, new AsyncCallback<String>()
				{
					@Override
					public void onSuccess(String result)
					{
						GWT.log("Writing .js file to RequestService succed..", null);
						
						Window.alert(result);
					}

					@Override
					public void onFailure(Throwable caught)
					{
						GWT.log("ERROR while writing .js file to RequestService..", null);
						
						Window.alert(caught.getLocalizedMessage());
					}
				});
	}
	
	
	
	// -------------- the template strings -------------- //
	
	
	/** 
	 * This string contains template code for JSON or XML
	 * requests, decided by the CodeGenerators constructor given RequestType.
	 * 
	 * Is setted up in method setTemplates
	 * */
	String sendrequest = "";
	
	/**
	 * Contains root template and is setted up in
	 * setTemplates method
	 * */
	String rootTemplate = 
		//declare method rump 
		depth + "function transform(<<inputportlist>>)\n" +
		depth + "{\n" +
			//fill request url
			depth2 + "var prerequest = '<<prerequest>>';\n" +
			
			//should replace inports to real values in runtime!
			depth2 + "<<prerequestreplaces>>\n\n" +
			
			//save the complete url with an xmlHttp request (made for Ajax access to SameDomain Resources)
			depth2 + "var request = prerequest;\n" +
			
			//sending/recieving the request
			depth2 + "<<sendrequest>>\n";
	
	/**
	 * This method is used to overwrite and set up
	 * templates this way
	 * */
	protected void setTemplates()
	{
		//set up sendRequest for wrapping requested XML
		sendrequest = 
			depth2 + "var xmlHttp = null; \n" + 
			depth2 + "var xmlResponse = null; \n" + 
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
			         depth5 + "xmlResponse = xmlHttp.responseXML; \n\n" + 
			         depth5 + "var currentTags = null; \n\n" +
			         depth5 + "var currentCount = null; \n\n" +
			         depth5 + "var result = new String(''); \n\n" +

			         depth5 + "<<transformationCode>>\n\n" +

	   	             depth5 + "document.getElementById('show').value = '{' + result + '}'; \n" + 
			      depth4 + "} \n" + 
			   depth3 + "} \n" + 
			depth2 + "}\n\n" +
			depth2 + "xmlHttp.send(null); \n\n" + 
			depth2 + "return 'waiting for response...'; \n" + 
			depth + "} \n";
	}
	
	/**
	 * contains html end
	 * */
	public String posthtml =
		"</script>\n" +
		"</head>\n" +
		"<body>\n" +
		"<form name=f1>\n" +
		"<input type='text' name=t2 value='x' size='50'> \n" +
		"//<input type='text' name=t3 value='y' size='50'> \n" +
		"//<input type='text' name=t4 value='z' size='50'> \n" +
		"<input type=button value='request and transform' \n" +
		"onclick='this.form.t1.value=transform(this.form.t2.value /*, this.form.t3.value, this.form.t4.value*/)'>	\n" +
		"<br><br><br><br> \n" +
		"<textarea name=t1 id='show' cols=70 rows=20> To see the results, press the button above.. </textarea>" +
		"</form>\n" +
		"</body>\n" +
		"</html>\n";
	
	/**
	 *  Contains the html header and all javascript util functions
	 * */
	public String prehtml =
		"<html> \n" +
		"<head> \n" +
		"<meta http-equiv='Content-Type' content='text/html; charset=ISO-8859-1'> \n" +
		"<title>Insert title here</title> \n" +
		"<script type='text/javascript'> \n \n";

	public String helperMethods = 
		depth2 + "function from(str, sign, sepNr) \n" +
		depth2 + "{ \n" +
		depth3 + "var tmp = new String(Trim(str)); \n" +
		depth3 + "var save = ''; \n" +

		depth3 + "if (sepNr < 1) \n" +
		depth3 + "{ \n" +
		depth3 + "sepNr = 1; \n" +
		depth3 + "} \n" +

		depth3 + "while (tmp.indexOf(sign) != -1 && sepNr > 0) \n" +
		depth3 + "{ \n" +
		depth3 + "save = tmp.substring(tmp.indexOf(sign), tmp.indexOf(sign) \n" +
		depth3 + "+ sign.length); \n" +

		depth3 + "tmp = tmp.substring(tmp.indexOf(sign) + sign.length, tmp.length); \n" +

		depth3 + "sepNr--; \n" +
		depth3 + "} \n" +

		depth3 + "tmp = save + tmp; \n" +

		depth3 + "return tmp; \n" +
		depth2 + "} \n \n" +

		depth2 + "function until(str, sign, sepNr) \n" +
		depth2 + "{ \n" +
		depth3 + "var tmp = new String(Trim(str)); \n" +
		depth3 + "var res = ''; \n" +
		depth3 + "var length = sign.length; \n" +

		depth3 + "if(sepNr < 1) \n" +
		depth3 + "{ \n" +
		depth3 + "sepNr = 1; \n" +
		depth3 + "} \n" +

		depth3 + "while(tmp.indexOf(sign) != -1 && sepNr > 0) \n" +
		depth3 + "{ \n" +
		depth3 + "res += tmp.substring(0, tmp.indexOf(sign) + length); \n" +

		depth3 + "tmp = tmp.substring(tmp.indexOf(sign) + length, tmp.length); \n" +

		depth3 + "sepNr--; \n" +
		depth3 + "} \n" +

		depth3 + "return res; \n" +
		depth2 + "} \n \n" +

		depth2 + "function charsFromTo(str, from, to) \n" +
		depth2 + "{ \n" +
		depth3 + "var tmp = new String(Trim(str)); \n" +
		depth3 + "var res = ''; \n" +
		
		depth3 + "if(from < 1) \n" +
		depth3 + "{ \n" +
		depth3 + "from = 1; \n" +
		depth3 + "} \n" +
		
		depth3 + "if(to > tmp.length) \n" +
		depth3 + "{ \n" +
		depth3 + "to = tmp.length; \n" +
		depth3 + "} \n" +
		
		depth3 + "for(from; from <= to; from++) \n" +
		depth3 + "{ \n" +
		depth3 + "res += charAt(tmp, from); \n" +
		depth3 + "} \n" +
		
		depth3 + "return res; \n" +
		depth2 + "} \n \n" +
		
		depth2 + "function charAt(str, index) \n" +
		depth2 + "{ \n" +
		depth3 + "var res = ''; \n" +
		
		depth3 + "if(index < 1) \n" +
		depth3 + "{ \n" +
		depth3 + "index = 1; \n" +
		depth3 + "} \n" +
		depth3 + "else if(index > str.length) \n" +
		depth3 + "{ \n" +
		depth3 + "index = str.length; \n" +
		depth3 + "} \n" +
		
		depth3 + "index = index - 1; \n" +
		
		depth3 + "res = str.charAt(index); \n" +
		
		depth3 + "return res; \n" +
		depth2 + "} \n \n" +
		
		depth2 + "function wordsFromTo(str, from, to) \n" +
		depth2 + "{ \n" +
		depth3 + "var tmp = new String(Trim(str)); \n" +
		depth3 + "var res = ''; \n" +
		
		depth3 + "var _split = tmp.split(' '); \n" +
		depth3 + "var length = _split.length; \n" +
		
		depth3 + "if(from < 1) \n" +
		depth3 + "{ \n" +
		depth3 + "from = 1; \n" +
		depth3 + "} \n" +
		
		depth3 + "if(to > length) \n" +
		depth3 + "{ \n" +
		depth3 + "to = length; \n" +
		depth3 + "} \n" +
		
		depth3 + "for(from; from <= to; from++) \n" +
		depth3 + "{ \n" +
		depth3 + "res =  res + wordAt(str, from) + ' '; \n" +
		depth3 + "} \n" +
		
		depth3 + "return res; \n" +
		depth2 + "} \n \n" +
		
		depth2 + "function wordAt(str, nr) \n" +
		depth2 + "{ \n" +
		depth3 + "var res = new String(Trim(str)); \n" +
		depth3 + "var _split = res.split(' '); \n" +
		depth3 + "var length = _split.length; \n" +
		
		depth3 + "nr = nr -1; \n" +
		
		depth3 + "if(nr < 0 || nr >= length) \n" +
		depth3 + "{ \n" +
		depth3 + "nr = length-1; \n" +
		depth3 + "} \n" +
		
		depth3 + "res = _split[nr]; \n" +
		
		depth3 + "return res; \n" +
		depth2 + "} \n \n" +
		
		depth2 + "function Trim(str) \n" +
		depth2 + "{ \n" +
		depth3 + "return RTrim(LTrim(str)); \n" +
		depth2 + "} \n\n" +
		
		depth2 + "function LTrim(str) \n" +
		depth2 + "{ \n" +
		depth3 + "var whitespace = new String(' '); \n" +

		depth3 + "var s = new String(str); \n" +
		depth3 + "if (whitespace.indexOf(s.charAt(0)) != -1) \n" +
		depth3 + "{ \n" +
		depth3 + "var j=0, i = s.length; \n" +

		depth3 + "while (j < i && whitespace.indexOf(s.charAt(j)) != -1) \n" +
		depth3 + "j++; \n" +

		depth3 + "s = s.substring(j, i); \n" +
		depth3 + "} \n" +
		depth3 + "return s; \n" +
		depth2 + "} \n \n" +
		
		depth2 + "function RTrim(str) \n" +
		depth2 + "{ \n" +
		depth3 + "var whitespace = new String(' '); \n" +

		depth3 + "var s = new String(str); \n" +
		depth3 + "if (whitespace.indexOf(s.charAt(s.length-1)) != -1) \n" +
		depth3 + "{ \n" +
		depth3 + "var i = s.length - 1; \n" +

		depth3 + "while (i >= 0 && whitespace.indexOf(s.charAt(i)) != -1) \n" +
		depth3 + "i--; \n" +
		depth3 + "s = s.substring(0, i+1); \n" +
		depth3 + "} \n" +
		
		depth3 + "return s; \n" +
		depth2 + "} \n\n" +
	    
		depth2 + "function getValue(currentTags, name)\n" +
		depth2 + "{\n" +
		depth3 + "	var elemValue = '';\n" +
		depth3 + "	var elemItem = currentTags.getElementsByTagName(name).item(0);\n" +
		depth3 + "	if( elemItem != null )\n" +
		depth3 + "	{ elemValue = elemItem.textContent; }\n" +
		depth3 + "	else if( currentTags.attributes.getNamedItem(name) != null )\n" +
		depth3 + "  { elemValue = currentTags.attributes.getNamedItem(name).value; }\n\n" +
		depth3 + "  return elemValue; \n" +
	    depth2 + "} \n\n";
	
}



//@SuppressWarnings({ "unchecked", "unused" })
//private void add_outPort_toTable()
//{
//	String outputPortVar = "";
//	String outPutVarType = "";
//	
//	//search outPortName
//	Iterator<FactPort> iterator = screen.iteratorOfPostconditions();
//	FactPort currentOutPort = iterator.next();
//	
//	if(currentOutPort != null && ! iterator.hasNext()/*only one allowed*/)
//	{
//		outputPortVar = "" + currentOutPort.get("name");
//		
//		outPutVarType = (String) currentOutPort.get("factType");	//Should be the outputs type
//	}
//
//	//create code for variable initialization 
//	this.outputPortName = outputPortVar;
//	outputPortVar = depth2 + "var " + outputPortVar + " = new " + outPutVarType + "(); \n";
//	
//	table.put("<<outputport>>", outputPortVar);
//}

/**
 * The path to the standalone GET Proxy Servlet
 * 
 * Add a Param before sending. Param should be the url u want to request,
 * but fill with escape code first:
 * url = http://open.api.sandbox.ebay.com/shopping?appid=KasselUn-efea-4b93-9505-5dc2ef1ceecd&version=517&callname=FindItems&ItemSort=EndTime&QueryKeywords=USB&responseencoding=XML
 * 
 * -> with URL Escape Codes: / -> %2F, = -> %3D, ? = %3F, & -> %26, : -> %3A
 * xxx = http%3A%2F%2Fopen.api.sandbox.ebay.com%2Fshopping%3Fappid%3DKasselUn-efea-4b93-9505-5dc2ef1ceecd%26version%3D517%26callname%3DFindItems%26ItemSort%3DEndTime%26QueryKeywords%3DUSB%26responseencoding%3DXML
 * 
 * to do this, there is a replaceEscapeCharacter method in this class!
 * */