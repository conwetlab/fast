//-----------------------------------------------------------------------
// <copyright file="Service.svc.cs" company="Cyntelix">
//     Copyright (c) Cyntelix. All rights reserved.
// </copyright>
// <author>Ciprian Palaghita</author>
//-----------------------------------------------------------------------
/// Copyright (c) Microsoft Corporation.  All rights reserved.

using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Runtime.Serialization;
using System.Security.Principal;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using System.Web;
using Ionic.Zip;
using Microsoft.Practices.EnterpriseLibrary.Logging;
using Storage.DataAccess;
using Microsoft.ServiceModel.Web;
using System.Text;

// The following line sets the default namespace for DataContract serialized typed to be ""
[assembly: ContractNamespace("", ClrNamespace = "Storage")]

namespace Storage
{
    // TODO: Please set IncludeExceptionDetailInFaults to false in production environments
    [ServiceBehavior(IncludeExceptionDetailInFaults = true), AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed), ServiceContract]
    public partial class Service
    {

        private string baseServiceUri = ConfigurationManager.AppSettings["baseServiceUri"].ToString();
        private string baseServiceURL = ConfigurationManager.AppSettings["baseServiceURL"].ToString();
        
        private string uriFormat = @"/{0}/{1}/{2}";

        #region ServiceInterface
        [WebHelp(Comment = "For Service testing purposes")]
        [WebGet(UriTemplate = "Echo", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public String Echo()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("FAST Storage Service with: ");
            sb.Append(" BaseServiceUri: "); 
            sb.Append(Uri.UnescapeDataString(baseServiceUri));
            sb.Append(" BaseServiceURL: ");
            sb.Append(Uri.UnescapeDataString(baseServiceURL));

            Logger.Write("Entered Echo");
            return sb.ToString();
        }

        #region Gadget
        [WebHelp(Comment = "Stores Gadget's data and metadata")]
        [WebInvoke(UriTemplate = "gadgets", Method = "POST", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public GadgetResponseBody StoreGadget(RequestBody request)
        {
            Logger.Write("Entered Store Gadget");
            if (request.Metadata.hasCompuloryFieldsSet())
            {
                Gadget resp = StoreMetadata(request.Metadata); //createMetadata in DB
                if (resp != null)
                {
                    bool noContent = SaveData(resp.GadgetUri, request.IncomingData);
                    DAGadget.Instance.UpdateGadgetContent(resp, !noContent);
                    Logger.Write("Exit Store Gadget successfully");
                    return new GadgetResponseBody
                    {
                        ServiceGadgetUri = baseServiceUri + resp.GadgetUri,
                        GadgetLocationURL = baseServiceURL + resp.GadgetUri,
                        GadgetMetadataUri = baseServiceUri + resp.GadgetUri + "/metadata",
                        GadgetDataUri = baseServiceUri + resp.GadgetUri + "/data"
                    };
                }
                else
                {
                    WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.Conflict;
                    WebOperationContext.Current.OutgoingResponse.StatusDescription = "A Gadget with this metadata already exists.Use PUT for Update or change Metadata and send new POST request";
                    //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                    Logger.Write("Exit Store Gadget with fail");
                    return null;
                }
            }
            else
            {
                WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.BadRequest;
                WebOperationContext.Current.OutgoingResponse.StatusDescription = "One of Metadata compulsory fields is missing.";
                //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                Logger.Write("Exit Store Gadget with fail");
                return null;
            }
        }

        [WebHelp(Comment = "Update Gadget's data and metadata")]
        [WebInvoke(UriTemplate = "gadgets/{owner}/{gadgetName}/{version}", Method = "PUT", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public GadgetResponseBody UpdateGadget(string owner, string gadgetName, string version, RequestBody request)
        {
            //Logger.Write("Entered Update Gadget");
            //GadgetResponseBody resp = StoreMetadata(request.Metadata); //updateMetadata in DB
            //string relativeUri = "/" + request.Metadata.Owner + "/" + request.Metadata.GadgetName + "/" + request.Metadata.Version;
            //SaveData(relativeUri, request.IncomingData);
            //return resp;
            DAGadget daGadget = DAGadget.Instance;
            Gadget gadgetObj = daGadget.GetGadgetById(string.Format(uriFormat, owner, gadgetName, version));
            if (gadgetObj != null)
            {
                Gadget resp = daGadget.UpdateGadget(request.Metadata);
                bool saveSuccessful = SaveData(gadgetObj.GadgetUri, request.IncomingData);
                return new GadgetResponseBody
                {
                    ServiceGadgetUri = baseServiceUri + resp.GadgetUri,
                    GadgetLocationURL = baseServiceURL + resp.GadgetUri,
                    GadgetMetadataUri = baseServiceUri + resp.GadgetUri + "/metadata",
                    GadgetDataUri = baseServiceUri + resp.GadgetUri + "/data"
                };
            }
            else
            {
                WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.NotFound;
                WebOperationContext.Current.OutgoingResponse.StatusDescription =
                    string.Format("Cannont Update! Gadget with Owner:{0} Name:{1} Version:{2} does not exist", owner, gadgetName, version);
                //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                Logger.Write("Exit Store Gadget with fail");
                return null;
            }
        }

        [WebHelp(Comment = "Deletes Gadget's data and metadata")]
        [WebInvoke(UriTemplate = "gadgets/{owner}/{gadgetName}/{version}", Method = "DELETE", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public bool DeleteGadget(string owner, string gadgetName, string version)
        {
            Logger.Write("Entered Delete Gadget");
            DAGadget daGadget = DAGadget.Instance;
            Gadget gadgetObj = daGadget.GetGadgetById(string.Format(uriFormat,owner,gadgetName,version));
            if (gadgetObj != null)
            {
                bool physicalDeleteSuccesfull = DeleteFolder(owner, gadgetName, version);
                return daGadget.DeleteGadget(gadgetObj, physicalDeleteSuccesfull);
            }
            else
            {
                WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.NotFound;
                WebOperationContext.Current.OutgoingResponse.StatusDescription = 
                    string.Format("Gadget with Owner:{0} Name:{1} Version:{2} does not exist",owner,gadgetName,version);
                //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                Logger.Write("Exit Store Gadget with fail");
                return false;
            }
        }

        [WebHelp(Comment = "Gets Gadget's data and metadata")]
        [WebGet(UriTemplate = "gadgets/{owner}/{gadgetName}/{version}", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public ResponseBody GetGadget(string owner, string gadgetName, string version)
        {
            Logger.Write("Entered Get Gadget");
            Gadget respMetadata = DAGadget.Instance.GetGadgetById(string.Format(uriFormat, owner, gadgetName, version));

            if (respMetadata != null)
            {
                ResponseBody resp = new ResponseBody();
                resp.Metadata = respMetadata;

                if (respMetadata.NoContent == false)
                {
                    resp.Data = Convert.ToBase64String(GetFile(owner, gadgetName, version));
                }
                else
                {
                    resp.Data = null;
                }

                return resp;
            }
            else
            {
                WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.NotFound;
                WebOperationContext.Current.OutgoingResponse.StatusDescription =
                    string.Format("Gadget with Owner:{0} Name:{1} Version:{2} does not exist", owner, gadgetName, version);
                //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                Logger.Write("Exit Store Gadget with fail");
                return null;
            }
        }
        #endregion
        

        #region Metadata
        [WebHelp(Comment = "Create metadata of the Gadget")]
        [WebInvoke(UriTemplate = "gadgets/metadata", Method = "POST", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public GadgetResponseBody CreateGadgetEntryPoint(Gadget request)
        {
            Logger.Write("Entered Create Gadget Entry Point");
            if (request.hasCompuloryFieldsSet())
            {
                Gadget resp = StoreMetadata(request);
                if (resp != null)
                {
                    return new GadgetResponseBody
                    {
                        ServiceGadgetUri = baseServiceUri + resp.GadgetUri,
                        GadgetLocationURL = baseServiceURL + resp.GadgetUri,
                        GadgetMetadataUri = baseServiceUri + resp.GadgetUri + "/metadata",
                        GadgetDataUri = baseServiceUri + resp.GadgetUri + "/data"
                    };
                }
                else
                {
                    WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.Conflict;
                    WebOperationContext.Current.OutgoingResponse.StatusDescription = "A Gadget with metadata this metadata already exists.Use PUT for Update or change Metadata";
                    //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                    Logger.Write("Exit Store Gadget with fail");
                    return null;
                }
            }
            else
            {
                WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.BadRequest;
                WebOperationContext.Current.OutgoingResponse.StatusDescription = "One of Metadata compulsory fields is missing.";
                //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                Logger.Write("Exit Create Gadget Entry Point with fail");
                return null;
            }
        }

        [WebHelp(Comment = "Update metadata of the Gadget")]
        [WebInvoke(UriTemplate = "gadgets/{owner}/{gadgetName}/{version}/metadata", Method = "PUT", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public void UpdateGadgetMetadata(string owner, string gadgetName, string version, Gadget request)
        {
            //To Do - update code in the DB
            Logger.Write("Entered Update Gadget Metadata");
            DAGadget daGadget = DAGadget.Instance;
            request.GadgetUri = string.Format(uriFormat, owner, gadgetName, version);
            if (daGadget.GetGadgetById(request.GadgetUri) != null)
            {
                daGadget.UpdateGadget(request);
            }
            else
            {
                WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.NotFound;
                WebOperationContext.Current.OutgoingResponse.StatusDescription =
                    string.Format("Cannont Update! Gadget with Owner:{0} Name:{1} Version:{2} does not exist", owner, gadgetName, version);
                //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                Logger.Write("Exit Store Gadget with fail");
            }
        }

        [WebHelp(Comment = "Gets metadata of the Gadget")]
        [WebGet(UriTemplate = "gadgets/{owner}/{gadgetName}/{version}/metadata", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public Gadget GetGadgetMetadata(string owner, string gadgetName, string version)
        {
            Gadget gadgetObj = DAGadget.Instance.GetGadgetById(string.Format(uriFormat, owner, gadgetName, version));
            if (gadgetObj != null)
            {
                return gadgetObj;
            }
            else
            {
                WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.NotFound;
                WebOperationContext.Current.OutgoingResponse.StatusDescription =
                    string.Format("Cannont Update! Gadget with Owner:{0} Name:{1} Version:{2} does not exist", owner, gadgetName, version);
                //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                Logger.Write("Exit Store Gadget with fail");
                return null;
            }
        }

        [WebHelp(Comment = "Gets the value of the {propertyName} of the metadata")]
        [WebGet(UriTemplate = "gadgets/{owner}/{gadgetName}/{version}/metadata/{propertyName}", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public MetadataProperty GetMetadataProperty(string owner, string gadgetName, string version, string propertyName)
        {
            Gadget gadgetObj = DAGadget.Instance.GetGadgetById(string.Format(uriFormat, owner, gadgetName, version));
            if (gadgetObj != null)
            {
                try
                {
                    object res = gadgetObj.GetType().GetProperty(propertyName).GetValue(gadgetObj, null);
                    return new MetadataProperty
                    {
                        Property = propertyName,
                        Value = res.ToString()
                    };
                }
                catch (Exception ex)
                {
                    WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.NotFound;
                    WebOperationContext.Current.OutgoingResponse.StatusDescription = ex.Message;
                    //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                    Logger.Write("Exit Store Gadget with fail");
                    return null;
                }
            }
            else
            {
                WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.NotFound;
                WebOperationContext.Current.OutgoingResponse.StatusDescription =
                    string.Format("Gadget with Owner:{0} Name:{1} Version:{2} does not exist", owner, gadgetName, version);
                //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                Logger.Write("Exit Store Gadget with fail");
                return null;
            }
            //Logger.Write("Entered Get Gadget Metadata Property - TO DO");
            //WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.NotImplemented;
            //WebOperationContext.Current.OutgoingResponse.StatusDescription = "This functionality is not yet available";
            //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
        }

        [WebHelp(Comment = "Sets the value of the {propertyName} of the metadata with the value in the request body")]
        [WebInvoke(UriTemplate = "gadgets/{owner}/{gadgetName}/{version}/metadata/{propertyName}", Method = "PUT", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public void SetMetadataProperty(string owner, string gadgetName, string version, string propertyName, RequestBody request)
        {
            Logger.Write("Entered Set Gadget Metadata Property - TO DO");
            WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.NotImplemented;
            WebOperationContext.Current.OutgoingResponse.StatusDescription = "This functionality is not yet available";
            WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
        }
        #endregion


        #region GadgetData
        [WebHelp(Comment = "Creates data of the Gadget")]
        [WebInvoke(UriTemplate = "gadgets/{owner}/{gadgetName}/{version}/data", Method = "POST", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public bool SaveGadgetData(string owner, string gadgetName, string version, IncomingData request)
        {
            Logger.Write("Entered Save Gadget Data");
            Gadget gadgetObj = DAGadget.Instance.GetGadgetById(string.Format(uriFormat, owner, gadgetName, version));
            if (gadgetObj != null)
            {
                if (gadgetObj.NoContent)
                {
                    DAGadget.Instance.UpdateGadgetContent(gadgetObj, false);
                    return SaveData(gadgetObj.GadgetUri, request);
                }
                else
                {
                    WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.Conflict;
                    WebOperationContext.Current.OutgoingResponse.StatusDescription = "This gadget already has data.Use PUT for Update or change Metadata";
                    //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                    Logger.Write("Exit Store Gadget with fail");
                    return false;
                }
            }
            else
            {
                WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.NotFound;
                WebOperationContext.Current.OutgoingResponse.StatusDescription = 
                    string.Format("GadgetMetadata for Gadget with Owner:{0} Name:{1} Version:{2} does not exist",owner,gadgetName,version);
                //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                Logger.Write("Exit Store Gadget with fail");
                return false;
            }
        }

        [WebHelp(Comment = "Update data of the Gadget")]
        [WebInvoke(UriTemplate = "gadgets/{owner}/{gadgetName}/{version}/data", Method = "PUT", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public bool UpdateGadgetData(string owner, string gadgetName, string version, IncomingData request)
        {
            Logger.Write("Entered Update Gadget Data");
            Gadget gadgetObj = DAGadget.Instance.GetGadgetById(string.Format(uriFormat, owner, gadgetName, version));
            if (gadgetObj != null)
            {
                    DAGadget.Instance.UpdateGadgetContent(gadgetObj, false);
                    return SaveData(gadgetObj.GadgetUri, request);
            }
            else
            {
                WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.NotFound;
                WebOperationContext.Current.OutgoingResponse.StatusDescription =
                    string.Format("GadgetMetadata for Gadget with Owner:{0} Name:{1} Version:{2} does not exist", owner, gadgetName, version);
                //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                Logger.Write("Exit Store Gadget with fail");
                return false;
            }
        }

        [WebHelp(Comment = "Gets the data of the Gadget")]
        [WebGet(UriTemplate = "gadgets/{owner}/{gadgetName}/{version}/data", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        [OperationContract]
        public void GetGadgetData(string owner, string gadgetName, string version)
        {
            Logger.Write("Entered Get Gadget Data as ZIP");
            if (DAGadget.Instance.GetGadgetById(string.Format(uriFormat, owner, gadgetName, version)) != null)
            {
                HttpContext.Current.Response.ContentType = "application/x-zip-compressed";
                byte[] buff = null;
                try
                {
                    buff = GetFile(owner, gadgetName, version);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
                HttpContext.Current.Response.OutputStream.Write(buff, 0, buff.Length);
            }
            else
            {
                WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.NotFound;
                WebOperationContext.Current.OutgoingResponse.StatusDescription =
                    string.Format("GadgetMetadata for Gadget with Owner:{0} Name:{1} Version:{2} does not exist", owner, gadgetName, version);
                //WebOperationContext.Current.OutgoingResponse.SuppressEntityBody = true;
                Logger.Write("Exit Store Gadget with fail");
            }

        }
        #endregion
        #endregion

        #region ServiceImplementation
        private bool SaveData(string relativeUri, IncomingData data)
        {
            Logger.Write("Entered SaveData");
            if (impersonateValidUser(ConfigurationManager.AppSettings["UserName"].ToString(),
                                     ConfigurationManager.AppSettings["DomainName"].ToString(),
                                     ConfigurationManager.AppSettings["UserPass"].ToString()))
            {
                //Insert your code that runs under the security context of a specific user here.
                Logger.Write("Impersonation Successful Save Data");
                string uploadPath = HttpContext.Current.Server.MapPath(ConfigurationManager.AppSettings["UploadPath"].ToString() +  relativeUri);
                Logger.Write("Solved upload path? - " + uploadPath);
                if (!Directory.Exists(uploadPath))
                {
                    System.IO.Directory.CreateDirectory(uploadPath);
                }

                if (data.DataType == "base64string")
                {
                    WriteFile(uploadPath, Convert.FromBase64String(data.Data));
                }
                else if (data.DataType == "URL")
                {
                    //downloadfile from location
                    WebClient cl = new WebClient();
                    WriteFile(uploadPath, cl.DownloadData(new Uri(data.Data)));
                    cl.Dispose();
                }
                else
                {
                    //incorect data type
                }
                UnzipFile(uploadPath);
                undoImpersonation();
                return true;
            }
            else
            {
                Logger.Write("Impersonation Failed Save Data");
                return false;
                //Your impersonation failed. Therefore, include a fail-safe mechanism here.
            }
        }
        private Gadget StoreMetadata(Gadget requestMetadata)
        {
            Logger.Write("Entered StoreMetadata");
            //store in the DB
            DAGadget daGadget = DAGadget.Instance;
            if (daGadget.GetGadget(requestMetadata) == null)
            {
                return daGadget.AddGadget(requestMetadata);
            }
            else
            {
                return null;
            }
        }
        private void WriteFile(string uploadPath, byte[] data)
        {
            Logger.Write("Entered WriteFile");
            BinaryWriter binWriter = new BinaryWriter(File.Open(Path.Combine(uploadPath, "data.zip"), FileMode.Create,
                     FileAccess.Write));
            binWriter.Write(data);
            binWriter.Close();
            Logger.Write("Exit WriteFile");
        }
        private bool DeleteFolder(string owner, string gadgetName, string version)
        {
            Logger.Write("Entered DeleteFolder");
            if (impersonateValidUser(ConfigurationManager.AppSettings["UserName"].ToString(),
                         ConfigurationManager.AppSettings["DomainName"].ToString(),
                         ConfigurationManager.AppSettings["UserPass"].ToString()))
            {
                Logger.Write("DeleteFolder Impersonation Successful");
                //Insert your code that runs under the security context of a specific user here.
                //File.Delete(Path.Combine(folderPath, "data.zip"));
                string folderPath = HttpContext.Current.Server.MapPath(ConfigurationManager.AppSettings["UploadPath"].ToString() + "/" + owner + "/" + gadgetName + "/" + version);
                if (Directory.Exists(folderPath))
                {
                    try
                    {
                        //Directory.Delete(folderPath, true);
                        EmptyFolder(new DirectoryInfo(folderPath));
                    }
                    catch(Exception ex)
                    {
                        Logger.Write("Detele folder failed" + ex.Message);
                        undoImpersonation();
                        return false;
                    }
                }

                undoImpersonation();
                Logger.Write("Exit Deleted Folder with true");
                return true;
            }
            else
            {
                Logger.Write("DeleteFolder Impersonation Failed");
                //Your impersonation failed. Therefore, include a fail-safe mechanism here.
                WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.Forbidden;
                WebOperationContext.Current.OutgoingResponse.StatusDescription = "ImpersonationFailed";
                Logger.Write("Exit Deleted Folder with false");
                return false;
            }
        }
        private void UnzipFile(string folderPath)
        {
            Logger.Write("Entered UnzipFile");
            if (impersonateValidUser(ConfigurationManager.AppSettings["UserName"].ToString(),
                                     ConfigurationManager.AppSettings["DomainName"].ToString(),
                                     ConfigurationManager.AppSettings["UserPass"].ToString()))
            {
                using (ZipFile zip = ZipFile.Read(Path.Combine(folderPath, "data.zip")))
                {
                    foreach (ZipEntry e in zip)
                    {
                        e.Extract(folderPath, ExtractExistingFileAction.OverwriteSilently);
                    }
                }
                undoImpersonation();
            }
            else
            {
                //Your impersonation failed. Therefore, include a fail-safe mechanism here.

            }
            Logger.Write("Exit UnzipFile");

        }
        private byte[] GetFile(string owner, string gadgetName, string version)
        {
            Logger.Write("Entered GetFile");
            byte[] buffer = null;
            if (impersonateValidUser(ConfigurationManager.AppSettings["UserName"].ToString(),
                                     ConfigurationManager.AppSettings["DomainName"].ToString(),
                                     ConfigurationManager.AppSettings["UserPass"].ToString()))
            {
                string folderPath = HttpContext.Current.Server.MapPath(ConfigurationManager.AppSettings["UploadPath"].ToString() + "/" + owner + "/" + gadgetName + "/" + version);
                BinaryReader br = new BinaryReader(File.Open(Path.Combine(folderPath, "data.zip"), FileMode.Open, FileAccess.Read));
                br.BaseStream.Position = 0;
                buffer = br.ReadBytes(Convert.ToInt32(br.BaseStream.Length));
                br.Close();

                undoImpersonation();
            }
            else
            {
                //Your impersonation failed. Therefore, include a fail-safe mechanism here.

            }
            return buffer;
        }
        private void EmptyFolder(DirectoryInfo directoryInfo)
        {
            foreach (FileInfo file in directoryInfo.GetFiles())
            {
                file.Delete();
            }
            foreach (DirectoryInfo subfolder in directoryInfo.GetDirectories())
            {
                EmptyFolder(subfolder);
                subfolder.Delete();
            }
        }
        #endregion

        #region Impersonation
        public const int LOGON32_LOGON_INTERACTIVE = 2;
        public const int LOGON32_PROVIDER_DEFAULT = 0;

        WindowsImpersonationContext impersonationContext;

        [DllImport("advapi32.dll")]
        public static extern int LogonUserA(String lpszUserName,
            String lpszDomain,
            String lpszPassword,
            int dwLogonType,
            int dwLogonProvider,
            ref IntPtr phToken);
        [DllImport("advapi32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern int DuplicateToken(IntPtr hToken,
            int impersonationLevel,
            ref IntPtr hNewToken);

        [DllImport("advapi32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern bool RevertToSelf();

        [DllImport("kernel32.dll", CharSet = CharSet.Auto)]
        public static extern bool CloseHandle(IntPtr handle);

        private bool impersonateValidUser(String userName, String domain, String password)
        {
            if (String.IsNullOrEmpty(userName))
            {
                return true;
            }
            else
            {
                #region commentForNoImpersonation
                Logger.Write("Entered impersonateValidUser");
                WindowsIdentity tempWindowsIdentity;
                IntPtr token = IntPtr.Zero;
                IntPtr tokenDuplicate = IntPtr.Zero;

                if (RevertToSelf())
                {
                    if (LogonUserA(userName, domain, password, LOGON32_LOGON_INTERACTIVE,
                        LOGON32_PROVIDER_DEFAULT, ref token) != 0)
                    {
                        if (DuplicateToken(token, 2, ref tokenDuplicate) != 0)
                        {
                            tempWindowsIdentity = new WindowsIdentity(tokenDuplicate);
                            impersonationContext = tempWindowsIdentity.Impersonate();
                            if (impersonationContext != null)
                            {
                                CloseHandle(token);
                                CloseHandle(tokenDuplicate);
                                Logger.Write("impersonateValidUser returns true");
                                return true;
                            }
                        }
                    }
                }
                if (token != IntPtr.Zero)
                    CloseHandle(token);
                if (tokenDuplicate != IntPtr.Zero)
                    CloseHandle(tokenDuplicate);
                Logger.Write("impersonateValidUser returns false");
                return false;
                #endregion
            }
        }

        private void undoImpersonation()
        {
            #region commentForNoImpersonation
            Logger.Write("Entered undoImpersonation");
            impersonationContext.Undo();
            #endregion
        }
        #endregion
    }

    public class RequestBody
    {
        public Gadget Metadata { set; get; }
        public IncomingData IncomingData { set; get; } 
    }

    public class ResponseBody
    {
        public Gadget Metadata { get; set; }
        public string Data { get; set; }
    }

    public class GadgetResponseBody
    {
        public string ServiceGadgetUri { set; get; }
        public string GadgetLocationURL { set; get; }
        public string GadgetMetadataUri { set; get; }
        public string GadgetDataUri { set; get; }
    }

    [DataContract]
    public class IncomingData
    {
        [DataMember]
        public string DataType { set; get; }
        [DataMember]
        public string Data { set; get; }
    }

    [DataContract]
    public class MetadataProperty
    {
        [DataMember]
        public string Property { set; get; }

        [DataMember]
        public string Value { set; get; }
    }
}