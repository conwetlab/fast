/*
 * GWT compliant generated by Fujaba - CodeGen2 version 03.12.2009
 */

package fast.facttool.client;

import com.google.gwt.user.client.ui.Panel;
import com.google.gwt.user.client.ui.Button;
import fujaba.web.runtime.client.CObject;
import com.google.gwt.user.client.ui.TreeItem;
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.*;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.ClickEvent;




public class DeleteFactTypeButton implements PropertyChangeClient
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
   	
      return vec;
   }

   // generic set and get methods
   public void set (String fieldName, Object value)
   {
   }  

   public void add (String fieldName, Object value)
   {
      set (fieldName, value);
   }

   public Object get (String fieldName)
   {
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
   private Button deleteFactTypeButton;

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

      build = new Build ();
      deleteButtonClickHandler = new DeleteButtonClickHandler ();
      // NONE

      //build.addToFollowers("deleteFactTypeButton.click", deleteButtonClickHandler);
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

            // check object panel is really bound
            JavaSDM.ensure ( panel != null );
            // create object deleteFactTypeButton
            deleteFactTypeButton = new Button ( );

            // assign attribute deleteFactTypeButton
            deleteFactTypeButton.setText ("delete");
            // create link widget from panel to deleteFactTypeButton
            panel.add (deleteFactTypeButton);

            // collabStat call
            deleteFactTypeButton.setStyleName("fastButton");
            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }


         deleteFactTypeButton.addClickHandler(deleteButtonClickHandler);

       }

   }

   private DeleteButtonClickHandler deleteButtonClickHandler;
   public class DeleteButtonClickHandler extends FAction
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
            // check object parentItem is really bound
            JavaSDM.ensure ( parentItem != null );
            // collabStat call
            object.removeYou();
            // collabStat call
            parentItem.remove();
            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }



       }

   }

   // my style test for method.vm

   public void start (Panel panel , CObject object , TreeItem parentItem )
   { 
      // copy parameters to attributes
      this.panel = panel;
      this.object = object;
      this.parentItem = parentItem;
      start();
   }

   // attributes for action container method parameters 
   public Panel panel;
   public CObject object;
   public TreeItem parentItem;


   public void removeYou()
   {
   }
}


