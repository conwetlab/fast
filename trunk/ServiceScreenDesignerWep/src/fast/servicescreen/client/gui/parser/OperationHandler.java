package fast.servicescreen.client.gui.parser;

import java.util.ArrayList;
import java.util.Iterator;

import com.google.gwt.xml.client.Node;
import com.google.gwt.xml.client.NodeList;

import fast.servicescreen.client.gui.RuleUtil;

/**
 * Parses the given fromField line.
 * Handles any operation decoded by the parser.
 * */
public class OperationHandler
{
	private ExtendedRuleParser exRuleParser = null;
	private ArrayList<ArrayList<Operation>> operationList = null;
	private String lastRealTagname = "";

	/**
	 * Initialize with this constructor will create
	 * the parser and parse/ the given line
	 * */
	public OperationHandler(String fromField, Node xmlDoc)
	{
		if(fromField != null && ! "".equals(fromField) && xmlDoc != null)
		{
			exRuleParser = new ExtendedRuleParser();
			
			//parse
			exRuleParser.parse(fromField);
			
			
			//save parsed operations into list, separated by Operators: "+" 
			
			operationList = new ArrayList<ArrayList<Operation>>();
			ArrayList<Operation> operationList_part = new ArrayList<Operation>();
			int opIndex = 0;
			Operation currentOperation = exRuleParser.getOperation(opIndex++); 
		
			while(currentOperation != null)
			{
				if(currentOperation.kind == Kind.plus)
				{
					operationList.add(operationList_part);
					operationList_part = new ArrayList<Operation>();
				}
				else
				{
					operationList_part.add(currentOperation);	
				}
				
				currentOperation = exRuleParser.getOperation(opIndex++);
			}
			
			//add last list
			operationList.add(operationList_part);

			//set up last tag name for RuleGUI
			ArrayList<Operation> currentList;
			for (Iterator<ArrayList<Operation>> opList_it = operationList.iterator(); opList_it.hasNext();)
			{
				currentList = opList_it.next();
				
				if(currentList.size() > 0)
				{
					Kind startKind = currentList.get(0).kind;
					
					//if it is not a constant
					if(Kind.constant != startKind)
					{
						//take the last real tagname
						lastRealTagname = getLastTagnameOf(currentList).value;
					}
				}
			}
		}
	}
	
	/**
	 * NOTICE: this method returns the last real sourcetagname out of given opList, BUT
	 * this way the method cannot check, if the opList is about a constat! So do not use if
	 * u are not sure that it is a constant or not.
	 * */
	public Operation getLastTagnameOf(ArrayList<Operation> opList)
	{
		Operation currentOp = null;
		Operation returnOp = null; 
		
		for (Iterator<Operation> opList_it = opList.iterator(); opList_it.hasNext();)
		{
			currentOp = opList_it.next();
			
			if(Kind.RName.equals(currentOp.kind))
			{
				returnOp = currentOp;
			}
			else
			{
				break;
			}
		}
		
		return returnOp;
	}
	
	/**
	 * This method executes all operations.
	 * 
	 * Returns the transformed nodeValue or even the
	 * nodeValue himself, if anything was wrong 
	 * */
	//execute hole operationList
	public String executeOperations(Node xmlDoc, int elementsItemID)
	{
		String result = "";
		
		//Execute any operationList
		for (Iterator<ArrayList<Operation>> iterator = operationList.iterator(); iterator.hasNext();)
		{
			//take currentOpList
			ArrayList<Operation> currentList = (ArrayList<Operation>) iterator.next();
			
			if(currentList.size() > 0)
			{
				//if const, add. If not, execute operation
				Kind firstOpKind = currentList.get(0).kind;
				if(Kind.constant == firstOpKind)
				{
					result += currentList.get(0).value;
				}
				else
				{
					//set up sourceTag with last real tagName AND a solved xmlDoc
					SourceTag sourceTag = getLastSourceTag(xmlDoc, currentList, elementsItemID);
					
					String nodeValue = sourceTag.getAttributeValue();
					//if it is not a attribute
					if(nodeValue == null)
					{
						nodeValue = sourceTag.getCurrentXmlPart().getFirstChild().getNodeValue();
					}
					
					//create/expand the result
					result += executeOperationList(currentList, nodeValue);
				}
			}
		}

		return result;
	}
	
	/**
	 * Executes a list of instructions and transform the given nodeValue.
	 * Returns the changed nodeValue.
	 * */
	//execute operation* (+ operation)*
	private String executeOperationList(ArrayList<Operation> opList, String nodeValue)
	{
		int count = 1;

		if(opList.size() > count+1)
		{
			//take operations "Kind, Param/Signs"
			Operation currentOperation = opList.get(count);
			Operation nextOperation = opList.get(++count);

			while(nextOperation != null)
			{	
				nodeValue = executeOneOperation(currentOperation.kind, nextOperation.value, nextOperation.signs, nodeValue);

				if(opList.size() > count+2)
				{
					currentOperation = opList.get(++count);
					nextOperation = opList.get(++count);
				}
				else
				{
					break;
				}
			}
		}

		return nodeValue;
	}

	//executes one operation
	private String executeOneOperation(Kind opKind, String parameter, String signs, String nodeValue)
	{
		int param_from = 1, param_to = 1;
		int sepNr = 1;

		//It should be a sign parameter, or a exactlyThis parameter, or a from-to parameter
		if(signs != null)
		{
			try
			{
				sepNr = Integer.valueOf(parameter).intValue();
			}
			catch(java.lang.NumberFormatException e)
			{
				//should not happen
				return nodeValue;
			}
		}
		else
		{
			//transform String parameter -> int param_from, param_to
			try
			{
    			String par_from = parameter.substring(0, parameter.indexOf("-"));
    			String par_to = parameter.substring(parameter.indexOf("-") +1);
	    		
    			param_from = Integer.valueOf(par_from).intValue();
    			param_to = Integer.valueOf(par_to).intValue();
    			
	    		//avoid exceptions from user entry
	    		if(param_from <= 0)
	    			param_from = 1;
	    		
	    		if(param_to <= 0)
	    			param_to = 1;
			}
			catch(java.lang.NumberFormatException e)
			{
				//should not happen
				return nodeValue;
			}
		}
		
		
		//execute operation
		switch(opKind)
		{
			case words	:	nodeValue = RuleUtil.getWords(nodeValue, param_from, param_to);
							break;

			case chars	:	nodeValue = RuleUtil.getChars(nodeValue, param_from, param_to);
							break;
							
			case until	: 	nodeValue = RuleUtil.wordsUnitl(nodeValue, signs, sepNr);
							break;
							
			case from	: 	nodeValue = RuleUtil.wordsFrom(nodeValue, signs, sepNr);
							break;

			//add more operations here, in Kind and in ExRuleParser.define()

			default	:		break; 	//else do nothing
		}

		//returns changed nodeValue
		return nodeValue;
	}

	
	/**
	 * Return last operation (with Kind RName) in given operationList.
	 * Steps over every RName and take the addicted next Name, as 
	 * long as operationList is solved. 
	 * */
	private SourceTag getLastSourceTag(Node xmlDoc, ArrayList<Operation> opList, int itemID)
	{
		Operation currentOperation = null;
		SourceTag sourceTag = null;
		NodeList tmpNodeList = null;
		Node tmpNode = xmlDoc;	//at first iteration, the node is hole xml
		
		for (Iterator<Operation> iterator = opList.iterator(); iterator.hasNext();)
		{
			currentOperation = (Operation) iterator.next();
			String tagName = currentOperation.value;
			
			if(currentOperation.kind == Kind.RName)
			{
				sourceTag = new SourceTag();
				
				String attrValue = RuleUtil.get_AttributeByName(xmlDoc, tagName);
				//if it is a attribute
				if(attrValue != null)
				{
					sourceTag.setAttributeValue(attrValue);
				}
				else
				{
					//gets node list out of a currentXmlDoc and a currentTagName
					tmpNodeList = RuleUtil.get_ElementsByTagname(tmpNode, tagName);
					
					sourceTag.setUp(tmpNodeList, currentOperation.value, itemID);
					
					//this setup the solve currentXml for next iteration 
					tmpNode = sourceTag.getCurrentXmlPart();					
				}
			}
			else
			{
				//stop, if there are no more References
				break;
			}
		}
		
		return sourceTag;
	}
	
	
	
	//Getters, Setters and Helpers
	
	
	/**
	 * Saves a sourceTag - Name AND
	 * the limited Xml (solved by: tagName and itemID)
	 * */
	protected class SourceTag
	{
		//attribute management
		private String attrValue = null;
		public void setAttributeValue(String value)
		{
			attrValue = value; 
		}
		
		public String getAttributeValue()
		{
			return attrValue;
		}
		
		//element management
		private String tagName = "";
		private Node currentXmlDoc = null;
		
		/**
		 * Creates a new Node to access it again with getElemByTagName
		 * */
		public void setUp(NodeList nodeList, String tagName, int itemID)
		{
			if(nodeList != null)
			{
				this.tagName = tagName;
				
				currentXmlDoc = nodeList.item(itemID);
			}
		}
		
		public Node getCurrentXmlPart()
		{
			return currentXmlDoc;
		}
		
		public String getTagName()
		{
			return tagName;
		}
	}
	
	/**
	 * Returns the last real sourceTagname
	 * of the first operationList
	 * */
	public String getLastSourceTagname()
	{
		return lastRealTagname;
	}

	/**
	 * Create for code generation. Returns iterator of opLists
	 * */
	public Iterator<ArrayList<Operation>> getOperationlistIterator()
	{
		return operationList.iterator();
	}
}