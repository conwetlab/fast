//package fast.servicescreen.client.gui.ExtendedRuleParser;
//
//import java.util.ArrayList;
//import java.util.Iterator;
//
//import com.google.gwt.event.dom.client.ChangeEvent;
//import com.google.gwt.event.dom.client.ChangeHandler;
//import com.google.gwt.event.dom.client.ClickEvent;
//import com.google.gwt.event.dom.client.ClickHandler;
//import com.google.gwt.event.logical.shared.SelectionEvent;
//import com.google.gwt.event.logical.shared.SelectionHandler;
//import com.google.gwt.event.logical.shared.ValueChangeEvent;
//import com.google.gwt.event.logical.shared.ValueChangeHandler;
//import com.google.gwt.user.client.ui.Button;
//import com.google.gwt.user.client.ui.FlexTable;
//import com.google.gwt.user.client.ui.Grid;
//import com.google.gwt.user.client.ui.Label;
//import com.google.gwt.user.client.ui.MultiWordSuggestOracle;
//import com.google.gwt.user.client.ui.ScrollPanel;
//import com.google.gwt.user.client.ui.SuggestBox;
//import com.google.gwt.user.client.ui.TextBox;
//import com.google.gwt.user.client.ui.Tree;
//import com.google.gwt.user.client.ui.TreeItem;
//import com.google.gwt.user.client.ui.Widget;
//import com.google.gwt.user.client.ui.SuggestOracle.Suggestion;
//import com.google.gwt.xml.client.Node;
//import com.google.gwt.xml.client.NodeList;
//
//import fast.FASTMappingRule;
//import fast.FactAttribute;
//import fast.FactType;
//import fast.ServiceDesigner;
//import fast.ServiceScreen;
//import fast.servicescreen.client.ServiceScreenDesignerWep;
//import fast.servicescreen.client.gui.CTextChangeHandler;
//import fast.servicescreen.client.gui.RuleUtil;
//
///**
// * This class provides a UI working with
// * the other parts of the serviceWrapper.
// * 
// * It´s the third instance (After Requests and Rules), that should expand normal
// * rule - operations to extended rule operations.
// * So u can realize object wrapping for example.
// * 
// * TODOs some Handler seems to handle more often then they need
// * */
//public class ExtendedRuleGUI
//{
//	private ServiceScreenDesignerWep designer;
//	private ServiceScreen exServiceScreen;
//	
//    public Tree xmlTreeCopy;
//    private Tree extendedFactsTree;
//    
//    private FASTMappingRule rootRule;
//    private Tree rulesTree;
//    private FASTMappingRule selectedRule;
//    
//    public OperationHandler opHandler;
//    
//	/**
//	 * The only constructor needs the ServiceScreenDesignerWep
//	 * */
//	public ExtendedRuleGUI(ServiceScreenDesignerWep designer)
//	{
//	   this.designer = designer;
//	   
//	   exServiceScreen = new ServiceScreen();
//	}
//	
//	/**
//	  * creates and returns a flextable containing the trees
//	  * for extended transformations
//	 * */
//	public Widget createExtendedRuleEditor()
//	{
//	      final FlexTable translationTable = new FlexTable();
//	      int rowCount = translationTable.getRowCount();
//	      
//	      // headlines, labels and buttons in first row
//	      translationTable.setWidget(rowCount, 0, new Label("Ressource:"));
//	      translationTable.setWidget(rowCount, 1, createRulesHeadlineTable());
//	      translationTable.setWidget(rowCount, 2, new Label("Extended facts:"));
//	      rowCount++;
//	      
//	      // prepare ScrollPanel
//	      ScrollPanel resultScrollPanel = new ScrollPanel();
//	      resultScrollPanel.setAlwaysShowScrollBars(true);
//	      resultScrollPanel.setSize("11cm", "11cm"); 
//	       
//	      // add rule table
//	      ScrollPanel rulesScrollPanel = new ScrollPanel();
//	      rulesScrollPanel.setAlwaysShowScrollBars(true);
//	      rulesScrollPanel.setSize("11cm", "11cm");
//	      rulesScrollPanel.setWidget(createRulesTree());
//	      translationTable.setWidget(rowCount, 1, rulesScrollPanel);
//	         
//	      // add xml tree
//	      ScrollPanel xmlScrollPanel = new ScrollPanel();
//	      xmlScrollPanel.setAlwaysShowScrollBars(true);
//	      xmlScrollPanel.setSize("11cm", "11cm");
//	      xmlTreeCopy = new Tree();
//	      XmlTreeHandler xmlTreeHandler = new XmlTreeHandler(); 
//	      xmlTreeCopy.addSelectionHandler(xmlTreeHandler);
//	      xmlScrollPanel.setWidget(xmlTreeCopy);
//	      translationTable.setWidget(rowCount, 0, xmlScrollPanel);
//	      
//	      // add extendedFactsTree
//	      ScrollPanel extendedFactsScrollPanel = new ScrollPanel();
//	      extendedFactsScrollPanel.setAlwaysShowScrollBars(true);
//	      extendedFactsScrollPanel.setSize("11cm", "11cm");
//	      extendedFactsTree = new Tree();
//	      extendedFactsScrollPanel.setWidget(extendedFactsTree);
//	      translationTable.setWidget(rowCount, 2, extendedFactsScrollPanel);
//	      
//	      // return the table
//	      translationTable.ensureDebugId("cwFlexTable");
//	      return translationTable;
//	   }
//
//	   /**
//	    * create rules headline table
//	    * */
//	   private Widget createRulesHeadlineTable()
//	   {
//	      FlexTable rulesHeadlineTable = new FlexTable();
//	      
//	      int rowCount = rulesHeadlineTable.getRowCount();
//	      
//	      rulesHeadlineTable.setWidget(rowCount, 0, new Label("Rules:"));
//	      
//		  int rowCount_upAndDown = rowCount + 1;
//		  int rowCount_leftAndRight = rowCount + 2;
//		  int rowCount_headlines = rowCount + 3;
//	      
//	      rulesHeadlineTable.setWidget(rowCount_headlines, 0, new Label("<From>"));
//	      rulesHeadlineTable.setWidget(rowCount_headlines, 1, new Label("<Kind>"));
//	      rulesHeadlineTable.setWidget(rowCount_headlines, 2, new Label("<Target>"));
//	      
//	      //add - button
//	      Button addRuleButton = new Button("Add Kid Rule");
//	      addRuleButton.addClickHandler(new AddKidRuleHandler());
//	      rulesHeadlineTable.setWidget(rowCount, 0, addRuleButton);
//	      
//	      //remove - button
//		  Button removeRuleButton = new Button("Remove Rule");
//		  removeRuleButton.addClickHandler(new RemoveRuleHandler());
//		  rulesHeadlineTable.setWidget(rowCount, 1, removeRuleButton);
//		  
//		  //up - button
//		  Button upButton = new Button("up");
//		  upButton.setSize("50px", "35px");
//		  upButton.addClickHandler(new RuleUpHandler());
//		  rulesHeadlineTable.setWidget(rowCount_upAndDown, 0, upButton);
//
//		  //down - button
//		  Button downButton = new Button("down");
//		  downButton.setSize("50px", "35px");
//		  downButton.addClickHandler(new RuleDownHandler());
//		  rulesHeadlineTable.setWidget(rowCount_upAndDown, 1, downButton);
//		  
//		  //left - button
//		  Button leftButton = new Button("left");
//		  leftButton.setSize("50px", "35px");
//		  leftButton.addClickHandler(new RuleLeftHandler());
//		  rulesHeadlineTable.setWidget(rowCount_leftAndRight, 0, leftButton);
//		  
//		  //right - button
//		  Button rightButton = new Button("right");
//		  rightButton.setSize("50px", "35px");
//		  rightButton.addClickHandler(new RuleRightHandler());
//		  rulesHeadlineTable.setWidget(rowCount_leftAndRight, 1, rightButton);
//		  
//	      // return the table
//	      rulesHeadlineTable.ensureDebugId("cwFlexTable");
//	      return rulesHeadlineTable;
//	   }
//	   
//	   //build rules-tree new
//	   @SuppressWarnings("unchecked")
//	   private Tree createRulesTree()
//	   {
//	      if (rulesTree == null)
//	    	  rulesTree = new Tree();
//	      else
//	    	  rulesTree.clear();
//	      
//	      TreeItem treeParent = rulesTree.addItem("Rules:");
//	      
//	      //  root rule
//	      if (exServiceScreen.sizeOfMappingRules() == 0)
//	      {
//	    	  //TEST only
//	    	  rootRule = new FASTMappingRule();
//	    	  rootRule.setSourceTagname("FindItemsResponse");
//	    	  rootRule.setKind("createObject");
//	    	  rootRule.setTargetElemName("List");
//	    	  
//	    	  FASTMappingRule testRootRule_kid1 = new FASTMappingRule();
//	    	  testRootRule_kid1.setSourceTagname("Item");
//	    	  testRootRule_kid1.setKind("createObject");
//	    	  testRootRule_kid1.setTargetElemName("Product");
//	    	  
//	    	  FASTMappingRule testRootRule_kid2 = new FASTMappingRule();
//	    	  testRootRule_kid2.setSourceTagname("Item.ItemID + Title.words.1-4");
//	    	  testRootRule_kid2.setKind("fillAttributes");
//	    	  testRootRule_kid2.setTargetElemName("productName");
//	    	  
//	    	  FASTMappingRule testRootRule_kid3 = new FASTMappingRule();
//	    	  testRootRule_kid3.setSourceTagname("Title.words.1-2");
//	    	  testRootRule_kid3.setKind("fillAttributes");
//	    	  testRootRule_kid3.setTargetElemName("shortName");
//	    	  
//	    	  FASTMappingRule testRootRule_kid4 = new FASTMappingRule();
//	    	  testRootRule_kid4.setSourceTagname("Title.words.1.chars.1-3");
//	    	  testRootRule_kid4.setKind("fillAttributes");
//	    	  testRootRule_kid4.setTargetElemName("realyShort");
//	    	  
//	    	  testRootRule_kid1.addToKids(testRootRule_kid2);
//	    	  testRootRule_kid1.addToKids(testRootRule_kid3);
//	    	  testRootRule_kid1.addToKids(testRootRule_kid4);
//	    	  rootRule.addToKids(testRootRule_kid1);
//	    	  
//	    	  exServiceScreen.addToMappingRules(rootRule);
//	      }
//	      
//	      // add existing rules to the tree
//	      Iterator<FASTMappingRule> iteratorOfMappingRules = exServiceScreen.iteratorOfMappingRules();	      
//	      
//	      while (iteratorOfMappingRules.hasNext())
//	      {
//	         FASTMappingRule nextRule = (FASTMappingRule) iteratorOfMappingRules.next();
//	         addRuleTree(nextRule, treeParent);
//	      }
//	      
//	      TreeItem item = rulesTree.getItem(0);
//	      item.setState(true);
//
//	      SelectionHandler<TreeItem> handler = new RulesTreeHandler();
//	      rulesTree.addSelectionHandler(handler);
//	      
//	      RuleUtil.expandTree(rulesTree);
//	      
//	      return rulesTree;
//	   }
//
//	   @SuppressWarnings("unchecked")
//	   private void addRuleTree(FASTMappingRule nextRule, TreeItem treeParent)
//	   {
//	      TreeItem ruleEditor = createRuleEditor(nextRule, treeParent);
//	      
//	      // add kids
//	      for (Iterator<FASTMappingRule> kidsIter = nextRule.iteratorOfKids(); kidsIter.hasNext();)
//	      {
//	         FASTMappingRule kidRule = (FASTMappingRule) kidsIter.next();
//	         addRuleTree(kidRule, ruleEditor);
//	      }
//	   }
//
//	   private RulefieldsListener rulefieldListener = new RulefieldsListener();
//	   private TreeItem createRuleEditor(FASTMappingRule nextRule, TreeItem treeParent)
//	   {
//	      // "from" attribute
//	      // new SuggestBox
//	      TextBox fromBox = CTextChangeHandler.createWidthTextBox(nextRule, "3cm", "sourceTagname");
//	      
//	      // "kind" attribute
//	      MultiWordSuggestOracle oracle = new MultiWordSuggestOracle();
//	      ArrayList<String> words = new ArrayList<String>();
//	      
//	      words.add("createObject");
//	      //delete "dummy". In this extension, u can write x.y instead creating a dummy
//	      words.add("fillAttributes");
//	      
//	      for(String word : words)
//	        oracle.add(word);
//	         
//	      oracle.setDefaultSuggestionsFromText(words);
//	      SuggestBox kindBox = CTextChangeHandler.createWidthSuggestBox(nextRule, "3cm", "kind", oracle);
//	      
//	      // "target" attribute
//	      MultiWordSuggestOracle typeOracle = new MultiWordSuggestOracle();
//	      
//	      ServiceDesigner serviceDesigner = createDefaultTypeStructure();
//	      
//	      fillTypesOracle(nextRule, typeOracle, serviceDesigner);
//	      final SuggestBox targetBox = CTextChangeHandler.createWidthSuggestBox(nextRule, "3cm", "targetElemName", typeOracle);;
//	      targetBox.setValue(nextRule.getTargetElemName());
//	      targetBox.setWidth("3cm");
//
//	      Grid ruleRow = new Grid(1,3);
//	      ruleRow.setWidget(0, 0, fromBox);
//	      ruleRow.setWidget(0, 1, kindBox);
//	      ruleRow.setWidget(0, 2, targetBox);
//	      
//	      // add listeners for oracle relevant changes
//	      UpdateTargetBoxOracleHandler handler = new UpdateTargetBoxOracleHandler(nextRule, typeOracle, serviceDesigner);
//	      kindBox.addSelectionHandler(handler);
//	      
//	      if (treeParent != null)
//	      {
//	         Grid parentGrid = (Grid) treeParent.getWidget();
//	         if (parentGrid != null)
//	         {
//	            SuggestBox parentTargetBox = (SuggestBox) parentGrid.getWidget(0, 2); // the target box of the parent
//	            parentTargetBox.addSelectionHandler(handler);
//	         }
//	      }
//	      
//	      //adding a RulefieldsListener (and handler) to rule fields
//	      fromBox.addChangeHandler(rulefieldListener);
//	      kindBox.addSelectionHandler(rulefieldListener);
//	      targetBox.addSelectionHandler(rulefieldListener);
//	      
//	      //handles from - box changes
//	      fromBox.addValueChangeHandler(new ValueChangeHandler<String>()
//	      {
//	    	  @Override
//	    	  public void onValueChange(ValueChangeEvent<String> event)
//	    	  {
//	    		  updateExtendedFactsTree();
//	     	  }
//	      });
//	      
//	      TreeItem result = treeParent.addItem(ruleRow);
//	      result.setUserObject(nextRule);
//	      
//	      return result;
//	   }
//
//	   @SuppressWarnings("unchecked")
//	   private void fillTypesOracle(FASTMappingRule nextRule,
//	         MultiWordSuggestOracle typeOracle, ServiceDesigner serviceDesigner)
//	   {  
//	      // for create object rules add fact types to oracle
//	      ArrayList<String> types = new ArrayList<String>();
//	      String kind = nextRule.getKind();
//	      if ("createObject".equals(kind))
//	      {
//	         for (Iterator typeIter = serviceDesigner.iteratorOfFactTypes(); typeIter.hasNext();)
//	         {
//	            FactType factType = (FactType) typeIter.next();
//	            types.add(factType.getTypeName());
//	         }
//	      }
//	      else if ("fillAttributes".equals(kind))
//	      {
//	         // retrieve type of parent rule and add its attributes to the oracle
//	         FASTMappingRule parent = nextRule.getParent();
//	         String typeName = parent.getTargetElemName();
//	         FactType factType = findFactType(typeName);
//	         if(factType != null)
//	         {
//		         for (Iterator iter = factType.iteratorOfFactAttributes(); iter.hasNext();)
//		         {
//		            FactAttribute attr = (FactAttribute) iter.next();
//		            types.add(attr.getAttrName());
//		         } 
//	         }
//	      }
//	      
//	      for(String word : types)
//	         typeOracle.add(word);
//	               
//	      typeOracle.setDefaultSuggestionsFromText(types);
//	   }
//	   
//	   class UpdateTargetBoxOracleHandler implements SelectionHandler<Suggestion>
//	   {
//	      private FASTMappingRule rule;
//	      private MultiWordSuggestOracle oracle;
//	      private ServiceDesigner serviceDesigner;
//	      
//	      public UpdateTargetBoxOracleHandler(FASTMappingRule rule, MultiWordSuggestOracle oracle, ServiceDesigner serviceDesigner)
//	      {
//	         // this rule's kind or parent rule's target type has changed.
//	         // in case of a fillAttributes rule, the oracle for attr names needs to be changed. 
//	         this.oracle = oracle;
//	         this.rule = rule;
//	         this.serviceDesigner = serviceDesigner;
//	      }
//
//	      @Override
//	      public void onSelection(SelectionEvent<Suggestion> event)
//	      {
//	         // update oracle
//	         oracle.clear();
//	         fillTypesOracle(rule, oracle, serviceDesigner);
//	      }      
//	   }
//	    
//	   private ServiceDesigner tmpServiceDesigner = null;
//	   private FactType tmpFactType;
//	   private ServiceDesigner createDefaultTypeStructure()
//	   {
//	      tmpServiceDesigner = designer.serviceScreen.getServiceDesigner(); 
//	      if (tmpServiceDesigner == null)
//	      {
//	         tmpServiceDesigner = new ServiceDesigner().withScreens(designer.serviceScreen);
//	         addToFactTypes("List");
//	        
//	         addToFactTypes("Product");
//	         withNewFactAttr("productName");
//	         withNewFactAttr("shortName");
//	         withNewFactAttr("realyShort");
//	         withNewFactAttr("price");
//	         withNewFactAttr("uri");
//	         
//	         addToFactTypes("Person");
//	         withNewFactAttr("fullName");
//	         withNewFactAttr("address");
//	         
//	         addToFactTypes("Address");
//	         withNewFactAttr("street");
//	         withNewFactAttr("cipcode");
//	         withNewFactAttr("city");
//	         withNewFactAttr("country");
//	                  
//	         addToFactTypes("ShoppingCard");
//	      
//	         addToFactTypes("String");
//	         withNewFactAttr("value");
//	      }
//	      
//	      return tmpServiceDesigner;
//	   }
//	   
//	   private void withNewFactAttr(String string)
//	   {
//	      FactAttribute factAttribute = new FactAttribute()
//	                                    .withAttrName(string);
//	      tmpFactType.addToFactAttributes(factAttribute);
//	   }
//
//	   private void addToFactTypes(String string)
//	   {
//	      tmpFactType = new FactType()
//	                    .withTypeName(string);
//	      tmpServiceDesigner.addToFactTypes(tmpFactType);
//	   }
//
//	   @SuppressWarnings("unchecked")
//	   private FactType findFactType(String typeName)
//	   {
//	      FactType factType = null;
//	      for (Iterator iter = designer.serviceScreen.getServiceDesigner().iteratorOfFactTypes(); iter.hasNext();)
//	      {
//	         factType = (FactType) iter.next();
//	         if (factType.getTypeName().equals(typeName))
//	         {
//	            return factType;
//	         }
//	      }
//	      return null;
//	   }
//	   
//
//	   
//	   /**
//	    * This method should update the extended facts tree. To do this, it uses
//	    * the extended rules.
//	    * */
//	   public void updateExtendedFactsTree()
//	   {
//		   if(rootRule == null)
//		   {
//			   rootRule = new FASTMappingRule();
//		   }
//		   
//		   //set up exFactsTree and clear old parse values
//		   extendedFactsTree.clear();
//		   TreeItem rootItem = extendedFactsTree.addItem("Extended Facts:");
//		   
//		   transformAndParse(designer.requestHandler.xmlDoc, rootRule, rootItem);
//		   
//		   RuleUtil.expandTree(extendedFactsTree);
//	   }
//	   
//	   /**
//	    * This (recursive) method parse the from-textBox methods and updates the extendedFactsTree
//	    * and build up the new tree
//	    * */
//	   public void transformAndParse(Node xmlDocElement, FASTMappingRule rule, TreeItem treeItem)
//	   {
//	      if(RuleUtil.isCompleteRule(rule))
//	      {
//		      //create a handler for operations in the decoded fromField 
//	    	  opHandler = new OperationHandler(rule.getSourceTagname(), xmlDocElement); 
//	    	  
//	    	  TreeItem kidItem;
//	    	  
//	    	  String sourceTagname = opHandler.getLastSourceTagname();
//	    	  
//	    	  NodeList elements = RuleUtil.get_ElementsByTagname(xmlDocElement, sourceTagname);
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
//	        	  // create tag value pair for that attributes
//	        	  for (int i = 0; i < elements.getLength(); ++i)
//	        	  {  
//	        		  //execute operation
//	        		  String nodeValue = opHandler.executeOperations(i, xmlDocElement);
//
//	        		  kidItem = treeItem.addItem(targetElemName + " : " + nodeValue);
//	        	  }
//	          }
//
//	          //"dummy" calls transform(..) for all kids to jump over dummy tags
//	          else if(rule.getKind().equals("dummy"))
//	          {
//	             for (int i = 0; i < elements.getLength(); ++i)
//	             {
//	                callTransformForKids(elements.item(i), rule, treeItem);
//	             }
//	          }
//	      }
//	   }
//	   
//	   
//	   
//	   /**
//	    * Helps reuse the code. Call transformAndParse(..) for any kid
//	    * rule of the given rule.
//	   * */
//	   @SuppressWarnings("unchecked")
//	   private void callTransformForKids(Node xmlDocElement, FASTMappingRule rule, TreeItem treeItem)
//	   {
//		  if(rule.sizeOfKids() != 0)
//		  {
//		      	for (Iterator<FASTMappingRule> kidIter = rule.iteratorOfKids(); kidIter.hasNext();)
//		      	{
//		    	  	FASTMappingRule kid = (FASTMappingRule) kidIter.next();
//		         	transformAndParse(xmlDocElement, kid, treeItem);
//		      	}
//		  }
//	   }
//	   
//
//	   
//
//	   
//	   
//	   //Handler//
//
//	   /**
//	    * Handles changes in Rulefields
//	    * 
//	    * TODO take targetbox changes does not work
//	    * */
//	   class RulefieldsListener implements ChangeHandler, SelectionHandler<Suggestion>
//	   {    
//		   /**
//		    * This method is called when any of the Rule - Fields
//		    * changes.
//		    * It bind the changed Fieldname to the Facte - Tree.
//		    * */
//		   @Override
//		   public void onChange(ChangeEvent event)
//		   {
//			   updateExtendedFactsTree();
//		   }
//
//		   @Override
//		   public void onSelection(SelectionEvent<Suggestion> event)
//		   {
//			   updateExtendedFactsTree();
//		   }
//	   }
//	   
//	   class RulesTreeHandler implements SelectionHandler<TreeItem>
//	   {
//	      @Override
//	      public void onSelection(SelectionEvent<TreeItem> event)
//	      {
//	        // store selected rule
//	         TreeItem selectedItem = event.getSelectedItem();
//	         FASTMappingRule mappingRule = (FASTMappingRule) selectedItem.getUserObject();
//	         selectedRule = mappingRule;
//	      }
//	   }
//	   
//	   /**
//	    * Add a Kidrule - Handler
//	    * */
//	   class AddKidRuleHandler implements ClickHandler
//	   {
//	     @Override
//	     public void onClick(ClickEvent event)
//	     {
//	        FASTMappingRule newRule = new FASTMappingRule();
//	        newRule.setKind("createObject");
//	        
//	        TreeItem selectedItem = rulesTree.getSelectedItem();
//	        selectedRule.addToKids(newRule);
//	        createRuleEditor(newRule, selectedItem);
//	         
//			 updateExtendedFactsTree();
//	     }
//	   }
//	   
//	   /**
//	    * Remove a Rule - Handler
//	    * */
//	   class RemoveRuleHandler implements ClickHandler
//	   {
//			@Override
//			public void onClick(ClickEvent event)
//			{
//				TreeItem selectedItem = rulesTree.getSelectedItem();
//				
//				//if the rule has no parent rule, do nothing (one rule has to remain)
//				if(RuleUtil.isNotNullOrRoot(selectedItem))
//				{
//					//the node has subrules, add them to the parent
//					if(selectedItem.getChildCount() > 0)
//					{	
//						
//						FASTMappingRule parent = selectedRule.getParent();
//						
//						for(int count = selectedItem.getChildCount()-1; count >= 0; --count)
//						{
//							selectedItem.getParentItem().addItem(selectedItem.getChild(count));
//							selectedItem.removeItem(selectedItem.getChild(count));
//							
//							parent.addToKids(selectedRule.getFromKids(count));
//						}
//					}
//					
//					//deleting selected item/rule
//					selectedItem.remove();
//					selectedRule.removeYou();
//					
//					rulesTree = createRulesTree();
//				}
//				
//				 updateExtendedFactsTree();
//			}
//	   }
//	   
//	   /**
//	    * Rule up - Handler
//	    * */
//	   class RuleUpHandler implements ClickHandler
//	   {
//			@Override
//			public void onClick(ClickEvent event)
//			{
//				TreeItem upItem = rulesTree.getSelectedItem();
//				
//				if(RuleUtil.isNotNullOrRoot(upItem))
//				{
//					TreeItem parent = upItem.getParentItem(); 
//					int index = parent.getChildIndex(upItem); 
//						
//					if(index != 0)
//					{
//						//move rule
//						FASTMappingRule parentRule = selectedRule.getParent();
//						FASTMappingRule beforeRule = parentRule.getPreviousOfKids(selectedRule);
//					    parentRule.addBeforeOfKids(beforeRule, selectedRule);
//					    
//					    rulesTree = createRulesTree();
//					}
//					else
//					{
//						//maybe call ruleLeft
//					}
//				}
//				
//				 updateExtendedFactsTree();
//			}
//	   }
//	   
//	   /**
//	    * Rule down - Handler
//	    * */
//	   class RuleDownHandler implements ClickHandler
//	   {
//			@Override
//			public void onClick(ClickEvent event)
//			{
//				TreeItem downItem = rulesTree.getSelectedItem();
//				
//				if(RuleUtil.isNotNullOrRoot(downItem))
//				{
//					TreeItem parent = downItem.getParentItem(); 
//					int index = parent.getChildIndex(downItem); 
//					int childCount = parent.getChildCount();
//						
//					if(index < (childCount-1))
//					{
//						//move rule
//						FASTMappingRule parentRule = selectedRule.getParent();
//					    parentRule.addAfterOfKids(selectedRule, selectedRule);
//					    
//					    rulesTree = createRulesTree();
//					}
//				}
//				
//				 updateExtendedFactsTree();
//			}
//	   }
//	   
//	   /**
//	    * Rule left - Handler
//	    * */
//	   class RuleLeftHandler implements ClickHandler
//	   {
//			@Override
//			public void onClick(ClickEvent event)
//			{
//				TreeItem leftItem = rulesTree.getSelectedItem();
//				
//				if(RuleUtil.isNotNullOrRoot(leftItem) && 
//				   RuleUtil.isNotNullOrRoot(leftItem.getParentItem()))
//				{
//					FASTMappingRule parent = selectedRule.getParent();
//					
//					FASTMappingRule addRuleHere = parent.getParent();
//					
//					addRuleHere.addBeforeOfKids(parent, selectedRule);
//					rulesTree = createRulesTree();
//				}
//				
//				 updateExtendedFactsTree();
//			}
//	   }
//	   
//	   /**
//	    * Rule right - Handler
//	    * */
//	   class RuleRightHandler implements ClickHandler
//	   {
//			@Override
//			public void onClick(ClickEvent event)
//			{
//				TreeItem rightItem = rulesTree.getSelectedItem();
//				
//				if(RuleUtil.isNotNullOrRoot(rightItem))
//				{
//					FASTMappingRule parentRule = selectedRule.getParent();
//					FASTMappingRule intoRule = parentRule.getNextOfKids(selectedRule);
//					intoRule.addToKids(0, selectedRule);
//					rulesTree = createRulesTree();
//				}
//				
//				 updateExtendedFactsTree();
//			}
//	   }
//	   
//	   /**
//	    * Handles the xml tree (Selection and PropChange)
//	    * */
//	   class XmlTreeHandler implements SelectionHandler<TreeItem>
//	   {
//	      @Override
//	      public void onSelection(SelectionEvent<TreeItem> event)
//	      {
//	         // print selected element in rule area
//	         TreeItem selectedItem = event.getSelectedItem();
//	         String text = selectedItem.getText();
//	         
//	         // try to find corresponding xmlDoc element
//	         String tagName = text.split(":")[0].trim();
//	         
//	         if(selectedRule != null)
//	         {
//	             // transfer tagName to the currently selected mapping rule. 
//	             selectedRule.setSourceTagname(tagName);
//	         }
//	      }
//	   }
//}