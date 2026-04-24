import React from 'react'
import link from "../../../../svgs/link-2-svgrepo-com.svg";
import unlink from "../../../../svgs/link-broke-svgrepo-com.svg";
import redo from "../../../../svgs/redo-svgrepo-com (1).svg";
import undo from "../../../../svgs/undo-svgrepo-com (1).svg";
import underline from "../../../../svgs/underline-svgrepo-com (1).svg";
import bold from "../../../../svgs/bold-svgrepo-com (1).svg";
import italic from "../../../../svgs/italic-svgrepo-com.svg";
import img from "../../../../svgs/image-svgrepo-com (5).svg";
import vid from "../../../../svgs/video-library-svgrepo-com (1).svg";
import ol from "../../../../svgs/ordered-list-svgrepo-com (2).svg";
import ul from "../../../../svgs/list-pointers-svgrepo-com (1).svg";
import { v4 as uuidv4 } from 'uuid';

export default function Tools() {

  let handleImage = () => {

        
    let f = document.querySelector("#file");

    let reader = new FileReader();

    reader.onload = (result) => {

      let id = uuidv4();;     

      document.querySelector(".editor").focus(); 


      let imgCnt = `
      <div id=${id.src} style='height: 300px; width: 100%; margin: 20px 0 20px 0;'>
          <img src='${reader.result}' id='${id}' style='height: 100%; width: 100%; margin: 0;' alt='${[...f.files][0].name}' />
      </div>
      `

      document.execCommand("insertHTML", false, 
      
          imgCnt
      );

    }
    reader.readAsDataURL([...f.files][0]);
  }

  return (
    <>
        <div className="tools-cnt" style={{background: '#fff'}}>

            <button style={{height: '20px', margin: '0px 6px', width: '20px'}} onClick={() => {document.querySelector(".editor").focus(); document.execCommand("bold", false, "")}}>
                <img src={bold.src} style={{height: "15px", width: "15px"}} alt="bold" />
            </button>

            <button style={{height: '20px', margin: '0px 6px', width: '20px'}} onClick={() => {document.querySelector(".editor").focus(); document.execCommand("underline", false, "")}}>
                <img src={underline.src} style={{height: "15px", width: "15px"}} alt="underline" />
            </button>

            <button style={{height: '20px', margin: '0px 6px', width: '20px'}} onClick={() => {document.querySelector(".editor").focus(); document.execCommand("italic", false, "")}}>
                <img src={italic.src} style={{height: "15px", width: "15px"}} alt="italic" />
            </button>
            &nbsp;

            <button style={{height: '20px', margin: '0px 6px', width: '20px', margin: "0 20px 0 20px"}} onClick={() => {document.querySelector(".editor").focus(); document.execCommand("undo", false, "")}}>
                <img src={undo.src} style={{height: "20px", width: "20px"}} alt="undo" />
            </button>

            <button style={{height: '20px', margin: '0px 6px', width: '20px', margin: "0 20px 0 20px"}} onClick={() => {document.querySelector(".editor").focus();  document.execCommand("redo", false, "")}}>
                <img src={redo.src} style={{height: "20px", width: "20px"}} alt="redo" />
            </button>
        </div>
    </>
  )
}
