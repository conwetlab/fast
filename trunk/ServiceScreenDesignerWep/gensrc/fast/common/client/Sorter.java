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

import fast.common.client.ServiceScreen;
import java.util.*;
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.*;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.ClickEvent;




public class Sorter implements PropertyChangeClient
{

   public void removeAllFrom(String className) 
   {
      if ("fast.common.client.ServiceScreen".equals(className)){
         removeAllFromServiceScreens();
      }
   }
   
   /**
   Return ArrayList of all atrr names
   */
   public java.util.ArrayList arrayListOfAttrNames() 
   {
      java.util.ArrayList vec = new java.util.ArrayList();
   	
      return vec;
   }

   // generic set and get methods
   public void set (String fieldName, Object value)
   {
  // serviceScreens
      if ("serviceScreens".equals(fieldName)){
         addToServiceScreens ((fast.common.client.ServiceScreen) value);
      }   }  

   public void add (String fieldName, Object value)
   {
      set (fieldName, value);
   }

   public Object get (String fieldName)
   {
      if ("serviceScreens".equals(fieldName))
      {
         return iteratorOfServiceScreens();
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

   public  Sorter ()
   { 
      boolean fujaba__Success = false;

      // story pattern storypatternwiththis
      try 
      {
         fujaba__Success = false; 

         // collabStat call
         serviceScreens = new FPropTreeSet<ServiceScreen> (this, PROPERTY_SERVICE_SCREENS);
         fujaba__Success = true;
      }
      catch ( JavaSDMException fujaba__InternalException )
      {
         fujaba__Success = false;
      }

      return ;
   }

   /**
    * <pre>
    *           0..1     serviceScreens     0..n
    * Sorter ------------------------> ServiceScreen
    *           sorter               serviceScreens
    * </pre>
    */
   public static final String PROPERTY_SERVICE_SCREENS = "serviceScreens";

   private FPropTreeSet<ServiceScreen> serviceScreens;

   public FPropTreeSet<ServiceScreen> getServiceScreens () {
      return serviceScreens;
   }

   public boolean addToServiceScreens (ServiceScreen value) {
      boolean changed = false;

      if (value != null)
      {
         if (this.serviceScreens == null)
         {
            this.serviceScreens = new FPropTreeSet<ServiceScreen> (this, PROPERTY_SERVICE_SCREENS);

         }
      
         changed = this.serviceScreens.add (value);
      
      }
      return changed;
   }

   public Sorter withServiceScreens (ServiceScreen value ) {
         addToServiceScreens ( value);
      return this;
   }

   public Sorter withoutServiceScreens (ServiceScreen value) {
      removeFromServiceScreens (value);
      return this;
   }

   public boolean removeFromServiceScreens (ServiceScreen value) {
      boolean changed = false;

      if ((this.serviceScreens != null) && (value != null))
      {
      
         changed = this.serviceScreens.remove (value);
      
      }
      return changed;
   }

   public void removeAllFromServiceScreens () {
      if (this.serviceScreens != null && this.serviceScreens.size () > 0)
      {
      
         this.serviceScreens.clear();
      
      }
   }

   public boolean hasInServiceScreens (ServiceScreen value) {
      return ((this.serviceScreens != null) &&
              (value != null) &&
              this.serviceScreens.contains (value));
   }

   public Iterator iteratorOfServiceScreens () {
      return ((this.serviceScreens == null)
              ? FEmptyIterator.get ()
              : this.serviceScreens.iterator ());

   }

   public int sizeOfServiceScreens () {
      return ((this.serviceScreens == null)
              ? 0
              : this.serviceScreens.size ());
   }
   public ServiceScreen getFirstOfServiceScreens ()
   {
      if (serviceScreens == null)
      {
         return null;
      }
      else
      {
         if (serviceScreens.size() == 0) 	 
         { 	 
            return null; 	 
         }
         return (ServiceScreen) serviceScreens.getFirst ();
      }
   }

   public ServiceScreen getLastOfServiceScreens ()
   {
      if (serviceScreens == null)
      {
         return null;
      }
      else
      {
         if (serviceScreens.size() == 0) 	 
         { 	 
            return null; 	 
         }
         return (ServiceScreen) serviceScreens.getLast ();
      }
   }

   public void removeYou()
   {
      this.removeAllFromServiceScreens ();
   }
}


