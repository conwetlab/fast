package fast.servicescreen.client.gui;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.Set;

import com.google.gwt.json.client.JSONArray;
import com.google.gwt.json.client.JSONBoolean;
import com.google.gwt.json.client.JSONNumber;
import com.google.gwt.json.client.JSONObject;
import com.google.gwt.json.client.JSONString;
import com.google.gwt.json.client.JSONValue;
import com.google.gwt.user.client.ui.Tree;
import com.google.gwt.user.client.ui.TreeItem;
import com.google.gwt.xml.client.Document;
import com.google.gwt.xml.client.Element;
import com.google.gwt.xml.client.NamedNodeMap;
import com.google.gwt.xml.client.Node;
import com.google.gwt.xml.client.NodeList;

import fast.common.client.FASTMappingRule;

/**
 * This class contain static versions of helper methods needed
 * in more than one part of the SSD
 * */
public class RuleUtil
{
	   /**
	    * expands a tree to level 3
	    * */
	   public static void expandTree(Tree tree)
	   {
		   TreeItem tempItem = tree.getItem(0);
		   if (tempItem != null)
			   tempItem.setState(true);
		   
		   for (int i = 0; i < tempItem.getChildCount(); i++)
		   {
			   TreeItem tempChild = tempItem.getChild(i);
			   if (tempChild != null){
				   for (int j = 0; j < tempChild.getChildCount(); j++)
				   {
					   TreeItem tempKid = tempChild.getChild(j);
					   if (tempKid != null){
						   tempKid.setState(true);
					   }
				   }
				   tempChild.setState(true);
			   }
		   }
	   }
	   
	   /**
	    * Expands the hole Tree (if u give the rootitem of the tree) or even
	    * the subitems of given item.
	    * */
	   public static void expandItem(TreeItem item)
	   {
		   if (item != null)
		   {
			   item.setState(true);
			   
			   for (int i = 0; i < item.getChildCount(); i++)
			   {
				   TreeItem tempChild = item.getChild(i);
				   
				   tempChild.setState(true);
				   
				   expandItem(tempChild);
			   }
		   }
	   }
	   
	   /**
		 * Recursive method for retrieving all jsonvalues for a specified tagName
		 * */
	   public static void jsonValuesByTagName(JSONArray elements, JSONValue root, String tagName)
	   { 
		   //if object search on first layer. on failure begin depth-search
		   JSONObject object = root.isObject();
		   if( object != null )
		   {	
			   //get (first layer) keys contained in the JSONValue
			   Set<String> keys = object.keySet();

			   //seek on first layer
			   for (Iterator<String> iterator = keys.iterator(); iterator.hasNext();)
			   {
				   String key = (String) iterator.next();

				   //found - add it and stop
				   if(key.equals(tagName))
				   {
					   int index = elements.size();
					   elements.set(index, object.get(key));
					   //stop - key can occur only once on first layer
					   break;
				   }
				   //nothing found - depth-search
				   else
				   {
					   jsonValuesByTagName(elements, object.get(key), tagName);
				   }
			   }
		   }

		   //if it's an array, search among it's children by calling recursive method
		   //for every child
		   JSONArray jsonArray = root.isArray();
		   if(jsonArray != null)
		   {	
			   for (int i = 0; i < jsonArray.size(); i++)
			   {
				   jsonValuesByTagName(elements, jsonArray.get(i), tagName);
			   }
		   }

		   //if it's a matching boolean, number or string: add it
		   JSONBoolean jsonBoolean = root.isBoolean();
		   if(jsonBoolean != null && tagName.equals(jsonBoolean.booleanValue()))
		   {
			   int index = elements.size();
			   elements.set(index, jsonBoolean);
		   }
		   JSONNumber jsonNumber = root.isNumber();
		   if(jsonNumber != null && tagName.equals(jsonNumber.doubleValue()))
		   {
			   int index = elements.size();
			   elements.set(index, jsonNumber);
		   }
		   JSONString jsonString = root.isString();
		   if(jsonString != null && tagName.equals(jsonString.stringValue()))
		   {
			   int index = elements.size();
			   elements.set(index, jsonString);
		   }
	   }
	   
	   /**
	    * Returns the String value of given JSONValue, or "" if
	    * value was emtpy
	    * */
	   public static String getJSONValue_AsString(JSONValue jsonValue)
	   {
		   //Define JSON valuetype. Get its sting value 
		   String nodeValue = "";
		   JSONBoolean attrBoolean = jsonValue.isBoolean();
		   JSONNumber attrNumber = jsonValue.isNumber();
		   JSONString attrString = jsonValue.isString();
		   
		   if(attrBoolean != null)
		   {
			   nodeValue = "" + attrBoolean.booleanValue();
		   }
		   else if(attrNumber != null)
		   {
			   nodeValue = "" + attrNumber.doubleValue();
		   }
		   else if(attrString != null)
		   {
			   String stringValue = attrString.stringValue();
			   if(stringValue != null && !"".equals(stringValue.trim()))
			   {
				   nodeValue = "" + stringValue;
			   }
			   else
			   {
				   nodeValue = "";
			   }
		   }
		   
		   return nodeValue;
	   }
	   
	   /**
	    * Returns true, if given Rule contains source, target and kind
	    * */
	   public static boolean isCompleteRule(FASTMappingRule checkRule)
	   {
		   if(checkRule != null && isCompleteString(checkRule.getSourceTagname())
		      && isCompleteString(checkRule.getTargetElemName())
		      && isCompleteString(checkRule.getKind()))
		   {
			   return true;
		   }
		   
		   //else
		   return false;
	   }
	   
	   public static boolean isCompleteString (String str)
	   {
		   return str != null && ! "".equals(str);
	   }
	
	   /**
	    * Returns false, if given item is null or
	    * his parents text is "Rules:" (means highest item in List) 
	    * 
	    * Returns true, otherwise
	    * */
	   public static boolean isNotNullOrRoot(TreeItem item)
	   {
		   if((item == null) || (item.getParentItem().getText().equals("Rules:")))
			  return false;
		   return true;
	   }
	   
	   /**
	    * Returns true, if given String equals "true".
	    * False otherwise.. 
	    * */
	   public static boolean getBool(String string)
	   {
		   if("true".equals(string))
		   {
			   return true;
		   }
		   
		   //else
		   return false;
	   }
	   
	   /**
	    * recursively parses rule structure into a JSONValue
	    * */
	   @SuppressWarnings("unchecked")
	   public static JSONValue rulesToJsonValue(FASTMappingRule parentRule)
	   {
		   
		   JSONObject resultValue = new JSONObject();
		   
		   if(parentRule == null)
		   {
			   return resultValue;
		   }
		   
		   JSONString sourceTagname = new JSONString(parentRule.getSourceTagname());
		   JSONString targetElemName = new JSONString(parentRule.getTargetElemName());
		   JSONString kind = new JSONString(parentRule.getKind());
		   
		   resultValue.put("sourceTagname", sourceTagname);
		   resultValue.put("targetElemName", targetElemName);
		   resultValue.put("kind", kind);
		   
		   JSONArray childrenArray = new JSONArray();
		   for (Iterator<FASTMappingRule> childRuleIterator = parentRule.iteratorOfKids(); childRuleIterator.hasNext();)
		   {
			   FASTMappingRule childRule = (FASTMappingRule) childRuleIterator.next();

			   childrenArray.set(childrenArray.size(), rulesToJsonValue(childRule));
		   }
		   
		   resultValue.put("kids", childrenArray);
		   
		   return resultValue;
	   }
	   
	   /**
	    * Returns the NodeList containing values founded with given tagName
	    * in given Node xmlDoc
	    * */
	   public static NodeList get_ElementsByTagname(Node xmlDoc, String tagName)
	   {
		   NodeList elements = null;

		   if (xmlDoc instanceof Document)
		   {
			   elements = ((Document) xmlDoc).getElementsByTagName(tagName);
		   }
		   else if (xmlDoc instanceof Element)
		   {
			   elements = ((Element) xmlDoc).getElementsByTagName(tagName);
		   }
		   
		   return elements;
	   }
	   
	   /**
	    * This method watch for Attr. (exactly) in given xmlDoc (TODO:maybee
	    * we want to allow to acces any Attr. in any lower tag?)
	    * */
	   public static String get_AttributeByName(Node xmlDoc, String tagName)
	   {
		   String nodeValue = null;
		   
		   NamedNodeMap attributes = xmlDoc.getAttributes();
		   Node namedItem = attributes.getNamedItem(tagName);
		   if(namedItem != null)
		   {
          		nodeValue = namedItem.getNodeValue();
		   }
		   
		   return nodeValue;
	   }
	   
	   
	   
	   
	   //extended operations//
	   
	   /**
	    * Returns a String reduced at wordsCount.
	    * 
	    * Notice: wordsCount = 1  means first word
	    * */
	   @SuppressWarnings("deprecation")
	   public static String getWords(String nodeValue, int wordsCount_from, int wordsCount_to)
	   {
		   nodeValue = deleteWhiteSpaces(nodeValue);
		   String result = "";
		   ArrayList<String> words = new ArrayList<String>();
		   int pos = 0;

		   //finds and saves all words
		   while(pos < nodeValue.length())
		   {
			   //build a word
			   if(! Character.isSpace((nodeValue.charAt(pos))))
			   {
				   result += nodeValue.charAt(pos);

				   pos++;
			   }
			   else
			   {
				   //add word
				   words.add(result);
				   
				   result = "";
				   pos++;
			   }
		   }
		   
		   //add last word
		   words.add(result);

		   //build result String
		   result = "";
		   wordsCount_from--;
		   wordsCount_to--;
		   
		   if(wordsCount_to < words.size())	// if a word is ordered, which index is to much
		   {
			   for(;wordsCount_from <= wordsCount_to; ++wordsCount_from)
			   {
				   String currentWord = words.get(wordsCount_from);
				   
				   if(currentWord != null)
				   {
					   result += currentWord + " ";
				   }
			   }
			   
			   return result;
		   }

		   //else
		   return nodeValue;
	   }
	   
	   /**
	    * This method returns the given String words,
	    * but cut anything after the @sepNr time
	    * of occurrence of @untilSign.
	    * */
	   public static String wordsUnitl(String words, String untilSign, int sepNr)
	   {
		   String result = "";
		   
		   while(words.contains(untilSign) && sepNr > 0)
		   {
			   result += words.substring(0, words.indexOf(untilSign) +untilSign.length());
			   words = words.substring(words.indexOf(untilSign) +untilSign.length(), words.length());
			   sepNr--;
		   }
		   
		   if(result.length() > 1)
		   {
			   return result.substring(0, result.length());   
		   }
		   
		   //else
		   return words;
	   }
	   
	   /**
	    * This method returns the given String words,
	    * but cut anything before the @sepNr time
	    * of occurrence of @untilSign.
	    * */
	   public static String wordsFrom(String words, String fromSign, int sepNr)
	   {
		   String save = "";
		   while(words.contains(fromSign) && sepNr > 0)
		   {
			   save = words.substring(words.indexOf(fromSign), words.indexOf(fromSign) + fromSign.length());
			   words = words.substring(words.indexOf(fromSign) + fromSign.length(), words.length()) + " ";
			   sepNr--;
		   }
		   
		   words = save + words;
		   
		   return words;
	   }
	   
	   @SuppressWarnings("deprecation")
	   private static String deleteWhiteSpaces(String nodeValue)
	   {
		   //jump over first whitespaces, if there are some
		   int pos = 0;
		   while(Character.isSpace(nodeValue.charAt(pos)))
		   {
			   pos++;
		   }
		   
		   return nodeValue.substring(pos, nodeValue.length());
	   }
	   
	   /**
	    * Returns a String from 0 till charsCount. Returns the original string, 
	    * if count was more then origString.length.
	    * 
	    * Notice charsCount_from = 1  means the first char at given String
	    * */
	   public static String getChars(String nodeValue, int charsCount_from, int charsCount_to)
	   {
		   nodeValue = deleteWhiteSpaces(nodeValue);
		   
		   //if more count then signs, give untill last sign
		   if(charsCount_to > nodeValue.length())
		   {
			   charsCount_to = nodeValue.length();
		   }
		   
		   if(charsCount_from <= charsCount_to && charsCount_from > 0)
		   {
			   return nodeValue.substring(charsCount_from-1, charsCount_to);   
		   }
		   
		   return nodeValue;
	   }
}