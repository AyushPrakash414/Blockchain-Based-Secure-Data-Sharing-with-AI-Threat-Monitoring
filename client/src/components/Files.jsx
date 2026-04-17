import { useState } from "react"
import { logEvent } from "../utils/logger"
import { DocumentTextIcon, FolderIcon } from '@heroicons/react/24/outline';


export default function Files({ contract, account, shared, title }) {
  const [allfiles, setAllFiles] = useState([])

  const GetAllFiles = async () => {
    const addressInput = document.querySelector(".address");
    const Otheraddress = addressInput ? addressInput.value : "";
    
    try {
      if (shared) {
        if(!Otheraddress){
          alert('Enter Target Wallet Address')
        } else {
            logEvent({
              wallet: account,
              action: "FILES_DISPLAY_REQUESTED",
              result: "info",
              meta: { shared: true, targetWallet: Otheraddress },
            });
          
            const files = await contract.display(Otheraddress)
            setAllFiles(files)
        }
      } else {
        logEvent({
          wallet: account,
          action: "FILES_DISPLAY_REQUESTED",
          result: "info",
          meta: { shared: false, targetWallet: account },
        });
        const files = await contract.display(account)
        setAllFiles(files)
      }
    } catch (e) {
      alert("Encryption locked: Unauthorized access strictly denied.");
      setAllFiles([])
    }
  }

  return (
    <div className="transition-colors duration-300">
      {title && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b theme-border-subtle pb-4">
            <div className="flex items-center gap-3">
                <FolderIcon className="w-7 h-7 theme-accent" />
                <h3 className="text-2xl font-bold font-['Space_Grotesk'] theme-text">{title}</h3>
            </div>
            <span className="text-sm font-mono theme-text-muted mt-2 md:mt-0 px-3 py-1 theme-bg-surface rounded-full border theme-border-subtle">Net-Drive Access</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 w-full mb-8"> 
          {shared && (
            <input
                type="text"
                placeholder="Enter Target 0x Wallet Address"
                className="address flex-1 theme-bg-surface border theme-border theme-text px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all font-mono text-sm" style={{ '--tw-ring-color': 'var(--color-accent)' }}
            />
          )}
          
          <button 
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-200 active:scale-[0.98] ${shared ? 'theme-bg-surface border theme-accent hover:theme-accent-soft' : 'theme-accent-bg text-white dark:text-[#131313] hover:opacity-90'}`} 
              style={shared ? { borderColor: 'var(--color-accent)', color: 'var(--color-accent)' } : {}}
              onClick={GetAllFiles}
          >
              Decrypt & Sync Registry
          </button>
      </div>

      {allfiles.length === 0 ? (
          <div className="border-2 border-dashed theme-border p-12 flex flex-col items-center justify-center rounded-xl theme-bg-inset transition-colors duration-300">
              <DocumentTextIcon className="w-12 h-12 theme-text-faint mb-4" />
              <p className="theme-text-muted text-sm font-medium">No encrypted files isolated in this zone yet.</p>
          </div>
      ) : (
          <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allfiles.map((file) => (
              <li key={file} className="flex flex-col justify-between group overflow-hidden theme-bg-surface border theme-border rounded-xl hover:border-[var(--color-accent)] transition-all duration-300 theme-shadow">
                <div className="p-4 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg theme-bg-inset border theme-border-subtle flex items-center justify-center shrink-0 group-hover:theme-accent-soft transition-colors duration-300">
                     <DocumentTextIcon className="w-5 h-5 theme-text-muted group-hover:theme-accent transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                      <p className="text-xs theme-text-faint font-mono tracking-tighter truncate max-w-[200px]">ipfs://{file.substring(36, 50)}...</p>
                      <p className="text-sm font-medium theme-text mt-1 line-clamp-2 leading-snug">
                        Secure Vault Document
                      </p>
                  </div>
                </div>
                
                <div className="border-t theme-border-subtle theme-bg-inset p-3 mt-2 transition-colors duration-300">
                    <a
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center text-xs font-bold uppercase tracking-widest theme-accent hover:opacity-80 transition-colors"
                      onClick={() =>
                        logEvent({
                          wallet: account,
                          action: "FILE_VIEW_CLICKED",
                          result: "info",
                          meta: { fileUrl: file, shared: Boolean(shared) },
                        })
                      }
                    >
                      Authenticate & View
                    </a>
                </div>
              </li>
            ))}
          </ul>
      )}
    </div>
  )
}
