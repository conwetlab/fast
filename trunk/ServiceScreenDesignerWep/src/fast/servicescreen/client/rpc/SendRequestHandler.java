package fast.servicescreen.client.rpc;

import java.util.Iterator;

import com.google.gwt.core.client.GWT;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.http.client.URL;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.rpc.AsyncCallback;
import com.google.gwt.user.client.ui.Tree;
import com.google.gwt.user.client.ui.TreeItem;
import com.google.gwt.xml.client.Document;
import com.google.gwt.xml.client.NamedNodeMap;
import com.google.gwt.xml.client.Node;
import com.google.gwt.xml.client.NodeList;
import com.google.gwt.xml.client.XMLParser;

import fast.common.client.FactPort;
import fast.common.client.TemplateParameter;
import fast.mediation.client.gui.MediationRuleGUI;
import fast.servicescreen.client.RequestService;
import fast.servicescreen.client.RequestServiceAsync;
import fast.servicescreen.client.ServiceScreenDesignerWep;
import fast.servicescreen.client.gui.RuleUtil;
import fast.servicescreen.client.gui.RequestTypeHandler.RequestMethodType;
import fast.servicescreen.client.gui.codegen_js.CodeGenViewer.WrappingType;

public class SendRequestHandler implements ClickHandler
{
   private ServiceScreenDesignerWep designer;
   public RequestServiceAsync service;
   public Document xmlDoc;
   
   String header, body;
   
   /**
    * A handler to click sendRequest and getting the result shown in resultField. Build
    * up result tree in RuleGUIs, too
    * */
   public SendRequestHandler(ServiceScreenDesignerWep serviceScreenDesignerWep)
   {
      designer = serviceScreenDesignerWep;
   }
   
   /**
    * This method should replace the examplevalues into the inputPort tags.
    * U can give the body String or the get url to replace values!
    * */
   @SuppressWarnings("unchecked")
   protected String replaceInPorts_byExampleValues(String url_or_body)
   {
	   // insert example values for input port names
	   Iterator<FactPort> iteratorOfPreconditions = designer.serviceScreen.iteratorOfPreconditions();
	   while (iteratorOfPreconditions.hasNext())
	   {
		   FactPort nextPort = iteratorOfPreconditions.next();
		   String exampleValue = nextPort.getExampleValue();
		   String portName = nextPort.getName();

		   if (   exampleValue != null && ! exampleValue.equals("")
				   && portName != null && ! portName.equals(""))
		   {
			   // do expansion
			   String encodedValue = URL.encode(exampleValue);
			   url_or_body = url_or_body.replaceAll("<" + portName + ">", encodedValue);
		   }
	   }
	   
	   return url_or_body;
   }

   /**
    * This method replace example values into input port tags, for post into body, for get into url.
    * Then toggle request
    * */
   public void onClick(ClickEvent event)
   {
	   String request = buildRequestUrl();
	   
	   //decide: send GET or POST request
	   RequestMethodType methodType = designer.requestGui.reqTypeHandler.getRequestType();
	   
	   // Instantiate service
	   if(service == null)
	   {
		   //TODO dk problem is here..
		   service = GWT.create(RequestService.class);
	   }
	   
	   if(methodType.equals(RequestMethodType.GET_REQUEST))
	   {
		   request = replaceInPorts_byExampleValues(request);
		   
		   //invoke service
		   service.sendHttpRequest_GET(request, null, new ParseXMLAction());
	   }
	   else if(methodType.equals(RequestMethodType.POST_REQUEST))
	   {
		   //	    	  header = designer.requestGui.reqTypeHandler.getHeader();
		   //	    	  HashMap<String, String> headerMap = new HashMap<String, String>();
		   //	    	  headerMap.put("testKey", header);
		   
		   body = designer.requestGui.reqTypeHandler.getBody();
		   body = replaceInPorts_byExampleValues(body);

		   //invoke service
		   service.sendHttpRequest_POST(request, null/*TODO dk&tg what about headers?*/, body, new ParseXMLAction());
	   }

	   //show ready request url to user
	   designer.requestUrlBox.setText(request);

	   designer.getResultText().setText("Waiting for server response ...");
   }

   @SuppressWarnings("unchecked")
   private String buildRequestUrl()
   {
	   String result = "";
	   
	   Iterator<TemplateParameter> iteratorOfTemplateParams = designer.serviceScreen.iteratorOfTemplateParameters();
	   while (iteratorOfTemplateParams.hasNext())
	   {
		   TemplateParameter param = iteratorOfTemplateParams.next();
		   
		   if(param.getName() == "Service:")
		   {
			   result += param.getValue();
			   if ( iteratorOfTemplateParams.hasNext() && ! result.endsWith("?"))
			   {
				   result += "?"; 
			   }
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

   class ParseXMLAction implements AsyncCallback<String>
   {
      @Override
      public void onSuccess(String result)
      {
         designer.resultText.setText(result);
         
         parseServerResponse(result);
         
         designer.ruleGUI.updateFactsTree();
      }
      
      @Override
      public void onFailure(Throwable caught) {
         Window.alert("Fehler: " + caught.getLocalizedMessage());
      }
   }

   /**
    * Parses the requests result and add a 
    * representing tree in two tabs
    * */
   private void parseServerResponse(String result)
   {
      System.out.println("Going to parse server response");
      
      if(designer.requestGui.reqTypeHandler.getRessourceType() == WrappingType.WRAP_AND_REQUEST_JSON) //parse JSON
      {
    	  //cut the trash from result value 
    	  int first, last;
    	  first = result.indexOf("{");
    	  last = result.lastIndexOf("}");
    	  if(first < 0 || last <= 0)
    	  {
    		  //do nothing
    	  }
    	  else if(last == result.length())
    	  {
    		  result = result.substring(first, last);
    	  }
    	  else
    	  {
    		  result = result.substring(first, last +1);
    	  }

    	  ((MediationRuleGUI) designer.ruleGUI).setJsonRequestetValue(result);
    	  ((MediationRuleGUI) designer.ruleGUI).createResultTree();
      }
      else	//parse XML
      {
          xmlDoc = XMLParser.parse(result);
          
          buildXmlTree(designer.ruleGUI.xmlTree);  
      }
   }
   
   //code reuse
   private void buildXmlTree(Tree tree)
   {
	      tree.clear();
	      
	      TreeItem treeItem = tree.addItem("XMLDoc");
	      
	      NodeList childNodes = xmlDoc.getChildNodes();
	      for (int i = 0; i < childNodes.getLength(); i++)
	      {
	         Node item = childNodes.item(i);
	         addChildTree(treeItem, item);
	      }
	      
	      RuleUtil.expandTree(tree);
   }
   
   private void addChildTree(TreeItem treeItem, Node item)
   {
      // add this node
      String nodeName = item.getNodeName();
      String nodeValue = item.getNodeValue();
      boolean subNodeProcessed = false;
      
      short nodeType = item.getNodeType(); 
      if (nodeType == Node.TEXT_NODE && nodeValue.startsWith("\n")) 
      {
         // skip newline text nodes
         return;
      }
      
      NodeList childNodes = item.getChildNodes();
      
      if (nodeValue == null && childNodes.getLength() == 1 && childNodes.item(0).getNodeType() == Node.TEXT_NODE)
      {
         // if it has only one child of type text, add that text as value for this node
         nodeValue = childNodes.item(0).getNodeValue();
         subNodeProcessed = true;
      }
      
      if (nodeValue == null)
      {
         nodeValue = "";
      }
      
      TreeItem thisTreeItem = treeItem.addItem(nodeName + " : " + nodeValue);
      
      // add attributes
      try
      {
         if (   nodeType != Node.ATTRIBUTE_NODE 
             && nodeType != Node.TEXT_NODE)
         {
            NamedNodeMap attributes = item.getAttributes();
            for (int i = 0; i < attributes.getLength(); i++)
            {
               Node subItem = attributes.item(i);
               addChildTree(thisTreeItem, subItem);
            }
         }
      } catch (Exception e)
      {
         System.out.println("Could not access attributes for node of type " + nodeType);
      }
      
      
      // add sub nodes
      if (   !subNodeProcessed 
          && nodeType != Node.ATTRIBUTE_NODE 
          && nodeType != Node.TEXT_NODE)
      {
         for (int i = 0;  i < childNodes.getLength(); i++)
         {
            Node subItem = childNodes.item(i);
            addChildTree(thisTreeItem, subItem);
         }
      }
   }
}