package fast.mediation.client;

import java.util.Iterator;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.RootPanel;
import com.google.gwt.user.client.ui.TabPanel;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.user.client.ui.FlexTable.FlexCellFormatter;

import de.uni_kassel.webcoobra.client.CoobraRoot;
import de.uni_kassel.webcoobra.client.CoobraService;
import de.uni_kassel.webcoobra.client.DataLoadTimer;
import fast.common.client.ServiceScreenModel;
import fast.common.client.TrafoOperator;
import fast.servicescreen.client.gui.CTextChangeHandler;
import fast.servicescreen.client.gui.PortGUI;
import fast.servicescreen.client.gui.RuleGUI;
import fast.servicescreen.client.rpc.SendRequestHandler;
import fujaba.web.runtime.client.FAction;
import fujaba.web.runtime.client.FTest;
import fujaba.web.runtime.client.ICObject;

public class DataTransformationTool implements EntryPoint 
{

	@Override
	public void onModuleLoad() 
	{
		RootPanel root = RootPanel.get();

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
	public TrafoOperator trafoOperator = null;
	public SendRequestHandler requestHandler;
	   
	class BuildAction extends FAction
	{
		@SuppressWarnings("deprecation")
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
				if (obj instanceof TrafoOperator)
				{
					trafoOperator = (TrafoOperator) obj;
					break;
				}
			}

			// if there has been no data loaded, create an inital ServiceScreen
			if (trafoOperator == null)
			{
				trafoOperator = new TrafoOperator();
			}

			buildGUI();

		}
	}


	// GUI elements
	private TextBox nameTextBox;
	private PortGUI portGUI;
	public RuleGUI ruleGUI;
	      

	public void buildGUI()
	{
	    FTest.assertTrue(true, "buildGUI has been reached");

		/*
		 * panel containing the designer-gui
		 * */
		RootPanel rootPanel = RootPanel.get();

		// tabPanel contains the design steps
		TabPanel tabPanel = new TabPanel();

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

		FTest.assertTrue(nameTextBox.getText().equals("CustomerToPerson"), "Transformation operator Customer2Person found");
		
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
		tabPanel.selectTab(0);


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
		ruleGUI = new RuleGUI(trafoOperator, requestHandler);
		transformationTable.setWidget(numRows, 1, ruleGUI.createTranslationTable());
		
		transformationTable.ensureDebugId("cwFlexTable");
	     
		tabPanel.add(transformationTable, "exTransformation");
		 

		// add tabPanel to root
		rootPanel.add(tabPanel);
	}
}
