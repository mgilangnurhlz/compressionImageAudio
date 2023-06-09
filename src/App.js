import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import lamejs from "lamejs";
import love from "./images/love.ico";
import ImageResize from "./ImageResize";

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [processImage, setProcessImage] = useState(null);
  const [processAudio, setProcessAudio] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setProcessAudio(null);
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    setSelectedAudio(file);
    setSelectedImage(null);
  };

  const handleImageResize = async () => {
    if (selectedImage) {
      try {
        const options = {
          maxSizeMB: 50,
          maxWidthOrHeight: 300,
          useWebWorker: true,
        };
        const compressedImage = await imageCompression(selectedImage, options);
        setProcessImage(compressedImage);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const compressAudio = (audioBuffer) => {
    const mp3Encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
    const samples = audioBuffer.getChannelData(0);
    const sampleBlockSize = 1152;
    const mp3Data = [];

    for (let i = 0; i < samples.length; i += sampleBlockSize) {
      const sampleChunk = samples.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }

    const mp3buf = mp3Encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }

    const blob = new Blob(mp3Data, { type: "audio/mp3" });
    return blob;
  };

  const handleAudioCompression = async () => {
    if (selectedAudio) {
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const reader = new FileReader();
        reader.onload = async (event) => {
          const arrayBuffer = event.target.result;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const compressedAudioBlob = compressAudio(audioBuffer);
          setProcessAudio(compressedAudioBlob);
        };
        reader.readAsArrayBuffer(selectedAudio);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleDownloadImage = () => {
    const url = URL.createObjectURL(processImage);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gilangApps(kompresi).jpg";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudio = () => {
    const url = URL.createObjectURL(processAudio);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gilangApps.mp3";
    link.click();
    URL.revokeObjectURL(url);
  };

  const [imageToResize, setImageToResize] = useState(undefined);
  const [resizedImage, setResizedImage] = useState(undefined);

  const onUploadFile = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setImageToResize(event.target.files[0]);
    }
  };

  const downloadImage = () => {
    if (resizedImage) {
      const link = document.createElement("a");
      link.href = resizedImage;
      link.download = "gilangApps(resize).jpg";
      link.click();
    }
  };

  return (
    <div className="body">
      <header>
        <div className="kiri">
          <a href="https://github.com/mgilangnurhlz">@mgilangnurhlz</a>
        </div>
        <div className="kanan">
          <a href="https://github.com/mgilangnurhlz/compressionImageAudio">
            code
          </a>
          <a href="https://youtu.be/xKKZpaxPa5w">video</a>
        </div>
      </header>
      <div className="form">
        <div className="image">
          <div className="text">
            <h3>--Image Compression--</h3>
          </div>
          <div className="inputbox">
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <button onClick={handleImageResize}>Compression Image</button>
          {processImage && (
            <div className="resultImg">
              <div className="text">
                <h4>Results Image</h4>
              </div>
              <div className="displayImg">
                <img src={URL.createObjectURL(processImage)} alt="Result" />
              </div>

              <button onClick={handleDownloadImage}>Download Image</button>
            </div>
          )}
        </div>
        <div className="gambar">
          <div className="text">
            <h3>--Image Resizer--</h3>
          </div>
          <div className="inputbox">
            <input type="file" accept="image/*" onChange={onUploadFile} />
          </div>

          <div className="previewimage">
            <ImageResize
              imageToResize={imageToResize}
              onImageResized={(resizedImage) => setResizedImage(resizedImage)}
            />
          </div>
          {resizedImage && (
            <div>
              <div className="text">
                <h4>Results Image</h4>
              </div>
              <div className="displayImg">
                <img alt="Resize Image" src={resizedImage} />
              </div>
            </div>
          )}
        </div>
        <button onClick={downloadImage}>Download image</button>
        <div className="audio">
          <div className="text">
            <h3>--Audio Compression--</h3>
          </div>
          <div className="inputbox">
            <input
              className="input"
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
            />
          </div>
          {selectedAudio && (
            <div className="resultaud">
              <audio controls>
                <source
                  src={URL.createObjectURL(selectedAudio)}
                  type="audio/mp3"
                />
              </audio>
            </div>
          )}
          <button
            style={{ marginBottom: "30px" }}
            onClick={handleAudioCompression}
          >
            Compression Audio
          </button>
          {processAudio && (
            <div className="audio">
              <div className="text">
                <h4>Results Audio</h4>
              </div>
              <div className="resultaud">
                <audio controls>
                  <source
                    src={URL.createObjectURL(processAudio)}
                    type="audio/mp3"
                  />
                </audio>
              </div>
              <button
                style={{ marginBottom: "30px" }}
                onClick={() =>
                  handleDownloadAudio(processAudio, "gilangApps.mp3")
                }
              >
                Download Audio
              </button>
            </div>
          )}
        </div>
      </div>
      <footer>
        made with <img className="icon" src={love} alt="React Logo" />
      </footer>
    </div>
  );
};

export default App;
