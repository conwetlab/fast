package fast.servicescreen.client;

import java.util.Iterator;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.json.client.JSONValue;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.ui.Anchor;
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
import fast.servicescreen.client.gui.CTextChangeHandler;
import fast.servicescreen.client.gui.PortGUI;
import fast.servicescreen.client.gui.RequestGUI;
import fast.servicescreen.client.gui.RuleGUI;
import fast.servicescreen.client.gui.SaveLoadJsonHandler;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer;
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
	public ServiceDesigner getDesigner() {
		return designer;
	}

	public void setDesigner(ServiceDesigner designer) {
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
      FTest.init();
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
         CoobraService.Util.getDefault().openSession("login", "pass2",
               "ServiceScreenRepository.cdr", this);
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
   private JSONValue savedJson;
private TabPanel tabPanel;
   
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
            templateBox.setValue("http://open.api.sandbox.ebay.com/shopping?appid=KasselUn-efea-4b93-9505-5dc2ef1ceecd&version=517&callname=FindItems&ItemSort=EndTime&QueryKeywords=<query_keywords>&responseencoding=XML");
         }
         

         // xmldoc should still be null        
//         FTest.assertTrue(requestHandler.xmlDoc == null, "xmldoc should be null is: " + requestHandler.xmlDoc);
         
         requestButton.click();
         
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
      /*
       * panel containing the designer-gui
       * */
      RootPanel rootPanel = RootPanel.get();
      
      tabPanel = new TabPanel();
      
      
      // build overview panel
      ServiceWrapperOverviewTab serviceWrapperOverviewTab = new ServiceWrapperOverviewTab();
      serviceWrapperOverviewTab.start(this, tabPanel);
      
      rebuildOtherTabs();
      
      
      rootPanel.add(tabPanel);
      
      // add link to fact tool 
      String factToolURL = "./" + "FactTool.html";
      Anchor a = new Anchor(factToolURL, factToolURL, "_blank");
      rootPanel.add(a);
      
      // add link to data transformation tool 
      String dataTransformationToolURL = "./" + "DataTransformationTool.html";
      a = new Anchor(dataTransformationToolURL, dataTransformationToolURL);
      rootPanel.add(a);
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
      
      // add label and nameTextBox
      Label nameLabel = new Label("Name:");
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
      
      // add save and load buttons
      Button saveJsonButton = new Button("Save Wrapper");
      saveJsonButton.addClickHandler(new ClickHandler() {
    	  @Override
    	  public void onClick(ClickEvent event) {
    		  //TODO save json
    		  SaveLoadJsonHandler handler = new SaveLoadJsonHandler(ServiceScreenDesignerWep.this);
    		  savedJson = handler.saveJson();
    		  Window.alert(savedJson.toString());
    	  }
      });
      generalInformationTable.setWidget(rowCount, 0, saveJsonButton);
      Button loadJsonButton = new Button("Load Wrapper");
      loadJsonButton.addClickHandler(new ClickHandler() {
    	  @Override
    	  public void onClick(ClickEvent event) {
    		  //TODO load json
    		  SaveLoadJsonHandler handler = new SaveLoadJsonHandler(ServiceScreenDesignerWep.this);
    		  handler.loadJson(savedJson);
    	  }
      });
      generalInformationTable.setWidget(rowCount, 1, loadJsonButton);
      rowCount++;
      
      // add general tab 
      tabPanel.add(generalInformationTable, "General");
      
      // add request tab
      requestGui = new RequestGUI(this);
      Widget requestTable = requestGui.createRequestTable();
      tabPanel.add(requestTable, "Request");
      
      // transformation tab
      FlexTable transformationTable = new FlexTable();
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
      transformationTable.setWidget(numRows, 1, ruleGUI.createTranslationTable());

      transformationTable.ensureDebugId("cwFlexTable");
      
      // Add into tabpanel
      tabPanel.add(transformationTable, "Transformation");
 
      //Adding part three, just to test code generation, there is a show of selected rules, templates and the .js results
      codeGenViewer = new CodeGenViewer(serviceScreen, false/*false = type is XML*/);
      tabPanel.add(codeGenViewer.createCodeGenViewer(), "CodeGen Viewer");
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