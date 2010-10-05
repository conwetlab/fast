/*
 * GWT compliant generated by Fujaba - CodeGen2 version 03.12.2009
 */

package fast.common.client;

import fast.common.client.FactType;
import fast.common.client.FastObject;
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.*;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.ClickEvent;




public class FactAttribute extends FastObject
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
      vec.add("factType");
   	
      return vec;
   }

   // generic set and get methods
   public void set (String fieldName, Object value)
   {
      // attrName
      if ("attrName".equals(fieldName)){				
         setAttrName((String) value);
      }      else      // factType
      if ("factType".equals(fieldName)){				
         setFactType((String) value);
      }//( toMany false || toMany2 true || qualified $qualified || 
// internalQualified false ||  
// role.Qualifier $role.Qualifier || ordered false || sorted false)
 //2[! (  ( toMany || !toMany2) && !( toMany && toMany2)  && role.Qualifier  ) ]
//2.2[ !( qualified && !internalQualified ) ]
 else// owner
      if ("owner".equals(fieldName)){				
         setOwner ((fast.common.client.FactType) value);
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
      else      // factType
      if ("factType".equals(fieldName)){
         return (String) getFactType();
      }
      else      if ("owner".equals(fieldName))
      {				
         return getOwner();
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

   public static final String PROPERTY_FACT_TYPE = "factType";

   private String factType;

   public void setFactType (String value)
   {
      if ( ! JavaSDM.stringEquals (this.factType, value))
      {
         String oldValue = this.factType;
         this.factType = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_FACT_TYPE, oldValue, value);
      }
   }

   public FactAttribute withFactType (String value)
   {
      setFactType (value);
      return this;
   }

   public String getFactType ()
   {
      return this.factType;
   }

   /**
    * <pre>
    *           0..*     factAttributes     0..1
    * FactAttribute ------------------------- FactType
    *           factAttributes               owner
    * </pre>
    */
   public static final String PROPERTY_OWNER = "owner";

   private FactType owner;

   public boolean setOwner (FactType value)
   {
      boolean changed = false;

      if (this.owner != value)
      {
      
         FactType oldValue = this.owner;
         FactAttribute source = this;
         if (this.owner != null)
         {
            this.owner = null;
            oldValue.removeFromFactAttributes (this);
         }
         this.owner = value;

         if (value != null)
         {
            value.addToFactAttributes (this);
         }
            getPropertyChangeSupport().firePropertyChange(PROPERTY_OWNER, oldValue, value);
         changed = true;
      
      }
      return changed;
   }

   public FactAttribute withOwner (FactType value)
   {
      setOwner (value);
      return this;
   }

   public FactType getOwner ()
   {
      return this.owner;
   }

   public void removeYou()
   {
      this.setOwner (null);
      super.removeYou ();
   }
}


