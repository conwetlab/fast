/*
 * GWT compliant generated by Fujaba - CodeGen2 version 03.12.2009
 */

package fast.common.client;

import fast.common.client.FactType;
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.*;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.ClickEvent;




public class FactExampleValue implements PropertyChangeClient
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
      vec.add("content");
   	
      return vec;
   }

   // generic set and get methods
   public void set (String fieldName, Object value)
   {
      // content
      if ("content".equals(fieldName)){				
         setContent((String) value);
      }//( toMany false || toMany2 true || qualified $qualified || 
// internalQualified false ||  
// role.Qualifier $role.Qualifier || ordered false || sorted false)
 //2[! (  ( toMany || !toMany2) && !( toMany && toMany2)  && role.Qualifier  ) ]
//2.2[ !( qualified && !internalQualified ) ]
 else// factType
      if ("factType".equals(fieldName)){				
         setFactType ((fast.common.client.FactType) value);
      }   }  

   public void add (String fieldName, Object value)
   {
      set (fieldName, value);
   }

   public Object get (String fieldName)
   {
      // content
      if ("content".equals(fieldName)){
         return (String) getContent();
      }
      else      if ("factType".equals(fieldName))
      {				
         return getFactType();
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


   public static final String PROPERTY_CONTENT = "content";

   private String content;

   public void setContent (String value)
   {
      if ( ! JavaSDM.stringEquals (this.content, value))
      {
         String oldValue = this.content;
         this.content = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_CONTENT, oldValue, value);
      }
   }

   public FactExampleValue withContent (String value)
   {
      setContent (value);
      return this;
   }

   public String getContent ()
   {
      return this.content;
   }

   /**
    * <pre>
    *           0..*     factExampleValue     0..1
    * FactExampleValue ------------------------- FactType
    *           factExampleValue               factType
    * </pre>
    */
   public static final String PROPERTY_FACT_TYPE = "factType";

   private FactType factType;

   public boolean setFactType (FactType value)
   {
      boolean changed = false;

      if (this.factType != value)
      {
      
         FactType oldValue = this.factType;
         FactExampleValue source = this;
         if (this.factType != null)
         {
            this.factType = null;
            oldValue.removeFromFactExampleValue (this);
         }
         this.factType = value;

         if (value != null)
         {
            value.addToFactExampleValue (this);
         }
            getPropertyChangeSupport().firePropertyChange(PROPERTY_FACT_TYPE, oldValue, value);
         changed = true;
      
      }
      return changed;
   }

   public FactExampleValue withFactType (FactType value)
   {
      setFactType (value);
      return this;
   }

   public FactType getFactType ()
   {
      return this.factType;
   }

   public void removeYou()
   {
      this.setFactType (null);
   }
}


