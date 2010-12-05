package fast.servicescreen.client.gui;

import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.DialogBox;
import com.google.gwt.user.client.ui.FlowPanel;
import com.google.gwt.user.client.ui.LayoutPanel;
import com.google.gwt.user.client.ui.ListBox;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.VerticalPanel;

import fast.servicescreen.client.rpc.WSDLHandler;

/**
 * This widget presents a view, where user can put WSDL url and load that
 * description. A chooser let them choose a service Method. Choosing will
 * create the request URl and parameters for POST or GET
 */
public class WSDLWidget extends DialogBox
{
	protected TextBox wsdlTextbox;
	protected ListBox methods;
	protected Button wsdlButton;

	/**
	 * This widget presents a view, where user can put WSDL url and load that
	 * description. A chooser let them choose a service Method. Choosing will
	 * create the request URl and parameters for POST or GET
	 */
	public WSDLWidget(RequestGUI requestGUI)
	{		
		methods = new ListBox();
		methods.setSize("420px", "30px");

		wsdlTextbox = new TextBox();
		wsdlTextbox.setText("http://www.webservicex.net/geoipservice.asmx?WSDL");
		wsdlTextbox.setWidth("450px");
		
		wsdlButton = new Button("get description");
		wsdlButton.setStyleName("fastButton");
		wsdlButton.addClickHandler(new WSDLHandler(this, requestGUI));
		
		Button closeButton = new Button("close");
		closeButton.setStyleName("fastButton");
		closeButton.addClickHandler(new CloseHandler());
		
		FlowPanel flowP = new FlowPanel();
		flowP.add(wsdlButton);
		flowP.add(closeButton);
		
		VerticalPanel verticalP = new VerticalPanel();
		verticalP.add(wsdlTextbox);
		verticalP.add(flowP);
		verticalP.add(methods);
		//the holder panel, because a dialogBox is used to 
		setSize("470px", "120px");
		setHTML("WSDL helper");
		LayoutPanel layoutPanel = new LayoutPanel();
		setWidget(layoutPanel);
		layoutPanel.setSize("430px", "120px");
		layoutPanel.add(verticalP);
		
		setPopupPosition(getAbsoluteLeft() + 200, getAbsoluteTop() + 120);
	}
	
	public ListBox getMethodBox()
	{
		return methods;
	}
	
	public String getWSDLPath()
	{
		return wsdlTextbox.getText();
	}
	
	class CloseHandler implements ClickHandler
	{
		@Override
		public void onClick(ClickEvent event)
		{
			removeFromParent();
		}
	}
}