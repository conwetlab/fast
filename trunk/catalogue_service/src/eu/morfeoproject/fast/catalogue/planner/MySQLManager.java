package eu.morfeoproject.fast.catalogue.planner;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.sql.DataSource;

import org.apache.commons.dbcp.BasicDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MySQLManager {

	final Logger logger = LoggerFactory.getLogger(MySQLManager.class);

	private DataSource dataSource = null;
	
	public MySQLManager(String host, String port, String database, String username, String password) {
		super();
		initDataSource(host, port, database, username, password);
	}
	
	private void initDataSource(String host, String port, String database, String username, String password) {
		BasicDataSource basicDataSource = new BasicDataSource();
		basicDataSource.setDriverClassName("com.mysql.jdbc.Driver");
		basicDataSource.setUrl("jdbc:mysql://"+host+":"+port+"/"+database);
		basicDataSource.setUsername(username);
		basicDataSource.setPassword(password);
		dataSource = basicDataSource;
	}

	public ResultSet executeQuery(String sql) {
		ResultSet rs = null;
		Connection connection = null;
	    try {
	    	// connection is expected to be automatically closed by the RDBMS
	    	connection = dataSource.getConnection();
			Statement st = connection.createStatement();
			rs = st.executeQuery(sql);
	    } catch (SQLException e) {
	    	logger.error("SQL query threw an error: ", e);
	    }
		return rs;
	}
	
	public int executeUpdate(String sql) {
		int code = -1;
		Connection connection = null;
	    try {
	    	connection = dataSource.getConnection();
			Statement st = connection.createStatement();
			code = st.executeUpdate(sql);
			st.close();
	    } catch (SQLException e) {
	    	logger.error("SQL update threw an error: ", e);
			code = -1;
	    } finally {
	    	if (null != connection) {
				try {
					connection.close();
				} catch (SQLException e) {
			    	logger.error("Error while closing the DB connection: ", e);
				}
	    	}
	    }
		return code;
	}
}
