package fast.servicescreen.client.gui;

import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.TextArea;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.user.client.ui.FlexTable.FlexCellFormatter;

import fast.common.client.ServiceScreen;
import fast.servicescreen.client.ServiceScreenDesignerWep;
import fast.servicescreen.client.rpc.SendRequestHandler;
import fujaba.web.runtime.client.FAction;

public class RequestGUI
{
	public RequestGUI(ServiceScreenDesignerWep serviceScreenDesignerWep)
	{
		designer = serviceScreenDesignerWep;
	}

	private ServiceScreenDesignerWep designer;
	private Widget templateTable;

	public Widget createRequestTable()
	{
		FlexTable requestTable = new FlexTable();
		FlexCellFormatter requestTableCellFormatter = requestTable.getFlexCellFormatter();
		requestTable.addStyleName("cw-FlexTable");
		requestTable.setWidth("32em");
		requestTable.setCellSpacing(5);
		requestTable.setCellPadding(3);
		requestTableCellFormatter.setHorizontalAlignment(0, 1, HasHorizontalAlignment.ALIGN_LEFT);
		requestTableCellFormatter.setColSpan(0, 0, 2);

		int numRows = requestTable.getRowCount();

		// Add textboxes for the request template, url, the parameters and send button
		requestTable.setWidget(numRows, 0, new Label("Request:"));

		String textSize = "20cm";
		designer.templateBox = CTextChangeHandler.createWidthTextBox(designer.serviceScreen, textSize, "requestTemplate");
		templateBoxHandler = new TemplateBoxHandler();
		designer.serviceScreen.addPropertyChangeListener(ServiceScreen.PROPERTY_REQUEST_TEMPLATE, templateBoxHandler);
		// designer.templateBox.addChangeHandler(templateBoxHandler);
		requestTable.setWidget(numRows, 1, designer.templateBox);
		numRows++;

		if (templateGUI == null)
		{
			templateGUI = new TemplateGUI(designer);			
		}
		updateAtWork = true;
		setTemplateTable(templateGUI.createTemplateTable());
		requestTable.setWidget(numRows, 1, getTemplateTable());
		updateAtWork = false;
		numRows++;

		designer.setResultText(new TextArea());
		designer.requestUrlBox = CTextChangeHandler.createWidthTextBox(designer.serviceScreen, textSize, "requestUrl");

		// Add request button with handler
		designer.requestHandler = new SendRequestHandler(designer);
		designer.requestButton = new Button("Send Request", designer.requestHandler);

		designer.requestButton.addStyleName("sc-FixedWidthButton");
		requestTable.setWidget(numRows, 1, designer.requestButton);
		numRows++;

		// Add textbox for actual request
		requestTable.setWidget(numRows, 0, new Label("Sent request: "));
		requestTable.setWidget(numRows, 1, designer.requestUrlBox);
		numRows++;
		numRows++;

		// Add textfield for result xml
		designer.resultText.setSize("20cm", "6cm");
		requestTable.setWidget(numRows, 1, new Label("Service Reply (XML): "));
		requestTable.setWidget(numRows+1, 1, designer.resultText);
		numRows++;
		numRows++;

		return requestTable;
	}
	
	public TemplateBoxHandler templateBoxHandler;
	private TemplateGUI templateGUI;
	public boolean updateAtWork = false;
	
	class TemplateBoxHandler extends FAction
	{
		@Override
		public void doAction() 
		{
			if (!updateAtWork) 
			{
				updateAtWork = true;
				System.out.println("template box fires update to "
						+ designer.templateBox.getText());
				templateGUI.createTemplateTable();
				updateAtWork = false;
			}
		}		
	}


	public void setTemplateTable(Widget templateTable) {
		this.templateTable = templateTable;
	}

	public Widget getTemplateTable() {
		return templateTable;
	}
}
