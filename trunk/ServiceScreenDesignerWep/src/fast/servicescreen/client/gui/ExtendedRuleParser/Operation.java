package fast.servicescreen.client.gui.ExtendedRuleParser;

/**
 * A type to save a operation within its kind
 * */
public class Operation
{
	public String value = null;
	public Kind kind = null;
	
	Operation(String value, Kind kind)
	{
		this.value = value;
		this.kind = kind;
	}
}
