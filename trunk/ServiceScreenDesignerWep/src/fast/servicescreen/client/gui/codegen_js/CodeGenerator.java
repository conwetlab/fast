package fast.servicescreen.client.gui.codegen_js;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import com.google.gwt.core.client.GWT;
import com.google.gwt.user.client.rpc.AsyncCallback;

import fast.FASTMappingRule;
import fast.FactPort;
import fast.servicescreen.client.RequestService;
import fast.servicescreen.client.RequestServiceAsync;
import fast.servicescreen.client.ServiceScreenDesignerWep;
import fast.servicescreen.client.gui.RuleUtil;
import fast.servicescreen.client.gui.ExtendedRuleParser.Kind;
import fast.servicescreen.client.gui.ExtendedRuleParser.Operation;
import fast.servicescreen.client.gui.ExtendedRuleParser.OperationHandler;

/**
 * Use the constructor to create the first template
 * */
public class CodeGenerator
{
	private ServiceScreenDesignerWep designer = null;
	private HashMap<String, String> table = null;
	private String rootTemplate = "";
	private boolean writeFile_result = true;
	
	@SuppressWarnings("unused")
	private String outputPortName = "";	//use later to generate translation code
	
	/**
	 * The constructor creates the first template
	 * */
	public CodeGenerator(ServiceScreenDesignerWep designer)
	{
		this.designer = designer;
		
		setStartingRootTemplate();
	}
	
	public String setStartingRootTemplate()
	{
		//fill the rootTemplate
		rootTemplate =
			
			//declare method rump 
			"run: function (<<inputportlist>>) \n" +
			"{\n" +
			
			//fill request url
			"   //fill imput data into request template \n" + 
			"   var prerequest = '<<prerequest>>'; \n" +
			"\n" +
			
			//should replace inports to real values in runtime!
			"  //search and replace (Operator - Time replacement) \n" +
			"  <<prerequestreplaces>>" +
			"\n" +
			
			//save the complete url with an xmlHttp request (made for Ajax access to SameDomain Resources)
			"  var request = prerequest; \n" +
			"\n" +
			
			//sending/recieving the request
			"  //the code for sending a request to same domain resource \n"+
			"  <<sendrequest>> \n" +
			"  var xmlResponse =  response; \n" + 
			"\n" +
			
			//the outputPort variable
			"  //the outputPort variable \n"+
			"  <<outputport>> \n" +
			"\n" +
			
			"  //the transformation code \n"+
			"  <<transformation>> \n" +
			"\n" +
			
			
			//declare method end
			"}\n";
		
		return rootTemplate;
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

		//Build the outport (setup this.outputPortName, too)
		add_outPort_toTable();
		
		//Build the exRules - feature
		add_Translation_toTable();
		
		
		//load the current template text into root template (for user changes, delete it later)
		rootTemplate = designer.codeGenViewer.get_templateShow_Text();
		
		//fill founded values into the <keywords> in rootTemplate
		rootTemplate = expandTemplateKeys(rootTemplate);

		return rootTemplate;
	}
	

	private void add_PreRequest_toTable()
	{	
		// lookup the gui request text field
		String prerequestText = designer.templateBox.getText();
		table.put("<<prerequest>>", prerequestText);
	}
	
	@SuppressWarnings("unchecked")
	private void add_InPorts_toTable()
	{	
		// lookup the gui input ports
		String inputPortText = "";
		FactPort currentInPort = null;
		
		for (Iterator<FactPort> iterator = designer.serviceScreen.iteratorOfPreconditions(); iterator.hasNext();)
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
	
	//TODO, this should be more then one type. Send Xml as output?? ONE outpp ok?
	@SuppressWarnings("unchecked")
	private void add_outPort_toTable()
	{
		String outputPortVar = "";
		
		//search outPortName
		Iterator<FactPort> iterator = designer.serviceScreen.iteratorOfPostconditions();
		FactPort currentOutPort = iterator.next();
		
		if(currentOutPort != null && ! iterator.hasNext()/*only one allowed*/)
		{
			outputPortVar = "" + currentOutPort.get("name");
		}

		//create code for variable initialization 
		this.outputPortName = outputPortVar;		//save name
		outputPortVar = "var " + outputPortVar + " = ''; \n";
		
		table.put("<<outputport>>", outputPortVar);
	}
	
	@SuppressWarnings("unchecked")
	private void add_PreRequestReplaces_toTable()
	{	
		// lookup the gui input ports
		FactPort currentInpPort = null;
		String preReqRepText = "";
		
		for (Iterator<FactPort> iterator = designer.serviceScreen.iteratorOfPreconditions(); iterator.hasNext();)
		{
			currentInpPort = iterator.next();
			
			//build prerequestreplaces
			preReqRepText += "prerequest = prerequest.replace(/<";
			preReqRepText += currentInpPort.get("name");
			preReqRepText += ">/g,"; 
			preReqRepText += currentInpPort.get("name");
			preReqRepText += ".data.keyword); \n ";
		}
		
		//add result lines in the table
		table.put("<<prerequestreplaces>>", preReqRepText);
	}
	
	private void add_SendRequest_toTable()
	{
		String sendRequest =
		
			"var xmlHttp = null; \n" + 
			"  var respone = null; \n" + 
			"  try \n" +
			"  { \n" + 
			"     // Mozilla, Opera, Safari sowie Internet Explorer (ab v7) \n" + 
			"     xmlHttp = new XMLHttpRequest(); \n" + 
			"  } \n" +
			"  catch(e) \n" +
			"  { \n" + 
			"      try \n" +
			"      { \n" + 
			"          // MS Internet Explorer (ab v6) \n" + 
			"          xmlHttp  = new ActiveXObject('Microsoft.XMLHTTP'); \n" + 
			"      } \n" +
			"      catch(e) \n" +
			"      { \n" + 
			"            try \n" +
			"            { \n" + 
			"                  // MS Internet Explorer (ab v5) \n" + 
			"                  xmlHttp  = new ActiveXObject('Msxml2.XMLHTTP'); \n" + 
			"            } \n" +
			"            catch(e) \n" +
			"            { \n" + 
			"                  xmlHttp  = null; \n" + 
			"            } \n" + 
			"      } \n" + 
			"  } \n" + 
			"\n" + 
			"  if (xmlHttp) \n" +
			"  { \n" + 
			"      //the <resource> tag should contain the requested information \n" +
			"      xmlHttp.open('GET', '<resource>', true); \n" + 
			"      xmlHttp.onreadystatechange = function () { \n" + 
			"            if (xmlHttp.readyState == 4) \n" +
			"            { \n" + 
			"                  //the response should save requested information \n" +
			"                  respone = xmlHttp.responseText; \n" + 
			"            } \n" + 
			"      }; \n" + 
			"\n" +
			"      xmlHttp.send(null); \n" + 
			"  } \n";

		//add result in the table
		table.put("<<sendrequest>>", sendRequest);
	}
	
	private String transCode = "";
	private void add_Translation_toTable()
	{
		transCode = "";
		
		//take rootRule
		FASTMappingRule rootRule = (FASTMappingRule) designer.serviceScreen.iteratorOfMappingRules().next();
		
		//run threw all rules and append js code. Returns js cdoe    
		transform(rootRule);
		
		table.put("<<transformation>>", transCode);
	}

	private void transform(FASTMappingRule rule)
	{
		if(RuleUtil.isCompleteRule(rule))
		{
			//gets the current operationList 
			OperationHandler opHandler = rule.getOperationHandler();
			Iterator<ArrayList<Operation>> opList_iter = opHandler.getOperationlistIterator();
			ArrayList<Operation> current_opList = null;
			
			String kind = rule.getKind();
			
			if ("createObject".equals(kind))
			{
				//create a Attr. in the object, how?!
			}
			else if ("fillAttributes".equals(kind))
			{
				//HOW TO iterate over elements.items(0 - x), and execute following code for every item ??
				//aint got no xmlRequest here..
				
				while(opList_iter.hasNext())
				{
					current_opList = opList_iter.next();
					
					if(current_opList.get(0).kind == Kind.constant)
					{
						//es gilt eine Konstante zu adden, how?!
						
						transCode += current_opList.get(0).value + " ";
					}
					else
					{
						//hier muss man eine um lastSourceTagname und elementsItemID eingeschränkte Nodelist beschaffen
						//TODO bleibt immer title?! Also nur einmaliger TagName pro opList(part)
						
						String lastSourceTagname = opHandler.getLastSourceTagname();
						
						transCode += "xmlResponse.getElementsByTagName(" + lastSourceTagname
						          +  ").getItem(" + "..elemItemID, aus opHandler?.." + "); \n";	//oder so..
						
						//TODO code that executes "currentOpList" with "nodeValue"..
					}
				}
			}
			else if("dummy".equals(kind))
			{
				//simply no handling?
			}
			
			callTransformForKids(rule);
		}
	}
	
	/**
	 * Should call tranformation method for any child of given rule
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
		for (String key : table.keySet()) 
		{
			String value = table.get(key);
			template = template.replaceAll(key, value);
		}
		
		return template;
	}
	
	/**
	 * This method send the current template to
	 * an service which writes a js file with it as content. 
	 * */
	public boolean write_JS_File()
	{
		// Instantiate service and set up its target url
		RequestServiceAsync service = GWT.create(RequestService.class);

		service.saveJsFileOnServer(rootTemplate, new AsyncCallback<String>()
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
	
	
	
	
	//Getters, Setters, Helpers
	
	/**
	 * Returns the current template
	 * */
	public String getCurrentTemplate()
	{
		return this.rootTemplate;
	}
	
	/**
	 * Set up the current template
	 * */
	public void setCurrentTemplate(String text)
	{
		this.rootTemplate = text;
	}
}