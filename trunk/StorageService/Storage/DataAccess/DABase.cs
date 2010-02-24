//-----------------------------------------------------------------------
// <copyright file="DABase.cs" company="Cyntelix">
//     Copyright (c) Cyntelix. All rights reserved.
// </copyright>
// <author>Ciprian Palaghita</author>
//-----------------------------------------------------------------------
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Storage.DataAccess
{
    public class DABase
    {
        private string strConnection = null;
        private StorageDataDataContext dataContext = null;

        protected StorageDataDataContext DataContext
        {
            get
            {
                if (this.dataContext == null)
                {
                    this.dataContext = new StorageDataDataContext(this.strConnection);
                }
                return this.dataContext;
            }
        }

        public DABase()
        {
            this.strConnection = global::System.Configuration.ConfigurationManager.ConnectionStrings["FASTStorageConnectionString"].ConnectionString;
            //this.strConnection = global::System.Configuration.ConfigurationManager.ConnectionStrings["FASTStorageConnectionStringRemote"].ConnectionString;
        }
    }
}
