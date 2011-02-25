/**
 * Copyright (c) 2008-2011, FAST Consortium
 * 
 * This file is part of FAST Platform.
 * 
 * FAST Platform is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * FAST Platform is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with FAST Platform. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Info about members and contributors of the FAST Consortium
 * is available at http://fast.morfeo-project.eu
 *
 **/
/*
 * GWT compliant generated by Fujaba - CodeGen2 version 03.12.2009
 */

package fast.common.client;

import java.lang.Object;
import fast.common.client.ServiceDesigner;
import fast.common.client.BuildingBlock;
import java.lang.Comparable;
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.*;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.ClickEvent;




public class ServiceScreen extends BuildingBlock implements Comparable
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
      vec.add("requestTemplate");
      vec.add("uri");
      vec.add("name");
   	
      return vec;
   }

   // generic set and get methods
   public void set (String fieldName, Object value)
   {
      // requestTemplate
      if ("requestTemplate".equals(fieldName)){
         setRequestTemplate((String) value);
      }      else      // uri
      if ("uri".equals(fieldName)){
         setUri((String) value);
      }      else      // name
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
      // requestTemplate
      if ("requestTemplate".equals(fieldName)){
         return (String) getRequestTemplate();
      }
      else      // uri
      if ("uri".equals(fieldName)){
         return (String) getUri();
      }
      else      // name
      if ("name".equals(fieldName)){
         return (String) getName();
      }
      else      if ("serviceDesigner".equals(fieldName))
      {
         return getServiceDesigner();
      }
      return null;
   }
   public int compareTo (Object other )
   { 

      return getName().compareTo(((ServiceScreen)other).getName());
   }

   public static final String PROPERTY_REQUEST_TEMPLATE = "requestTemplate";

   private String requestTemplate;

   public void setRequestTemplate (String value)
   {
      if ( ! JavaSDM.stringEquals (this.requestTemplate, value))
      {
         String oldValue = this.requestTemplate;
         this.requestTemplate = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_REQUEST_TEMPLATE, oldValue, value);
      }
   }

   public ServiceScreen withRequestTemplate (String value)
   {
      setRequestTemplate (value);
      return this;
   }

   public String getRequestTemplate ()
   {
      return this.requestTemplate;
   }

   /**
    * <pre>
    *           0..n     screens     0..1
    * ServiceScreen ------------------------- ServiceDesigner
    *           screens               serviceDesigner
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
         ServiceScreen source = this;
         if (this.serviceDesigner != null)
         {
            this.serviceDesigner = null;
            oldValue.removeFromScreens (this);
         }
         this.serviceDesigner = value;

         if (value != null)
         {
            value.addToScreens (this);
         }
            getPropertyChangeSupport().firePropertyChange(PROPERTY_SERVICE_DESIGNER, oldValue, value);
         changed = true;
      
      }
      return changed;
   }

   public ServiceScreen withServiceDesigner (ServiceDesigner value)
   {
      setServiceDesigner (value);
      return this;
   }

   public ServiceDesigner getServiceDesigner ()
   {
      return this.serviceDesigner;
   }

   public static final String PROPERTY_URI = "uri";

   private String uri;

   public void setUri (String value)
   {
      if ( ! JavaSDM.stringEquals (this.uri, value))
      {
         String oldValue = this.uri;
         this.uri = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_URI, oldValue, value);
      }
   }

   public ServiceScreen withUri (String value)
   {
      setUri (value);
      return this;
   }

   public String getUri ()
   {
      return this.uri;
   }

   public void removeYou()
   {
      this.setServiceDesigner (null);
      super.removeYou ();
   }
}


