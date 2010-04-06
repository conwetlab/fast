package fast.mediation.client.gui;

import java.util.Iterator;
import java.util.Set;

import com.google.gwt.event.logical.shared.SelectionEvent;
import com.google.gwt.event.logical.shared.SelectionHandler;
import com.google.gwt.json.client.JSONArray;
import com.google.gwt.json.client.JSONBoolean;
import com.google.gwt.json.client.JSONNumber;
import com.google.gwt.json.client.JSONObject;
import com.google.gwt.json.client.JSONParser;
import com.google.gwt.json.client.JSONString;
import com.google.gwt.json.client.JSONValue;
import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.ScrollPanel;
import com.google.gwt.user.client.ui.Tree;
import com.google.gwt.user.client.ui.TreeItem;
import com.google.gwt.user.client.ui.Widget;

import fast.common.client.BuildingBlock;
import fast.common.client.FASTMappingRule;
import fast.servicescreen.client.RequestServiceAsync;
import fast.servicescreen.client.gui.RuleGUI;
import fast.servicescreen.client.gui.RuleUtil;
import fast.servicescreen.client.rpc.SendRequestHandler;

/**
 * Specifies the RuleGUI working with JSON instead XML.
 * Define RessourceType first, then initial this GUI, or the common
 * RuleGUI
 * */
public class MediationRuleGUI extends RuleGUI 
{
	public MediationRuleGUI(BuildingBlock buildingBlock, SendRequestHandler rh)
	{
		super(buildingBlock, rh);
	}
	
	//The JSON resource and result - Tree
	public Tree jsonTree;
	private JSONValue jsonValue;
	
	/**
    * creates and returns a flextable containing the trees
    * for translation design
    * */
   public Widget createJsonTranslationTable()
   {
      final FlexTable translationTable = new FlexTable();
      int rowCount = translationTable.getRowCount();
      
      // headlines, labels and buttons in first row
      translationTable.setWidget(rowCount, 0, new Label("Result:"));
      translationTable.setWidget(rowCount, 1, createRulesHeadlineTable());
      translationTable.setWidget(rowCount, 2, new Label("Facts:"));
      rowCount++;
      
      // add result tree
      ScrollPanel resultScrollPanel = new ScrollPanel();
      resultScrollPanel.setAlwaysShowScrollBars(true);
      resultScrollPanel.setSize("11cm", "11cm"); 
      
      //create xmlTree and add a selection/PropertyChange - handler
      jsonTree = new Tree();
      jsonTree.addSelectionHandler(new JsonTreeHandler());
      resultScrollPanel.setWidget(jsonTree);
      translationTable.setWidget(rowCount, 0, resultScrollPanel);
       
      // add rule table
      ScrollPanel rulesScrollPanel = new ScrollPanel();
      rulesScrollPanel.setAlwaysShowScrollBars(true);
      rulesScrollPanel.setSize("11cm", "11cm");
      rulesScrollPanel.setWidget(createRulesTree());
      translationTable.setWidget(rowCount, 1, rulesScrollPanel);
         
      // add facts tree
      ScrollPanel factsScrollPanel = new ScrollPanel();
      factsScrollPanel.setAlwaysShowScrollBars(true);
      factsScrollPanel.setSize("11cm", "11cm");
      
      factsTree = new Tree();
      factsScrollPanel.setWidget(factsTree);
      translationTable.setWidget(rowCount, 2, factsScrollPanel);


      //TODO: get access to the real resource 
      getJson();	
      TreeItem rootJsonItem = jsonTree.addItem("JSONValue:");
      rootJsonItem.setState(true);
      buildJsonTree(rootJsonItem, jsonValue, "JSONValue");
      RuleUtil.expandTree(jsonTree);
      updateFactsTree();

      // return the table
      translationTable.ensureDebugId("cwFlexTable");
      return translationTable;
   }

   @Override
   public void updateFactsTree()
   {
	   //transforms the rule hierarchy to Strings in facts - tree
	   if (rootRule == null)
	   {
		   rootRule = (FASTMappingRule) buildingBlock.iteratorOfMappingRules().next();
	   }
	   
	   buildFactsTree(factsTree);
   }
   
   @Override
   public void buildFactsTree(Tree aFactsTree)
   {
	   //(re)build the facts tree 
	   aFactsTree.clear();

	   TreeItem rootItem = aFactsTree.addItem("Facts:");

	   transform(jsonValue, rootRule, rootItem);

	   RuleUtil.expandTree(aFactsTree);
   }
   
   /**
    * This method transforms the data with the rules
    * to the this.factsTree (JSON)
    * */
   public void transform(JSONValue rootJsonValue, FASTMappingRule rule, TreeItem treeItem)
   {
	   if(RuleUtil.isCompleteRule(rule))
	   {
		   String sourceTagname = rule.getSourceTagname();
		   String kind = rule.getKind();
		   String targetElemName = rule.getTargetElemName();
		   
		   JSONArray elements = new JSONArray();
		   //for normal sourceTagnames retrieve the elements recursive
		   if(! sourceTagname.endsWith("_Item"))
		   {
			   jsonValuesByTagName(elements, rootJsonValue, sourceTagname);
		   }
		   //special case: array items
		   else
		   {
			   //add children to elements directly
			   JSONArray jsonArray = rootJsonValue.isArray();
			   if(jsonArray != null)
			   {	
				   for (int i = 0; i < jsonArray.size(); i++)
				   {
					   JSONValue kid = jsonArray.get(i); 

					   int index = elements.size();
					   elements.set(index, kid);
				   }
			   }
		   }
		   
		   //"createObject" creates an object for every element in the list
		   //and starts recursive call of transform
		   if (kind.equals("createObject"))
		   {
			   for (int i = 0; i < elements.size(); i++)
			   {
				   JSONValue tmpElement = elements.get(i);
				   TreeItem kidItem = treeItem.addItem(targetElemName);
				   transformKids(tmpElement, rule, kidItem);
			   }
		   }
		   //"fillAttribute" fills attribute strings on right position
		   else if (kind.equals("fillAttributes"))
		   {
			   for (int i = 0; i < elements.size(); i++)
			   {
				   JSONValue tmpElement = elements.get(i);

				   //add content of the element which IS (JSONBoolean, JSONNumber or JSONString)
				   JSONBoolean attrBoolean = tmpElement.isBoolean();
				   if(attrBoolean != null)
				   {
					   treeItem.addItem(targetElemName + ": " + attrBoolean.booleanValue());
				   }
				   JSONNumber attrNumber = tmpElement.isNumber();
				   if(attrNumber != null)
				   {
					   treeItem.addItem(targetElemName + ": " + attrNumber.doubleValue());
				   }
				   JSONString attrString = tmpElement.isString();
				   if(attrString != null)
				   {
					   
					   String stringValue = attrString.stringValue();
					   if(stringValue != null && !"".equals(stringValue.trim()))
					   {
						   treeItem.addItem(targetElemName + ": " + stringValue);
					   }
					   //FIXME if string is null or empty ("", " ", etc.) show it to the user??
					   //TODO: Yes! A user should see empty values like any other..
					   else
					   {
						   treeItem.addItem(targetElemName + ": -");
					   }
				   }
			   }
		   }
	   }
   }
   
   /**
    * calls transform for all children of a rule
    * */
   @SuppressWarnings("unchecked")
   public void transformKids(JSONValue rootJsonValue, FASTMappingRule rule, TreeItem treeItem)
   {
	   for (Iterator<FASTMappingRule> kidIter = rule.iteratorOfKids(); kidIter.hasNext();)
	   {
		   FASTMappingRule kid = (FASTMappingRule) kidIter.next();
		   //call transform for the kid
		   transform(rootJsonValue, kid, treeItem);
	   }
   }
   
   /**
	 * recursive method for retrieving all jsonvalues for a specified tagName
	 * */
   private void jsonValuesByTagName(JSONArray elements, JSONValue root, String tagName)
   { 
	   //if object search on first layer. on failure begin depth-search
	   JSONObject object = root.isObject();
	   if( object != null )
	   {	
		   //get (first layer) keys contained in the JSONValue
		   Set<String> keys = object.keySet();

		   //seek on first layer
		   for (Iterator<String> iterator = keys.iterator(); iterator.hasNext();)
		   {
			   String key = (String) iterator.next();

			   //found - add it and stop
			   if(key.equals(tagName))
			   {
				   int index = elements.size();
				   elements.set(index, object.get(key));
				   //stop - key can occur only once on first layer
				   break;
			   }
			   //nothing found - depth-search
			   else
			   {
				   jsonValuesByTagName(elements, object.get(key), tagName);
			   }
		   }
	   }

	   //if it's an array, search among it's children by calling recursive method
	   //for every child
	   JSONArray jsonArray = root.isArray();
	   if(jsonArray != null)
	   {	
		   for (int i = 0; i < jsonArray.size(); i++)
		   {
			   jsonValuesByTagName(elements, jsonArray.get(i), tagName);
		   }
	   }

	   //if it's a matching boolean, number or string: add it
	   JSONBoolean jsonBoolean = root.isBoolean();
	   if(jsonBoolean != null && tagName.equals(jsonBoolean.booleanValue()))
	   {
		   int index = elements.size();
		   elements.set(index, jsonBoolean);
	   }
	   JSONNumber jsonNumber = root.isNumber();
	   if(jsonNumber != null && tagName.equals(jsonNumber.doubleValue()))
	   {
		   int index = elements.size();
		   elements.set(index, jsonNumber);
	   }
	   JSONString jsonString = root.isString();
	   if(jsonString != null && tagName.equals(jsonString.stringValue()))
	   {
		   int index = elements.size();
		   elements.set(index, jsonString);
	   }
   }

   /**
    * handles the json tree (Selection and PropChange)
    * */
   class JsonTreeHandler implements SelectionHandler<TreeItem>
   {
      @Override
      public void onSelection(SelectionEvent<TreeItem> event)
      {
         //print first part ("name" from "name : value") of selected element in rule area
         TreeItem selectedItem = event.getSelectedItem();
         String name = selectedItem.getText().split(":")[0].trim();
         
         if(selectedRule != null)
         {
        	 selectedRule.setSourceTagname(name);
         }
         
         //TODO finally update the facts-tree??
         updateFactsTree();
      }
   }
   
	//testing json responses
	@SuppressWarnings("unused")
	private RequestServiceAsync reqService;
	
	public void getJson()
	{
//		String alonso = "{\"MRData\":{\"xmlns\": \"http:////ergast.com//mrd//1.1\",\"series\": \"f1\",\"url\": \"\"," +
//                       "\"limit\": \"30\",\"offset\": \"0\",\"total\": \"2\",\"SeasonTable\": {\"driverId\": \"alonso\"," + 
//                       "\"driverStandings\": \"1\",\"Seasons\": [{\"season\": \"2005\", \"url\": \"http:////en.wikipedia.org//wiki//2005_Formula_One_season\"}," +
//                       "{\"season\": \"2006\", \"url\": \"http:////en.wikipedia.org//wiki//2006_Formula_One_season\"}]}}}";
		
		String drivers = "{\"MRData\": {" +
			             "\"xmlns\": \"http:////ergast.com//mrd//1.1\",\"series\": \"f1\",\"url\": \"\",\"limit\": \"30\",\"offset\": \"0\",\"total\": \"812\","+
			             "\"DriverTable\": {\"Drivers\": ["+
			             "{"+
			             "\"driverId\": \"alesi\","+
			             "\"url\": \"http:////en.wikipedia.org//wiki//Jean_Alesi\","+
			             "\"givenName\": \"Jean\","+
			             "\"familyName\": \"Alesi\","+
			             "\"dateOfBirth\": \"1964-06-11\","+
			             "\"nationality\": \"French\","+
			             "},"+
			             "{"+
			             "\"driverId\": \"alonso\","+
			             "\"url\": \"http:////en.wikipedia.org//wiki//Fernando_Alonso\","+
			             "\"givenName\": \"Fernando\","+
			             "\"familyName\": \"Alonso\","+
			             "\"dateOfBirth\": \"1981-07-29\","+
			             "\"nationality\": \"Spanish\","+
			             "},"+
			             "{"+
			             "\"driverId\": \"amati\","+
			             "\"url\": \"http:////en.wikipedia.org//wiki//Giovanna_Amati\","+
			             "\"givenName\": \"Giovanna\","+
			             "\"familyName\": \"Amati\","+
			             "\"dateOfBirth\": \"1962-07-20\","+
			             "\"nationality\": \"Italian\","+
			             "},"+
			             "{"+
			             "\"driverId\": \"arnold\","+
			             "\"url\": \"http:////en.wikipedia.org//wiki//Chuck_Arnold\","+
			             "\"givenName\": \"Chuck\","+
			             "\"familyName\": \"Arnold\","+
			             "\"dateOfBirth\": \"1926-05-30\","+
			             "\"nationality\": \"American\","+
			             "}" +
			             "]}}}";

		jsonValue = JSONParser.parse(drivers);
		
		//FIXME: Make that work at time
//		String url = "http:////ergast.com//api//f1//drivers//alonso//driverStandings//1//seasons.json";
//		RequestServlet service = new RequestServlet();
//		String response = service.sendHttpRequest_GET(url);
//		
//		jsonValue = JSONParser.parse(response);
	}


	
	/**
	 * recursive method to generate a tree that represents a json value
	 * */
	private void buildJsonTree(TreeItem parentItem, JSONValue node, String parentName)
	{	
		//if it's an object, build the tree for all children
		JSONArray jsonArray = node.isArray();
		if(jsonArray != null)
		{	
			for (int i = 0; i < jsonArray.size(); i++)
			{
				//add a section item for every child
				TreeItem treeSection = parentItem.addItem(parentName + "_Item:");
				treeSection.setState(true);
				
				buildJsonTree(treeSection, jsonArray.get(i), parentName);
			}
		}
		
		//if it's a string add the leaf (maybe for isNumber() too)
		JSONString jsonString = node.isString();
		if(jsonString != null)
		{
			String parentText = parentItem.getText();
			String attributeText = jsonString.stringValue();
			parentItem.setText(parentText + " " + attributeText);
		}
		
		//if it's an object, build the tree for all children
		JSONObject operator = node.isObject();
		if( operator != null )
		{	
			Set<String> keys = operator.keySet();

			for (Iterator<String> iterator = keys.iterator(); iterator.hasNext();)
			{
				String key = (String) iterator.next();

				TreeItem treeSection = parentItem.addItem(key + ":");
				treeSection.setState(true);

				JSONValue child = operator.get(key);
				buildJsonTree(treeSection, child, key);
			}
		}
	}
}