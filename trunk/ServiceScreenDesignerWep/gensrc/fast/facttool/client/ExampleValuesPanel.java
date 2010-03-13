/*
 * GWT compliant generated by Fujaba - CodeGen2 version 03.12.2009
 */

package fast.facttool.client;

import com.google.gwt.user.client.ui.TreeItem;
import fast.common.client.FactType;
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.*;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.ClickEvent;




public class ExampleValuesPanel
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

   // create attributes for all objects in all states of this statechart
   private TreeItem rootItem;

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

            // check object treeItem is really bound
            JavaSDM.ensure ( treeItem != null );
            // create object rootItem
            rootItem = new TreeItem ( );

            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }



       }

   }
   public void start (TreeItem treeItem , FactType factType )
   { 
      // copy parameters to attributes
      this.treeItem = treeItem;
      this.factType = factType;
      start();
   }

   // attributes for action container method parameters 
   public TreeItem treeItem;
   public FactType factType;


   public void removeYou()
   {
   }
}


