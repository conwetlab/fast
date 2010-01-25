package fast.servicescreen.client.gui.ExtendedRuleParser;

/**
 * Contains information about a word or operator
 * */
public class Token
{	
	private String word;
	
	private double value;

	private int pos;
	
	private Kind kind;
	
	public String getWord() {
		if(word == null)
			return "";
		return word;
	}

	public void setWord(String word) {
		this.word = word;
	}

	public int getPos() {
		return pos;
	}

	public void setPos(int pos) {
		this.pos = pos;
	}

	public Kind getKind() {
		return kind;
	}

	public void setKind(Kind kind) {
		this.kind = kind;
	}

	public void setValue(double value) {
		this.value = value;
	}

	public double getValue() {
		return value;
	}
}