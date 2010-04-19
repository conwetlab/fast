/*
 * GWT compliant generated by Fujaba - CodeGen2 version 03.12.2009
 */

package fast.common.client;

import com.google.gwt.user.client.ui.Panel;
import fast.common.client.ServiceScreen;
import com.google.gwt.user.client.ui.VerticalPanel;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.HorizontalPanel;
import fujaba.web.runtime.client.FAction;
import fast.servicescreen.client.ServiceScreenDesignerWep;
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.*;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.ClickEvent;




public class ScreenPanel implements PropertyChangeClient
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
   private VerticalPanel vertPanel;
   private Image image;
   private Label label;
   private Image delImage;
   private HorizontalPanel horiPanel;

   public void start()
   {
      initStateChart();
      // call doAction on initial state
      buildGUI.doAction();
   }

   public void start(FAction parent)
   {
      initStateChart();
      //set parent of rootState
      buildGUI.setToParent(parent);
      // call doAction on rootState
      buildGUI.doAction();
   }

   // GWT statechart code
   public void initStateChart()
   {
      if(buildGUI != null)
         return;

      buildGUI = new BuildGUI ();
      imageHandler = new ImageHandler ();
      removeWrapperHandler = new RemoveWrapperHandler ();
      screenListener = new ScreenListener ();
      // NONE

      //buildGUI.addToFollowers("delImage.click", removeWrapperHandler);
      // NONE

      //buildGUI.addToFollowers("image.click", imageHandler);
      // NONE

      //buildGUI.addToFollowers("screen.change", screenListener);
   }


   private BuildGUI buildGUI;
   public class BuildGUI extends FAction
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
            // check object screen is really bound
            JavaSDM.ensure ( screen != null );
            // create object vertPanel
            vertPanel = new VerticalPanel ( );

            // create object image
            image = new Image ("images/ServiceWrapperIcon.png");

            // create object label
            label = new Label ( );

            // create object delImage
            delImage = new Image("images/x.png");

            // create object horiPanel
            horiPanel = new HorizontalPanel ( );

            // assign attribute label
            label.setText (screen.getName());
            // create link widget from panel to vertPanel
            panel.add (vertPanel);

            // collabStat call
            horiPanel.add(image);
            // collabStat call
            horiPanel.add(delImage);
            // collabStat call
            vertPanel.add(horiPanel);
            // collabStat call
            vertPanel.add(label);
            // collabStat call
            if ( screen == wrapperTool.getServiceScreen() )
            {
            vertPanel.setBorderWidth(3);
            }
            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }


         screen.addPropertyChangeListener(screenListener);
         image.addClickHandler(imageHandler);
         delImage.addClickHandler(removeWrapperHandler);

       }

   }

   private ImageHandler imageHandler;
   public class ImageHandler extends FAction
   {
       public void doAction()
       {
   		 boolean fujaba__Success = false;

         // story pattern storypatternwiththis
         try 
         {
            fujaba__Success = false; 

            // check object refreshAction is really bound
            JavaSDM.ensure ( refreshAction != null );
            // check object screen is really bound
            JavaSDM.ensure ( screen != null );
            // check object wrapperTool is really bound
            JavaSDM.ensure ( wrapperTool != null );
            // create link serviceScreen from wrapperTool to screen
            wrapperTool.setServiceScreen (screen);

            // collabStat call
            refreshAction.doAction();
            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }



       }

   }

   private RemoveWrapperHandler removeWrapperHandler;
   public class RemoveWrapperHandler extends FAction
   {
       public void doAction()
       {
   		 boolean fujaba__Success = false;

         // story pattern storypatternwiththis
         try 
         {
            fujaba__Success = false; 

            // check object screen is really bound
            JavaSDM.ensure ( screen != null );
            // delete object screen
            screen.removeYou ();

            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }



       }

   }

   private ScreenListener screenListener;
   public class ScreenListener extends FAction
   {
       public void doAction()
       {
   		 boolean fujaba__Success = false;

         // story pattern storypatternwiththis
         try 
         {
            fujaba__Success = false; 

            // check object label is really bound
            JavaSDM.ensure ( label != null );
            // assign attribute label
            label.setText (screen.getName());
            fujaba__Success = true;
         }
         catch ( JavaSDMException fujaba__InternalException )
         {
            fujaba__Success = false;
         }



       }

   }

   // my style test for method.vm


   // my style test for method.vm


   // my style test for method.vm

   public void start (ServiceScreenDesignerWep wrapperTool , ServiceScreen screen , Panel panel , FAction refreshAction )
   { 
      // copy parameters to attributes
      this.wrapperTool = wrapperTool;
      this.screen = screen;
      this.panel = panel;
      this.refreshAction = refreshAction;
      start();
   }

   // attributes for action container method parameters 
   public ServiceScreenDesignerWep wrapperTool;
   public ServiceScreen screen;
   public Panel panel;
   public FAction refreshAction;


   public void removeYou()
   {
   }
}


