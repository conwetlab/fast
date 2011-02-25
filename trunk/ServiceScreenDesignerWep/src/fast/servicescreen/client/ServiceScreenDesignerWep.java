/**
 * Copyright (c) 2008-2011, FAST Consortium
 * 
 * This file is part of FAST Platform.
 * 
 * FAST Platform is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * FAST Platform is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with FAST Platform. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Info about members and contributors of the FAST Consortium
 * is available at http://fast.morfeo-project.eu
 *
 **/
package fast.servicescreen.client;

import java.util.Iterator;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.RootPanel;
import com.google.gwt.user.client.ui.TabPanel;
import com.google.gwt.user.client.ui.TextArea;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.user.client.ui.FlexTable.FlexCellFormatter;

import de.uni_kassel.webcoobra.client.CoobraRoot;
import de.uni_kassel.webcoobra.client.CoobraService;
import de.uni_kassel.webcoobra.client.DataLoadTimer;
import fast.common.client.FactPort;
import fast.common.client.ServiceDesigner;
import fast.common.client.ServiceScreen;
import fast.common.client.ServiceScreenModel;
import fast.common.client.ServiceWrapperOverviewTab;
import fast.mediation.client.gui.MediationRuleGUI;
import fast.servicescreen.client.gui.CTextChangeHandler;
import fast.servicescreen.client.gui.PortGUI;
import fast.servicescreen.client.gui.RequestGUI;
import fast.servicescreen.client.gui.RuleGUI;
import fast.servicescreen.client.gui.TabWidget;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer.WrappingType;
import fast.servicescreen.client.rpc.SendRequestHandler;
import fujaba.web.runtime.client.FAction;
import fujaba.web.runtime.client.FTest;
import fujaba.web.runtime.client.ICObject;

/**
 * Entry point classes define <code>onModuleLoad()</code>.
 */
public class ServiceScreenDesignerWep extends FastTool implements EntryPoint
{
	public ServiceDesigner designer;
	
	public ServiceDesigner getDesigner()
	{
		return designer;
	}

	public void setDesigner(ServiceDesigner designer)
	{
		this.designer = designer;
	}

	public ServiceScreen serviceScreen;

	public ServiceScreen getServiceScreen() 
	{
		return serviceScreen;
	}

	public void setServiceScreen(ServiceScreen serviceScreen) 
	{
		if (this.serviceScreen != serviceScreen)
		{
			this.serviceScreen = serviceScreen;
			rebuildOtherTabs();
		}
	}

	/**
	 * This is the entry point method.
    */
   public void onModuleLoad()
   {
      FTest.init(false);
      FTest.assertTrue(true, "entry point has been reached");

      // build action graph
      initFActions();
      
      // run actions
      openAction.doAction();
      System.out.println();
   }

   public void initFActions()
   {
      openAction = new OpenFAction();
      initAction = new InitAction();
      buildAction = new BuildAction();
      testServiceRequestAction = new TestServiceRequestAction();
      
      openAction.setToSuccess(initAction);
      initAction.setToSuccess(buildAction);
      buildAction.setToSuccess(testServiceRequestAction);
   }

   public OpenFAction openAction;

   class OpenFAction extends FAction
   {
      @SuppressWarnings("unchecked")
	  @Override
      public void doAction()
      {
         CoobraService.Util.getDefault().openSession("login", "pass2", "ServiceScreenRepository.cdr", this);
      }
   }

   public InitAction initAction;
   class InitAction extends FAction
   {
      @Override
      public void doAction()
      {
         // Store session id 
         String result = (String) this.resultValue;
         CoobraRoot.get();
         CoobraRoot.setSessionId(result);
         
         // init data polling
         ServiceScreenModel servicemodel = new ServiceScreenModel();
         servicemodel.registerModelRoot();
         // fujaba.web.runtime.client.ModelRoot.addEventListener(servicemodel);
         DataLoadTimer.get().sessionId = result;
         DataLoadTimer.get().run(buildAction, null);
      }
   }

   public BuildAction buildAction;
   private TextBox nameTextBox;
   private PortGUI portGUI;
   public RequestGUI requestGui;
   public TextBox templateBox;
   public TextArea resultText;
   public TextBox requestUrlBox;
   public Button requestButton;
   public RuleGUI ruleGUI;
   public SendRequestHandler requestHandler;
   private TestServiceRequestAction testServiceRequestAction;
   public TabPanel tabPanel;
   
   //Panles which changes in runtime
   private Widget codeGenViewer_Panel;
   private Widget ruleGUI_Panel;
   FlexTable transformationTable;
   
   class BuildAction extends FAction
   {
      @SuppressWarnings({ "deprecation", "unchecked" })
      @Override
      public void doAction()
      {
         CoobraRoot.get().setAutoLoadData(true);
         CoobraRoot.get().setSendBufferTimeout(500);
         CoobraRoot.get().setEnableSendBuffer(false);
         
         // CoobraService.Util.getInstance().init(servicemodel, this);
         
         // if there has been no data loaded, create an inital ServiceScreen
         Iterator<ICObject> iter = CoobraRoot.get().iteratorOfICObjects();
         while (iter.hasNext())
         {
            Object obj = iter.next();
            if (obj instanceof ServiceDesigner)
            {
               designer = (ServiceDesigner) obj;
               break;
            }
         }

         if (designer == null)
         {
        	 designer = new ServiceDesigner();
         }
         
         Iterator iteratorOfScreens = designer.iteratorOfScreens();
         if (iteratorOfScreens.hasNext())
         {
        	 serviceScreen = (ServiceScreen) iteratorOfScreens.next();
         }
         else
         {
        	 serviceScreen = new ServiceScreen();
        	 designer.addToScreens(serviceScreen);
         }
         
         buildGUI();
         
         // in case of testing 
         if (getToSuccess() != null)
         {
            getToSuccess().doAction();
         }
         
      }
   }

   class TestServiceRequestAction extends FAction
   {

      @Override
      public void doAction()
      {
//         System.out.println("now ready to start testing ...");
         
         // fill potentially empty fields
         String value = nameTextBox.getValue();
         if (value == null || "".equals(value))
         {
            nameTextBox.setValue("Ebay Wrapper");
         }
         
         if (serviceScreen.sizeOfPreconditions() == 0)
         {
            FactPort factPort = new FactPort();
            factPort.setName("query_keywords");
            factPort.setExampleValue("Notebook");
            serviceScreen.addToPreconditions(factPort);
         }
         
         String templateText = templateBox.getValue();
         if (templateText == null || "".equals(templateText))
         {
            templateBox.setValue(URL_Settings.getTemplateBox_ExampleURL());
         }
         

         // xmldoc should still be null        
//         FTest.assertTrue(requestHandler.xmlDoc == null, "xmldoc should be null is: " + requestHandler.xmlDoc);
         
//         requestButton.click();
         
         // result tree should not be empty
//         FTest.assertTrue(ruleGUI.xmlTree != null, "xmltree should have been created, text size is: " + ruleGUI.xmlTree.toString().length());
         
         // the facts tree should contain elements
//         int itemCount = ruleGUI.factsTree.toString().length();
//         FTest.assertTrue(itemCount > 3, "Facts tree contains some items, text lenght is: " + itemCount);
         
//         FTest.assertTrue(true, "init done");          
      }

   }

   public void buildGUI()
   {
      /**
       * panel containing the designer-gui
       * */
      RootPanel rootPanel = RootPanel.get();
      
      tabPanel = new TabPanel();
      tabPanel.setStyleName("fastTabPanel");
      tabPanel.setWidth("1300px");
      
      // build overview panel
      ServiceWrapperOverviewTab serviceWrapperOverviewTab = new ServiceWrapperOverviewTab();
      serviceWrapperOverviewTab.start(this, tabPanel);
      
      rebuildOtherTabs();
      //tabPanel.setStyleName("myPanel");
      
      rootPanel.add(tabPanel);
   }

   private void rebuildOtherTabs() 
   {
	  // remove old tabs
	   int widgetCount = tabPanel.getWidgetCount();
	   while (widgetCount > 1)
	   {
		   tabPanel.remove(widgetCount-1);
		   widgetCount = tabPanel.getWidgetCount();
	   }

	  // general tab
	  FlexTable generalInformationTable = new FlexTable();
	  FlexCellFormatter generalInfoFormatter = generalInformationTable.getFlexCellFormatter();
      generalInformationTable.addStyleName("cw-FlexTable");
      generalInformationTable.setWidth("32em");
      generalInformationTable.setCellSpacing(5);
      generalInformationTable.setCellPadding(3);
      generalInfoFormatter.setHorizontalAlignment(0, 1, HasHorizontalAlignment.ALIGN_LEFT);
      generalInfoFormatter.setColSpan(0, 0, 2);
      
      int rowCount = generalInformationTable.getRowCount();
      
      // add story board hint
      Label hintLabel;
      hintLabel = new Label("Step 1: define how this resource is connected to other building blocks.");
      generalInformationTable.setWidget(rowCount, 0, hintLabel);
      rowCount++;
      
      // add label and nameTextBox
      Label nameLabel = new Label("Give this resource a name:");
      generalInformationTable.setWidget(rowCount, 0, nameLabel);
      rowCount++;
      nameTextBox = CTextChangeHandler.createTextBox(serviceScreen, "name");
      generalInformationTable.setWidget(rowCount, 0, nameTextBox);
      rowCount++;

      // add input ports to general info with short example value
      portGUI = new PortGUI(serviceScreen, false);
      Widget inputPortTable = portGUI.createInputPortTable();
      generalInformationTable.setWidget(rowCount, 0, inputPortTable);
      rowCount++;
      
      // add output ports to general info
      portGUI = new PortGUI(serviceScreen, false);
      Widget outputPortTable = portGUI.createOutputPortTable();
      generalInformationTable.setWidget(rowCount, 0, outputPortTable);
      rowCount++;
      
      // add general tab 
      tabPanel.add(generalInformationTable, "General");
      //tabPanel.add(generalInformationTable, "<div>General</div>");
      tabPanel.add(generalInformationTable, new TabWidget("General"));
      
      // add request tab
      requestGui = new RequestGUI(this);
      Widget requestTable = requestGui.createRequestTable();
      tabPanel.add(requestTable, new TabWidget("Request"));
      //tabPanel.add(requestTable, "Request");
      
      // transformation tab
      transformationTable = new FlexTable();
      FlexCellFormatter transformationTableCellFormatter = transformationTable.getFlexCellFormatter();
      transformationTable.addStyleName("cw-FlexTable");
      transformationTable.setWidth("32em");
      transformationTable.setCellSpacing(5);
      transformationTable.setCellPadding(3);
      transformationTableCellFormatter.setHorizontalAlignment(0, 1, HasHorizontalAlignment.ALIGN_LEFT);
      transformationTableCellFormatter.setColSpan(0, 0, 2);

      int numRows = transformationTable.getRowCount();
      
      // Add translationtable
      ruleGUI = new RuleGUI(serviceScreen, requestHandler);
      ruleGUI_Panel = ruleGUI.createTranslationTable();
      transformationTable.setWidget(numRows, 1, ruleGUI_Panel);

      transformationTable.ensureDebugId("cwFlexTable");
      
      // Add into tabpanel
      //tabPanel.add(transformationTable, "Transformation");
      tabPanel.add(transformationTable, new TabWidget("Transformation"));
 
      // Add the Codegenerator and it´s UI (for XML at first)
      codeGenViewer = new CodeGenViewer(this, WrappingType.WRAP_AND_REQUEST_XML);
      codeGenViewer_Panel = codeGenViewer.createCodeGenViewer();
      
      //tabPanel.add(codeGenViewer_Panel, "CodeGen Viewer"); 
      tabPanel.add(codeGenViewer_Panel, new TabWidget("CodeGen Viewer"));
   }

   public void setCodeGenViewer(CodeGenViewer viewer)
   {
	   if(viewer != null && viewer != codeGenViewer)
	   {
		   tabPanel.remove(codeGenViewer_Panel);
		   
		   codeGenViewer = viewer;
		   codeGenViewer_Panel = codeGenViewer.createCodeGenViewer();
		   
		   tabPanel.add(codeGenViewer_Panel, new TabWidget("CodeGen Viewer"));
	   }
   }

   /**
    * Change of Rule GUI for XML or even JSON.
    * Accept Wrap_AND_REQUEST_JSON and Wrap_AND_REQUEST_XML. 
    * */
   public void setRuleGUI_byType(WrappingType type)
   {
	   switch(type)
	   {
	   	case WRAP_AND_REQUEST_JSON: 
	   								if(mediationGUI_tmp == null)
	   								{
	   									//create new mediationGUI
	   									mediationGUI_tmp = new MediationRuleGUI(WrappingType.WRAP_AND_REQUEST_JSON, serviceScreen, requestHandler);
	   									setRuleGUI(mediationGUI_tmp);
	   								}
	   								else
	   								{
	   									//set up last mediationGUI
	   									setRuleGUI(mediationGUI_tmp);
	   								}
	   								
	   								break;
	   								
	   	case WRAP_AND_REQUEST_XML:  if(ruleGUI_tmp == null)
									{
	   									//create new ruleGUI 
										ruleGUI_tmp = new RuleGUI(serviceScreen, requestHandler);
										setRuleGUI(ruleGUI_tmp);
									}
									else
									{
										//setup last ruleGUI
										setRuleGUI(ruleGUI_tmp);
									}
			
									break;
	   }
	   
   }
   
   /**
    * To switch RuleTab between JSON and XML handling.
    * Accept RuleGUI and MediationGUI as input.
    * */
   RuleGUI ruleGUI_tmp = null;
   MediationRuleGUI mediationGUI_tmp = null;
   protected void setRuleGUI(RuleGUI ruleGUI)
   {
	   if(ruleGUI != null && this.ruleGUI != ruleGUI)
	   { 	
		   tabPanel.remove(transformationTable);
		   tabPanel.remove(ruleGUI_Panel);
		   
		   ruleGUI_Panel = ruleGUI.createTranslationTable();
		   this.ruleGUI = ruleGUI;
		   
		   tabPanel.add(ruleGUI_Panel, new TabWidget("Transformation"));
	   }
   }
   
   /**
    * Returns the Sendrequesthandler from this designer
    * */
   public SendRequestHandler getRequestHandler()
   {
	   return this.requestHandler;
   }

   public void setResultText(TextArea resultText)
   {
      this.resultText = resultText;
   }

   public TextArea getResultText()
   {
      return resultText;
   }
}