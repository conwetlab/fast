
package fast.servicescreen.client.gui;

import java.util.ArrayList;
import java.util.Iterator;

import com.google.gwt.event.dom.client.ChangeEvent;
import com.google.gwt.event.dom.client.ChangeHandler;
import com.google.gwt.event.logical.shared.SelectionEvent;
import com.google.gwt.event.logical.shared.SelectionHandler;
import com.google.gwt.user.client.ui.MultiWordSuggestOracle;
import com.google.gwt.user.client.ui.SuggestBox;
import com.google.gwt.user.client.ui.SuggestOracle;
import com.google.gwt.user.client.ui.TextArea;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.SuggestOracle.Suggestion;

import fast.common.client.FactExample;
import fast.common.client.FactPort;
import fast.common.client.FactType;
import fast.common.client.ServiceDesigner;
import fast.common.client.TrafoOperator;
import fujaba.web.runtime.client.CObject;
import fujaba.web.runtime.client.FAction;
import fujaba.web.runtime.client.PropertyChangeEvent;
import fujaba.web.runtime.client.PropertyChangeListener;

public class CTextChangeHandler implements ChangeHandler, PropertyChangeListener, SelectionHandler<Suggestion>
{
   public static TextBox createWidthTextBox(CObject obj, String width, String attrName)
   {
      TextBox textBox = createTextBox(obj, attrName);
      textBox.setWidth(width);
      return textBox;
   }
   
   private TextBox textBox;

   public TextBox getTextBox()
   {
      return textBox;
   }

   public void setTextBox(TextBox textBox)
   {
      this.textBox = textBox;
   }
   
   public static TextBox createTextBox(CObject obj, String attrName)
   {
      CTextChangeHandler handler = new CTextChangeHandler();
      TextBox textBox = new TextBox();
      
      handler.setTarget(obj);
      handler.setTargetAttrName(attrName);
      handler.setTextBox(textBox);
      String oldValue = (String) obj.get(attrName);
      textBox.setValue(oldValue);
      textBox.addChangeHandler(handler);
      obj.addPropertyChangeListener(attrName, handler);
      return textBox;
   }
   
   private TextArea textArea;

   public void setTextArea(TextArea textArea)
   {
	   this.textArea = textArea;
   }

   public TextArea getTextArea()
   {
	   return textArea;
   }
   
   public static TextArea createTextArea(CObject obj, String width, String height, String attrName)
   {
	      CTextChangeHandler handler = new CTextChangeHandler();
	      TextArea textArea = new TextArea();
	      
	      textArea.setSize(width, height);
	      
	      handler.setTarget(obj);
	      handler.setTargetAttrName(attrName);
	      handler.setTextArea(textArea);
	      String oldValue = (String) obj.get(attrName);
	      textArea.setValue(oldValue);
	      textArea.addChangeHandler(handler);
	      obj.addPropertyChangeListener(attrName, handler);
	      
	      return textArea;
   }
   
   private SuggestBox suggestBox;
   
   public SuggestBox getSuggestBox()
   {
		return suggestBox;
   }
	
   public void setSuggestBox(SuggestBox box)
   {
	   	this.suggestBox = box;
   }
   
   public static FactTypesListener factTypesListener;

   static class FactTypesListener extends FAction
   {
	   public ServiceDesigner designer;
	   @Override
	   public void doAction() 
	   {
		   // refresh the oracle
		   refreshOracle(designer);
		   
		   Object newValue = propertyEvent.getNewValue();
		   
		   if (newValue != null && newValue instanceof FactType)
		   {
			   FactType newType = (FactType) newValue;
			   newType.addPropertyChangeListener(FactType.PROPERTY_TYPE_NAME, this);
			   System.out.println("Added type name listener to new fact type");
		   }
	   }
   }
   
   @SuppressWarnings({ "unchecked" })
   public static SuggestBox createTypeSuggestBox(ServiceDesigner designer, CObject obj, String attrName)
   {
	   if (oracle == null) 
	   {
		   oracle = new MultiWordSuggestOracle();

		   // provide updater for type oracle
		   factTypesListener = new FactTypesListener();
		   factTypesListener.designer = designer;
		   designer.addPropertyChangeListener(ServiceDesigner.PROPERTY_FACT_TYPES, factTypesListener);
	   }
	   
	   refreshOracle(designer);
	   
	   final SuggestBox suggestBox = createSuggestBox(obj, attrName, oracle);
	   final TextBox textBox = (TextBox)suggestBox.getTextBox();
	   @SuppressWarnings("unused")
	   SuggestOracle boxOracle = suggestBox.getSuggestOracle();
	   
	   return suggestBox;
   }

   private static void refreshOracle(ServiceDesigner designer) 
   {
	   final ArrayList<String> words = new ArrayList<String>();

	   for (Iterator<FactType> types = designer.iteratorOfFactTypes(); types.hasNext();) 
	   {
		   FactType type = (FactType) types.next();
		   String typeName = type.getTypeName();
		   //format type name: (e.g. Book - fast.amazon)
		   // typeName = typeName.substring(typeName.lastIndexOf(".") + 1) + " - " +
		   // typeName.subSequence(0, typeName.lastIndexOf("."));
		   //add to oracle words
		   System.out.println("Add type to oracle: " + typeName);
		   if (typeName != null) 
		   {
			   words.add(typeName);
			   words.add("List of " + typeName);
		   }
	   }
	   
	   oracle.clear();
	   for (Iterator<String> wordIt = words.iterator(); wordIt.hasNext();)
	   {
		   String word = (String) wordIt.next();
		   oracle.add(word);
	   }
	   oracle.setDefaultSuggestionsFromText(words);
   }

   public static SuggestBox createWidthSuggestBox(CObject obj, String width, String attrName, MultiWordSuggestOracle oracle)
   {
	   SuggestBox suggestBox = createSuggestBox(obj, attrName, oracle);
	   suggestBox.setWidth(width);
	   return suggestBox;
   }

   public static SuggestBox createSuggestBox(CObject obj, String attrName, MultiWordSuggestOracle oracle)
   {
      CTextChangeHandler handler = new CTextChangeHandler();
      SuggestBox suggestBox = new SuggestBox(oracle);
      handler.setTarget(obj);
      handler.setTargetAttrName(attrName);
      handler.setSuggestBox(suggestBox);
      String oldValue = (String) obj.get(attrName);
      suggestBox.setValue(oldValue);
      suggestBox.addSelectionHandler(handler);
      
      obj.addPropertyChangeListener(attrName, handler);
      return suggestBox;
   }
   
   private CObject target;

   public CObject getTarget()
   {
      return target;
   }

   public void setTarget(CObject target)
   {
      this.target = target;
   }
   
   private String targetAttrName;
   private static MultiWordSuggestOracle oracle;

   public String getTargetAttrName()
   {
      return targetAttrName;
   }

   public void setTargetAttrName(String targetAttrName)
   {
      this.targetAttrName = targetAttrName;
   }

   @Override
   public void onChange(ChangeEvent event)
   {
      Object source = event.getSource();
      String text = "";
      if(source instanceof TextBox)
      {
    	  text = ((TextBox) source).getValue();
      }
      else if(source instanceof TextArea)
      {
    	  text = ((TextArea) source).getValue();
    	  //assign the value to the associated factType
    	  writeExampleValueToFactType(text);
      }
      System.out.println("Box: " + event.toString());
      System.out.println("value has changed to " + text);
      target.set(targetAttrName, text);
   }
   
   /**
    * assign the value to the associated factType
    * */
   @SuppressWarnings("unchecked")
   private void writeExampleValueToFactType(String value)
   { 
	   if(target instanceof FactPort)
	   {
		   FactPort factPort = (FactPort)target;
		   String factTypeName = factPort.getFactType();
		   
		   if(factPort.getServiceScreen() instanceof TrafoOperator)
		   {
			   TrafoOperator trafOp = (TrafoOperator)factPort.getServiceScreen();
			   ServiceDesigner designer = trafOp.getServiceDesigner();
			   
			   for (Iterator<FactType> iterator = designer.iteratorOfFactTypes(); iterator.hasNext();) {
				   FactType factType = (FactType) iterator.next();
				   if( factTypeName.equals(factType.getTypeName()))
				   {
					   FactExample firstExample = getFirstExample(factType);
					   firstExample.setJson(value);
					   break;
				   }
			   }
		   }
	   }
   }

   private FactExample getFirstExample(FactType factType) 
   {
	   Iterator iter = factType.iteratorOfFactExamples();
	   FactExample next;
	   if (iter.hasNext())
	   {
		   next = (FactExample) iter.next();
	   }
	   else
	   {
		   next = new FactExample();
		   factType.addToFactExamples(next);
	   }
	
	   return next;
   }

   @Override
   public void propertyChanged(PropertyChangeEvent evt)
   {
	   // change content of the textbox
      String newValue = (String) target.get(targetAttrName);
      if(textBox != null)
      {
    	  textBox.setValue(newValue);
      }
      else if(suggestBox != null)
      {
    	  suggestBox.setValue(newValue);
      }
      else if (textArea != null)
      {
    	  textArea.setValue(newValue);
      }
   }

   @Override
   public void onSelection(SelectionEvent<Suggestion> event)
   {
      String text = event.getSelectedItem().getReplacementString();
      System.out.println("Box: " + event.toString());
      System.out.println("value has changed to " + text);
      //fetch example value
      if(target instanceof FactPort)
      {
    	  fetchExampleValue();
      }
      target.set(targetAttrName, text);
   }

   /**
    * fetches the example value for the target factport
    * */
   private void fetchExampleValue()
   {
	   FactPort factPort = (FactPort)target;
	   String factTypeName = factPort.getFactType();
	   
	   if(factPort.getServiceScreen() instanceof TrafoOperator)
	   {
		   TrafoOperator trafOp = (TrafoOperator)factPort.getServiceScreen();
		   ServiceDesigner designer = trafOp.getServiceDesigner();
		   
		   for (Iterator<FactType> iterator = designer.iteratorOfFactTypes(); iterator.hasNext();) {
			   FactType factType = (FactType) iterator.next();
			   if( factTypeName.equals(factType.getTypeName()) & factType.iteratorOfFactExamples().hasNext())
			   {
				   FactExample example = (FactExample) getFirstExample(factType);
				   factPort.setExampleValue(example.getJson());
			   }
		   }
	   }
   }
}