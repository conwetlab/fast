/*
 * GWT compliant generated by Fujaba - CodeGen2 version 03.12.2009
 */

package fast.common.client;

import fast.common.client.ServiceDesigner;
import fast.common.client.BuildingBlock;
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.*;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.ClickEvent;




public class TrafoOperator extends BuildingBlock
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
      vec.add("name");
   	
      return vec;
   }

   // generic set and get methods
   public void set (String fieldName, Object value)
   {
      // name
      if ("name".equals(fieldName)){
         setName((String) value);
      }  else// serviceDesigner
      if ("serviceDesigner".equals(fieldName)){
         setServiceDesigner ((fast.common.client.ServiceDesigner) value);
      }   }  

   public void add (String fieldName, Object value)
   {
      set (fieldName, value);
   }

   public Object get (String fieldName)
   {
      // name
      if ("name".equals(fieldName)){
         return (String) getName();
      }
      else      if ("serviceDesigner".equals(fieldName))
      {
         return getServiceDesigner();
      }
      return null;
   }

   /**
    * <pre>
    *           0..*     trafoOperators     0..1
    * TrafoOperator ------------------------- ServiceDesigner
    *           trafoOperators               serviceDesigner
    * </pre>
    */
   public static final String PROPERTY_SERVICE_DESIGNER = "serviceDesigner";

   private ServiceDesigner serviceDesigner;

   public boolean setServiceDesigner (ServiceDesigner value)
   {
      boolean changed = false;

      if (this.serviceDesigner != value)
      {
      
         ServiceDesigner oldValue = this.serviceDesigner;
         TrafoOperator source = this;
         if (this.serviceDesigner != null)
         {
            this.serviceDesigner = null;
            oldValue.removeFromTrafoOperators (this);
         }
         this.serviceDesigner = value;

         if (value != null)
         {
            value.addToTrafoOperators (this);
         }
            getPropertyChangeSupport().firePropertyChange(PROPERTY_SERVICE_DESIGNER, oldValue, value);
         changed = true;
      
      }
      return changed;
   }

   public TrafoOperator withServiceDesigner (ServiceDesigner value)
   {
      setServiceDesigner (value);
      return this;
   }

   public ServiceDesigner getServiceDesigner ()
   {
      return this.serviceDesigner;
   }

   public void removeYou()
   {
      this.setServiceDesigner (null);
      super.removeYou ();
   }
}


