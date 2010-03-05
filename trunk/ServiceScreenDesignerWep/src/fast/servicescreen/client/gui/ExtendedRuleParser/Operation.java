package fast.servicescreen.client.gui.ExtendedRuleParser;

/**
 * A type to save a operation within its kind
 * */
public class Operation
{
	public String value = null;
	public String signs = null;
	public Kind kind = null;
	
	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public String getSigns() {
		return signs;
	}

	public void setSigns(String signs) {
		this.signs = signs;
	}

	public Kind getKind() {
		return kind;
	}

	public void setKind(Kind kind) {
		this.kind = kind;
	}

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
