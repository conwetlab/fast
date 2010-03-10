
package fast.servicescreen.client.gui;

import java.util.ArrayList;
import java.util.Iterator;

import com.google.gwt.event.dom.client.ChangeEvent;
import com.google.gwt.event.dom.client.ChangeHandler;
import com.google.gwt.event.dom.client.FocusEvent;
import com.google.gwt.event.dom.client.FocusHandler;
import com.google.gwt.event.logical.shared.SelectionEvent;
import com.google.gwt.event.logical.shared.SelectionHandler;
import com.google.gwt.user.client.ui.MultiWordSuggestOracle;
import com.google.gwt.user.client.ui.SuggestBox;
import com.google.gwt.user.client.ui.SuggestOracle;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.SuggestOracle.Suggestion;

import fast.common.client.FactType;
import fast.common.client.ServiceDesigner;
import fujaba.web.runtime.client.CObject;
import de.uni_kassel.webcoobra.client.ModelRoot;
import fujaba.web.runtime.client.PropertyChangeEvent;
import fujaba.web.runtime.client.PropertyChangeListener;
import fujaba.web.runtime.client.reflect.CClass;

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
   
   private SuggestBox suggestBox;
   
   public SuggestBox getSuggestBox()
   {
		return suggestBox;
   }
	
   public void setSuggestBox(SuggestBox box)
   {
	   	this.suggestBox = box;
   }
   
   @SuppressWarnings({ "unchecked" })
   public static SuggestBox createTypeSuggestBox(ServiceDesigner designer, CObject obj, String attrName)
   {
	   //create oracle and all the types
	   MultiWordSuggestOracle oracle = new MultiWordSuggestOracle();
	   
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
	      words.add(typeName);
	      words.add("List of " +  typeName);
	   }
	   for (Iterator wordIt = words.iterator(); wordIt.hasNext();)
	   {
	      String word = (String) wordIt.next();
	      oracle.add(word);
	   }
	   oracle.setDefaultSuggestionsFromText(words);
	   
	   final SuggestBox suggestBox = createSuggestBox(obj, attrName, oracle);
	   final TextBox textBox = (TextBox)suggestBox.getTextBox();
	   @SuppressWarnings("unused")
	   SuggestOracle boxOracle = suggestBox.getSuggestOracle();
	   
	   textBox.addFocusHandler(new FocusHandler()
	   {
			@Override
			public void onFocus(FocusEvent event)
			{
				   if(!words.contains(suggestBox.getText())  && words.size() > 0)
				   {
					   textBox.setText(words.get(0));
				   }
			}
	   });
	   
//	   ((TextBox)suggestBox.getTextBox()).addKeyPressHandler(new KeyPressHandler()
//	   {
//
//			@Override
//			public void onKeyPress(KeyPressEvent event)
//			{
//				//TODO do nothing or stop all event firing!
//			}
//	   });
	   
	   return suggestBox;
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
      String oldValue = (String) obj.get(attrName);
      suggestBox.setValue(oldValue);
      suggestBox.addSelectionHandler(handler);
      //TODO: test if change comes to and from server 
//      ((TextBox)suggestBox.getTextBox()).addChangeHandler(handler);
      
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
      String text = ((TextBox) source).getValue();
      System.out.println("Box: " + event.toString());
      System.out.println("value has changed to " + text);
      target.set(targetAttrName, text);
   }

   @Override
   public void propertyChanged(PropertyChangeEvent evt)
   {
      // change content of the textbox
      String newValue = (String) target.get(targetAttrName);
      if(textBox != null)
    	  textBox.setValue(newValue);
      else if(suggestBox != null)
    	  suggestBox.setValue(newValue);
   }

   @Override
   public void onSelection(SelectionEvent<Suggestion> event)
   {
      String text = event.getSelectedItem().getReplacementString();
      System.out.println("Box: " + event.toString());
      System.out.println("value has changed to " + text);
      target.set(targetAttrName, text);
   }
}