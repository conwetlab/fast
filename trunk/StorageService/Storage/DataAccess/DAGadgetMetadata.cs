//-----------------------------------------------------------------------
// <copyright file="DAGadgetMetadata.cs" company="Cyntelix">
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
    public class DAGadgetMetadata : DABase
    {
        private static DAGadgetMetadata singleInstance = null;
        static DAGadgetMetadata()
        {
            singleInstance = new DAGadgetMetadata();
        }
        public static DAGadgetMetadata Instance
        {
            get { return singleInstance; }
        }

        public GadgetMetadata GetGadgetMetadata(GadgetMetadata gadgetMetadata)
        {
            //return base.DataContext.GadgetMetadatas.SingleOrDefault<GadgetMetadata>(gm => gm.Equals(gadgetMetadata));
            foreach (GadgetMetadata gm in base.DataContext.GadgetMetadatas)
            {
                if (gm.Equals(gadgetMetadata))
                    return gm;
            }
            return null;
        }

        public int AddGadgetMetadata(GadgetMetadata newGadgetMetadata)
        {
            GadgetMetadata existingObj = GetGadgetMetadata(newGadgetMetadata);
            if (existingObj == null)
            {
                base.DataContext.GadgetMetadatas.InsertOnSubmit(newGadgetMetadata);
                base.DataContext.SubmitChanges();

                return newGadgetMetadata.GadgetMetadataId;
            }
            else
            {
                return existingObj.GadgetMetadataId;
            }
        }

    }
}
