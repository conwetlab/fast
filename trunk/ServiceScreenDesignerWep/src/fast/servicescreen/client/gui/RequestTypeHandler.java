package fast.servicescreen.client.gui;

import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.AbsolutePanel;
import com.google.gwt.user.client.ui.RadioButton;

import fast.servicescreen.client.ServiceScreenDesignerWep;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer.WrappingType;

public class RequestTypeHandler
{
	private ServiceScreenDesignerWep designer;
	private AbsolutePanel panel;
	
	//start state
	public WrappingType currentType = WrappingType.WRAP_AND_REQUEST_XML;
	
	public RequestTypeHandler(ServiceScreenDesignerWep designer)
	{
		this.designer = designer;
		panel = new AbsolutePanel();
		
		//create radiobuttons to choose
		RadioButton reqJSON = new RadioButton("reqType", "JSON");
		RadioButton reqXML = new RadioButton("reqType", "XML");
		
		//activate XML button as default
		reqXML.setValue(true);
		
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
			currentType = WrappingType.WRAP_AND_REQUEST_XML;
			
			//This should replace MediationRuleGUI to normal RuleGUI to handle JSON
			designer.setRuleGUI_byType(currentType);
			
			//This replace the CodeGenerator
			designer.setCodeGenViewer(new CodeGenViewer(designer, currentType));
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
			currentType = WrappingType.WRAP_AND_REQUEST_JSON;
			
			//This should replace normal Rule GUI to MediationRuleGUI to handle JSON
			designer.setRuleGUI_byType(currentType);
			
			//This replace the CodeGenerator 
			designer.setCodeGenViewer(new CodeGenViewer(designer, currentType));
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