package fast.servicescreen.client.gui;

import java.util.Iterator;

import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.FlexTable;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.Widget;
import com.google.gwt.user.client.ui.HTMLTable.Cell;

import fast.common.client.TemplateParameter;
import fast.servicescreen.client.ServiceScreenDesignerWep;
import fujaba.web.runtime.client.PropertyChangeEvent;
import fujaba.web.runtime.client.PropertyChangeListener;

public class TemplateGUI
{
	   public TemplateGUI(ServiceScreenDesignerWep serviceScreenDesignerWep)
	   {
	      designer = serviceScreenDesignerWep;
	      
	      RequestTemplateListener requestTemplateListener = new RequestTemplateListener(designer);
	      designer.serviceScreen.addPropertyChangeListener("requestTemplate", requestTemplateListener);
	   }
	   
	   private ServiceScreenDesignerWep designer;
	   private FlexTable templateTable;
	   
	   @SuppressWarnings("unchecked")
	   public Widget createTemplateTable() 
	   {
		  if (templateTable == null)
		  {
			  templateTable = new FlexTable();
		  }
		  else
		  {
			  templateTable.clear();
		  }
		   
	      int numRows = 0;
	      
	      // add headlines
	      templateTable.setHTML(numRows, 0, "Request Template:");
	      numRows++;
	      
	      String requestTemplate = (String)designer.serviceScreen.getRequestTemplate();
	      parseTemplate(requestTemplate);
	      
	      // add new parameter button
	      Button addParameterButton = new Button("Add Parameter");
	      addParameterButton.addClickHandler(new AddNewParameterHandler());
	      templateTable.setWidget(numRows, 0, addParameterButton);
	      numRows++;

	      // add input header row
	      templateTable.setWidget(numRows, 0, new Label("Name"));
	      templateTable.setWidget(numRows, 1, new Label("Value"));
	      numRows++;
	      
	      // add rows for existing parameters
	      Iterator<TemplateParameter> iteratorOfTemplateParams = designer.serviceScreen.iteratorOfTemplateParameters();
	      while (iteratorOfTemplateParams.hasNext())
	      {
	    	  TemplateParameter param = iteratorOfTemplateParams.next();
	            
	          // per fact port add one row with three text boxes for name, type, and example value
	    	  createTemplateTableRowFor(param);
	      }
	      
	      // return the panel
	      templateTable.ensureDebugId("cwFlexTable");
	      return templateTable;
	   }
	   
	   private void parseTemplate(String requestTemplate) {
		   //FIXME: Some coobra exceptions while starting the Proj.
		   if(requestTemplate == null || "".equals(requestTemplate))
		   {
			   return;
		   }
		   
		   designer.serviceScreen.removeAllFromTemplateParameters();
		   
		   int fixPartEnd = requestTemplate.indexOf("?");
		   if( fixPartEnd == -1)
		   {
			  fixPartEnd = requestTemplate.length()-1;
		   }
		   
		   String serverUrl = requestTemplate.substring(0, fixPartEnd+1);
		   requestTemplate = requestTemplate.substring(fixPartEnd+1);
		   
		   TemplateParameter server = new TemplateParameter();
		   server.setName("Server:");
		   server.setValue(serverUrl);
		   designer.serviceScreen.addToTemplateParameters(server);
	       
		   while(requestTemplate.length() > 0)
		   {
			   TemplateParameter param = new TemplateParameter();
	
			   String name = requestTemplate.substring(0, requestTemplate.indexOf("="));
			   requestTemplate = requestTemplate.substring(requestTemplate.indexOf("=")+1);
			   requestTemplate.replace(name + "=", "");
			   
			   String value = "";
			   if(requestTemplate.contains("&"))
			   {
				   value = requestTemplate.substring(0, requestTemplate.indexOf("&"));
				   requestTemplate = requestTemplate.substring(requestTemplate.indexOf("&")+1);
			   }
			   else
			   {
				   value = requestTemplate;
				   requestTemplate = "";
			   }
			   
			   param.setName(name);
			   param.setValue(value);
			   
			   designer.serviceScreen.addToTemplateParameters(param);
		   }
	   }

	   private void createTemplateTableRowFor(TemplateParameter param)
	   {
		   String textsize = "5cm";
		   TextBox nameBox = CTextChangeHandler.createWidthTextBox(param, textsize, "name");
		   TextBox valueBox = CTextChangeHandler.createWidthTextBox(param, textsize, "value");
		   
		   if(param.getName() == "Server:")
		   {
			   nameBox.setReadOnly(true);
		   }
		   
		   int numRows = templateTable.getRowCount();
		      
		   // add the text boxes
		   templateTable.setWidget(numRows, 0, nameBox);
		   templateTable.setWidget(numRows, 1, valueBox);
		   
		   //FIXME not working exactly
//		   param.addPropertyChangeListener(new PropertyChangeListener()
//	       {
//				@Override
//				public void propertyChanged(PropertyChangeEvent evt) {
//					// if text changes build new template url
//					String result = buildRequestUrl();
//				    designer.serviceScreen.setRequestTemplate(result);
//				}
//	       });
		      
		   // add remove button
		   Button removeParameterButton = new Button("Remove Parameter");
		   RemoveParameterHandler parameterHandler = new RemoveParameterHandler();
		   parameterHandler.setTemplateParameter(param);
		   removeParameterButton.addClickHandler(parameterHandler);
		   templateTable.setWidget(numRows, 3, removeParameterButton);
	   }
	   
	   @SuppressWarnings({ "unchecked", "unused" })
	   private String buildRequestUrl()
	   {
		   String result = "";
		   
		   Iterator<TemplateParameter> iteratorOfTemplateParams = designer.serviceScreen.iteratorOfTemplateParameters();
		   while (iteratorOfTemplateParams.hasNext())
		   {
			   TemplateParameter param = iteratorOfTemplateParams.next();
			   
			   if(param.getName() == "Server:")
			   {
				   result += param.getValue();
			   }
			   else
			   {
				   result += param.getName();
				   result += "=";
				   result += param.getValue();
				   if(iteratorOfTemplateParams.hasNext())
				   {
					   result += "&";
				   }
			   }
		   }
		   
		   return result;
	   }
	   
	   /**
	    * handler for adding parameters
	    * */
	   class AddNewParameterHandler implements ClickHandler
	   {
	     @Override
	     public void onClick(ClickEvent event)
	     {
	    	TemplateParameter param = new TemplateParameter();
	    	designer.serviceScreen.addToTemplateParameters(param);
	        createTemplateTableRowFor(param);
	     }
	   }
	   
	   /**
	    * handler for removing parameters
	    * */
	   class RemoveParameterHandler implements ClickHandler
	   {
			 private TemplateParameter templateParameter;
			 
		     public TemplateParameter getTemplateParameter()
		     {
		    	 return templateParameter;
		     }
	
			 public void setTemplateParameter(TemplateParameter templateParameter)
			 {
				 this.templateParameter = templateParameter;
			 }
	
			 @Override
		     public void onClick(ClickEvent event)
		     {
		         Cell cell = templateTable.getCellForEvent(event);         
		         int rowCount = cell.getRowIndex();
		         templateTable.removeRow(rowCount);
		         
		         designer.serviceScreen.removeFromTemplateParameters(templateParameter);
		     } 
	   }
	   
	   class RequestTemplateListener implements PropertyChangeListener
	   {
		   @SuppressWarnings("unused")
		   private ServiceScreenDesignerWep designer;
		   
		   public RequestTemplateListener(ServiceScreenDesignerWep designer) {
			   this.designer = designer;
		   }

		   @Override
		   public void propertyChanged(PropertyChangeEvent evt) {
			   //FIXME something is completely wrong here
//			   String requestTemplate = (String) designer.serviceScreen.get("requestTemplate"); 
//			   if(requestTemplate != null && requestTemplate != "")
//			   {
//				   designer.requestGui.getTemplateTable().removeFromParent();
//				   Widget templateTable = createTemplateTable();
//				   designer.requestGui.setTemplateTable(templateTable);
//			   }
		   }		   
	   }
}
