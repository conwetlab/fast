package eu.morfeoproject.fast.catalogue.planner;

import java.util.List;

public interface Graph<V> {

    public void addEdge(V from, V to);
    public void removeEdge(V from, V to);
    public void addNode(V node);
    public void removeNode(V node);
    public List<V> neighbors(V node);
    public void clear();

}