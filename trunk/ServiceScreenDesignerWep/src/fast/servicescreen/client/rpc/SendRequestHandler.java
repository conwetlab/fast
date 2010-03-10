package fast.servicescreen.client.rpc;

import java.util.Iterator;

import com.google.gwt.core.client.GWT;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
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
import fast.servicescreen.client.RequestService;
import fast.servicescreen.client.RequestServiceAsync;
import fast.servicescreen.client.ServiceScreenDesignerWep;
import fast.servicescreen.client.gui.RuleUtil;

public class SendRequestHandler implements ClickHandler
{
   private ServiceScreenDesignerWep designer;
   public RequestServiceAsync service;
   
   public Document xmlDoc;
   
   public SendRequestHandler(ServiceScreenDesignerWep serviceScreenDesignerWep)
   {
      designer = serviceScreenDesignerWep;
   }

   @SuppressWarnings("unchecked")
   public void onClick(ClickEvent event) 
   {
      String request = buildRequestUrl();
      // request = "http://open.api.sandbox.ebay.com/shopping?appid=KasselUn-efea-4b93-9505-5dc2ef1ceecd&version=517&callname=FindItems&ItemSort=EndTime&QueryKeywords=USB&responseencoding=XML";

      // insert example values for input port names
      Iterator iteratorOfPreconditions = designer.serviceScreen.iteratorOfPreconditions();
      while (iteratorOfPreconditions.hasNext())
      {
         FactPort nextPort = (FactPort) iteratorOfPreconditions.next();
         String exampleValue = nextPort.getExampleValue();
         String portName = nextPort.getName();
         
         if (   exampleValue != null && ! exampleValue.equals("")
             && portName != null && ! portName.equals(""))
         {
            // do expansion
            request = request.replaceAll("<" + portName + ">", exampleValue);
         }
      }

      designer.requestUrlBox.setText(request);

      // Instanciate service
      service = GWT.create(RequestService.class);
      
      designer.getResultText().setText("Waiting for server response ...");

      service.sendHttpRequest_GET(request, new ParseXMLAction());
   }

   @SuppressWarnings("unchecked")
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

   class ParseXMLAction implements AsyncCallback<String>
   {
      @Override
      public void onSuccess(String result) {
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
    * Parses the Xml requests result and add a 
    * representing tree in two tabs
    * */
   private void parseServerResponse(String result)
   {
      System.out.println("Going to parse server response");
      
      xmlDoc = XMLParser.parse(result);
      
      buildXmlTree(designer.ruleGUI.xmlTree);
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