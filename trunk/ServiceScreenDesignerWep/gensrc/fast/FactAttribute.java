/*
 * GWT compliant generated by Fujaba - CodeGen2 version 25.3.2009
 */

package fast;

// GWT: de.upb.tools.sdm.*

import fujaba.web.runtime.client.*;
// GWT: fast.FactType
// GWT: fast.FastObject
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.Iterator;

public class FactAttribute extends FastObject
{

   public void removeAllFrom(String className) {
   }
   
   /**
   Return ArrayList of all atrr names
   */
   public java.util.ArrayList arrayListOfAttrNames() {
   	java.util.ArrayList vec = new java.util.ArrayList();
   	vec.add("attrName");
   	
   	return vec;
   }

   // generic set and get methods
   public void set (String fieldName, Object value)
   {
      // attrName
      if ("attrName".equals(fieldName))
      {				
         setAttrName((String) value);
      }
      else      // factType
      if ("factType".equals(fieldName))
      {				
         setFactType ((fast.FactType) value);
      }
   }

   public Object get (String fieldName)
   {
      // attrName
      if ("attrName".equals(fieldName))
      {
         return (String) getAttrName();
      }
      else      if ("factType".equals(fieldName))
      {				
         return getFactType();
      }
      return null;
   }

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

   public FactAttribute withAttrName (String value)
   {
      setAttrName (value);
      return this;
   }

   public String getAttrName ()
   {
      return this.attrName;
   }

   /**
    * <pre>
    *           0..*     factAttributes     0..1
    * FactAttribute ------------------------- FactType
    *           factAttributes               factType
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
         FactAttribute source = this;
         if (this.factType != null)
         {
            this.factType = null;
            oldValue.removeFromFactAttributes (this);
         }
         this.factType = value;

         if (value != null)
         {
            value.addToFactAttributes (this);
         }
            getPropertyChangeSupport().firePropertyChange(PROPERTY_FACT_TYPE, oldValue, value);
         changed = true;
      
      }
      return changed;
   }

   public FactAttribute withFactType (FactType value)
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
      super.removeYou ();
   }
}

