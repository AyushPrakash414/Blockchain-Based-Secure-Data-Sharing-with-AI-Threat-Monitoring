import { useState } from "react";
import axios from "axios";
import { API_Key, API_Secret } from "../utils/constants";
import { logEvent } from "../utils/logger";
import { DocumentArrowUpIcon, ArrowPathIcon } from '@heroicons/react/24/outline';


const FileUpload = ({ contract, account, provider }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No image selected");
  const [isUploading, setIsUploading] = useState(false);

  const getErrorMessage = (error) => {
    return (
      error?.response?.data?.error ||
      error?.reason ||
      error?.message ||
      "Unknown error"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      setIsUploading(true);
      const baseMeta = {
        fileName: file.name,
        fileSize: file.size,
      };

      logEvent({
        wallet: account,
        action: "FILE_UPLOAD_STARTED",
        result: "info",
        meta: baseMeta,
      });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: API_Key,
            pinata_secret_api_key: API_Secret,
            "Content-Type": "multipart/form-data",
          },
        });
        const cid = resFile.data.IpfsHash;
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${cid}`;

        logEvent({
          wallet: account,
          action: "FILE_UPLOADED_TO_IPFS",
          result: "success",
          meta: {
            ...baseMeta,
            cid,
            gatewayUrl: ImgHash,
          },
        });

        const tx = await contract.add(account, ImgHash);

        logEvent({
          wallet: account,
          action: "FILE_STORED_ONCHAIN_PENDING",
          result: "pending",
          meta: {
            ...baseMeta,
            cid,
            gatewayUrl: ImgHash,
            txHash: tx.hash,
          },
        });

        await tx.wait();

        logEvent({
          wallet: account,
          action: "FILE_STORED_ONCHAIN_SUCCESS",
          result: "success",
          meta: {
            ...baseMeta,
            cid,
            gatewayUrl: ImgHash,
            txHash: tx.hash,
          },
        });
      
        setFileName("No image selected");
        setFile(null);
      } catch (error) {
        logEvent({
          wallet: account,
          action: "FILE_UPLOAD_FAILED",
          result: "error",
          meta: {
            ...baseMeta,
            error: getErrorMessage(error),
          },
        });
        alert("Unable to upload image to Pinata. Check console/logs.");
      } finally {
          setIsUploading(false);
      }
    } else {
        setFileName("No image selected");
        setFile(null);
    }
  };
  
  const retrieveFile = (e) => {
    const data = e.target.files[0];
    if (data) {
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(data);
        reader.onloadend = () => {
          setFile(data);
        };
        setFileName(data.name);
    }
    e.preventDefault();
  };

  return (
    <div className="transition-colors duration-300">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="relative border-2 border-dashed theme-border hover:border-[var(--color-accent)] transition-colors theme-bg-inset rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <input
                    disabled={!account || isUploading}
                    type="file"
                    id="file-upload"
                    name="data"
                    onChange={retrieveFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                
                <div className="theme-accent-soft p-3 rounded-full mb-3 border transition-colors duration-300" style={{ borderColor: 'var(--color-accent)' }}>
                    <DocumentArrowUpIcon className="w-7 h-7 theme-accent"/>
                </div>
                
                {file ? (
                    <span className="text-sm font-medium theme-text theme-bg-surface px-4 py-2 rounded-lg">{fileName}</span>
                ) : (
                    <>
                        <span className="text-sm font-medium theme-text-secondary mb-1">Click to browse or drag file here</span>
                        <span className="text-xs theme-text-muted">IPFS Network Storage via Pinata</span>
                    </>
                )}
            </div>

            <button 
                type="submit" 
                disabled={!file || !account || isUploading}
                className="mt-1 w-full flex items-center justify-center gap-2 theme-accent-bg text-white dark:text-[#131313] font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isUploading ? (
                    <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Encrypting & Uploading...
                    </>
                ) : (
                    "Init Secure Transfer"
                )}
            </button>
        </form>
    </div>
  );
};

export default FileUpload;
