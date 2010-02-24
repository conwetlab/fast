//-----------------------------------------------------------------------
// <copyright file="GadgetMetadata.cs" company="Cyntelix">
//     Copyright (c) Cyntelix. All rights reserved.
// </copyright>
// <author>Ciprian Palaghita</author>
//-----------------------------------------------------------------------
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Storage
{
    public partial class GadgetMetadata
    {
        public override bool Equals(object obj)
        {
            if (typeof(GadgetMetadata).Equals(obj.GetType()))
            {
                GadgetMetadata refObj = (GadgetMetadata)obj;
                if (this.GadgetName != refObj.GadgetName)
                    return false;
                if (this.GadgetShortName != refObj.GadgetShortName)
                    return false;

                //if (this.GadgetDescription != refObj.GadgetDescription)
                //    return false;
                //if (this.GadgetDefaultHeight != refObj.GadgetDefaultHeight)
                //    return false;
                //if (this.GadgetDefaultWidth != refObj.GadgetDefaultWidth)
                //    return false;
            }
            else
            {
                return false;
            }

            return true;
        }
    }
}
