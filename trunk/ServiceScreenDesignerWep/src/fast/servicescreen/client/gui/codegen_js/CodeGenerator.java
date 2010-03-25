package fast.servicescreen.client.gui.codegen_js;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import com.google.gwt.core.client.GWT;
import com.google.gwt.user.client.rpc.AsyncCallback;

import fast.common.client.BuildingBlock;
import fast.common.client.FASTMappingRule;
import fast.common.client.FactPort;
import fast.common.client.ServiceScreen;
import fast.servicescreen.client.RequestService;
import fast.servicescreen.client.RequestServiceAsync;
import fast.servicescreen.client.gui.RuleUtil;
import fast.servicescreen.client.gui.parser.Kind;
import fast.servicescreen.client.gui.parser.Operation;
import fast.servicescreen.client.gui.parser.OperationHandler;

/**
 * Use the constructor to create the first template
 * */
public class CodeGenerator
{
	BuildingBlock screen = null;
	private HashMap<String, String> table = null;
	private HashMap<String, String> bracketTable = null;
	
	private String endbrackets_forLoop = "";
//	private String endbrackets_outObject = "";
	private boolean writeFile_result = true;
	private boolean firstOperation = true;
	
	@SuppressWarnings("unused")
	private String outputPortName = "";	//use later to generate translation code
	
	//Operation names
	private String trimBoth 	= "Trim(";
	private String charsFromTo 	= "charsFromTo(";
	private String wordsFromTo 	= "wordsFromTo(";
	private String until 		= "until(";
	private String _from 		= "from(";
	
	private String depth  = "	";
	private String depth2 = "		";
	private String depth3 = "			";
	private String depth4 = "				";
	private String depth5 = "					";
	
	
	/**
	 * The constructor creates the first template
	 * */
	public CodeGenerator(BuildingBlock screen)
	{
		this.screen = screen;
	}
	
	public String resetTemplates()
	{
		//resets the templates
		CodeGenerator tmp = new CodeGenerator(null);
		rootTemplate = tmp.rootTemplate;
		sendrequest = tmp.sendrequest;
		prehtml = tmp.prehtml;
		posthtml = tmp.posthtml;
		helperMethods = tmp.helperMethods;
		
		//resets some state variables
		endbrackets_forLoop = "";
//		endbrackets_outObject = "";
		firstOperation = true;
		operationStart = true;
		
		return rootTemplate;
	}
	
	/**
	 * Code generation order
	 * */
	public String generateJS()
	{
		table = new HashMap<String, String>();	
		bracketTable = new HashMap<String, String>();	
		
		//Build the input port list
		add_InPorts_toTable();
		
		//Build the request
		add_PreRequest_toTable();
		add_PreRequestReplaces_toTable();
		
		//Build the request - code
		add_SendRequest_toTable();

		//Build the outport (setup this.outputPortName, too)
//		add_outPort_toTable();
		
		//Build the exRules - feature
		add_Translation_toTable();
		
		
//		//add the object end brakets of transformation code
//		bracketTable.put("<<endbrackets_outObject>>", endbrackets_outObject);
		
		//add the end brakets of transformation code
		bracketTable.put("<<endbrackets_forLoop>>", endbrackets_forLoop);
		
		//fill founded values into the <keywords> in rootTemplate
		rootTemplate = expandTemplateKeys(rootTemplate);

		return rootTemplate;
	}

	private void add_PreRequest_toTable()
	{	
		// lookup the gui request text field
		if (screen instanceof ServiceScreen)
		{
			String prerequestText = ((ServiceScreen)screen).getRequestTemplate();
			table.put("<<prerequest>>", prerequestText);
		}
	}
	
	@SuppressWarnings("unchecked")
	private void add_PreRequestReplaces_toTable()
	{	
		// lookup the gui input ports
		FactPort currentInpPort = null;
		String preReqRepText = "";
		
		for (Iterator<FactPort> iterator = screen.iteratorOfPreconditions(); iterator.hasNext();)
		{
			currentInpPort = iterator.next();
			
			//build prerequestreplaces
			preReqRepText += depth2 + "prerequest = prerequest.replace(/<";
			preReqRepText += currentInpPort.get("name");
			preReqRepText += ">/g,"; 
			preReqRepText += currentInpPort.get("name");
			preReqRepText += "); \n ";
		}
		
		//add result lines in the table
		table.put("<<prerequestreplaces>>", preReqRepText);
	}
	
	@SuppressWarnings("unchecked")
	private void add_InPorts_toTable()
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
	
	@SuppressWarnings({ "unchecked", "unused" })
	private void add_outPort_toTable()
	{
		String outputPortVar = "";
		String outPutVarType = "";
		
		//search outPortName
		Iterator<FactPort> iterator = screen.iteratorOfPostconditions();
		FactPort currentOutPort = iterator.next();
		
		if(currentOutPort != null && ! iterator.hasNext()/*only one allowed*/)
		{
			outputPortVar = "" + currentOutPort.get("name");
			
			outPutVarType = (String) currentOutPort.get("factType");	//Should be the outputs type
		}

		//create code for variable initialization 
		this.outputPortName = outputPortVar;
		outputPortVar = depth2 + "var " + outputPortVar + " = new " + outPutVarType + "(); \n";
		
		table.put("<<outputport>>", outputPortVar);
	}

	private void add_SendRequest_toTable()
	{
		//add result in the table
		table.put("<<sendrequest>>", sendrequest);
	}
	
	private String transCode = "";	// should only be added ONE time
	private String currentTags = "currentTags";
	private void add_Translation_toTable()
	{
		transCode = "";
		
		//take rootRule
		FASTMappingRule rootRule = (FASTMappingRule) screen.iteratorOfMappingRules().next();
		
		//run threw all rules and append js code. Returns js code    
		transform(rootRule);
		
		table.put("<<transformationCode>>", transCode);
	}

	private boolean operationStart = true;
	private void transform(FASTMappingRule rule)
	{
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
				}

				//element count
				String lengthName =  from + "_length";
				
				//create element count variable
				tmpCode += depth4 + "var " + lengthName + " = " + curTag + ".getElementsByTagName('" + from + "').length; \n";
				
				//increment var for loop
				String countVar = from + "_Count";
				
				//créate loop - code				
				tmpCode += 
							//get searched elementsList out of xmlResponse 
					depth4 + "var " + from + " = " + curTag + ".getElementsByTagName('" + from + "'); \n\n" +
							
							//declare loop rump
					depth4 + "for(var " + countVar + " = 0; " + countVar + " < " + lengthName + "; ++" + countVar + ")\n" +
					depth4 + "{\n" +
							
							//declare loop body
					depth4 + currentTags + " = " + from + ".item(" + countVar + ");\n\n" +
							
					depth4 + "currentCount = " + countVar + ";\n" + 			//adds a current index variable 
					
					depth4 + "result += '\"" + target + "Object\" : [{ '; \n" +	//adds a 'new object' in the result
							
					depth4 + "\n\n";
							
				
				//overtake loop in real transcode
				transCode += tmpCode;
				
				
				//add for loop end bracket
				endbrackets_forLoop += depth4 + "} \n";	
				
				//adds the endbraket for the objects (would be added later)
//				endbrackets_outObject += depth4 + "result += '}'; \n";
			}
			else if ("fillAttributes".equals(kind))
			{
				String tmpCode;
				
				//Iterate over any opList entry
				while(opList_iter.hasNext())
				{
					tmpCode = "";
					String lastSourceTagname = "";
					
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
						tmpCode += trimBoth +  currentTags + ".getElementsByTagName('"
								+ lastSourceTagname + "').item(0).textContent)";
						
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
						transCode += depth4 + "result += '\"" + lastSourceTagname + "Attribute\" : \"' + " + tmpCode ;
						
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
							transCode += " + '\"}], '; \n";
						}
						else
						{
							transCode += " + '\", '; \n";
						}
						
						operationStart = true;
					}
				}
			}
			
			callTransformForKids(rule);
		}
	}
	
	/**
	 * append code for given operation into tmpCode and return that
	 * */
	private String createOperationCode(String tmpCode, Operation op)
	{
		Kind kind = op.kind;
		
		switch(kind)
		{
			case chars: 	tmpCode =  charsFromTo + tmpCode + ", ";
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
	private void callTransformForKids(FASTMappingRule rule)
	{
		for (Iterator<FASTMappingRule> kidIter = rule.iteratorOfKids(); kidIter.hasNext();)
		{
			FASTMappingRule kid = (FASTMappingRule) kidIter.next();
			transform(kid);
		}
	}

	/**
	 * Replace any <key> with a value, if the table contains it.
	 * 
	 * Returns the filled template.
	 * */
	private String expandTemplateKeys(String template)
	{
		//code
		for (String key : table.keySet()) 
		{
			String value = table.get(key);
			template = template.replaceAll(key, value);
		}
		
		//endBrakets for forLoops and outObjects
		for (String key : bracketTable.keySet()) 
		{
			String value = bracketTable.get(key);
			template = template.replaceAll(key, value);
		}
		
		return template;
	}
	
	/**
	 * This method send the current template to
	 * an service which writes a js and a html file with it as content. 
	 * */
	public boolean write_JS_File()
	{
		// Instantiate service and set up its target url
		RequestServiceAsync service = GWT.create(RequestService.class);

		//send pre - trans - post code to server
		service.saveJsFileOnServer(prehtml, helperMethods + rootTemplate, posthtml, new AsyncCallback<String>()
				{
					@Override
					public void onSuccess(String result)
					{
						if(RuleUtil.getBool(result))
						{
							//If onSucces, and result = "true", return true
							writeFile_result = true;
						}
						else
						{
							writeFile_result = false;
						}
					}

					@Override
					public void onFailure(Throwable caught)
					{
						writeFile_result = false;
					}
				});

		return writeFile_result;
	}
	
	
	
	// -------------- the templte strings -------------- //
	
	public String sendrequest =
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
		depth3 + "xmlHttp.open('GET', '" + "http://127.0.0.1:8888/servicescreendesignerwep/requestServlet?url=" + "' + replaceEscapeCharacter(request), true); \n" + 
		depth3 + "xmlHttp.onreadystatechange = function () { \n" + 
		depth3 + "if (xmlHttp.readyState == 4) \n" +
		depth3 + "{ \n" + 
		depth4 + "xmlResponse = xmlHttp.responseXML; \n\n" + 
		depth4 + "var currentTags = null; \n\n" +
		depth4 + "var currentCount = null; \n\n" +
		depth4 + "var result = new String(''); \n\n" +

		"<<transformationCode>>\n" +

//		"<<endbrackets_outObject>>\n" +
		"<<endbrackets_forLoop>>\n" +
		
		depth3 + "document.getElementById('show').value = '{' + result + '}'; \n" + 
		depth3 + "} \n" + 
		depth2 + "} \n" + 
		depth2 + "}\n\n" +
		depth2 + "xmlHttp.send(null); \n\n" + 
		depth2 + "return 'waiting for response...'; \n" + 
		depth + "} \n";
	
	
	//fill the rootTemplate
	public String rootTemplate = 
		//declare method rump 
		depth + "function transform(<<inputportlist>>) \n" +
		depth + "{\n" +
		
		//fill request url
		depth2 + "var prerequest = '<<prerequest>>'; \n\n" +
		
		//should replace inports to real values in runtime!
		depth2 + "<<prerequestreplaces>> \n\n" +
		
		//save the complete url with an xmlHttp request (made for Ajax access to SameDomain Resources)
		depth2 + "var request = prerequest; \n" +
		"\n" +
		
		//sending/recieving the request
		depth2 + "<<sendrequest>> \n";
		
		//the outputPort variable
//		"<<outputport>> \n" +
//		"\n" +
	
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
		
		depth2 + "function replaceEscapeCharacter(url)\n" +
		depth2 + "{\n" +
		depth3 + "url = url.replace(/\\//g, '%2F'); \n" +
		depth3 + "url = url.replace(/=/g, '%3D'); \n" +
		depth3 + "url = url.replace(/\\?/g, '%3F'); \n" +
		depth3 + "url = url.replace(/&/g, '%26'); \n" +
		depth3 + "url = url.replace(/:/g, '%3A'); \n" +
		depth3 + "return url; \n" +
	    depth2 + "} \n\n";
}

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