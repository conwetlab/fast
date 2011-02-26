/**
 * Copyright (c) 2008-2011, FAST Consortium
 * 
 * This file is part of FAST Platform.
 * 
 * FAST Platform is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * FAST Platform is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with FAST Platform. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Info about members and contributors of the FAST Consortium
 * is available at http://fast.morfeo-project.eu
 *
 **/
package eu.morfeoproject.fast.catalogue;

import java.io.File;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openrdf.repository.Repository;
import org.openrdf.repository.RepositoryException;
import org.openrdf.repository.config.RepositoryConfigException;
import org.openrdf.repository.manager.RemoteRepositoryManager;
import org.openrdf.repository.manager.RepositoryManager;
import org.openrdf.repository.sail.SailRepository;
import org.openrdf.sail.NotifyingSail;
import org.openrdf.sail.nativerdf.NativeStore;


/**
 * 	
 * @author Ismael Rivera
 */
public class PersistentRepository {
	
	protected final Log log = LogFactory.getLog(PersistentRepository.class);
	
	private static final String defaultIndexes = "spoc, posc, sopc, psoc, ospc, opsc";
	private static final int defaultInferencer = TripleStore.FORWARD_CHAINING_RDFS_INFERENCER;
	
	public static Repository getHTTPRepository(String sesameServer, String repositoryID)
	throws RepositoryException, RepositoryConfigException {
		RepositoryManager manager = RemoteRepositoryManager.getInstance(sesameServer);
		Repository repository = null;
		repository = manager.getRepository(repositoryID);
		repository.initialize();
		return repository;
	}
	
	public static Repository getLocalRepository(File dir, String indexes)
	throws RepositoryException {
		//RepositoryManager manager = new LocalRepositoryManager(dir);
		//manager.getRepository(arg0);
		if (indexes == null) indexes = defaultIndexes;
		NotifyingSail sail = new NativeStore(dir, indexes);
		Repository repository = new SailRepository(sail);
		repository.initialize();
		return repository;
	}
	
	public static Repository getLocalRepository(File dir) throws RepositoryException {
		return PersistentRepository.getLocalRepository(dir, defaultIndexes);
	}
	
}
