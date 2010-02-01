package fast.servicescreen.client.gui.ExtendedRuleParser;

/**
 * A type to save a operation within its kind
 * */
public class Operation
{
	public String value = null;
	public String signs = null;
	public Kind kind = null;
	
	Operation(String value, Kind kind)
	{
		this.value = value;
		this.kind = kind;
	}
	
	Operation(String value, String signs, Kind kind)
	{
		this.value = value;
		this.signs = signs;
		this.kind = kind;
	}
}
