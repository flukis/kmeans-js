import { useRef, useState } from "react";
import "./App.css";
import { rgbToHex } from "./utils";

const worker = new Worker("./worker.js", { type: "module" });

function App() {
  const [imS, setIms] = useState(null);
  const [palletes, setPalletes] = useState([]);
  const imgRef = useRef(null);

  return (
    <>
      <div className="container">
        <h1 className="title">Extract Color Palette From Image</h1>
        <div className="image-container">
          {imS ? (
            <>
              <img
                alt="from input"
                width="100%"
                height="100%"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                src={URL.createObjectURL(imS)}
              />
              <button
                onClick={() => {
                  setIms(null);
                  setPalletes([]);
                }}
                className="remove-image"
                aria-label="Erase current image"
                title="Erase image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M18 6l-12 12"></path>
                  <path d="M6 6l12 12"></path>
                </svg>
                <span className="sr-only">Button Erase Image</span>
              </button>
            </>
          ) : (
            <div className="image-placeholder" />
          )}
        </div>
        <div>
          <button
            className="custom-file-upload"
            onClick={() => imgRef?.current.click()}
          >
            <i className="fa fa-cloud-upload"></i> Select Image (jpg/png)
          </button>
          <input
            type="file"
            name="image-upload"
            ref={imgRef}
            accept="image/png, image/jpeg"
            onChange={(e) => {
              setIms(e.target.files[0]);
              let img = new Image();
              const reader = new FileReader();

              reader.readAsDataURL(e.target.files[0]);

              reader.onload = function (e) {
                img.src = e.target?.result;
                setPalletes([]);
              };

              img.onload = function () {
                const canvas = document.createElement("canvas");

                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, img.width, img.height);

                let imageData = ctx?.getImageData(
                  0,
                  0,
                  img.width,
                  img.height
                ).data;

                worker.postMessage(imageData);

                worker.onmessage = function (event) {
                  const result = event.data;
                  const formated = (result || []).map((item) =>
                    rgbToHex(
                      Math.floor(item[0]),
                      Math.floor(item[1]),
                      Math.floor(item[2])
                    )
                  );
                  const removeDuplicated = [...new Set(formated)];
                  setPalletes(removeDuplicated);
                };
              };
            }}
          />
        </div>

        {imS ? (
          palletes.length > 0 ? (
            <div className="result-pallete">
              {(palletes || []).map((item, idx) => {
                if (item === "#000000") return;
                return (
                  <div key={idx}>
                    <button
                      type="button"
                      title={item}
                      onClick={() => navigator.clipboard.writeText(item)}
                      style={{
                        cursor: "pointer",
                        width: "24px",
                        height: "24px",
                        borderRadius: "4px",
                        background: item,
                      }}
                    >
                      <span className="sr-only">{`Color code is: ${item}`}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="loading-image-state">
                <div className="lds-ring">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <span>Please wait ...</span>
              </div>
            </div>
          )
        ) : null}
      </div>
    </>
  );
}

export default App;
