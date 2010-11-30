package fast.servicescreen.client.rpc;

import java.util.HashMap;
import java.util.Iterator;

import com.google.gwt.core.client.GWT;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.rpc.AsyncCallback;
import com.google.gwt.user.client.ui.ClickListener;
import com.google.gwt.user.client.ui.ListBox;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.xml.client.Document;
import com.google.gwt.xml.client.NamedNodeMap;
import com.google.gwt.xml.client.NodeList;
import com.google.gwt.xml.client.XMLParser;

import fast.servicescreen.client.RequestService;
import fast.servicescreen.client.RequestServiceAsync;
import fast.servicescreen.client.gui.RequestGUI;
import fast.servicescreen.client.gui.RuleUtil;
import fast.servicescreen.client.gui.WSDLWidget;

/**
 * This handler should be added to the WSDl widget, to handle 
 * WSDl file requesting/ parsing/ representing and choosing methods.
 * */
@SuppressWarnings("deprecation")
public class WSDLHandler implements ClickHandler
{
	protected RequestServiceAsync service;
	protected WSDLWidget widget;
	protected ListBox methods;
	protected HashMap<String, String> methodsAndParameters;
	protected String wsdlBaseURl;
	protected RequestGUI requestGUI;
	
	/**
	 * This handler should be added to the WSDl widget, to handle 
	 * WSDl file requesting/ parsing/ representing and choosing methods.
	 * 
	 * Needs the widget and the requestGUI (there the request URL must be filled in)
	 * */
	public WSDLHandler(WSDLWidget widget, RequestGUI requestGUI)
	{
		this.widget = widget;
		
		this.requestGUI = requestGUI;
		
		service = GWT.create(RequestService.class);
	}

	@Override
	public void onClick(ClickEvent event)
	{
		String wsdlURI = widget.getWSDLPath();

		//if it was empty, take default to a default
		if(wsdlURI == null || "".equals(wsdlURI))
		{
			//GeoIP Service
			wsdlURI = "http://www.webservicex.net/geoipservice.asmx?WSDL";
		}

		//invoke service
		service.sendHttpRequest_GET(wsdlURI, null, new AsyncCallback<String>()
				{
					@Override
					public void onSuccess(String result)
					{
						//parse response
						Document xmlDoc = XMLParser.parse(result);
						
						//search for base_URL
						NodeList elements = RuleUtil.get_ElementsByTagname(xmlDoc, "address");
						if(elements.getLength() >= 1)
						{
							wsdlBaseURl = RuleUtil.get_AttributeByName(elements.item(0), "location");
						}

						//if not found, abort
						if(elements.getLength() < 1 || wsdlBaseURl == null)
						{
							//Abort, if no base URL is found
							Window.alert("Cannot find base URL in WSDl description..");
							return;
						}
						
						//should show message chooser to the user and set up parameter informations
						createMethodInformations(xmlDoc);
					}

					@Override
					public void onFailure(Throwable caught)
					{
						Window.alert("Can´t load WSDl description from this URL..");
					}
				});
	}
	
	/**
	 * This method extract the method names and belonging parameters, 
	 * save it, and trigger filling of chooser box.
	 * */
	protected void createMethodInformations(Document xmlDoc)
	{
		methodsAndParameters = new HashMap<String, String>();
		
		NodeList types = RuleUtil.get_ElementsByTagname(xmlDoc, "types");
		
		String operations = "";
		NamedNodeMap nodeMap;
		NodeList elements;
		String methodName = "";
		NodeList parameter;
		String completeParameter = "";
		
		//for each type
		for (int i = 0; i < types.getLength(); i++)
		{
			elements = RuleUtil.get_ElementsByTagname(types.item(i), "element");
			
			//for each element
			for (int j = 0; j < elements.getLength(); j++)
			{
				nodeMap = elements.item(j).getAttributes();
				if(nodeMap.getLength() == 1 && nodeMap.getNamedItem("name") != null)
				{
					//find the real operation names
					methodName = RuleUtil.get_AttributeByName(elements.item(j), "name");
					if(! methodName.contains("Response"))
					{
						operations += methodName + "\n";
						
						//find the real parameters
						parameter = RuleUtil.get_ElementsByTagname(elements.item(j), "element");
						for (int k = 0; k < parameter.getLength(); k++)
						{
							if(k > 0)
							{
								completeParameter += "&" + RuleUtil.get_AttributeByName(parameter.item(k), "name") + "=";
							}
							//if k = 0
							else
							{
								completeParameter += "?" + RuleUtil.get_AttributeByName(parameter.item(k), "name") + "=";
							}
						}
						
						methodsAndParameters.put(methodName, completeParameter);
					}
				}
			}
		}
		
		//creates the ListBox to show methods
		createListboxEntry();
	}
	
	/**
	 * Creates the ListBox with any method name.
	 * Notice: parameter info is in the  methodsAndParameters map
	 * */
	protected void createListboxEntry()
	{
		methods = widget.getMethodBox();
		methods.clear();
		
		String methodName = "";
		for (Iterator<String> iterator = methodsAndParameters.keySet().iterator(); iterator.hasNext();)
		{
			methodName = iterator.next();
			
			methods.addItem(methodName);
		}
		
		//add listener to change request URL if user choose method
		methods.addClickListener(new ChoosenMethodListener());
	}
	
	/**
	 * Handler for method choosing.
	 * By choose, this build the requestURL and fill it to RequestGUI
	 * */
	class ChoosenMethodListener implements ClickListener
	{
		@Override
		public void onClick(Widget sender)
		{
			//get chosen entry
			ListBox box = (ListBox) sender; 
			String currentMethod = box.getItemText(box.getSelectedIndex());

			//find the bounded parameter
			String parameter = methodsAndParameters.get(currentMethod);

			//build request URL out of node List
			String requestURL = wsdlBaseURl + "/" + currentMethod + parameter;

			//set the builded URL to the Request GUI
			requestGUI.setRequestURL(requestURL);
		}
	}
}