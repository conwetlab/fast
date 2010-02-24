//-----------------------------------------------------------------------
// <copyright file="Gadget.cs" company="Cyntelix">
//     Copyright (c) Cyntelix. All rights reserved.
// </copyright>
// <author>Ciprian Palaghita</author>
//-----------------------------------------------------------------------
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace Storage
{
    public partial class Gadget
    {

        public override bool Equals(object obj)
        {
            if(typeof(Gadget).Equals(obj.GetType()))
            {
                Gadget refObj = (Gadget)obj;
                if (this.Owner != refObj.Owner)
                    return false;
                if (this.Version != refObj.Version)
                    return false;

                if (this.Vendor != null && refObj.Vendor != null)
                {
                    if (!this.Vendor.Equals(refObj.Vendor))
                        return false;
                }
                else if (!(this.Vendor == null && refObj.Vendor == null))
                {
                    return false;
                }

                if (this.Author != null && refObj.Author != null)
                {
                    if (!this.Author.Equals(refObj.Author))
                        return false;
                }
                else if (!(this.Author == null && refObj.Author == null))
                {
                    return false;
                }

                if (this.GadgetMetadata != null && refObj.GadgetMetadata != null)
                {
                    if (!this.GadgetMetadata.Equals(refObj.GadgetMetadata))
                        return false;
                }
                else if (!(this.GadgetMetadata == null && refObj.GadgetMetadata == null))
                {
                    return false;
                }
            }
            else
            {
                return false;
            }

            return true;
        }

        public bool hasCompuloryFieldsSet()
        {
            if (string.IsNullOrEmpty(this.Owner))
                return false;
            if (string.IsNullOrEmpty(this.GadgetMetadata.GadgetName))
                return false;
            if (string.IsNullOrEmpty(this.Version))
                return false;

            return true;
        }
    }
}
