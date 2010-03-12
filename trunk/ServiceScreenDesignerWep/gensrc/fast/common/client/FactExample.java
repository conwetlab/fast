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




public class FactExample implements PropertyChangeClient
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
      vec.add("json");
   	
      return vec;
   }

   // generic set and get methods
   public void set (String fieldName, Object value)
   {
      // json
      if ("json".equals(fieldName)){				
         setJson((String) value);
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
      // json
      if ("json".equals(fieldName)){
         return (String) getJson();
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


   /**
    * <pre>
    *           0..*     factExamples     0..1
    * FactExample ------------------------- FactType
    *           factExamples               factType
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
         FactExample source = this;
         if (this.factType != null)
         {
            this.factType = null;
            oldValue.removeFromFactExamples (this);
         }
         this.factType = value;

         if (value != null)
         {
            value.addToFactExamples (this);
         }
            getPropertyChangeSupport().firePropertyChange(PROPERTY_FACT_TYPE, oldValue, value);
         changed = true;
      
      }
      return changed;
   }

   public FactExample withFactType (FactType value)
   {
      setFactType (value);
      return this;
   }

   public FactType getFactType ()
   {
      return this.factType;
   }

   public static final String PROPERTY_JSON = "json";

   private String json;

   public void setJson (String value)
   {
      if ( ! JavaSDM.stringEquals (this.json, value))
      {
         String oldValue = this.json;
         this.json = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_JSON, oldValue, value);
      }
   }

   public FactExample withJson (String value)
   {
      setJson (value);
      return this;
   }

   public String getJson ()
   {
      return this.json;
   }

   public void removeYou()
   {
      this.setFactType (null);
   }
}


