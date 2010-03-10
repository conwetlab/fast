package fast.servicescreen.client.gui;

import java.util.Iterator;

import com.google.gwt.json.client.JSONArray;
import com.google.gwt.json.client.JSONObject;
import com.google.gwt.json.client.JSONString;
import com.google.gwt.json.client.JSONValue;
import com.google.gwt.user.client.ui.RootPanel;

import fast.common.client.FASTMappingRule;
import fast.common.client.FactPort;
import fast.common.client.ServiceScreen;
import fast.servicescreen.client.ServiceScreenDesignerWep;

public class SaveLoadJsonHandler {

	private ServiceScreenDesignerWep designer;
	private ServiceScreen screen;

	public SaveLoadJsonHandler(ServiceScreenDesignerWep serviceScreenDesigner)
	{
		designer = serviceScreenDesigner;
		screen = designer.serviceScreen;
	}

	@SuppressWarnings("unchecked")
	public JSONValue saveJson(){
		JSONObject operator = new JSONObject();

		// name
		String name = (String)screen.get("name");
		if( name == null )
		{
			name = "";
		}
		JSONString opName = new JSONString(name);
		operator.put("name", opName);

		// preconditions
		JSONArray preConds = new JSONArray();
		int index = 0;
		for (Iterator<FactPort> iterator = screen.iteratorOfPreconditions(); iterator.hasNext();) {
			FactPort preCond = (FactPort) iterator.next();
			//name
			String preCondStringName = preCond.getName();
			if( preCondStringName == null )
			{
				preCondStringName = "";
			}
			JSONString preCondName = new JSONString(preCondStringName);
			//factType
			String preCondStringFactType = preCond.getFactType();
			if( preCondStringFactType == null )
			{
				preCondStringFactType = "";
			}
			JSONString preCondFactType = new JSONString(preCondStringFactType);
			//exampleValue
			String preCondStringExampleValue = preCond.getExampleValue();
			if( preCondStringExampleValue == null )
			{
				preCondStringExampleValue = "";
			}
			JSONString preCondExampleValue = new JSONString(preCondStringExampleValue);

			JSONObject inPort = new JSONObject();
			inPort.put("name", preCondName);
			inPort.put("factType", preCondFactType);
			inPort.put("exampleValue", preCondExampleValue);
			
			preConds.set(index, inPort);
			index++;
		}
		operator.put("preconditions", preConds);

		//postconditions
		JSONArray postConds = new JSONArray();
		index = 0;
		for (Iterator<FactPort> iterator = screen.iteratorOfPostconditions(); iterator.hasNext();) {
			FactPort postCond = (FactPort) iterator.next();
			//name
			String postCondStringName = postCond.getName();
			if( postCondStringName == null )
			{
				postCondStringName = "";
			}
			JSONString postCondName = new JSONString(postCondStringName);
			//factType
			String postCondStringFactType = postCond.getFactType();
			if( postCondStringFactType == null )
			{
				postCondStringFactType = "";
			}
			JSONString postCondFactType = new JSONString(postCondStringFactType);
			//exampleValue
			String postCondStringExampleValue = postCond.getExampleValue();
			if( postCondStringExampleValue == null )
			{
				postCondStringExampleValue = "";
			}
			JSONString postCondExampleValue = new JSONString(postCondStringExampleValue);

			JSONObject outPort = new JSONObject();
			outPort.put("name", postCondName);
			outPort.put("factType", postCondFactType);
			outPort.put("exampleValue", postCondExampleValue);

			postConds.set(index, outPort);
			index++;
		}
		operator.put("postconditions", postConds);

		// request template
		String requestTemplate = (String)screen.get("requestTemplate");
		if( requestTemplate == null )
		{
			requestTemplate = "";
		}
		JSONString requestTemplateJson = new JSONString(requestTemplate); 
		operator.put("requestTemplate", requestTemplateJson);

		// rules (TODO screen only needs a rootRule??)
		JSONObject rules = new JSONObject();
		for (Iterator<FASTMappingRule> iterator = screen.iteratorOfMappingRules(); iterator.hasNext();) {
			FASTMappingRule rule = (FASTMappingRule) iterator.next();

			JSONValue mappingRule= rulesToJsonValue(rule);

			rules.put("rootRule", mappingRule);
		}
		operator.put("rules", rules);

		// extended rules TODO
//		FASTMappingRule extendedRoot = designer.extendedRuleGUI.getRootRule();
//		JSONValue extendedRules = rulesToJsonValue(extendedRoot);
//		operator.put("extendedRules", extendedRules);

		return operator;
	}
	
	public void loadJson(JSONValue savedJson)
	{
		JSONObject operator = savedJson.isObject();
		if( operator == null )
		{
			return;
		}
		
		// name
		JSONString name = operator.get("name").isString();
		if( name != null )
		{
			screen.set("name", name.stringValue());
		}
		
		//preconditions
		JSONArray preconditions = operator.get("preconditions").isArray();
		if( preconditions != null )
		{
			screen.removeAllFromPreconditions();
			for (int i = 0; i < preconditions.size(); i++) {
				JSONObject preCondJson = preconditions.get(i).isObject();
				if( preCondJson == null )
				{
					return;
				}
				
				FactPort preCond = new FactPort();
				String preCondName = preCondJson.get("name").isString().stringValue();
				preCond.set("name", preCondName);
				String preCondFactType = preCondJson.get("factType").isString().stringValue();
				preCond.set("factType", preCondFactType);
				String preCondExampleValue = preCondJson.get("exampleValue").isString().stringValue();
				preCond.set("exampleValue", preCondExampleValue);
				
				screen.addToPreconditions(preCond);
			}
		}
		
		//postconditions
		JSONArray postconditions = operator.get("postconditions").isArray();
		if( postconditions != null )
		{
			screen.removeAllFromPostconditions();
			for (int i = 0; i < postconditions.size(); i++) {
				JSONObject postCondJson = postconditions.get(i).isObject();
				if( postCondJson == null )
				{
					return;
				}
				
				FactPort postCond = new FactPort();
				String postCondName = postCondJson.get("name").isString().stringValue();
				postCond.set("name", postCondName);
				String postCondFactType = postCondJson.get("factType").isString().stringValue();
				postCond.set("factType", postCondFactType);
				String postCondExampleValue = postCondJson.get("exampleValue").isString().stringValue();
				postCond.set("exampleValue", postCondExampleValue);
				
				screen.addToPostconditions(postCond);
			}
		}
		
		// requestTemplate
		JSONString requestTemplate = operator.get("requestTemplate").isString();
		if( requestTemplate != null )
		{
			screen.set("requestTemplate", requestTemplate.stringValue());
		}
		
		JSONObject rules = operator.get("rules").isObject();
		JSONObject jsonRoot = rules.get("rootRule").isObject();
		if( jsonRoot != null )
		{
			FASTMappingRule rootRule = jsonRulesToFASTRules(jsonRoot);
			screen.removeAllFromMappingRules();
			screen.addToMappingRules(rootRule);
		}
		
		//TODO looks quite nice at the moment
		RootPanel.get().clear();
		designer.buildGUI();
	}

	/**
	 * recursively parses rule structure into a JSONValue
	 * */
	@SuppressWarnings("unchecked")
	public static JSONValue rulesToJsonValue(FASTMappingRule parentRule)
	{

		JSONObject resultValue = new JSONObject();

		if( parentRule == null )
		{
			return resultValue;
		}

		//rule itself
		//sourceTagname
		String sourceTagnameString = parentRule.getSourceTagname();
		if( sourceTagnameString == null )
		{
			sourceTagnameString = "";
		}
		JSONString sourceTagname = new JSONString(sourceTagnameString);
		
		//kind
		String kindString = parentRule.getKind();
		if( kindString == null )
		{
			kindString = "";
		}
		JSONString kind = new JSONString(kindString);
		
		//targetElemName
		String targetElemNameString = parentRule.getTargetElemName();
		if( targetElemNameString == null )
		{
			targetElemNameString = "";
		}
		JSONString targetElemName = new JSONString(targetElemNameString);

		resultValue.put("sourceTagname", sourceTagname);
		resultValue.put("kind", kind);
		resultValue.put("targetElemName", targetElemName);

		//kids
		JSONArray childrenArray = new JSONArray();
		for (Iterator<FASTMappingRule> childRuleIterator = parentRule.iteratorOfKids(); childRuleIterator.hasNext();)
		{
			FASTMappingRule childRule = (FASTMappingRule) childRuleIterator.next();

			childrenArray.set(childrenArray.size(), rulesToJsonValue(childRule));
		}

		resultValue.put("kids", childrenArray);

		return resultValue;
	}
	
	/**
	 * recursively parses json rule structure into a mapping rule tree
	 * */
	public static FASTMappingRule jsonRulesToFASTRules(JSONObject rootRule)
	{
		
		FASTMappingRule resultRule = new FASTMappingRule();

		if(rootRule == null)
		{
			return resultRule;
		}
		
		//rule itself
		JSONString sourceTagname = rootRule.get("sourceTagname").isString();
		JSONString kind = rootRule.get("kind").isString();
		JSONString targetElemName = rootRule.get("targetElemName").isString();
		
		resultRule.set("sourceTagname", sourceTagname.stringValue());
		resultRule.set("kind", kind.stringValue());
		resultRule.set("targetElemName", targetElemName.stringValue());
		
		//kids
		JSONArray childrenArray = rootRule.get("kids").isArray();

		if(childrenArray != null)
		{
			for (int i = 0; i < childrenArray.size(); i++) {
				JSONObject kidJson = childrenArray.get(i).isObject();
				if (kidJson == null)
				{
					continue;
				}
				FASTMappingRule kidMappingRule = jsonRulesToFASTRules(kidJson);
				resultRule.addToKids(i, kidMappingRule);
			}
		}
		
		return resultRule;
	}
}
