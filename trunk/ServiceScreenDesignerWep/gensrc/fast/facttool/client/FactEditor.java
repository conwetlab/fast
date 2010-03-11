/*
 * GWT compliant generated by Fujaba - CodeGen2 version 03.12.2009
 */

package fast.facttool.client;

import fujaba.web.runtime.client.FTest;
import de.uni_kassel.webcoobra.client.CoobraRoot;
import java.util.*;
import fast.common.client.ServiceDesigner;
import fast.facttool.client.FactTypeTree;
import de.uni_kassel.webcoobra.client.CoobraServiceAsync;
import fast.common.client.BuildingBlock;
import de.uni_kassel.webcoobra.client.DataLoadTimer;
import fast.common.client.ServiceScreenModel;
import de.uni_kassel.webcoobra.client.*;
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.*;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.ClickEvent;


 //test

public class FactEditor
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
   private CoobraServiceAsync coobraService;
   private FactTypeTree factTypeTree;
   private CoobraRoot coobraRoot;
   private ServiceDesigner designer;
   private DataLoadTimer dataLoadTimer;
   private Iterator fujaba__IterCoobraRootToDesigner;
   private ServiceScreenModel modelRoot;
   private Object _TmpObject;

   public void start()
   {
      initStateChart();
      // call doAction on initial state
      init.doAction();
   }

   public void start(FAction parent)
   {
      initStateChart();
      //set parent of rootState
      init.setToParent(parent);
      // call doAction on rootState
      init.doAction();
   }

   // GWT statechart code
   public void initStateChart()
   {
      if(init != null)
         return;

      buildModel = new BuildModel ();
      init = new Init ();
      loadData = new LoadData ();
      // success
      init.setToSuccess(loadData);
      // success
      loadData.setToSuccess(buildModel);
   }


   // my style test for method.vm


   // my style test for method.vm


   private BuildModel buildModel;
   public class BuildModel extends FAction
   {
       public void doAction()
       {
   		 boolean fujaba__Success = false;

         // story pattern storypatternwiththis
         try 
         {
            fujaba__Success = false; 

            // check object coobraRoot is really bound
            JavaSDM.ensure ( coobraRoot != null );
            // iterate to-many link sharedObjects from coobraRoot to designer
            fujaba__Success = false;
            fujaba__IterCoobraRootToDesigner = coobraRoot.iteratorOfSharedObjects ();

            while ( !(fujaba__Success) && fujaba__IterCoobraRootToDesigner.hasNext () )
            {
               try
               {
                  _TmpObject =  fujaba__IterCoobraRootToDesigner.next ();

                  // ensure correct type and really bound of object designer
                  JavaSDM.ensure ( _TmpObject instanceof ServiceDesigner );
                  designer = (ServiceDesigner) _TmpObject;


                  fujaba__Success = true;
               }
               catch ( JavaSDMException fujaba__InternalException )
               {
                  fujaba__Success = false;
               }
            }
            JavaSDM.ensure (fujaba__Success);
            // create object factTypeTree
            factTypeTree = new FactTypeTree ( );

            // collabStat call
            FTest.assertTrue(true, "build model reached " + designer);
            // collabStat call
            factTypeTree.start ();
            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }



       }

   }

   private Init init;
   public class Init extends FAction
   {
       public void doAction()
       {
   		 boolean fujaba__Success = false;

         // story pattern storypatternwiththis
         try 
         {
            fujaba__Success = false; 

            coobraService = CoobraService.Util.getDefault();

            // check object coobraService is really bound
            JavaSDM.ensure ( coobraService != null );
            // collabStat call
            FTest.assertTrue(true, "inital statechart state reached");
            // collabStat call
            coobraService.openSession("login", "pass2", "ServiceScreenRepository.cdr", this);
            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }



       }

   }

   private LoadData loadData;
   public class LoadData extends FAction
   {
       public void doAction()
       {
   		 boolean fujaba__Success = false;

         // story pattern storypatternwiththis
         try 
         {
            fujaba__Success = false; 

            coobraRoot = CoobraRoot.get();

            // check object coobraRoot is really bound
            JavaSDM.ensure ( coobraRoot != null );
            dataLoadTimer = DataLoadTimer.get();

            // check object dataLoadTimer is really bound
            JavaSDM.ensure ( dataLoadTimer != null );
            // create object modelRoot
            modelRoot = new ServiceScreenModel ( );

            // assign attribute coobraRoot
            coobraRoot.setAutoLoadData (true);
            // assign attribute coobraRoot
            coobraRoot.setSendBufferTimeout (500);
            // assign attribute coobraRoot
            coobraRoot.setEnableSendBuffer (true);
            // assign attribute coobraRoot
            coobraRoot.setSessionId ((String) this.resultValue);
            // collabStat call
            FTest.assertTrue(true, "load data reached");
            // collabStat call
            modelRoot.registerModelRoot();
            // collabStat call
            dataLoadTimer.run(buildModel, null);
            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }



       }

   }

   public void removeYou()
   {
   }
}


