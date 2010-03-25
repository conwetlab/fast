package fast.mediation.client;

import java.util.Iterator;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.FlowPanel;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.RootPanel;
import com.google.gwt.user.client.ui.TabPanel;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.VerticalPanel;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.user.client.ui.FlexTable.FlexCellFormatter;

import de.uni_kassel.webcoobra.client.CoobraRoot;
import de.uni_kassel.webcoobra.client.CoobraService;
import de.uni_kassel.webcoobra.client.DataLoadTimer;
import fast.common.client.ServiceDesigner;
import fast.common.client.ServiceScreenModel;
import fast.common.client.TrafoOperator;
import fast.mediation.client.gui.MediationRuleGUI;
import fast.servicescreen.client.FastTool;
import fast.servicescreen.client.gui.CTextChangeHandler;
import fast.servicescreen.client.gui.PortGUI;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer;
import fast.servicescreen.client.rpc.SendRequestHandler;
import fujaba.web.runtime.client.FAction;
import fujaba.web.runtime.client.FTest;
import fujaba.web.runtime.client.ICObject;

public class DataTransformationTool extends FastTool implements EntryPoint 
{

	@Override
	public void onModuleLoad() 
	{
		FTest.init();
		FTest.assertTrue(true, "entry point has been reached");

		// build action graph
		initFActions(); 
		openAction.doAction();
	}
	public void initFActions()
	{
		openAction = new OpenFAction();
		initAction = new InitAction();
		buildAction = new BuildAction();

		openAction.setToSuccess(initAction);
		initAction.setToSuccess(buildAction);

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
			DataLoadTimer.get().run(buildAction, null);

		}
	}

	public BuildAction buildAction;
	public ServiceDesigner designer = null;
	public TrafoOperator trafoOperator = null;
	public SendRequestHandler requestHandler;
	   
	class BuildAction extends FAction
	{
		@SuppressWarnings("unchecked")
		@Override
		public void doAction()
		{
			CoobraRoot.get().setAutoLoadData(true);
			CoobraRoot.get().setSendBufferTimeout(500);
			CoobraRoot.get().setEnableSendBuffer(true);

			// find root model element here
			Iterator<ICObject> iter = CoobraRoot.get().iteratorOfSharedObjects();
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
			
			Iterator iteratorOfTrafoOperators = designer.iteratorOfTrafoOperators();
			if (iteratorOfTrafoOperators.hasNext())
			{
				trafoOperator = (TrafoOperator) iteratorOfTrafoOperators.next();
			}

			// if there has been no data loaded, create an inital trafoOperator
			if (trafoOperator == null)
			{
				trafoOperator = new TrafoOperator();
				designer.addToTrafoOperators(trafoOperator);
				trafoOperator.setName("new Operator");
			}

			buildGUI();

		}
	}


	// GUI elements
	private TextBox nameTextBox;
	private PortGUI portGUI;
	public MediationRuleGUI ruleGUI;
	      

	public void buildGUI()
	{
	    FTest.assertTrue(true, "buildGUI has been reached");

		rootPanel = RootPanel.get();

		tabPanel = new TabPanel();
		tabPanel.setWidth("900px");
		
		
		overviewFlowPanel = new FlowPanel();
		overviewFlowPanel.setWidth("895px");
		addTrafoOpHandler = new AddTrafoOpHandler();
		trafoOpListener = new TrafoOpListener();
		trafoOpSelectionHandler = new TrafoOpSelectionHandler();
		
		refreshOverviewPanel();
		
		designer.addPropertyChangeListener(ServiceDesigner.PROPERTY_TRAFO_OPERATORS, trafoOpListener);
		
		tabPanel.add(overviewFlowPanel, "Overview");
		tabPanel.selectTab(0);

		rebuildOperatorTabs();
	}
	
	
	private void rebuildOperatorTabs() 
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
		nameTextBox = CTextChangeHandler.createTextBox(trafoOperator, "name");
		generalInformationTable.setWidget(rowCount, 0, nameTextBox);
		rowCount++;

		// add form for input fact
		portGUI = new PortGUI(trafoOperator);
		Widget inputPortTable = portGUI.createInputPortTable();
		generalInformationTable.setWidget(rowCount, 0, inputPortTable);
		rowCount++;
		
		// add form for output fact
		portGUI = new PortGUI(trafoOperator);
		Widget outputPortTable = portGUI.createOutputPortTable();
		generalInformationTable.setWidget(rowCount, 0, outputPortTable);
		rowCount++;

		// add to tab panel
		tabPanel.add(generalInformationTable, "General");
		

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
		
		// Add rule GUI
		ruleGUI = new MediationRuleGUI(trafoOperator, requestHandler);
		transformationTable.setWidget(numRows, 1, ruleGUI.createJsonTranslationTable());
		
		transformationTable.ensureDebugId("cwFlexTable");
	     
		tabPanel.add(transformationTable, "exTransformation");
		 
		
		//Adding part three, just to test code generation, there is a show of selected rules, templates and the .js results
		codeGenViewer = new CodeGenViewer(trafoOperator); 
		tabPanel.add(codeGenViewer.createCodeGenViewer(), "CodeGen Viewer");


		// add tabPanel to root
		rootPanel.add(tabPanel);
		System.out.println("Tab panel has been added to root " + tabPanel);
	}
	
	public void refreshOverviewPanel() 
	{
		overviewFlowPanel.clear();
		// add operator panels
		for (TrafoOperator trafoOp : designer.getTrafoOperators()) 
		{
			VerticalPanel verticalPanel = new VerticalPanel();
			Image image = new Image ("images/DataTransformationOperatorIcon.png");
			verticalPanel.add(image);
			Label label = new Label(trafoOp.getName());
			verticalPanel.add(label);
			if (trafoOp == trafoOperator)
			{
				verticalPanel.setBorderWidth(3);
			}
			TrafoOpSelectionHandler selectHandler = new TrafoOpSelectionHandler();
			selectHandler.myOp = trafoOp;
			image.addClickHandler(selectHandler);
			overviewFlowPanel.add(verticalPanel);
			
			TrafoOpNameListener trafoOpNameListener = new TrafoOpNameListener();
			trafoOpNameListener.myLabel = label;
			trafoOp.addPropertyChangeListener(TrafoOperator.PROPERTY_NAME, trafoOpNameListener);
		}
		
		// add add button
		Button button = new Button("add");
		button.addClickHandler(addTrafoOpHandler);
		overviewFlowPanel.add(button);
	}
	
	public AddTrafoOpHandler addTrafoOpHandler;
	public FlowPanel overviewFlowPanel;
	class AddTrafoOpHandler extends FAction
	{
		@Override
		public void doAction()
		{
			TrafoOperator newOp = new TrafoOperator();
			newOp.setName("new Operator");
			designer.addToTrafoOperators(newOp);
		}
	}
	
	TrafoOpListener trafoOpListener;
	class TrafoOpListener extends FAction
	{
		@Override
		public void doAction()
		{
			System.out.println("trafo op list has changed");
			refreshOverviewPanel();
		}
	}
	
	TrafoOpSelectionHandler trafoOpSelectionHandler;
	public RootPanel rootPanel;
	public TabPanel tabPanel;
	class TrafoOpSelectionHandler extends FAction
	{
		public TrafoOperator myOp;
		
		@Override
		public void doAction()
		{
			trafoOperator = myOp;
			refreshOverviewPanel();
			rebuildOperatorTabs();
		}
	}

	class TrafoOpNameListener extends FAction
	{
		public Label myLabel;
		
		@Override
		public void doAction()
		{
			TrafoOperator myOp = (TrafoOperator) propertyEvent.getSource();
			myLabel.setText(myOp.getName());
		}		
	}
}
