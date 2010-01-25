package fast.servicescreen.client.gui.codegen_js;

import com.google.gwt.core.client.GWT;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.TextArea;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.user.client.ui.FlexTable.FlexCellFormatter;

import fast.servicescreen.client.ServiceScreenDesignerWep;

/**
 * This Tab should show result steps of code generation.
 * */
public class CodeGenViewer
{
	@SuppressWarnings("unused")
	private ServiceScreenDesignerWep designer = null;
	private FlexTable table = null;
	private TextArea templateShowBox, jsShowBox, jsTestvalueShowBox;
	public CodeGenerator generator = null;
	
	public CodeGenViewer(ServiceScreenDesignerWep designer)
	{
		this.designer = designer;
		generator = new CodeGenerator(designer);
		
		//create templateShowBox
		templateShowBox = new TextArea();
		templateShowBox.setSize("18cm", "3cm");
		
		set_templateShow_Text(generator.getCurrentTemplate());
	}
	
	/**
	 * Trigger the code generation
	 * */
	class GenerateButtonHandler implements ClickHandler
	{
		@Override
		public void onClick(ClickEvent event)
		{
			//trigger code generation
			String result = generator.generateJS(); 
			
			//show result
			set_js_Text(result);
		}
	}
	
	/**
	 * Creates a CodeGenViewer Widget
	 * */
	public Widget createCodeGenViewer()
	{
		table = new FlexTable();
	    FlexCellFormatter requestTableCellFormatter = table.getFlexCellFormatter();
	    table.addStyleName("cw-FlexTable");
	    table.setWidth("32em");
	    table.setCellSpacing(5);
	    table.setCellPadding(3);
	    requestTableCellFormatter.setHorizontalAlignment(0, 1, HasHorizontalAlignment.ALIGN_LEFT);
	    requestTableCellFormatter.setColSpan(0, 0, 2);
		
		int row = table.getRowCount();	//Add first line
		
		//create .js ShowBox
		jsShowBox = new TextArea();
		jsShowBox.setSize("18cm", "3cm");
		
		//create .js TestvalueShowBox
		jsTestvalueShowBox = new TextArea();
		jsTestvalueShowBox.setSize("18cm", "3cm");
		jsTestvalueShowBox.setReadOnly(true);
		
		//create generateButton
		Button generateButton = new Button("generate");
		GenerateButtonHandler generateButtonHandler = new GenerateButtonHandler();
		generateButton.addClickHandler(generateButtonHandler);
		
		//create setBack button (restore after user changes)
		Button restoreButton = new Button("restore");
		restoreButton.addClickHandler(new ClickHandler()
		{
			@Override
			public void onClick(ClickEvent event)
			{
				set_templateShow_Text(generator.setStartingRootTemplate());
			}
		});
		
		//create a save - Button
		Button saveButton = new Button("save File");
		saveButton.addClickHandler(new ClickHandler()
		{
			@Override
			public void onClick(ClickEvent event)
			{
					if(generator.write_JS_File())
					{
						GWT.log("Writing .js file to RequestService succed..", null);
					}
					else
					{
						GWT.log("ERROR while writing .js file to RequestService..", null);
					}
			}
		});
		
		//adding all together
		table.setWidget(row, 0, generateButton);
		table.setWidget(row, 1, restoreButton);
		table.setWidget(row, 2, saveButton);
		row++;
		table.setWidget(row, 0, new Label("The choosen template"));
		table.setWidget(row, 1, templateShowBox);
		row++;	//next line
		table.setWidget(row, 0, new Label("The .js code"));
		table.setWidget(row, 1, jsShowBox);
		row++;	//next line
		table.setWidget(row, 0, new Label("The value result"));
		table.setWidget(row, 1, jsTestvalueShowBox);	
		
		return table;
	}
	
	
	
	
	
	//Getters, Setters and Helpers
	
	public void set_jsTestValue_Text(String text)
	{
		if (jsTestvalueShowBox != null)
			jsTestvalueShowBox.setText(text);
	}
	
	public void set_js_Text(String text)
	{
		if (jsShowBox != null)
			jsShowBox.setText(text);
	}
	
	public void set_templateShow_Text(String text)
	{
		if (templateShowBox != null)
			templateShowBox.setText(text);
	}
	
	public String get_templateShow_Text()
	{
		return templateShowBox.getText();
	}
}
