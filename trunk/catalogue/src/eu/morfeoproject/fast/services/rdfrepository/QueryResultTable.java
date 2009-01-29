package eu.morfeoproject.fast.services.rdfrepository;

import java.util.List;

/**
 * optimized version of QueryResultTable.
 * The QueryResultTable is optimized for memory space, 
 * therefore the columnames only once.
 * @author sauermann
 */
public class QueryResultTable {
    
    
    
    /**
     * An array of column names
     */
    List<String> columnNames;
    
    /**
     * The list of result rows, each row has a list of nodes.
     * To map column names to variable bindings,look at the columnNames. 
     */
    List<List<Node>> rows;

    public List<String> getColumnNames() {
        return columnNames;
    }

    public void setColumnNames(List<String> columnNames) {
        this.columnNames = columnNames;
    }

    public List<List<Node>> getRows() {
        return rows;
    }

    public void setRows(List<List<Node>> rows) {
        this.rows = rows;
    }
    
    

}
