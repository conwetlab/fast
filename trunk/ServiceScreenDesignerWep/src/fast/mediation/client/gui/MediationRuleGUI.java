package fast.mediation.client.gui;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Set;

import com.google.gwt.event.logical.shared.SelectionEvent;
import com.google.gwt.event.logical.shared.SelectionHandler;
import com.google.gwt.json.client.JSONArray;
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
import com.google.gwt.xml.client.NodeList;

import fast.common.client.BuildingBlock;
import fast.common.client.FASTMappingRule;
import fast.servicescreen.client.RequestServiceAsync;
import fast.servicescreen.client.gui.RuleGUI;
import fast.servicescreen.client.gui.RuleUtil;
import fast.servicescreen.client.gui.parser.OperationHandler;
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
	
	//The JSON ressource and result - Tree
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
      
      
		//TODO: This is a testvalue... If we want to access Ressource, we should change the sendreq Handler
		getJson();		
		TreeItem rootJsonItem = jsonTree.addItem("JSON");
		rootJsonItem.setState(true);
		buildJsonTree(rootJsonItem, jsonValue);
		RuleUtil.expandTree(jsonTree);
      
      
      // return the table
      translationTable.ensureDebugId("cwFlexTable");
      return translationTable;
   }

   @Override
   public void buildFactsTree(Tree aFactsTree)
   {
	   //TODO override updateFTree, too! needed!
	   
	      //(re)build the facts tree 
	   	  aFactsTree.clear();
	      
	      TreeItem rootItem = aFactsTree.addItem("Facts:");
	      
//	      transform(/*TODO*/, rootRule, rootItem);
	      
	      RuleUtil.expandTree(aFactsTree);
   }
   
   /**
    * This method transform the data with the rules
    * to the this.factsTree (JSON)
    * */   
   public void transform(JSONValue jsonVal, FASTMappingRule rule, TreeItem treeItem)
   {
//	   if(RuleUtil.isCompleteRule(rule))
//	      {
//	    	  TreeItem kidItem = null;
//	    	  NodeList elements = null;
//	    	  
//	    	  //FIXME: Make that work at time..
//	    	  //create a handler for operations in the decoded fromField 
////	    	  OperationHandler opHandler = new OperationHandler(rule.getSourceTagname(), xmlDocElement); 
////	    	  String sourceTagname = opHandler.getLastSourceTagname();
//	    	  
//	    	  String sourceTagname = rule.getSourceTagname();
//	    	  
//	    	  //add the handler within parse results into the rule
////	    	  rule.setOperationHandler(opHandler);
//	    	  
//	    	  //take source
//	          elements = RuleUtil.get_ElementsByTagname(xmlDocElement, sourceTagname);
//	          
//	             
//	          //"createObject" creates a new tag
//	          String targetElemName = rule.getTargetElemName();
//	          if (rule.getKind().equals("createObject"))
//	          {
//	             for (int i = 0; i < elements.getLength(); ++i)
//	             {
//	                kidItem = treeItem.addItem(targetElemName);
//	                callTransformForKids(elements.item(i), rule, kidItem);
//	             }
//	          }
//
//	          //"fillAttribute" fills attribute strings on right possition
//	          else if (rule.getKind().equals("fillAttributes"))
//	          {
//	             // create tag value pair for that attributes
//	             for (int i = 0; i < elements.getLength(); ++i)
//	             {
//	       		    //execute operation
//	       		    String nodeValue = opHandler.executeOperations(xmlDocElement, i);
//	       		    
//	                kidItem = treeItem.addItem(targetElemName + " : " + nodeValue);
//	             }
//	          }
//	      }
   }
   
   /**
    * Handles the json tree (Selection and PropChange)
    * */
   class JsonTreeHandler implements SelectionHandler<TreeItem>
   {
      @Override
      public void onSelection(SelectionEvent<TreeItem> event)
      {
         // print selected element in rule area
         TreeItem selectedItem = event.getSelectedItem();
         String name = selectedItem.getText();
         
         if(selectedRule != null)
         {
        	 selectedRule.setSourceTagname(name);
         }
         
      }
   }
   
	//testing json responses
	@SuppressWarnings("unused")
	private RequestServiceAsync reqService;
	
	public void getJson() {
		String alonso = "{\"MRData\":{\"xmlns\": \"http:////ergast.com//mrd//1.1\",\"series\": \"f1\",\"url\": \"\"," +
                       "\"limit\": \"30\",\"offset\": \"0\",\"total\": \"2\",\"SeasonTable\": {\"driverId\": \"alonso\"," + 
                       "\"driverStandings\": \"1\",\"Seasons\": [{\"season\": \"2005\", \"url\": \"http:////en.wikipedia.org//wiki//2005_Formula_One_season\"}," +
                       "{\"season\": \"2006\", \"url\": \"http:////en.wikipedia.org//wiki//2006_Formula_One_season\"}]}}}";
		
		jsonValue = JSONParser.parse(alonso);
		
		//FIXME: Make that work at time
//		String requestUrl = "http:////ergast.com//api//f1//drivers//alonso//driverStandings//1//seasons.json";
//		reqService = GWT.create(RequestService.class);
//		
//		reqService.sendHttpRequest_GET(requestUrl, new AsyncCallback<String>() {
//			@Override
//			public void onSuccess(String result) {
//				jsonValue = JSONParser.parse(result);
//				
//				TreeItem rootJsonItem = ruleGUI.jsonTree.addItem("JSON");
//				rootJsonItem.setState(true);
//				buildJsonTree(rootJsonItem, jsonValue);
//			}
//
//			@Override
//			public void onFailure(Throwable caught) {
//				Window.alert("Fehler: " + caught.getLocalizedMessage());
//			}
//		});
	}


	
	/**
	 * recursive method to generate a tree that represents a json value
	 * */
	private void buildJsonTree(TreeItem parentItem, JSONValue node)
	{	
		//if it's an object, build the tree for all children
		JSONArray jsonArray = node.isArray();
		if(jsonArray != null)
		{	
			for (int i = 0; i < jsonArray.size(); i++)
			{
				//add a section item for every child
				TreeItem treeSection = parentItem.addItem("ArrayItem");
				treeSection.setState(true);
				
				buildJsonTree(treeSection, jsonArray.get(i));
			}
		}
		
		//if it's a string add the leaf (maybe for isNumber() too)
		JSONString jsonString = node.isString();
		if(jsonString != null)
		{
			parentItem.addItem(jsonString.stringValue());
		}
		
		//if it's an object, build the tree for all children
		JSONObject operator = node.isObject();
		if( operator != null )
		{	
			Set<String> keys = operator.keySet();

			for (Iterator<String> iterator = keys.iterator(); iterator.hasNext();)
			{
				String key = (String) iterator.next();

				TreeItem treeSection = parentItem.addItem(key);
				treeSection.setState(true);

				JSONValue child = operator.get(key);
				buildJsonTree(treeSection, child);
			}
		}
	}
	
	private JSONValue kidsValueByTagName(JSONValue root, String tagName)
	{ 
		   //if object	
		   JSONObject object = root.isObject();
		   if( object != null )
		   {	
			   //gets all (first layer) keys contained in the JSONValue
			   Set<String> keys = object.keySet();

			   //try to find on layer one
			   for (Iterator<String> iterator = keys.iterator(); iterator.hasNext();)
			   {
				   String key = (String) iterator.next();
				   
				   if(key.equals(tagName))
				   {
					   return object.get(key);
				   }
				   else
				   {
					   return kidsValueByTagName(object.get(key), tagName);
				   }
			   }
		   }
		   
		   //if it's an array, search among it's children and call rec method
		   //for any position
		   JSONArray jsonArray = root.isArray();
		   if(jsonArray != null)
		   {	
			   for (int i = 0; i < jsonArray.size(); i++)
			   { 
				   jsonValueByTagName(jsonArray.get(i), tagName);
			   }
		   }

		   //maybe it's the value/nrValue
//		   JSONString jsonString = root.isString();
//		   if(jsonString != null && tagName.equals(jsonString.stringValue()))
//		   {
//			   return jsonString;
//		   }
//		   
//		   JSONNumber jsonNumber = root.isNumber();
//		   

		return null;
	}
   
   /**
    * Tiefensuche
    * */
   private JSONValue jsonValueByTagName(JSONValue root, String tagName)
   {
	   //The first value should be an object any time 
	   JSONObject object = root.isObject();
	   if( object != null )
	   {	
		   //gets all (first layer) keys contained in the JSONValue
		   Set<String> keys = object.keySet();

		   //try to find on layer one
		   for (Iterator<String> iterator = keys.iterator(); iterator.hasNext();)
		   {
			   String key = (String) iterator.next();
			   
			   if(key.equals(tagName))
			   {
				   return object.get(key);
			   }
			   else
			   {
				   return kidsValueByTagName(object.get(key), tagName);
			   }
		   }
	   }

	   return null;
   }
}