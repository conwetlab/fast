package fast.mediation.client.gui;

import java.util.Iterator;
import java.util.Set;

import com.google.gwt.event.logical.shared.SelectionEvent;
import com.google.gwt.event.logical.shared.SelectionHandler;
import com.google.gwt.json.client.JSONArray;
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
import fast.common.client.FactPort;
import fast.servicescreen.client.gui.RuleGUI;
import fast.servicescreen.client.gui.RuleUtil;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer.WrappingType;
import fast.servicescreen.client.gui.parser.OperationHandler;
import fast.servicescreen.client.rpc.SendRequestHandler;

/**
 * Specifies the RuleGUI working with JSON instead XML.
 * Define RessourceType first, then initial this GUI, or the common
 * RuleGUI
 * */
public class MediationRuleGUI extends RuleGUI 
{
	public MediationRuleGUI(WrappingType reqType, BuildingBlock buildingBlock, SendRequestHandler rh)
	{
		super(buildingBlock, rh);
		
		this.reqType = reqType;
	}
	
	//The JSON resource and result - Tree
	public Tree jsonTree;
	public WrappingType reqType;
	private JSONValue jsonValue;
	
	/**
	 * Returns the current json value from the RuleGUI
	 * */
	public JSONValue getJSONValue()
	{
		return jsonValue;
	}
	
	/**
    * creates and returns a flextable containing the trees
    * for translation design
    * */
	@Override
    public Widget createTranslationTable()
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
      
      //create Tree and add a selection/PropertyChange - handler
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
      
      
       //build the result tree
	   //if DataMTool -> overtake example values
	   if(reqType == WrappingType.WRAP_JSON)
	   {
		   setJsonExampleValue("{}");
		   
		   createResultTree();
		   
		   updateFactsTree();		   
	   }
      
      // return the table
      translationTable.ensureDebugId("cwFlexTable");
      return translationTable;
   }

   /**
    * Called to build the result tree
    * */
   public void createResultTree()
   {
	   jsonTree.clear();
	   
	   TreeItem rootJsonItem = jsonTree.addItem("JSONValue:");
	   rootJsonItem.setState(true);
	   buildJsonTree(rootJsonItem, jsonValue, "JSONValue");
	   RuleUtil.expandItem(jsonTree.getItem(0));
   }

   @Override
   public void updateFactsTree()
   {   
	   //transforms the rule hierarchy to Strings in facts - tree
	   if (rootRule == null)
	   {
		   rootRule = (FASTMappingRule) buildingBlock.iteratorOfMappingRules().next();
	   }
	   
	   createResultTree();
	   
	   buildFactsTree(factsTree);
   }
   
   @Override
   public void buildFactsTree(Tree aFactsTree)
   {
	   //(re)build the facts tree 
	   aFactsTree.clear();

	   TreeItem rootItem = aFactsTree.addItem("Facts:");

	   transform(jsonValue, rootRule, rootItem);

       //This expand the HOLE tree
	   RuleUtil.expandItem(aFactsTree.getItem(0));	
   }
   
   /**
    * This method transforms the data with the rules
    * to the this.factsTree (JSON)
    * */
   public void transform(JSONValue rootJsonValue, FASTMappingRule rule, TreeItem treeItem)
   {
	   if(RuleUtil.isCompleteRule(rule))
	   {
		   String kind = rule.getKind();
		   String targetElemName = rule.getTargetElemName();
		   
		   
		   //create a handler for operations in the decoded fromField 
		   OperationHandler opHandler = new OperationHandler(rule.getSourceTagname()); 
		   String sourceTagname = opHandler.getLastSourceTagname();
	       //add the handler within parse results into the rule
		   rule.setOperationHandler(opHandler);
		   
		   JSONArray elements = new JSONArray();
		   //for normal sourceTagnames retrieve the elements recursive
		   if(! sourceTagname.endsWith("_Item"))
		   {
			   RuleUtil.jsonValuesByTagName(elements, rootJsonValue, sourceTagname);
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
				String nodeValue = opHandler.executeOperations(rootJsonValue);
				   
				treeItem.addItem(targetElemName + ": " + nodeValue);
		   }
	       else if(rule.getKind().equals("dummyRule"))
	       {
	    	   //TODO
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
         
         updateFactsTree();
      }
   }
   
   /**
    * Setting up JSON vlue from request as input value
    * */
   public void setJsonRequestetValue(String value)
   {
		try
		{
			jsonValue = JSONParser.parse(value);
		}
		catch (Exception e)
		{
			jsonValue = JSONParser.parse("{}");
			
			e.printStackTrace();
		}
   }
   
	/**
	 * Setting up JSON example values as input value
	 * */
	public void setJsonExampleValue(String value)
	{
		String jsonValueString = value;
		
		if(buildingBlock.getPreconditions() != null){
			for (Iterator<FactPort> iterator = buildingBlock.getPreconditions().iterator(); iterator.hasNext();)
			{
				FactPort factPort = (FactPort) iterator.next();
				String exampleValueString = factPort.getExampleValue(); 
				if(exampleValueString != null && ! "".equals(exampleValueString))
				{
					jsonValueString = exampleValueString;
				}
			}
		}
		
		try {
			jsonValue = JSONParser.parse(jsonValueString);
		} catch (Exception e) {
			jsonValue = JSONParser.parse("{}");
		}
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