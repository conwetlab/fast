/*
 * GWT compliant generated by Fujaba - CodeGen2 version 25.3.2009
 */

package fast;

// GWT: fast.FASTMappingRule
// GWT: java.util.*

import java.util.*;
// GWT: de.upb.tools.fca.*

import fast.servicescreen.client.gui.ExtendedRuleParser.OperationHandler;
import fujaba.web.runtime.client.*;
// GWT: de.upb.tools.sdm.*

// GWT: fast.ServiceScreen
// GWT: fast.FastObject
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.Iterator;

public class FASTMappingRule extends FastObject
{
	//change ctr
	private OperationHandler opHandler = null;
	public void setOperationHandler(OperationHandler opHandler)
	{
		this.opHandler = opHandler;
	}
	public OperationHandler getOperationHandler()
	{
		return this.opHandler;
	}
	
	
   public void removeAllFrom(String className) {
      if ("fast.FASTMappingRule".equals(className))
      {				
         removeAllFromKids();
      }
   }
   
   /**
   Return ArrayList of all atrr names
   */
   public java.util.ArrayList arrayListOfAttrNames() {
   	java.util.ArrayList vec = new java.util.ArrayList();
   	vec.add("sourceTagname");
   	vec.add("targetElemName");
   	vec.add("kind");
   	
   	return vec;
   }

   // generic set and get methods
   public void set (String fieldName, Object value)
   {
      // sourceTagname
      if ("sourceTagname".equals(fieldName))
      {				
         setSourceTagname((String) value);
      }
      else      // targetElemName
      if ("targetElemName".equals(fieldName))
      {				
         setTargetElemName((String) value);
      }
      else      // kind
      if ("kind".equals(fieldName))
      {				
         setKind((String) value);
      }
      else      // serviceScreen
      if ("serviceScreen".equals(fieldName))
      {				
         setServiceScreen ((fast.ServiceScreen) value);
      }
      else      // kids
      if ("kids".equals(fieldName))
      {				
         addToKids ((fast.FASTMappingRule) value);
      }
      else      // parent
      if ("parent".equals(fieldName))
      {				
         setParent ((fast.FASTMappingRule) value);
      }
   }

   public Object get (String fieldName)
   {
      // sourceTagname
      if ("sourceTagname".equals(fieldName))
      {
         return (String) getSourceTagname();
      }
      else      // targetElemName
      if ("targetElemName".equals(fieldName))
      {
         return (String) getTargetElemName();
      }
      else      // kind
      if ("kind".equals(fieldName))
      {
         return (String) getKind();
      }
      else      if ("serviceScreen".equals(fieldName))
      {				
         return getServiceScreen();
      }
      else      if ("kids".equals(fieldName))
      {				
         return iteratorOfKids();
      }
      else      if ("parent".equals(fieldName))
      {				
         return getParent();
      }
      return null;
   }

   /**
    * <pre>
    *           0..1     kids     0..n
    * FASTMappingRule ------------------------- FASTMappingRule
    *           parent               kids
    * </pre>
    */
   public static final String PROPERTY_KIDS = "kids";

   private FPropLinkedList kids;

   public boolean addToKids (FASTMappingRule value)
   {
      boolean changed = false;

      if (value != null && !this.hasInKids (value))
      {
         if (this.kids == null)
         {
            this.kids = new FPropLinkedList (this, PROPERTY_KIDS);

         }
      
         changed = this.kids.add (value);
         if (changed)
         {
            value.setParent (this);
         }
      
      }
      return changed;
   }

   public FASTMappingRule withKids (FASTMappingRule value)
   {
      addToKids (value);
      return this;
   }

   public FASTMappingRule withoutKids (FASTMappingRule value)
   {
      removeFromKids (value);
      return this;
   }

   public boolean removeFromKids (FASTMappingRule value)
   {
      boolean changed = false;

      if ((this.kids != null) && (value != null))
      {
      
         changed = this.kids.remove (value);
         if (changed)
         {
            value.setParent (null);
         }
      
      }
      return changed;
   }

   public void removeAllFromKids ()
   {
   
      FASTMappingRule tmpValue;

      if (kids != null) {
         java.util.Vector tempSet = new java.util.Vector(kids);
         Iterator iter = tempSet.iterator ();
      
         while (iter.hasNext ())
         {
            tmpValue = (FASTMappingRule) iter.next ();
            this.removeFromKids (tmpValue);
         }
      } 
   
   }

   public boolean hasInKids (FASTMappingRule value)
   {
      return ((this.kids != null) &&
              (value != null) &&
              this.kids.contains (value));
   }

   public ListIterator iteratorOfKids ()
   {
      return ((this.kids == null)
              ? FEmptyListIterator.get ()
              : this.kids.listIterator());
   }

   public int sizeOfKids ()
   {
      return ((this.kids == null)
              ? 0
              : this.kids.size ());
   }
   public FASTMappingRule getFirstOfKids ()
   {
      if (kids == null)
      {
         return null;
      }
      else
      {
         if (kids.size() == 0) 	 
         { 	 
            return null; 	 
         }
         return (FASTMappingRule) kids.getFirst ();
      }
   }

   public FASTMappingRule getLastOfKids ()
   {
      if (kids == null)
      {
         return null;
      }
      else
      {
         if (kids.size() == 0) 	 
         { 	 
            return null; 	 
         }
         return (FASTMappingRule) kids.getLast ();
      }
   }
   public FASTMappingRule getFromKids ( int index )
   {
      if (index >= 0 && index < sizeOfKids ())
      {
         return (FASTMappingRule) this.kids.get (index);
      }
      else
      {
         throw new IllegalArgumentException ("getKidsAt(" + index + ")" );
      }
   }

   public int indexOfKids ( FASTMappingRule value )
   {
      return ((this.kids == null)
              ? -1
              : this.kids.indexOf (value));
   }

   public int indexOfKids ( FASTMappingRule value, int index )
   {
      return ((this.kids == null)
   	       ? -1
   	       : this.kids.indexOf (value, index));
   }

   public int lastIndexOfKids ( FASTMappingRule value )
   {
      return ((this.kids == null)
               ? -1
               : this.kids.lastIndexOf (value));
   }

   public int lastIndexOfKids ( FASTMappingRule value, int index )
   {
      return ((this.kids == null)
               ? -1
               : this.kids.lastIndexOf (value, index));
   }

   public boolean isBeforeOfKids ( FASTMappingRule leftObject, FASTMappingRule rightObject)
   {
      if (kids == null)
      {
         return false;
      }
      else
      {
         return kids.isBefore (leftObject, rightObject);
      }
   }

   public boolean isAfterOfKids ( FASTMappingRule leftObject, FASTMappingRule rightObject)
   {
      if (kids == null)
      {
         return false;
      }
      else
      {
         return kids.isAfter (leftObject, rightObject);
      }
   }

   public FASTMappingRule getNextOfKids ( FASTMappingRule object )
   {
      if (kids == null)
      {
         return null;
      }
      else
      {
         return (FASTMappingRule) kids.getNextOf (object);
      }
   }

   public FASTMappingRule getNextOfKids ( FASTMappingRule object, int index)
   {
      if (kids == null)
      {
         return null;
      }
      else
      {
         return (FASTMappingRule) kids.getNextOf (object, index);
      }
   }

   public FASTMappingRule getPreviousOfKids ( FASTMappingRule object)
   {
      if (kids == null)
      {
         return null;
      }
      else
      {
         return (FASTMappingRule) kids.getPreviousOf (object);
      }
   }

   public FASTMappingRule getPreviousOfKids ( FASTMappingRule object, int index )
   {
      if (kids == null)
      {
         return null;
      }
      else
      {
         return (FASTMappingRule) kids.getPreviousOf (object, index);
      }
   }

   public boolean addAfterOfKids ( FASTMappingRule refObject, FASTMappingRule value)
   {
      boolean changed = false;
      if (kids != null)
      {
         int index = kids.indexOf (refObject);
         changed = addToKids (index+1, value);
      }
      return changed;
   }

   public boolean addBeforeOfKids ( FASTMappingRule refObject, FASTMappingRule value)
   {
      boolean changed = false;
      if (kids != null)
      {
         int index = kids.indexOf (refObject);
         changed = addToKids (index, value);
      }
      return changed;
   }

   public boolean addToKids (int index, FASTMappingRule value)
   {
      boolean changed = false;

      if (value != null)
      {
         if (this.kids == null)
         {
            this.kids = new FPropLinkedList (this, PROPERTY_KIDS); // or FTreeSet () or FLinkedList ()
         }
         int oldIndex = this.indexOfKids (value);
         if (oldIndex != index)
         {
            try
            {
            
               if (oldIndex > -1)
               {
                  kids.remove (oldIndex);
               }
               kids.add (index, value);
               if (oldIndex < 0)
               {
                  value.setParent (this);
               }
               changed = true;
            
            }
            catch (IndexOutOfBoundsException ex)
            {
               return false;
            }
         }
      }
      return changed;
   }

   public boolean setInKids (int index, FASTMappingRule value)
   {
      boolean changed = false;

      if (value != null)
      {
         if (this.kids == null)
         {
            this.kids = new FPropLinkedList (this, PROPERTY_KIDS); // or FTreeSet () or FLinkedList ()
         }
         int oldIndex = this.indexOfKids (value);
         if (oldIndex != index)
         {
            try
            {
            
               FASTMappingRule oldValue = (FASTMappingRule)this.kids.set (index, value);
               if (oldIndex > -1)
               {
                  this.kids.remove (oldIndex);
               }
               if (oldValue != value)
               {
                  if (oldValue != null)
                  {
                     oldValue.setParent (null);
                  }
                  if (oldIndex < 0)
                  {
                     value.setParent (this);
                  }
                  changed = true;
               }
            
            }
            catch (IndexOutOfBoundsException ex)
            {
               return false;
            }
         }
      }
      return changed;
   }

   public boolean removeFromKids (int index)
   {
      boolean changed = false;

      if (this.kids != null && (index >= 0 && index < this.kids.size ()))
      {
      
         FASTMappingRule tmpValue = (FASTMappingRule) this.kids.remove (index);
         if (tmpValue != null)
         {
            tmpValue.setParent (null);
            changed = true;
         }
      
      }
      return changed;
   }

   public boolean removeFromKids (int index, FASTMappingRule value)
   {
      boolean changed = false;

      if ((this.kids != null) && (value != null) && 
          (index >= 0 && index < this.kids.size ()))
      {
         FASTMappingRule oldValue = (FASTMappingRule) this.kids.get (index);
         if (oldValue == value)
         {
         
            changed = this.removeFromKids (index);
         
         }
      }
      return changed;
   }

   public ListIterator iteratorOfKids ( FASTMappingRule  lowerBound )
   {
      ListIterator result = FEmptyListIterator.get ();

      if (kids != null && lowerBound != null)
      {
         int index = kids.indexOf (lowerBound) + 1;
         result = kids.listIterator (index);
      }
      else if (kids != null && lowerBound == null)
      {
         result = kids.listIterator (0);
      }

      return result;
   }

   public ListIterator iteratorOfKids (int index)
   {
      return ((this.kids == null)
              ? FEmptyListIterator.get ()
              : this.kids.listIterator (Math.max(0,Math.min(index,this.kids.size ()))));
   }

   public static final String PROPERTY_KIND = "kind";

   private String kind;

   public void setKind (String value)
   {
      if ( ! JavaSDM.stringEquals (this.kind, value))
      {
         String oldValue = this.kind;
         this.kind = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_KIND, oldValue, value);
      }
   }

   public FASTMappingRule withKind (String value)
   {
      setKind (value);
      return this;
   }

   public String getKind ()
   {
      return this.kind;
   }

   /**
    * <pre>
    *           0..n     kids     0..1
    * FASTMappingRule ------------------------- FASTMappingRule
    *           kids               parent
    * </pre>
    */
   public static final String PROPERTY_PARENT = "parent";

   private FASTMappingRule parent;

   public boolean setParent (FASTMappingRule value)
   {
      boolean changed = false;

      if (this.parent != value)
      {
      
         FASTMappingRule oldValue = this.parent;
         FASTMappingRule source = this;
         if (this.parent != null)
         {
            this.parent = null;
            oldValue.removeFromKids (this);
         }
         this.parent = value;

         if (value != null)
         {
            value.addToKids (this);
         }
            getPropertyChangeSupport().firePropertyChange(PROPERTY_PARENT, oldValue, value);
         changed = true;
      
      }
      return changed;
   }

   public FASTMappingRule withParent (FASTMappingRule value)
   {
      setParent (value);
      return this;
   }

   public FASTMappingRule getParent ()
   {
      return this.parent;
   }

   /**
    * <pre>
    *           0..*     mappingRules     0..1
    * FASTMappingRule ------------------------- ServiceScreen
    *           mappingRules               serviceScreen
    * </pre>
    */
   public static final String PROPERTY_SERVICE_SCREEN = "serviceScreen";

   private ServiceScreen serviceScreen;

   public boolean setServiceScreen (ServiceScreen value)
   {
      boolean changed = false;

      if (this.serviceScreen != value)
      {
      
         ServiceScreen oldValue = this.serviceScreen;
         FASTMappingRule source = this;
         if (this.serviceScreen != null)
         {
            this.serviceScreen = null;
            oldValue.removeFromMappingRules (this);
         }
         this.serviceScreen = value;

         if (value != null)
         {
            value.addToMappingRules (this);
         }
            getPropertyChangeSupport().firePropertyChange(PROPERTY_SERVICE_SCREEN, oldValue, value);
         changed = true;
      
      }
      return changed;
   }

   public FASTMappingRule withServiceScreen (ServiceScreen value)
   {
      setServiceScreen (value);
      return this;
   }

   public ServiceScreen getServiceScreen ()
   {
      return this.serviceScreen;
   }

   public static final String PROPERTY_SOURCE_TAGNAME = "sourceTagname";

   private String sourceTagname;

   public void setSourceTagname (String value)
   {
      if ( ! JavaSDM.stringEquals (this.sourceTagname, value))
      {
         String oldValue = this.sourceTagname;
         this.sourceTagname = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_SOURCE_TAGNAME, oldValue, value);
      }
   }

   public FASTMappingRule withSourceTagname (String value)
   {
      setSourceTagname (value);
      return this;
   }

   public String getSourceTagname ()
   {
      return this.sourceTagname;
   }

   public static final String PROPERTY_TARGET_ELEM_NAME = "targetElemName";

   private String targetElemName;

   public void setTargetElemName (String value)
   {
      if ( ! JavaSDM.stringEquals (this.targetElemName, value))
      {
         String oldValue = this.targetElemName;
         this.targetElemName = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_TARGET_ELEM_NAME, oldValue, value);
      }
   }

   public FASTMappingRule withTargetElemName (String value)
   {
      setTargetElemName (value);
      return this;
   }

   public String getTargetElemName ()
   {
      return this.targetElemName;
   }

   public void removeYou()
   {
      this.removeAllFromKids ();
      this.setParent (null);
      this.setServiceScreen (null);
      super.removeYou ();
   }
}


