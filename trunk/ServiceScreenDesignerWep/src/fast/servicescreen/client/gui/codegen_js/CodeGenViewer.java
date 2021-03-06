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
package fast.servicescreen.client.gui.codegen_js;

import com.google.gwt.core.client.GWT;
import com.google.gwt.event.dom.client.ChangeEvent;
import com.google.gwt.event.dom.client.ChangeHandler;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.Anchor;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.ChangeListener;
import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.ListBox;
import com.google.gwt.user.client.ui.TextArea;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.user.client.ui.FlexTable.FlexCellFormatter;

import fast.common.client.BuildingBlock;
import fast.mediation.client.gui.MediationRuleGUI;
import fast.servicescreen.client.ServiceScreenDesignerWep;

/**
 * This Tab should show result steps of code generation.
 * */
@SuppressWarnings("deprecation")
public class CodeGenViewer
{
	private FlexTable table = null;
	private TextArea templateShowBox, jsShowBox;
	public CodeGenerator generator = null;
	public boolean isLocal = false;
	
	/**
	 * A type should be set, that marks if we handle XML or JSON, and if we have to request or get
	 * the data
	 * */
	public static enum WrappingType
	{
		WRAP_AND_REQUEST_XML, 
		WRAP_AND_REQUEST_JSON, 
		WRAP_JSON;
	}
	
	/**
	 * Give the needed wrapping type to initialize the Viewer and its generator
	 * */
	public CodeGenViewer(ServiceScreenDesignerWep serviceDesigner, WrappingType type)
	{
		switch(type)
		{
			case WRAP_AND_REQUEST_XML  : generator = new CodeGenerator(serviceDesigner);		//SDW XML
										 break;
										
			case WRAP_AND_REQUEST_JSON : generator = new CodeGenerator_reqJSON(serviceDesigner);//SDW JSON
										 break;
		}
	}
	
	public CodeGenViewer(BuildingBlock screen, WrappingType type, MediationRuleGUI gui)
	{
		switch(type)
		{
			case WRAP_JSON	:	generator = new CodeGenerator_JSON(screen, gui);	//DataMediation Tool
								break;
		}
	}
	

	ListBox choosenTemplate = null;
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
		
		//create templateShowBox
		templateShowBox = new TextArea();
		templateShowBox.setSize("28cm", "5cm");
		set_templateShow_Text(generator.rootTemplate);	//start content
		templateShowBox.addChangeHandler(new TemplateChangeHandler());
		
		//create .js ShowBox
		jsShowBox = new TextArea();
		jsShowBox.setSize("28cm", "5cm");
		
		//create generateButton
		Button generateButton = new Button("generate");
		generateButton.setStyleName("fastButton");
		GenerateButtonHandler generateButtonHandler = new GenerateButtonHandler();
		generateButton.addClickHandler(generateButtonHandler);
		
		//create setBack button (restore after user changes)
		Button restoreButton = new Button("restore");
		restoreButton.setStyleName("fastButton");
		restoreButton.addClickHandler(new ClickHandler()
		{
			@Override
			public void onClick(ClickEvent event)
			{
				set_templateShow_Text(generator.resetTemplates());
				
				if(choosenTemplate != null)
				{
					choosenTemplate.setItemSelected(0, true);
				}
				
				set_js_Text("");
			}
		});
		
		//create a save - Button
		Button saveButton = new Button("save File");
		saveButton.setStyleName("fastButton");

		saveButton.addClickHandler(new ClickHandler()
		{
			@Override
			public void onClick(ClickEvent event)
			{
				//TODO dk this is a hack.. Fix it here and in server
				String wrapperPath = GWT.getHostPageBaseURL() + GWT.getModuleName();
				if(wrapperPath.contains("8888"))
				{
					isLocal = true;
				}

				generator.write_JS_File(isLocal);

				//TODO dk remove share method/handler. Code should be generatet by generator
				//then this save button just have to call the post mehtod, currently called in sharedHandler
				//					ShareResourceHandler shOpHandler = new ShareResourceHandler();
				//					shOpHandler.share(generator.screen);
			}
		});

		//the path to the wrapper in webapps folder
		String baseURL = GWT.getHostPageBaseURL();
		String operatorURL = baseURL + "wrapper/" + generator.screen.getName() + "Op.html";
		Anchor a = new Anchor(operatorURL, operatorURL, "_blank");
		
		//create the template choose to make user changes possible 
		// -> Only things that make sense at time are lited here
		choosenTemplate = new ListBox();
		choosenTemplate.addItem("root");
		choosenTemplate.addItem("buildingBlock metadata");
		choosenTemplate.addItem("prehtml");	
		choosenTemplate.addItem("posthtml");
		choosenTemplate.addItem("helpermethods");
		choosenTemplate.addChangeListener(new ChoosenTemplateListener());
		
		
		//adding all together
		table.setWidget(row, 0, generateButton);
		table.setWidget(row, 1, restoreButton);
		row++;
		table.setWidget(row, 0, choosenTemplate);
		table.setWidget(row, 1, templateShowBox);
		row++;	//next line
		table.setWidget(row, 0, new Label("The .js code"));
		table.setWidget(row, 1, jsShowBox);
		row++;
		table.setWidget(row, 0, saveButton);
		table.setWidget(row, 1, a);
		
		return table;
	}

	String currentTemplate = "";
	/**
	 * Handler for template choose box. Do only use with those ListBoxes!
	 * */
	class ChoosenTemplateListener implements ChangeListener
	{
		@Override
		public void onChange(Widget sender)
		{
				ListBox box = (ListBox)sender; 
				currentTemplate = box.getItemText(box.getSelectedIndex());
			
				if("root".equals(currentTemplate))
				{
					set_templateShow_Text(generator.rootTemplate);
				}
				else if("prehtml".equals(currentTemplate))
				{
					set_templateShow_Text(generator.prehtml);
				}
				else if("posthtml".equals(currentTemplate))
				{
					set_templateShow_Text(generator.posthtml);
				}
				else if("helpermethods".equals(currentTemplate))
				{
					set_templateShow_Text(generator.helperMethods);
				}
				else if("buildingBlock metadata".equals(currentTemplate))
				{
					set_templateShow_Text(generator.buildingBlockTemplate);
				}
		}
	}
	
	/**
	 * The change handler for template changes will manage save of changes 
	 * */
	class TemplateChangeHandler implements ChangeHandler
	{
		@Override
		public void onChange(ChangeEvent event)
		{
			if("root".equals(currentTemplate))
			{
				generator.rootTemplate = get_templateShow_Text();
			}
			else if("prehtml".equals(currentTemplate))
			{
				generator.prehtml = get_templateShow_Text();
			}
			else if("posthtml".equals(currentTemplate))
			{
				generator.posthtml = get_templateShow_Text();
			}
			else if("helpermethods".equals(currentTemplate))
			{
				generator.helperMethods = get_templateShow_Text();
			}
			else if("buildingBlock metadata".equals(currentTemplate))
			{
				generator.buildingBlockTemplate = get_templateShow_Text();
			}
		}
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
