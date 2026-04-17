import { useState } from "react";
import "./Display.css";
import { logEvent } from "../utils/logger";
const Display = ({ contract, account }) => {
  const [data, setData] = useState("");
 
  const getdata = async () => {
    let dataArray;
    const addressInput = document.querySelector(".address");
    const Otheraddress = addressInput ? addressInput.value : "";
    logEvent({
      wallet: account,
      action: "FILES_DISPLAY_REQUESTED",
      result: "info",
      meta: {
        targetWallet: Otheraddress || account,
      },
    });
    try {
      if (Otheraddress) {
        dataArray = await contract.display(Otheraddress);
        console.log(dataArray);
      } else {
        dataArray = await contract.display(account);
      }
    } catch (e) {
      alert("You don't have access");
    }
    const isEmpty = Object.keys(dataArray).length === 0;

    if (!isEmpty) {
      const str = dataArray.toString();
      const str_array = str.split(",");
      // console.log(str);
      // console.log(str_array);
      const images = str_array.map((item, i) => {
        return (
          <>
          <a
            href={item}
            key={i}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              logEvent({
                wallet: account,
                action: "FILE_VIEW_CLICKED",
                result: "info",
                meta: {
                  fileUrl: item,
                  targetWallet: Otheraddress || account,
                },
              })
            }
          >
            <img
              key={i}
              // src={`https://gateway.pinata.cloud/ipfs/${item.substring(36)}`}
              src={`https://gateway.pinata.cloud/ipfs/QmQvi5s12wdKnuNqRuoLHEekY19EBk7bWjne2b1NARwcyi`}
              
              alt="new"
              className="image-list"
              ></img>
          </a>

          

        </>



        );
      });
      setData(images);
    } else {
      alert("No image to display");
    }
  };
  return (
    <>
      <div className="image-list">{data}</div>
      <input
        type="text"
        placeholder="Enter Address"
        className="address"
      ></input>
      <button className="center button" onClick={getdata}>
        Get Data
      </button>

 


    </>
  );
};
export default Display;
