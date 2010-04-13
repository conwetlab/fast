package fast.servicescreen.client.gui;

import java.util.ArrayList;
import java.util.Iterator;

import com.google.gwt.event.dom.client.ChangeEvent;
import com.google.gwt.event.dom.client.ChangeHandler;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.logical.shared.SelectionEvent;
import com.google.gwt.event.logical.shared.SelectionHandler;
import com.google.gwt.event.logical.shared.ValueChangeEvent;
import com.google.gwt.event.logical.shared.ValueChangeHandler;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.Grid;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.MultiWordSuggestOracle;
import com.google.gwt.user.client.ui.ScrollPanel;
import com.google.gwt.user.client.ui.SuggestBox;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.Tree;
import com.google.gwt.user.client.ui.TreeItem;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.user.client.ui.SuggestOracle.Suggestion;
import com.google.gwt.xml.client.Node;
import com.google.gwt.xml.client.NodeList;

import fast.common.client.BuildingBlock;
import fast.common.client.FASTMappingRule;
import fast.common.client.FactAttribute;
import fast.common.client.FactType;
import fast.common.client.ServiceDesigner;
import fast.servicescreen.client.gui.parser.OperationHandler;
import fast.servicescreen.client.rpc.SendRequestHandler;

public class RuleGUI
{
   public RuleGUI(BuildingBlock buildingBlock, SendRequestHandler rh)
   {
      this.buildingBlock = buildingBlock;
      requestHandler = rh;
   }

   protected BuildingBlock buildingBlock;
   protected SendRequestHandler requestHandler;
   
   //Ressource Trees
   public Tree xmlTree;

   //Output Tree
   public Tree factsTree;

   //TransRule Tree
   public Tree rulesTree;
   protected FASTMappingRule selectedRule;

   /**
    * creates and returns a flextable containing the trees
    * for translation design
    * */
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
      
      //create xmlTree and add a selection/PropertyChange - handler
      xmlTree = new Tree();
      xmlTree.addSelectionHandler(new XmlTreeHandler());
      resultScrollPanel.setWidget(xmlTree);
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
      
      // return the table
      translationTable.ensureDebugId("cwFlexTable");
      return translationTable;
   }
   
   
   //rules headline table
   protected Widget createRulesHeadlineTable()
   {
      FlexTable rulesHeadlineTable = new FlexTable();
      
      int rowCount = rulesHeadlineTable.getRowCount();
      
      rulesHeadlineTable.setWidget(rowCount, 0, new Label("Rules:"));
      
	  int rowCount_upAndDown = rowCount + 1;
	  int rowCount_leftAndRight = rowCount + 2;
	  int rowCount_headlines = rowCount + 3;
      
      rulesHeadlineTable.setWidget(rowCount_headlines, 0, new Label("<From>"));
      rulesHeadlineTable.setWidget(rowCount_headlines, 1, new Label("<Kind>"));
      rulesHeadlineTable.setWidget(rowCount_headlines, 2, new Label("<Target>"));
      
      //add - button
      Button addRuleButton = new Button("Add Kid Rule");
      addRuleButton.addClickHandler(new AddKidRuleHandler());
      rulesHeadlineTable.setWidget(rowCount, 0, addRuleButton);
      
      //remove - button
	  Button removeRuleButton = new Button("Remove Rule");
	  removeRuleButton.addClickHandler(new RemoveRuleHandler());
	  rulesHeadlineTable.setWidget(rowCount, 1, removeRuleButton);
	  
	  //up - button
	  Button upButton = new Button("up");
	  upButton.setSize("50px", "35px");
	  upButton.addClickHandler(new RuleUpHandler());
	  rulesHeadlineTable.setWidget(rowCount_upAndDown, 0, upButton);

	  //down - button
	  Button downButton = new Button("down");
	  downButton.setSize("50px", "35px");
	  downButton.addClickHandler(new RuleDownHandler());
	  rulesHeadlineTable.setWidget(rowCount_upAndDown, 1, downButton);
	  
	  //left - button
	  Button leftButton = new Button("left");
	  leftButton.setSize("50px", "35px");
	  leftButton.addClickHandler(new RuleLeftHandler());
	  rulesHeadlineTable.setWidget(rowCount_leftAndRight, 0, leftButton);
	  
	  //right - button
	  Button rightButton = new Button("right");
	  rightButton.setSize("50px", "35px");
	  rightButton.addClickHandler(new RuleRightHandler());
	  rulesHeadlineTable.setWidget(rowCount_leftAndRight, 1, rightButton);
	  
      // return the table
      rulesHeadlineTable.ensureDebugId("cwFlexTable");
      return rulesHeadlineTable;
   }
   
   //build rules-tree new
   @SuppressWarnings("unchecked")
   protected Tree createRulesTree()
   {
      if (rulesTree == null)
    	  rulesTree = new Tree();
      else
    	  rulesTree.clear();
      
      
      TreeItem treeParent = rulesTree.addItem("Rules:");
      
      //  root rule
      if (buildingBlock.sizeOfMappingRules() == 0)
      {
         buildingBlock.addToMappingRules(new FASTMappingRule());
      }
      
      // add existing rules to the tree
      Iterator<FASTMappingRule> iteratorOfMappingRules = buildingBlock.iteratorOfMappingRules();
      
      while (iteratorOfMappingRules.hasNext())
      {
         FASTMappingRule nextRule = (FASTMappingRule) iteratorOfMappingRules.next();
         addRuleTree(nextRule, treeParent);
      }
      
      TreeItem item = rulesTree.getItem(0);
      item.setState(true);

      SelectionHandler<TreeItem> handler = new RulesTreeHandler();
      rulesTree.addSelectionHandler(handler);
      
      RuleUtil.expandTree(rulesTree);
      
      return rulesTree;
   }

   @SuppressWarnings("unchecked")
   protected void addRuleTree(FASTMappingRule nextRule, TreeItem treeParent)
   {
      TreeItem ruleEditor = createRuleEditor(nextRule, treeParent);
      
      // add kids
      for (Iterator<FASTMappingRule> kidsIter = nextRule.iteratorOfKids(); kidsIter.hasNext();)
      {
         FASTMappingRule kidRule = (FASTMappingRule) kidsIter.next();
         addRuleTree(kidRule, ruleEditor);
      }
   }

   protected RulefieldsListener rulefieldListener = new RulefieldsListener(buildingBlock);
   
   protected TreeItem createRuleEditor(FASTMappingRule nextRule, TreeItem treeParent)
   {
      // "from" attribute
      // new SuggestBox
      TextBox fromBox = CTextChangeHandler.createWidthTextBox(nextRule, "3cm", "sourceTagname");
      
      // "kind" attribute
      MultiWordSuggestOracle oracle = new MultiWordSuggestOracle();
      ArrayList<String> words = new ArrayList<String>();
      
      words.add("createObject");
      words.add("fillAttributes");
      
      for(String word : words)
        oracle.add(word);
         
      oracle.setDefaultSuggestionsFromText(words);
      SuggestBox kindBox = CTextChangeHandler.createWidthSuggestBox(nextRule, "3cm", "kind", oracle);
      
      // "target" attribute
      MultiWordSuggestOracle typeOracle = new MultiWordSuggestOracle();
      
      ServiceDesigner serviceDesigner = (ServiceDesigner) buildingBlock.get("serviceDesigner");
      
      fillTypesOracle(nextRule, typeOracle, serviceDesigner);
      final SuggestBox targetBox = CTextChangeHandler.createWidthSuggestBox(nextRule, "3cm", "targetElemName", typeOracle);;
      targetBox.setValue(nextRule.getTargetElemName());
      targetBox.setWidth("3cm");

      Grid ruleRow = new Grid(1,3);
      ruleRow.setWidget(0, 0, fromBox);
      ruleRow.setWidget(0, 1, kindBox);
      ruleRow.setWidget(0, 2, targetBox);
      
      // add listeners for oracle relevant changes
      UpdateTargetBoxOracleHandler handler = new UpdateTargetBoxOracleHandler(nextRule, typeOracle, serviceDesigner);
      kindBox.addSelectionHandler(handler);
      
      if (treeParent != null)
      {
         Grid parentGrid = (Grid) treeParent.getWidget();
         if (parentGrid != null)
         {
            SuggestBox parentTargetBox = (SuggestBox) parentGrid.getWidget(0, 2); // the target box of the parent
            parentTargetBox.addSelectionHandler(handler);
         }
      }
      
      //adding a RulefieldsListener (and handler) to rule fields
      fromBox.addChangeHandler(rulefieldListener);
      kindBox.addSelectionHandler(rulefieldListener);
      targetBox.addSelectionHandler(rulefieldListener);
      
      fromBox.addValueChangeHandler(new ValueChangeHandler<String>()
      {
    	  @Override
    	  public void onValueChange(ValueChangeEvent<String> event)
    	  {
    		  updateFactsTree();
    	  }
      });
      
      TreeItem result = treeParent.addItem(ruleRow);
      result.setUserObject(nextRule);
      
      return result;
   }

   @SuppressWarnings("unchecked")
   protected void fillTypesOracle(FASTMappingRule nextRule,
         MultiWordSuggestOracle typeOracle, ServiceDesigner serviceDesigner)
   {
      // for create object rules add fact types to oracle
      ArrayList<String> types = new ArrayList<String>();
      String kind = nextRule.getKind();
      if ("createObject".equals(kind))
      {
         for (Iterator typeIter = serviceDesigner.iteratorOfFactTypes(); typeIter.hasNext();)
         {
            FactType factType = (FactType) typeIter.next();
            String typeName = factType.getTypeName();
			types.add(typeName);
			types.add("List of " + typeName);
         }
      }
      else if ("fillAttributes".equals(kind))
      {
         // retrieve type of parent rule and add its attributes to the oracle
         FASTMappingRule parent = nextRule.getParent();
         String typeName = parent.getTargetElemName();
         FactType factType = findFactType(typeName);
         
         if(factType != null)
         {
        	 for (Iterator iter = factType.iteratorOfFactAttributes(); iter.hasNext();)
        	 {
        		 FactAttribute attr = (FactAttribute) iter.next();
        		 types.add(attr.getAttrName());
        	 }
         }
      }
      
      for(String word : types)
         typeOracle.add(word);
               
      typeOracle.setDefaultSuggestionsFromText(types);
   }
   
   class UpdateTargetBoxOracleHandler implements SelectionHandler<Suggestion>
   {
	   protected FASTMappingRule rule;
	   protected MultiWordSuggestOracle oracle;
	   protected ServiceDesigner serviceDesigner;
      
      public UpdateTargetBoxOracleHandler(FASTMappingRule rule, MultiWordSuggestOracle oracle, ServiceDesigner serviceDesigner)
      {
         // this rule's kind or parent rule's target type has changed.
         // in case of a fillAttributes rule, the oracle for attr names needs to be changed. 
         this.oracle = oracle;
         this.rule = rule;
         this.serviceDesigner = serviceDesigner;
      }

      @Override
      public void onSelection(SelectionEvent<Suggestion> event)
      {
         // update oracle
         oracle.clear();
         fillTypesOracle(rule, oracle, serviceDesigner);
      }      
   }
   
   
   protected ServiceDesigner tmpServiceDesigner = null;
   protected FactType tmpFactType;
   
   protected void withNewFactAttr(String string)
   {
      FactAttribute factAttribute = new FactAttribute()
                                    .withAttrName(string);
      tmpFactType.addToFactAttributes(factAttribute);
   }

   protected void addToFactTypes(String string)
   {
      tmpFactType = new FactType()
                    .withTypeName(string);
      tmpServiceDesigner.addToFactTypes(tmpFactType);
   }

   @SuppressWarnings("unchecked")
   protected FactType findFactType(String typeName)
   {
      FactType factType = null;
      for (Iterator iter = ((ServiceDesigner) buildingBlock.get("serviceDesigner")).iteratorOfFactTypes(); iter.hasNext();)
      {
         factType = (FactType) iter.next();
         if (factType.getTypeName().equals(typeName))
         {
            return factType;
         }
      }
      return null;
   }

   
   protected FASTMappingRule rootRule;
   /**
    * Updates the facts trees (for XML Ressources!)
    * */
   public void updateFactsTree()
   {
      //transforms the rule hierarchy to Strings in facts - tree
      if (rootRule == null)
      {
         rootRule = (FASTMappingRule) buildingBlock.iteratorOfMappingRules().next();
      }
      
      requestHandler.xmlDoc.getDocumentElement();
      
      buildFactsTree(factsTree);
   }
   
   protected void buildFactsTree(Tree aFactsTree)
   {
	   	  aFactsTree.clear();
	      
	      TreeItem rootItem = aFactsTree.addItem("Facts:");
	      
	      transform(requestHandler.xmlDoc, rootRule, rootItem);
	      
	      RuleUtil.expandTree(aFactsTree);
   }
   
   /**
    * This method transform the data with the rules
    * to the this.factsTree (XML)
    * */
   public void transform(Node xmlDocElement, FASTMappingRule rule, TreeItem treeItem)
   {
      if(RuleUtil.isCompleteRule(rule))
      {
    	  TreeItem kidItem = null;
    	  NodeList elements = null;
    	  
    	  //create a handler for operations in the decoded fromField 
    	  OperationHandler opHandler = new OperationHandler(rule.getSourceTagname()); 
    	  String sourceTagname = opHandler.getLastSourceTagname();
    	  
    	  //add the handler within parse results into the rule
    	  rule.setOperationHandler(opHandler);
    	  
    	  //take source
          elements = RuleUtil.get_ElementsByTagname(xmlDocElement, sourceTagname);
             
          //"createObject" creates a new tag
          String targetElemName = rule.getTargetElemName();
          if (rule.getKind().equals("createObject"))
          {
             for (int i = 0; i < elements.getLength(); ++i)
             {
                kidItem = treeItem.addItem(targetElemName);
                callTransformForKids(elements.item(i), rule, kidItem);
             }
          }

          //"fillAttribute" fills attribute strings on right possition
          else if (rule.getKind().equals("fillAttributes"))
          {
             // create tag value pair for that attributes
             for (int i = 0; i < elements.getLength(); ++i)
             {
       		    //execute operation
       		    String nodeValue = opHandler.executeOperations(xmlDocElement, i);
       		    
                kidItem = treeItem.addItem(targetElemName + " : " + nodeValue);
             }
             
             //access attribute if there where no elements
             if (elements.getLength() == 0)
             {
            	String nodeValue = opHandler.executeOperations(xmlDocElement, 0);
            	 
               	kidItem = treeItem.addItem(targetElemName + " : " + nodeValue);
             }
          }
      }
   }
   
   /**
    * Helps reuse the code. Call transform(..) for any kid
    * rule the rule u gave got. 
   * */
   @SuppressWarnings("unchecked")
   protected void callTransformForKids(Node xmlDocElement, FASTMappingRule rule, TreeItem treeItem)
   {
      for (Iterator<FASTMappingRule> kidIter = rule.iteratorOfKids(); kidIter.hasNext();)
      {
         FASTMappingRule kid = (FASTMappingRule) kidIter.next();
         transform(xmlDocElement, kid, treeItem);
      }
   }
   
   
   
   
   //Handler

   
   /**
    * Handles changes in Rulefields
    * */
   class RulefieldsListener implements ChangeHandler, SelectionHandler<Suggestion>
   {      
	      protected BuildingBlock buildingBlock = null;
	      
	      public RulefieldsListener(BuildingBlock block)
	      {
	         this.buildingBlock = block;
	      }

	      /**
	       * This method is called when any of the Rule - Fields
	       * changes.
	       * It bind the changed Fieldname to the Facte - Tree.
	       * */
	      @Override
	      public void onChange(ChangeEvent event)
	      {
	         // Only TextBoxes should be bind to the Facts - Tree
	         Object source = event.getSource();
	         if((  source instanceof TextBox)
	            || source instanceof SuggestBox)
	         {
	            // that should happen any time the rule tree changes!
	            updateFactsTree();
	         }
	      }

	      @Override
	      public void onSelection(SelectionEvent<Suggestion> event)
	      {
	         updateFactsTree();
	      }
   }
   
   /**
    * Handles the xml tree (Selection and PropChange)
    * */
   class XmlTreeHandler implements SelectionHandler<TreeItem>
   { 
      @Override
      public void onSelection(SelectionEvent<TreeItem> event)
      {
         // print selected element in rule area
         TreeItem selectedItem = event.getSelectedItem();
         String text = selectedItem.getText();
         
         // try to find corresponding xmlDoc element
         String tagName = text.split(":")[0].trim();
         
         if(selectedRule != null)
         {
             // transfer tagName to the currently selected mapping rule. 
             selectedRule.setSourceTagname(tagName);
             
             updateFactsTree();
         }
      }
   }
   
   class RulesTreeHandler implements SelectionHandler<TreeItem>
   {
      @Override
      public void onSelection(SelectionEvent<TreeItem> event)
      {
        // store selected rule
         TreeItem selectedItem = event.getSelectedItem();
         FASTMappingRule mappingRule = (FASTMappingRule) selectedItem.getUserObject();
         selectedRule = mappingRule;
      }
   }
   
   /**
    * Add a Kidrule - Handler
    * */
   class AddKidRuleHandler implements ClickHandler
   {
     @Override
     public void onClick(ClickEvent event)
     {
        FASTMappingRule newRule = new FASTMappingRule();
        newRule.setKind("createObject");
        
        TreeItem selectedItem = rulesTree.getSelectedItem();
        selectedRule.addToKids(newRule);
        createRuleEditor(newRule, selectedItem);
        
        updateFactsTree();
     }
   }
   
   /**
    * Remove a Rule - Handler
    * */
   class RemoveRuleHandler implements ClickHandler
   {
		@Override
		public void onClick(ClickEvent event)
		{
			TreeItem selectedItem = rulesTree.getSelectedItem();
			
			//if the rule has no parent rule, do nothing (one rule has to remain)
			if(RuleUtil.isNotNullOrRoot(selectedItem))
			{
				//the node has subrules, add them to the parent
				if(selectedItem.getChildCount() > 0)
				{	
					
					FASTMappingRule parent = selectedRule.getParent();
					
					for(int count = selectedItem.getChildCount()-1; count >= 0; --count)
					{
						selectedItem.getParentItem().addItem(selectedItem.getChild(count));
						selectedItem.removeItem(selectedItem.getChild(count));
						
						parent.addToKids(selectedRule.getFromKids(count));
					}
				}
				
				//deleting selected item/rule
				selectedItem.remove();
				selectedRule.removeYou();
				
				rulesTree = createRulesTree();
			}
			
			updateFactsTree();
		}
   }
   
   /**
    * Rule up - Handler
    * */
   class RuleUpHandler implements ClickHandler
   {
		@Override
		public void onClick(ClickEvent event)
		{
			TreeItem upItem = rulesTree.getSelectedItem();
			
			if(RuleUtil.isNotNullOrRoot(upItem))
			{
				TreeItem parent = upItem.getParentItem(); 
				int index = parent.getChildIndex(upItem); 
					
				if(index != 0)
				{
					//move rule
					FASTMappingRule parentRule = selectedRule.getParent();
					FASTMappingRule beforeRule = parentRule.getPreviousOfKids(selectedRule);
				    parentRule.addBeforeOfKids(beforeRule, selectedRule);
				    
				    rulesTree = createRulesTree();
				}
				else
				{
					//maybe call ruleLeft
				}
			}
			updateFactsTree();
		}
   }
   
   /**
    * Rule down - Handler
    * */
   class RuleDownHandler implements ClickHandler
   {
		@Override
		public void onClick(ClickEvent event)
		{
			TreeItem downItem = rulesTree.getSelectedItem();
			
			if(RuleUtil.isNotNullOrRoot(downItem))
			{
				TreeItem parent = downItem.getParentItem(); 
				int index = parent.getChildIndex(downItem); 
				int childCount = parent.getChildCount();
					
				if(index < (childCount-1))
				{
					//move rule
					FASTMappingRule parentRule = selectedRule.getParent();
				    parentRule.addAfterOfKids(selectedRule, selectedRule);
				    
				    rulesTree = createRulesTree();
				}
			}
			
			updateFactsTree();
		}
   }
   
   /**
    * Rule left - Handler
    * */
   class RuleLeftHandler implements ClickHandler
   {
		@Override
		public void onClick(ClickEvent event)
		{
			TreeItem leftItem = rulesTree.getSelectedItem();
			
			if(RuleUtil.isNotNullOrRoot(leftItem) && 
			   RuleUtil.isNotNullOrRoot(leftItem.getParentItem()))
			{
				FASTMappingRule parent = selectedRule.getParent();
				
				FASTMappingRule addRuleHere = parent.getParent();
				
				addRuleHere.addBeforeOfKids(parent, selectedRule);
				rulesTree = createRulesTree();
			}
			
			updateFactsTree();
		}
   }
   
   /**
    * Rule right - Handler
    * */
   class RuleRightHandler implements ClickHandler
   {
		@Override
		public void onClick(ClickEvent event)
		{
			TreeItem rightItem = rulesTree.getSelectedItem();
			
			if(RuleUtil.isNotNullOrRoot(rightItem))
			{
				FASTMappingRule parentRule = selectedRule.getParent();
				FASTMappingRule intoRule = parentRule.getNextOfKids(selectedRule);
				intoRule.addToKids(0, selectedRule);
				rulesTree = createRulesTree();
			}
			
			updateFactsTree();
		}
   }
}