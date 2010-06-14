package fast.servicescreen.client.gui;

import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.AbsolutePanel;
import com.google.gwt.user.client.ui.RadioButton;

import fast.common.client.ServiceScreen;
import fast.servicescreen.client.ServiceScreenDesignerWep;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer.WrappingType;

public class RequestTypeHandler
{
	private ServiceScreenDesignerWep designer;
	private ServiceScreen screen;
	private AbsolutePanel panel;
	
	public RequestTypeHandler(ServiceScreenDesignerWep designer, ServiceScreen screen)
	{
		this.designer = designer;
		this.screen = screen;
		panel = new AbsolutePanel();
		
		//create radiobuttons to choose
		RadioButton reqJSON = new RadioButton("reqType", "JSON");
		RadioButton reqXML = new RadioButton("reqType", "XML");
		
		//add it into one panel
		panel.add(reqXML);
		panel.add(reqJSON);
		
		//add clickhandler to change CodeGenViewer
		reqXML.addClickHandler(new ReqXML_Handler());
		reqJSON.addClickHandler(new ReqJSON_Handler());
	}
	
	/**
	 * If click, create a CodeGenViewer and CodeGen for
	 * XML responses  
	 * */
	class ReqXML_Handler implements ClickHandler 
	{
		@Override
		public void onClick(ClickEvent event)
		{
			designer.setCodeGenViewer(new CodeGenViewer(screen, WrappingType.WRAP_AND_REQUEST_XML));
		}
	}

	/**
	 * If click, create a CodeGenViewer and CodeGen for
	 * JSON responses  
	 * */
	class ReqJSON_Handler implements ClickHandler 
	{
		@Override
		public void onClick(ClickEvent event)
		{
			designer.setCodeGenViewer(new CodeGenViewer(screen, WrappingType.WRAP_AND_REQUEST_JSON));
		}
	}
	
	/**
	 * Returns the panle with radiobuttons
	 * which change Codegenerator
	 * */
	public AbsolutePanel getChooserPanel()
	{
		return panel;
	}
}