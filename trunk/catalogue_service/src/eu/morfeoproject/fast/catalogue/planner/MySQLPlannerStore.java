package eu.morfeoproject.fast.catalogue.planner;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MySQLPlannerStore implements PlannerStore {

	final Logger logger = LoggerFactory.getLogger(MySQLPlannerStore.class);

	private MySQLManager dbms;
	
	public MySQLPlannerStore(String host, String port, String database, String username, String password) throws PlannerException {
		super();
		this.dbms = new MySQLManager(host, port, database, username, password);
		initTableStructure();
	}

	private void initTableStructure() throws PlannerException {
		String sql = "CREATE TABLE IF NOT EXISTS plans (uri_from VARCHAR(200) NOT NULL, uri_to VARCHAR(200) NOT NULL);";
		if (dbms.executeUpdate(sql) < 0)
			throw new PlannerException("MySQL planner couln't be set up.");
	}
	
	public boolean add(Plan plan) {
		boolean added = true;
		for (int i = 0; i < plan.getUriList().size() - 1; i++)
			added = added || add(plan.getUriList().get(i), plan.getUriList().get(i+1));
		return added;
	}
	
	public boolean add(URI from, URI to) {
		if (from.equals(to))
			return false;
		if (contains(from, to))
			return false;
    	String sql = "INSERT INTO plans VALUES ('"+from.toString()+"', '"+to.toString()+"');";
		return 0 < dbms.executeUpdate(sql);
	}
	
	private boolean contains(URI from, URI to) {
		boolean contains = false;
		try {
			String sql = "SELECT COUNT(1) FROM plans WHERE uri_from='"+from.toString()+"' AND uri_to='"+to.toString()+"';";
			ResultSet rs = dbms.executeQuery(sql);
			rs.next();
			contains = rs.getInt("COUNT(1)") > 0;
			rs.close();
		} catch (SQLException e) {
			e.printStackTrace();
			contains = false;
		}
		return contains;
	}
	
	public void removeFrom(URI uri) {
		String sql = "DELETE FROM plans WHERE uri_from='"+uri.toString()+"';";
		dbms.executeUpdate(sql);
	}
	
	public void removeTo(URI uri) {
		String sql = "DELETE FROM plans WHERE uri_to='"+uri.toString()+"';";
		dbms.executeUpdate(sql);
	}
	
	public List<URI> getFrom(URI uri) {
		ArrayList<URI> list = new ArrayList<URI>();
		try {
			String sql = "SELECT uri_to FROM plans WHERE uri_from='"+uri.toString()+"';";
			ResultSet rs = dbms.executeQuery(sql);
			while (rs.next())
				list.add(new URIImpl(rs.getString("uri_to")));
			rs.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return list;
	}
	
	public List<URI> getTo(URI uri) {
		ArrayList<URI> list = new ArrayList<URI>();
		try {
			String sql = "SELECT uri_FROM plans WHERE uri_to='"+uri.toString()+"';";
			ResultSet rs = dbms.executeQuery(sql);
			while (rs.next())
				list.add(new URIImpl(rs.getString("uri_from")));
			rs.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return list;
	}
	
	public void clear() {
		dbms.executeUpdate("TRUNCATE plans;");
	}
	
	public boolean isEmpty() {
		boolean empty = false;
		try {
			String sql = "SELECT COUNT(1) FROM plans;";
			ResultSet rs = dbms.executeQuery(sql);
			rs.next();
			empty = rs.getInt("COUNT(1)") == 0;
			rs.close();
		} catch (SQLException e) {
			e.printStackTrace();
			empty = false;
		}
		return empty;
	}
}
