/*
 * GWT compliant generated by Fujaba - CodeGen2 version 03.12.2009
 */

package fast.facttool.client;

import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.Panel;
import fujaba.web.runtime.client.CObject;
import fast.common.client.FactType;
import fast.facttool.pinion.CatalogueAPI;
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.*;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.ClickEvent;




public class AttributeTextBox implements PropertyChangeClient
{

   public void removeAllFrom(String className) 
   {
   }
   
   /**
   Return ArrayList of all atrr names
   */
   public java.util.ArrayList arrayListOfAttrNames() 
   {
      java.util.ArrayList vec = new java.util.ArrayList();
      vec.add("attrName");
   	
      return vec;
   }

   // generic set and get methods
   public void set (String fieldName, Object value)
   {
      // attrName
      if ("attrName".equals(fieldName)){				
         setAttrName((String) value);
      }   }  

   public void add (String fieldName, Object value)
   {
      set (fieldName, value);
   }

   public Object get (String fieldName)
   {
      // attrName
      if ("attrName".equals(fieldName)){
         return (String) getAttrName();
      }
      return null;
   }
	protected final PropertyChangeSupport listeners = new PropertyChangeSupport(this);

	public void addPropertyChangeListener(PropertyChangeListener listener)
	{
		getPropertyChangeSupport().addPropertyChangeListener(listener);
	}

	public void removePropertyChangeListener(PropertyChangeListener listener)
	{
		getPropertyChangeSupport().removePropertyChangeListener(listener);
	}

	public void addPropertyChangeListener(String property, PropertyChangeListener listener)
	{
		getPropertyChangeSupport().addPropertyChangeListener(property, listener);
	}

	public void removePropertyChangeListener(String property, PropertyChangeListener listener)
	{
		getPropertyChangeSupport().removePropertyChangeListener(property, listener);
	}

	public PropertyChangeSupport getPropertyChangeSupport()
	{
		return listeners;
	}


   // create attributes for all objects in all states of this statechart
   private CatalogueAPI catalogueAPI;
   private TextBox textBox;

   public void start()
   {
      initStateChart();
      // call doAction on initial state
      build.doAction();
   }

   public void start(FAction parent)
   {
      initStateChart();
      //set parent of rootState
      build.setToParent(parent);
      // call doAction on rootState
      build.doAction();
   }

   // GWT statechart code
   public void initStateChart()
   {
      if(build != null)
         return;

      attrChangeListener = new AttrChangeListener ();
      build = new Build ();
      texBoxChangeHandler = new TexBoxChangeHandler ();
      // NONE

      //build.addToFollowers("object.change", attrChangeListener);
      // NONE

      //build.addToFollowers("textBox.change", texBoxChangeHandler);
   }


   private AttrChangeListener attrChangeListener;
   public class AttrChangeListener extends FAction
   {
       public void doAction()
       {
   		 boolean fujaba__Success = false;

         // story pattern storypatternwiththis
         try 
         {
            fujaba__Success = false; 

            // check object textBox is really bound
            JavaSDM.ensure ( textBox != null );
            // assign attribute textBox
            textBox.setText ((String) object.get(attrName));
            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }



       }

   }

   private Build build;
   public class Build extends FAction
   {
       public void doAction()
       {
   		 boolean fujaba__Success = false;

         // story pattern storypatternwiththis
         try 
         {
            fujaba__Success = false; 

            // check object parent is really bound
            JavaSDM.ensure ( parent != null );
            // create object textBox
            textBox = new TextBox ( );

            // assign attribute textBox
            textBox.setText ((String) object.get(attrName));
            // create link widget from parent to textBox
            parent.add (textBox);

            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }


         textBox.addChangeHandler(texBoxChangeHandler);
         object.addPropertyChangeListener(attrChangeListener);

       }

   }

   private TexBoxChangeHandler texBoxChangeHandler;
   public class TexBoxChangeHandler extends FAction
   {
       public void doAction()
       {
   		 boolean fujaba__Success = false;

         // story pattern storypatternwiththis
         try 
         {
            fujaba__Success = false; 

            // check object object is really bound
            JavaSDM.ensure ( object != null );
            // create object catalogueAPI
            catalogueAPI = new CatalogueAPI ( );

            // collabStat call
            catalogueAPI.shareConcept((FactType)object);
            // collabStat call
            object.set (attrName, textBox.getText());
            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }



       }

   }

   // my style test for method.vm


   // my style test for method.vm


   public static final String PROPERTY_ATTR_NAME = "attrName";

   private String attrName;

   public void setAttrName (String value)
   {
      if ( ! JavaSDM.stringEquals (this.attrName, value))
      {
         String oldValue = this.attrName;
         this.attrName = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_ATTR_NAME, oldValue, value);
      }
   }

   public AttributeTextBox withAttrName (String value)
   {
      setAttrName (value);
      return this;
   }

   public String getAttrName ()
   {
      return this.attrName;
   }
   public void start (Panel parent , CObject object )
   { 
      // copy parameters to attributes
      this.parent = parent;
      this.object = object;
      start();
   }

   // attributes for action container method parameters 
   public Panel parent;
   public CObject object;


   public void removeYou()
   {
   }
}


