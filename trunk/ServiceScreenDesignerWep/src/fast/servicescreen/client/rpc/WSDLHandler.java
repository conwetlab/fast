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
import fast.servicescreen.client.gui.RequestTypeHandler.RequestMethodType;

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
	protected RequestGUI requestGUI;
	
	protected HashMap<String, String> methodsAndParameters_GET;
	protected HashMap<String, String> methodsAndParameters_POST;
	
	protected String wsdlBaseURl;
	protected String xmlNameSpaceURL;
	protected String requestAction;
	
	
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
		xmlNameSpaceURL = null;
		wsdlBaseURl = null;
		
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
						
						//search for nameSpace_URL
						elements = RuleUtil.get_ElementsByTagname(xmlDoc, "definitions");
						if(elements.getLength() >= 1)
						{
							xmlNameSpaceURL = RuleUtil.get_AttributeByName(elements.item(0), "targetNamespace");
						}

						//if not found, abort
						if(xmlNameSpaceURL == null || wsdlBaseURl == null)
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
		//This could be done more flexible with reading the s:schema tag only. 
		
		methodsAndParameters_GET = new HashMap<String, String>();
		methodsAndParameters_POST = new HashMap<String, String>();
		
		NodeList types = RuleUtil.get_ElementsByTagname(xmlDoc, "types");
		
		String operations = "";
		NamedNodeMap nodeMap;
		NodeList elements;
		String methodName = "";
		NodeList parameter;
		String getParameter = "";
		String postParameter = "";
		
		//search operations and params. for each type:
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
							postParameter = RuleUtil.get_AttributeByName(parameter.item(k), "name");
							
							if(k > 0)
							{
								getParameter += "&" + postParameter + "=<<" + postParameter + ">>";
							}
							//if k = 0
							else
							{
								getParameter += "?" + postParameter + "=<<" + postParameter + ">>";
							}
							
							postParameter = "<" + postParameter + "><<" + postParameter + ">></" + postParameter + ">";
						}
						
						methodsAndParameters_POST.put(methodName, postParameter);
						methodsAndParameters_GET.put(methodName, getParameter);
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
		for (Iterator<String> iterator = methodsAndParameters_GET.keySet().iterator(); iterator.hasNext();)
		{
			methodName = iterator.next();
			
			methods.addItem(methodName);
		}
		
		//add listener to change request URL if user choose method
		methods.addClickListener(new ChoosenMethodListener());
	}
	
	/**
	 * Handler for method choosing.
	 * By choose, this build the requestURL and parameters, and fill it to RequestGUI
	 * */
	class ChoosenMethodListener implements ClickListener
	{
		@Override
		public void onClick(Widget sender)
		{
			//get chosen entry
			ListBox box = (ListBox) sender; 
			requestAction = box.getItemText(box.getSelectedIndex());
			
			if(requestGUI.reqTypeHandler.getRequestType() == RequestMethodType.GET_REQUEST)
			{
				//find the bounded parameter
				String parameter = methodsAndParameters_GET.get(requestAction);

				//build request URL out of node List
				String requestURL = wsdlBaseURl + "/" + requestAction + parameter;

				//set the builded URL to the Request GUI
				requestGUI.setRequestURL(requestURL);
			}
			else if(requestGUI.reqTypeHandler.getRequestType() == RequestMethodType.POST_REQUEST)
			{
				//build and set up request URL
				String requestURL = wsdlBaseURl;
				requestGUI.setRequestURL(requestURL);
				
				//creates request body and set up in body field
				String newBody = createBody();
				requestGUI.reqTypeHandler.setBody(newBody);
			}
		}
	}

	/**
	 * Returns the SOPA body of the POST request
	 * */
	protected String createBody()
	{
		String body = this.bodyTemplate;
		
		body = replace(body, "<<requestAction>>", requestAction);
		
		body = replace(body, "<<xmlNamespaceURL>>", xmlNameSpaceURL);
		
		body = replace(body, "<<parameter>>", methodsAndParameters_POST.get(requestAction));
		
		return body;
	}
	
	/**
	 * 
	 * */
	protected String replace(String text, String key, String value) 
	{
		// find key and replace by value
		String result = text;
		int pos = text.indexOf(key);
		while (pos >= 0)
		{
			result = result.substring(0, pos) + value + result.substring(pos + key.length());
			pos = result.indexOf(key);
		}
		return result;
	}
	
	/**
	 * 
	 * */
	protected String bodyTemplate =
            "<?xml version='1.0' encoding='utf-8'?>\n" +
            "<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' " +
            "xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'>\n" + 
            	"<soap:Body>\n" +
            		"<<<requestAction>> xmlns='<<xmlNamespaceURL>>'>" +
            		"<<parameter>>" +
            		"</<<requestAction>>>" +
            	"</soap:Body>\n" +
            "</soap:Envelope>";
}