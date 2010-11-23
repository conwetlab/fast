/*
 * GWT compliant generated by Fujaba - CodeGen2 version 03.12.2009
 */

package fast.common.client;

import fast.common.client.FactAttribute;
import java.util.*;
import fast.common.client.FactExample;
import fast.common.client.FactTag;
import fast.common.client.FactType;
import fast.common.client.ServiceDesigner;
import fast.common.client.FastObject;
import fujaba.web.runtime.client.reflect.*;
import fujaba.web.runtime.client.*;
import java.util.*;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.ClickEvent;




public class FactType extends FastObject
{

   public void removeAllFrom(String className) 
   {
      if ("fast.common.client.FactAttribute".equals(className)){
         removeAllFromFactAttributes();
      }
      else      if ("fast.common.client.FactType".equals(className)){
         removeAllFromIsa();
      }
      else      if ("fast.common.client.FactType".equals(className)){
         removeAllFromSubtypes();
      }
      else      if ("fast.common.client.FactExample".equals(className)){
         removeAllFromFactExamples();
      }
      else      if ("fast.common.client.FactTag".equals(className)){				
         removeAllFromFactTags();
      }
   }
   
   /**
   Return ArrayList of all atrr names
   */
   public java.util.ArrayList arrayListOfAttrNames() 
   {
      java.util.ArrayList vec = new java.util.ArrayList();
      vec.add("typeName");
      vec.add("mnemonic");
      vec.add("uri");
      vec.add("label");
      vec.add("description");
      vec.add("subclassOf");
   	
      return vec;
   }

   // generic set and get methods
   public void set (String fieldName, Object value)
   {
      // typeName
      if ("typeName".equals(fieldName)){
         setTypeName((String) value);
      }      else      // mnemonic
      if ("mnemonic".equals(fieldName)){
         setMnemonic((String) value);
      }      else      // uri
      if ("uri".equals(fieldName)){
         setUri((String) value);
      }      else      // label
      if ("label".equals(fieldName)){				
         setLabel((String) value);
      }      else      // description
      if ("description".equals(fieldName)){				
         setDescription((String) value);
      }      else      // subclassOf
      if ("subclassOf".equals(fieldName)){				
         setSubclassOf((String) value);
      }//( toMany false || toMany2 true || qualified $qualified || 
// internalQualified false ||  
// role.Qualifier $role.Qualifier || ordered false || sorted false)
 //2[! (  ( toMany || !toMany2) && !( toMany && toMany2)  && role.Qualifier  ) ]
//2.2[ !( qualified && !internalQualified ) ]
 else// serviceDesigner
      if ("serviceDesigner".equals(fieldName)){				
         setServiceDesigner ((fast.common.client.ServiceDesigner) value);
      }  else// factAttributes
      if ("factAttributes".equals(fieldName)){
         addToFactAttributes ((fast.common.client.FactAttribute) value);
      }  else// isa
      if ("isa".equals(fieldName)){
         addToIsa ((fast.common.client.FactType) value);
      }  else// subtypes
      if ("subtypes".equals(fieldName)){
         addToSubtypes ((fast.common.client.FactType) value);
      }  else// factExamples
      if ("factExamples".equals(fieldName)){
         addToFactExamples ((fast.common.client.FactExample) value);
      }//( toMany true || toMany2 false || qualified $qualified || 
// internalQualified false ||  
// role.Qualifier $role.Qualifier || ordered false || sorted false)
 //2[! (  ( toMany || !toMany2) && !( toMany && toMany2)  && role.Qualifier  ) ]
//2.2[ !( qualified && !internalQualified ) ]
 else// factTags
      if ("factTags".equals(fieldName)){				
         addToFactTags ((fast.common.client.FactTag) value);
      }   }  

   public void add (String fieldName, Object value)
   {
      set (fieldName, value);
   }

   public Object get (String fieldName)
   {
      // typeName
      if ("typeName".equals(fieldName)){
         return (String) getTypeName();
      }
      else      // mnemonic
      if ("mnemonic".equals(fieldName)){
         return (String) getMnemonic();
      }
      else      // uri
      if ("uri".equals(fieldName)){
         return (String) getUri();
      }
      else      // label
      if ("label".equals(fieldName)){
         return (String) getLabel();
      }
      else      // description
      if ("description".equals(fieldName)){
         return (String) getDescription();
      }
      else      // subclassOf
      if ("subclassOf".equals(fieldName)){
         return (String) getSubclassOf();
      }
      else      if ("serviceDesigner".equals(fieldName))
      {
         return getServiceDesigner();
      }
      else      if ("factAttributes".equals(fieldName))
      {
         return iteratorOfFactAttributes();
      }
      else      if ("isa".equals(fieldName))
      {
         return iteratorOfIsa();
      }
      else      if ("subtypes".equals(fieldName))
      {
         return iteratorOfSubtypes();
      }
      else      if ("factExamples".equals(fieldName))
      {
         return iteratorOfFactExamples();
      }
      else      if ("factTags".equals(fieldName))
      {				
         return iteratorOfFactTags();
      }
      return null;
   }

   public static final String PROPERTY_DESCRIPTION = "description";

   private String description;

   public void setDescription (String value)
   {
      if ( ! JavaSDM.stringEquals (this.description, value))
      {
         String oldValue = this.description;
         this.description = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_DESCRIPTION, oldValue, value);
      }
   }

   public FactType withDescription (String value)
   {
      setDescription (value);
      return this;
   }

   public String getDescription ()
   {
      return this.description;
   }

   /**
    * <pre>
    *           0..1     factAttributes     0..*
    * FactType ------------------------- FactAttribute
    *           owner               factAttributes
    * </pre>
    */
   public static final String PROPERTY_FACT_ATTRIBUTES = "factAttributes";

   private FPropHashSet<FactAttribute> factAttributes;

   public FPropHashSet<FactAttribute> getFactAttributes () {
      return factAttributes;
   }

   public boolean addToFactAttributes (FactAttribute value) {
      boolean changed = false;

      if (value != null)
      {
         if (this.factAttributes == null)
         {
            this.factAttributes = new FPropHashSet<FactAttribute> (this, PROPERTY_FACT_ATTRIBUTES);

         }
      
         changed = this.factAttributes.add (value);
         if (changed)
         {
            value.setOwner (this);
         }
      
      }
      return changed;
   }

   public FactType withFactAttributes (FactAttribute value ) {
         addToFactAttributes ( value);
      return this;
   }

   public FactType withoutFactAttributes (FactAttribute value) {
      removeFromFactAttributes (value);
      return this;
   }

   public boolean removeFromFactAttributes (FactAttribute value) {
      boolean changed = false;

      if ((this.factAttributes != null) && (value != null))
      {
      
         changed = this.factAttributes.remove (value);
         if (changed)
         {
            value.setOwner (null);
         }
      
      }
      return changed;
   }

   public void removeAllFromFactAttributes () {
   
      FactAttribute tmpValue;

      if (factAttributes != null) {
         java.util.Vector tempSet = new java.util.Vector(factAttributes);
         Iterator iter = tempSet.iterator ();
      
         while (iter.hasNext ())
         {
            tmpValue = (FactAttribute) iter.next ();
            this.removeFromFactAttributes (tmpValue);
         }
      } 
   
   }

   public boolean hasInFactAttributes (FactAttribute value) {
      return ((this.factAttributes != null) &&
              (value != null) &&
              this.factAttributes.contains (value));
   }

   public Iterator iteratorOfFactAttributes () {
      return ((this.factAttributes == null)
              ? FEmptyIterator.get ()
              : this.factAttributes.iterator ());

   }

   public int sizeOfFactAttributes () {
      return ((this.factAttributes == null)
              ? 0
              : this.factAttributes.size ());
   }

   /**
    * <pre>
    *           0..1     factExamples     0..*
    * FactType ------------------------- FactExample
    *           factType               factExamples
    * </pre>
    */
   public static final String PROPERTY_FACT_EXAMPLES = "factExamples";

   private FPropHashSet<FactExample> factExamples;

   public FPropHashSet<FactExample> getFactExamples () {
      return factExamples;
   }

   public boolean addToFactExamples (FactExample value) {
      boolean changed = false;

      if (value != null)
      {
         if (this.factExamples == null)
         {
            this.factExamples = new FPropHashSet<FactExample> (this, PROPERTY_FACT_EXAMPLES);

         }
      
         changed = this.factExamples.add (value);
         if (changed)
         {
            value.setFactType (this);
         }
      
      }
      return changed;
   }

   public FactType withFactExamples (FactExample value ) {
         addToFactExamples ( value);
      return this;
   }

   public FactType withoutFactExamples (FactExample value) {
      removeFromFactExamples (value);
      return this;
   }

   public boolean removeFromFactExamples (FactExample value) {
      boolean changed = false;

      if ((this.factExamples != null) && (value != null))
      {
      
         changed = this.factExamples.remove (value);
         if (changed)
         {
            value.setFactType (null);
         }
      
      }
      return changed;
   }

   public void removeAllFromFactExamples () {
   
      FactExample tmpValue;

      if (factExamples != null) {
         java.util.Vector tempSet = new java.util.Vector(factExamples);
         Iterator iter = tempSet.iterator ();
      
         while (iter.hasNext ())
         {
            tmpValue = (FactExample) iter.next ();
            this.removeFromFactExamples (tmpValue);
         }
      } 
   
   }

   public boolean hasInFactExamples (FactExample value) {
      return ((this.factExamples != null) &&
              (value != null) &&
              this.factExamples.contains (value));
   }

   public Iterator iteratorOfFactExamples () {
      return ((this.factExamples == null)
              ? FEmptyIterator.get ()
              : this.factExamples.iterator ());

   }

   public int sizeOfFactExamples () {
      return ((this.factExamples == null)
              ? 0
              : this.factExamples.size ());
   }

   /**
    * <pre>
    *           0..1     factTags     0..*
    * FactType ------------------------- FactTag
    *           owner               factTags
    * </pre>
    */
   public static final String PROPERTY_FACT_TAGS = "factTags";

   private FPropHashSet<FactTag> factTags;

   public FPropHashSet<FactTag> getFactTags () {
      return factTags;
   }

   public boolean addToFactTags (FactTag value) {
      boolean changed = false;

      if (value != null)
      {
         if (this.factTags == null)
         {
            this.factTags = new FPropHashSet<FactTag> (this, PROPERTY_FACT_TAGS);

         }
      
         changed = this.factTags.add (value);
         if (changed)
         {
            value.setOwner (this);
         }
      
      }
      return changed;
   }

   public FactType withFactTags (FactTag value ) {
         addToFactTags ( value);
      return this;
   }

   public FactType withoutFactTags (FactTag value) {
      removeFromFactTags (value);
      return this;
   }

   public boolean removeFromFactTags (FactTag value) {
      boolean changed = false;

      if ((this.factTags != null) && (value != null))
      {
      
         changed = this.factTags.remove (value);
         if (changed)
         {
            value.setOwner (null);
         }
      
      }
      return changed;
   }

   public void removeAllFromFactTags () {
   
      FactTag tmpValue;

      if (factTags != null) {
         java.util.Vector tempSet = new java.util.Vector(factTags);
         Iterator iter = tempSet.iterator ();
      
         while (iter.hasNext ())
         {
            tmpValue = (FactTag) iter.next ();
            this.removeFromFactTags (tmpValue);
         }
      } 
   
   }

   public boolean hasInFactTags (FactTag value) {
      return ((this.factTags != null) &&
              (value != null) &&
              this.factTags.contains (value));
   }

   public Iterator iteratorOfFactTags () {
      return ((this.factTags == null)
              ? FEmptyIterator.get ()
              : this.factTags.iterator ());

   }

   public int sizeOfFactTags () {
      return ((this.factTags == null)
              ? 0
              : this.factTags.size ());
   }

   /**
    * <pre>
    *           0..n     isa     0..n
    * FactType ------------------------- FactType
    *           subtypes               isa
    * </pre>
    */
   public static final String PROPERTY_ISA = "isa";

   private FPropHashSet<FactType> isa;

   public FPropHashSet<FactType> getIsa () {
      return isa;
   }

   public boolean addToIsa (FactType value) {
      boolean changed = false;

      if (value != null)
      {
         if (this.isa == null)
         {
            this.isa = new FPropHashSet<FactType> (this, PROPERTY_ISA);

         }
      
         changed = this.isa.add (value);
         if (changed)
         {
            value.addToSubtypes (this);
         }
      
      }
      return changed;
   }

   public FactType withIsa (FactType value ) {
         addToIsa ( value);
      return this;
   }

   public FactType withoutIsa (FactType value) {
      removeFromIsa (value);
      return this;
   }

   public boolean removeFromIsa (FactType value) {
      boolean changed = false;

      if ((this.isa != null) && (value != null))
      {
      
         changed = this.isa.remove (value);
         if (changed)
         {
            value.removeFromSubtypes (this);
         }
      
      }
      return changed;
   }

   public void removeAllFromIsa () {
   
      FactType tmpValue;

      if (isa != null) {
         java.util.Vector tempSet = new java.util.Vector(isa);
         Iterator iter = tempSet.iterator ();
      
         while (iter.hasNext ())
         {
            tmpValue = (FactType) iter.next ();
            this.removeFromIsa (tmpValue);
         }
      } 
   
   }

   public boolean hasInIsa (FactType value) {
      return ((this.isa != null) &&
              (value != null) &&
              this.isa.contains (value));
   }

   public Iterator iteratorOfIsa () {
      return ((this.isa == null)
              ? FEmptyIterator.get ()
              : this.isa.iterator ());

   }

   public int sizeOfIsa () {
      return ((this.isa == null)
              ? 0
              : this.isa.size ());
   }

   public static final String PROPERTY_LABEL = "label";

   private String label;

   public void setLabel (String value)
   {
      if ( ! JavaSDM.stringEquals (this.label, value))
      {
         String oldValue = this.label;
         this.label = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_LABEL, oldValue, value);
      }
   }

   public FactType withLabel (String value)
   {
      setLabel (value);
      return this;
   }

   public String getLabel ()
   {
      return this.label;
   }

   public static final String PROPERTY_MNEMONIC = "mnemonic";

   private String mnemonic;

   public void setMnemonic (String value)
   {
      if ( ! JavaSDM.stringEquals (this.mnemonic, value))
      {
         String oldValue = this.mnemonic;
         this.mnemonic = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_MNEMONIC, oldValue, value);
      }
   }

   public FactType withMnemonic (String value)
   {
      setMnemonic (value);
      return this;
   }

   public String getMnemonic ()
   {
      return this.mnemonic;
   }

   /**
    * <pre>
    *           0..*     factTypes     0..1
    * FactType ------------------------- ServiceDesigner
    *           factTypes               serviceDesigner
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
         FactType source = this;
         if (this.serviceDesigner != null)
         {
            this.serviceDesigner = null;
            oldValue.removeFromFactTypes (this);
         }
         this.serviceDesigner = value;

         if (value != null)
         {
            value.addToFactTypes (this);
         }
            getPropertyChangeSupport().firePropertyChange(PROPERTY_SERVICE_DESIGNER, oldValue, value);
         changed = true;
      
      }
      return changed;
   }

   public FactType withServiceDesigner (ServiceDesigner value)
   {
      setServiceDesigner (value);
      return this;
   }

   public ServiceDesigner getServiceDesigner ()
   {
      return this.serviceDesigner;
   }

   public static final String PROPERTY_SUBCLASS_OF = "subclassOf";

   private String subclassOf;

   public void setSubclassOf (String value)
   {
      if ( ! JavaSDM.stringEquals (this.subclassOf, value))
      {
         String oldValue = this.subclassOf;
         this.subclassOf = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_SUBCLASS_OF, oldValue, value);
      }
   }

   public FactType withSubclassOf (String value)
   {
      setSubclassOf (value);
      return this;
   }

   public String getSubclassOf ()
   {
      return this.subclassOf;
   }

   /**
    * <pre>
    *           0..n     isa     0..n
    * FactType ------------------------- FactType
    *           isa               subtypes
    * </pre>
    */
   public static final String PROPERTY_SUBTYPES = "subtypes";

   private FPropHashSet<FactType> subtypes;

   public FPropHashSet<FactType> getSubtypes () {
      return subtypes;
   }

   public boolean addToSubtypes (FactType value) {
      boolean changed = false;

      if (value != null)
      {
         if (this.subtypes == null)
         {
            this.subtypes = new FPropHashSet<FactType> (this, PROPERTY_SUBTYPES);

         }
      
         changed = this.subtypes.add (value);
         if (changed)
         {
            value.addToIsa (this);
         }
      
      }
      return changed;
   }

   public FactType withSubtypes (FactType value ) {
         addToSubtypes ( value);
      return this;
   }

   public FactType withoutSubtypes (FactType value) {
      removeFromSubtypes (value);
      return this;
   }

   public boolean removeFromSubtypes (FactType value) {
      boolean changed = false;

      if ((this.subtypes != null) && (value != null))
      {
      
         changed = this.subtypes.remove (value);
         if (changed)
         {
            value.removeFromIsa (this);
         }
      
      }
      return changed;
   }

   public void removeAllFromSubtypes () {
   
      FactType tmpValue;

      if (subtypes != null) {
         java.util.Vector tempSet = new java.util.Vector(subtypes);
         Iterator iter = tempSet.iterator ();
      
         while (iter.hasNext ())
         {
            tmpValue = (FactType) iter.next ();
            this.removeFromSubtypes (tmpValue);
         }
      } 
   
   }

   public boolean hasInSubtypes (FactType value) {
      return ((this.subtypes != null) &&
              (value != null) &&
              this.subtypes.contains (value));
   }

   public Iterator iteratorOfSubtypes () {
      return ((this.subtypes == null)
              ? FEmptyIterator.get ()
              : this.subtypes.iterator ());

   }

   public int sizeOfSubtypes () {
      return ((this.subtypes == null)
              ? 0
              : this.subtypes.size ());
   }

   public static final String PROPERTY_TYPE_NAME = "typeName";

   private String typeName;

   public void setTypeName (String value)
   {
      if ( ! JavaSDM.stringEquals (this.typeName, value))
      {
         String oldValue = this.typeName;
         this.typeName = value;
         getPropertyChangeSupport().firePropertyChange(PROPERTY_TYPE_NAME, oldValue, value);
      }
   }

   public FactType withTypeName (String value)
   {
      setTypeName (value);
      return this;
   }

   public String getTypeName ()
   {
      return this.typeName;
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

   public FactType withUri (String value)
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
      this.removeAllFromFactAttributes ();
      this.removeAllFromFactExamples ();
      this.removeAllFromFactTags ();
      this.removeAllFromIsa ();
      this.setServiceDesigner (null);
      this.removeAllFromSubtypes ();
      super.removeYou ();
   }
}


