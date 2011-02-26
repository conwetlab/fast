/**
 * 
 */
package eu.morfeoproject.fast.catalogue.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
/**
 * 
 * A Map like structure where each key maps to a list of values. 
 * I couldn't get the generics to work the way I wanted, so it doesn't inherit anything.
 * TODO it's used in the crappy inferencer
 * 
 * @author grimnes
 */
public class ListMap<K,V> {

	private HashMap<K, List<V>> data;

	public ListMap() { 
		data=new HashMap<K,List<V>>();
	}
	
	public V put(K key, V value) {
		List<V> list;
		if (data.containsKey(key)) {
			list=data.get(key);
		} else { 
			list=new ArrayList<V>();
			data.put(key, list);
		}
		list.add(value);
		return null;
	}
    
    /**
     * remove the value of the key.
     * If key or value were not set, returns null
     * @param key the key 
     * @param value the value to remove
     * @return null or the removed value.
     */
	public V remove(K key, V value) {
	    List<V> list;
	    if (data.containsKey(key)) {
	        list=data.get(key);
	    } else { 
	        return null;
	    }
        if (list.remove(value))
            return value;
        else 
            return null;
	}

	/**
	 * Return the list for the given key, 
	 * if no such key an empty list is returned.
	 * @param key
	 * @return the list for the given key
	 */
	public List<V>get(K key) {
		if (data.containsKey(key))
			return data.get(key);
		return Collections.emptyList();
	}

	public boolean containsKey(K key) {
		return data.containsKey(key);
	}

	@Override
	public String toString() {
		return data.toString();
	}

	public void remove(K key) {
		data.remove(key);
	}
	
}
