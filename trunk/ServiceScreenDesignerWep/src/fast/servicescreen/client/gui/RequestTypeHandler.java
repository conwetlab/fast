package fast.servicescreen.client.gui;

import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.RadioButton;
import com.google.gwt.user.client.ui.TextArea;
import com.google.gwt.user.client.ui.VerticalPanel;

import fast.servicescreen.client.ServiceScreenDesignerWep;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer.WrappingType;

public class RequestTypeHandler
{
	private ServiceScreenDesignerWep designer;
	private VerticalPanel panel;
	private HorizontalPanel hPanel_XML_JSON;
	private HorizontalPanel hPanel_GET_POST;
	
	//To fill in header and body for WSDL 
	protected HorizontalPanel hHeaderBody;
	protected TextArea /*header,*/ body;
	
	//start resType
	WrappingType currentRequestType = WrappingType.WRAP_AND_REQUEST_XML;
	
	//start reqType
	RequestMethodType currentRequestMethodType = RequestMethodType.GET_REQUEST;
	
	/**
	 * Creates a Handler, to choose XML or JSON and GET or POST.
	 * Rebuild the GUI parts to knew configuration
	 * */
	public RequestTypeHandler(ServiceScreenDesignerWep designer)
	{
		this.designer = designer;
		
		//create structured panels for fill header, body
		hHeaderBody = new HorizontalPanel();
		body = new TextArea();
		body.setSize("756px", "150px");
		
		//TODO dk make headers changable
//		header = new TextArea();
//		header.setText("put header here");
//		header.setSize("378px", "150px");
		
		body.setText("put body here");
//		header.addClickHandler(new EmptyTextAreaHandler(header));
		body.addClickHandler(new EmptyTextAreaHandler(body));
//		hHeaderBody.add(header);
		hHeaderBody.add(body);
		hHeaderBody.setVisible(false);	//activate when clicking POST
		
		//create structured panles for choosing
		panel = new VerticalPanel();
		hPanel_GET_POST = new HorizontalPanel();
		hPanel_XML_JSON = new HorizontalPanel();
		
		//create radiobuttons to choose XML or JSON
		RadioButton reqJSON = new RadioButton("resType", "JSON");
		RadioButton reqXML = new RadioButton("resType", "XML");
		
		//activate XML button as default and add click handler
		reqXML.setValue(true);
		reqXML.addClickHandler(new ReqXML_Handler());
		reqJSON.addClickHandler(new ReqJSON_Handler());
		
		//add it into one panel and give it a name
		Label label_XML_JSON = new Label("Resource type");
		hPanel_XML_JSON.insert(label_XML_JSON, 0);
		hPanel_XML_JSON.insert(reqXML, 1);
		hPanel_XML_JSON.insert(reqJSON, 2);
		
		RadioButton normalService = new RadioButton("reqType", "GET");
		RadioButton wsdlService = new RadioButton("reqType", "POST");
		normalService.setValue(true);
		normalService.addClickHandler(new GET_Handler());
		wsdlService.addClickHandler(new POST_Handler());
		
		//add it into one panel and give it a name
		Label label_GET_WSDL = new Label("Request type ");
		hPanel_GET_POST.insert(label_GET_WSDL, 0);
		hPanel_GET_POST.insert(normalService, 1);
		hPanel_GET_POST.insert(wsdlService, 2);
		
		//add to vertical entrys: XMLvJSON and GETvPOST  
		panel.add(hPanel_XML_JSON);
		panel.add(hPanel_GET_POST);
	}
	
	/**
	 * This handler should manage the GUI changes to make POST
	 * Service requests
	 * */
	class POST_Handler implements ClickHandler
	{
		@Override
		public void onClick(ClickEvent event)
		{
			//set type
			currentRequestMethodType = RequestMethodType.POST_REQUEST;
			
			//set header, body visible
			hHeaderBody.setVisible(true);
		}
	}

	/**
	 * This handler should manage the GUI changes to make a Service
	 * request with a standard GET method call. 
	 * */
	class GET_Handler implements ClickHandler
	{
		@Override
		public void onClick(ClickEvent event)
		{
			//set type
			currentRequestMethodType = RequestMethodType.GET_REQUEST;
			
			//set header, body invisible
			hHeaderBody.setVisible(false);
		}
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
			currentRequestType = WrappingType.WRAP_AND_REQUEST_XML;
			
			//This should replace MediationRuleGUI to normal RuleGUI to handle JSON
			designer.setRuleGUI_byType(currentRequestType);
			
			//This replace the CodeGenerator
			designer.setCodeGenViewer(new CodeGenViewer(designer, currentRequestType));
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
			currentRequestType = WrappingType.WRAP_AND_REQUEST_JSON;
			
			//This should replace normal Rule GUI to MediationRuleGUI to handle JSON
			designer.setRuleGUI_byType(currentRequestType);
			
			//This replace the CodeGenerator 
			designer.setCodeGenViewer(new CodeGenViewer(designer, currentRequestType));
		}
	}
	
	/**
	 * A type should be set, that marks if we want to request with GET or POST call
	 * */
	public static enum RequestMethodType
	{
		GET_REQUEST, 
		POST_REQUEST;
	}
	
	class EmptyTextAreaHandler implements ClickHandler
	{
		TextArea area;
		
		public EmptyTextAreaHandler(TextArea area)
		{
			super();
			
			this.area = area;
		}
		
		@Override
		public void onClick(ClickEvent event)
		{
			if("put header here".equals(area.getText()) || "put body here".equals(area.getText()) )
					area.setText("");
		}
	}
	
	public HorizontalPanel getHeaderBodyPanel()
	{
		return hHeaderBody;
	}
	
//	public String getHeader()
//	{
//		if(header != null)
//			return header.getText();
//		
//		return "";
//	}
	
	public String getBody()
	{
		if(body != null)
			return body.getText();
		
		return "";
	}
	
	public void setBody(String paramList)
	{
		body.setText(paramList);
	}
	
	public WrappingType getRessourceType()
	{
		return this.currentRequestType;
	}
	
	public RequestMethodType getRequestType()
	{
		return this.currentRequestMethodType;
	}
	
	/**
	 * Returns the panle with radiobuttons
	 * which change Codegenerator
	 * */
	public VerticalPanel getChooserPanel()
	{
		return panel;
	}
}