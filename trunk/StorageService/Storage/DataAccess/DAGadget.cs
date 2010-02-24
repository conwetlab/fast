//-----------------------------------------------------------------------
// <copyright file="DAGadget.cs" company="Cyntelix">
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
    public class DAGadget : DABase
    {
        private string uriForamt = "/{0}/{1}/{2}";
        private static DAGadget singleInstance = null;
        static DAGadget()
        {
            singleInstance = new DAGadget();
        }
        public static DAGadget Instance
        {
            get { return singleInstance; }
        }

        public Gadget AddGadget(Gadget newGadget)
        {
            //Gadget existingObj = GetGadget(newGadget);
            //if (existingObj == null)
            //{
                
                //Vendor, Author, Metadata to DB - if they exist their ID is returned, otherwise they are added and the new ID is returned
                Gadget gadgetToAdd = new Gadget();
                gadgetToAdd.VendorId = DAVendor.Instance.AddVendor(newGadget.Vendor);
                gadgetToAdd.AuthorId = DAAuthor.Instance.AddAuthor(newGadget.Author);
                gadgetToAdd.GadgetMetadataId = DAGadgetMetadata.Instance.AddGadgetMetadata(newGadget.GadgetMetadata);

                //build URI and ULR
                gadgetToAdd.GadgetUri = string.Format(uriForamt, newGadget.Owner, newGadget.GadgetMetadata.GadgetName, newGadget.Version);
                gadgetToAdd.AbsoluteURL = "baseURL" + gadgetToAdd.GadgetUri;

                //copy rest of data
                gadgetToAdd.Owner = newGadget.Owner;
                gadgetToAdd.Version = newGadget.Version;
                gadgetToAdd.NoContent = true;

                base.DataContext.Gadgets.InsertOnSubmit(gadgetToAdd);
                base.DataContext.SubmitChanges();

                return gadgetToAdd;
            //}
            //else
            //{
            //    return existingObj;
            //}
        }

        public Gadget GetGadget(Gadget newGadget)
        {
            //return base.DataContext.Gadgets.Single<Gadget>(g => (g.Owner == newGadget.Owner &&  );
            foreach (Gadget g in base.DataContext.Gadgets)
            {
                if (g.IsDeleted == false)
                {
                    if (g.Equals(newGadget))
                        return g;
                }
            }
            return null;
        }
        public Gadget GetGadgetById(string gadgetUri)
        {
            return base.DataContext.Gadgets.SingleOrDefault<Gadget>(g => g.GadgetUri == gadgetUri && g.IsDeleted == false);
        }

        public bool DeleteGadget(string gadgetURI)
        {
            Gadget existingObj = base.DataContext.Gadgets.SingleOrDefault<Gadget>(g => g.GadgetUri == gadgetURI);
            if (existingObj != null)
            {
                existingObj.NoContent = true;
                existingObj.IsDeleted = true;

                base.DataContext.SubmitChanges();
                return true;
            }
            return false;
        }

        public bool DeleteGadget(Gadget deleteGadget, bool physicalDeleteSuccesfull)
        {
            deleteGadget.NoContent = physicalDeleteSuccesfull;
            deleteGadget.IsDeleted = true;
            base.DataContext.SubmitChanges();

            return true;
        }

        public void UpdateGadgetContent(Gadget objGadget, bool noContent)
        {
            objGadget.NoContent = noContent;
            base.DataContext.SubmitChanges();
        }

        public void UpdateGadgetContent(string gadgetUri, bool noContent)
        {
            UpdateGadgetContent(GetGadgetById(gadgetUri), noContent);
        }

        public Gadget UpdateGadget(Gadget newGadget)
        {
            Gadget oldGadget = GetGadgetById(newGadget.GadgetUri);
            oldGadget = newGadget;

            base.DataContext.SubmitChanges();

            return oldGadget;
        }
        //Delete - isDeleted


    }
}
