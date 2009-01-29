package eu.morfeoproject.fast.model;

public abstract class Representation {
	protected Object o;
	
	@Override
	public String toString() {
		return o.toString();
	}

}
