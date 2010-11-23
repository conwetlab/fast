package fast.servicescreen.client.gui;

import java.util.Iterator;

import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.SuggestBox;
import com.google.gwt.user.client.ui.TextArea;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.VerticalPanel;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.user.client.ui.HTMLTable.Cell;

import fast.common.client.BuildingBlock;
import fast.common.client.FactPort;
import fast.common.client.FastButton;
import fast.common.client.ServiceDesigner;
import fast.mediation.client.DataTransformationTool;
import fast.servicescreen.client.FastTool;
import fujaba.web.runtime.client.PropertyChangeEvent;
import fujaba.web.runtime.client.PropertyChangeListener;

public class PortGUI
{
	public PortGUI(BuildingBlock buildingBlock, boolean longExampleValues)
	{
		this.buildingBlock = buildingBlock;
		this.longExampleValues = longExampleValues;
	}

	public PortGUI(FastTool fastTool, BuildingBlock buildingBlock, boolean longExampleValues)
	{
		this.fastTool = fastTool;
		this.buildingBlock = buildingBlock;
		this.longExampleValues = longExampleValues;
	}

	private FastTool fastTool;
	private BuildingBlock buildingBlock;
	private boolean longExampleValues;
	public FlexTable inputPortTable;
	public FlexTable outputPortTable;
	private VerticalPanel portPanel;

	@SuppressWarnings("unchecked")
	public Widget createInputPortTable()
	{
		portPanel = new VerticalPanel();

		Label hintLabel = new Label("Define the preconditions where previous building blocks may provide data:");

		portPanel.add(hintLabel);

		inputPortTable = new FlexTable();

		int numRows = inputPortTable.getRowCount();

		// add the add-buttons
		// Add new input port Button
		Button addInputPortButton = new FastButton("Add precondition");
		addInputPortButton.addClickHandler(new AddNewInputPortHandler());
		inputPortTable.setWidget(numRows, 0, addInputPortButton);
		numRows++;

		// add input header row
		inputPortTable.setWidget(numRows, 0, new Label("Precondition name:"));
		inputPortTable.setWidget(numRows, 1, new Label("Precondition type:"));
		if(longExampleValues)
		{
			inputPortTable.setWidget(numRows, 2, new Label("List of example values"));
		}
		else
		{
			inputPortTable.setWidget(numRows, 2, new Label("Example value:"));
		}
		numRows++;

		// add rows for existing input fact ports
		Iterator<FactPort> iteratorOfPreconditions = buildingBlock.iteratorOfPreconditions();
		while (iteratorOfPreconditions.hasNext())
		{
			FactPort factPort = iteratorOfPreconditions.next();

			// per fact port add one row with three text boxes for name, type, and example value
			createInputTableRowFor(factPort);
		}

		// return the panel
		inputPortTable.ensureDebugId("cwFlexTable");
		
		portPanel.add(inputPortTable);
		
		return portPanel;
	}

	private void createInputTableRowFor(FactPort factPort)
	{
		if (longExampleValues)
		{
			TextBox nameBox = CTextChangeHandler.createTextBox(factPort, "name");
			SuggestBox typeBox = CTextChangeHandler.createTypeSuggestBox((ServiceDesigner)factPort.getServiceScreen().get("serviceDesigner"), factPort, "factType");
			TextArea exampleArea = CTextChangeHandler.createTextArea(factPort, "10cm", "8cm", "exampleValue");

			int inputNumRows = inputPortTable.getRowCount();
			inputPortTable.getRowFormatter().addStyleName(inputNumRows, "FindStyleForAlignTop");

			//add the text and suggest boxes
			inputPortTable.setWidget(inputNumRows, 0, nameBox);

			inputPortTable.setWidget(inputNumRows, 1, typeBox);
			inputPortTable.setWidget(inputNumRows, 2, exampleArea);
			// add remove button
			Button removePortButton = new Button("Remove precondition");
			removePortButton.setStyleName("fastButton");
			RemoveInputPortHandler inputPortHandler = new RemoveInputPortHandler();
			inputPortHandler.setFactPort(factPort);
			removePortButton.addClickHandler(inputPortHandler);

			inputPortTable.setWidget(inputNumRows, 3, removePortButton);

			//updateListener
			UpdateTransformationTabListener updateTabListener = new UpdateTransformationTabListener();
			factPort.addPropertyChangeListener("name", updateTabListener);
			factPort.addPropertyChangeListener("factType", updateTabListener);
			factPort.addPropertyChangeListener("exampleValue", updateTabListener);
		}
		else
		{
			TextBox nameBox = CTextChangeHandler.createTextBox(factPort, "name");
			SuggestBox typeBox = CTextChangeHandler.createTypeSuggestBox((ServiceDesigner) factPort.getServiceScreen().get("serviceDesigner"), factPort, "factType");
			TextBox exampleBox = CTextChangeHandler.createTextBox(factPort, "exampleValue");

			int inputNumRows = inputPortTable.getRowCount();

			//add the text and suggest boxes
			inputPortTable.setWidget(inputNumRows, 0, nameBox);
			inputPortTable.setWidget(inputNumRows, 1, typeBox);
			inputPortTable.setWidget(inputNumRows, 2, exampleBox);

			// add remove button
			Button removePortButton = new Button("Remove precondition");
			removePortButton.setStyleName("fastButton");
			RemoveInputPortHandler inputPortHandler = new RemoveInputPortHandler();
			inputPortHandler.setFactPort(factPort);
			removePortButton.addClickHandler(inputPortHandler);
			inputPortTable.setWidget(inputNumRows, 3, removePortButton);
		}
	}

	@SuppressWarnings("unchecked")
	public Widget createOutputPortTable() 
	{
		VerticalPanel outputPanel = new VerticalPanel();
		
		Label hintLabel = new Label("Define the postcondtion where this resource will deliver results:");	      
		
		outputPanel.add(hintLabel);
		
		outputPortTable = new FlexTable();

		int numRows = outputPortTable.getRowCount();

		// Add new output port Button
		Button addOutputPortButton = new Button("Add postcondition");
		addOutputPortButton.setStyleName("fastButton");
		addOutputPortButton.addClickHandler(new AddNewOutputPortHandler());
		outputPortTable.setWidget(numRows, 0, addOutputPortButton);
		numRows++;

		// add output header row
		outputPortTable.setWidget(numRows, 0, new Label("Postcondition name"));
		outputPortTable.setWidget(numRows, 1, new Label("Postcondition type"));
		numRows++;

		// add rows for existing output fact ports
		Iterator<FactPort> iteratorOfPostconditions = buildingBlock.iteratorOfPostconditions();
		while (iteratorOfPostconditions.hasNext())
		{
			FactPort factPort = iteratorOfPostconditions.next();

			// per fact port add one row with three text boxes for name, type, and example value
			createOutputTableRowFor(factPort);
		}

		if(longExampleValues)
		{
			//updateListener
			UpdateTransformationTabListener updateTabListener = new UpdateTransformationTabListener();
			buildingBlock.addPropertyChangeListener(BuildingBlock.PROPERTY_POSTCONDITIONS, updateTabListener);
		}

		// return the panel
		outputPortTable.ensureDebugId("cwFlexTable");
		
		outputPanel.add(outputPortTable);
		
		return outputPanel;
	}

	private void createOutputTableRowFor(FactPort factPort)
	{
		TextBox nameBox = CTextChangeHandler.createTextBox(factPort, "name");
		SuggestBox typeBox = CTextChangeHandler.createTypeSuggestBox((ServiceDesigner) factPort.getServiceScreen2().get("serviceDesigner"), factPort, "factType");

		int outputNumRows = outputPortTable.getRowCount();

		//add the text and suggest boxes
		outputPortTable.setWidget(outputNumRows, 0, nameBox);
		outputPortTable.setWidget(outputNumRows, 1, typeBox);

		// add remove button
		Button removePortButton = new Button("Remove postcondition");
		removePortButton.setStyleName("fastButton");
		RemoveOutputPortHandler outputPortHandler = new RemoveOutputPortHandler();
		outputPortHandler.setFactPort(factPort);
		removePortButton.addClickHandler(outputPortHandler);
		outputPortTable.setWidget(outputNumRows, 3, removePortButton);

		//updateListener
		UpdateTransformationTabListener updateTabListener = new UpdateTransformationTabListener();
		factPort.addPropertyChangeListener("name", updateTabListener);
		factPort.addPropertyChangeListener("factType", updateTabListener);
	}

	class UpdateTransformationTabListener implements PropertyChangeListener
	{
		@Override
		public void propertyChanged(PropertyChangeEvent evt)
		{
			if(fastTool instanceof DataTransformationTool)
			{
				((DataTransformationTool) fastTool).refreshRuleAndCodeTab();
			}
		}
	}

	class AddNewInputPortHandler implements ClickHandler
	{
		@Override
		public void onClick(ClickEvent event)
		{
			FactPort factPort = new FactPort();
			buildingBlock.addToPreconditions(factPort);
			createInputTableRowFor(factPort);
		}
	}

	/**
	 * This Handler is for removing and adding Ports
	 * */
	class RemoveInputPortHandler implements ClickHandler
	{

		private FactPort factPort;

		public FactPort getFactPort()
		{
			return factPort;
		}

		public void setFactPort(FactPort factPort)
		{
			this.factPort = factPort;
		}

		@Override
		public void onClick(ClickEvent event)
		{
			//do not remove last row
			if(inputPortTable.getRowCount() == 4)
			{
				return;
			}

			Cell cell = inputPortTable.getCellForEvent(event);         
			int rowCount = cell.getRowIndex();
			inputPortTable.removeRow(rowCount);

			// remove factport from preconditions
			buildingBlock.removeFromPreconditions(factPort);
		} 
	}

	class AddNewOutputPortHandler implements ClickHandler
	{
		@Override
		public void onClick(ClickEvent event)
		{
			FactPort factPort = new FactPort();
			buildingBlock.addToPostconditions(factPort);
			createOutputTableRowFor(factPort);
		}
	}

	class RemoveOutputPortHandler implements ClickHandler
	{
		private FactPort factPort;

		public FactPort getFactPort()
		{
			return factPort;
		}

		public void setFactPort(FactPort factPort)
		{
			this.factPort = factPort;
		}

		@Override
		public void onClick(ClickEvent event)
		{
			//don't remove last row
			if(outputPortTable.getRowCount() == 4)
			{
				return;
			}

			Cell cell = outputPortTable.getCellForEvent(event);         
			int rowCount = cell.getRowIndex();
			outputPortTable.removeRow(rowCount);

			// remove factport from postconditions
			buildingBlock.removeFromPostconditions(factPort);
		} 
	}
}