package fast.servicescreen.client.gui.parser;  

/**
 * These kinds mark finite automata for ExtendedOpParser.
 * If u want to extend enums, u should handle this in ExtendedRuleParser.defineType, too!
 * */ 
public enum Kind 
{
	//Kinds
	EOT,
	RName,
	
	//Operations
	words,
	chars,
	until,
	constant,
	from,
	Param,
	plus
}