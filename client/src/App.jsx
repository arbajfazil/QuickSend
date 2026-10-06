import { useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [mode, setMode] = useState("");
  const [file, setFile] = useState(null);
  const [code, setCode] = useState("");
  const [receiveCode, setReceiveCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendFile = async () => {
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API}/send`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setCode(data.code);
      setMessage("Give this code to the other device");
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    }

    setLoading(false);
  };

  const receiveFile = () => {
    if (!receiveCode || receiveCode.length !== 6) {
      setMessage("Enter a valid 6-digit code");
      return;
    }

    window.location.href = `${API}/receive/${receiveCode}`;
  };

  return (
    <div className="app">
      <div className="card">
        <h1>QuickSend</h1>

        <p className="subtitle">
          Send files between your phone and PC
        </p>

        {!mode && (
          <div className="buttons">
            <button onClick={() => setMode("send")}>
              Send File
            </button>

            <button onClick={() => setMode("receive")}>
              Receive File
            </button>
          </div>
        )}

        {mode === "send" && (
          <div className="section">
            <h2>Select File</h2>

            <input
              type="file"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setCode("");
                setMessage("");
              }}
            />

            {file && (
              <p className="filename">
                {file.name}
              </p>
            )}

            <button
              onClick={sendFile}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Generate Code"}
            </button>

            {code && (
              <div className="codeBox">
                <p>Your Code</p>
                <strong>{code}</strong>
              </div>
            )}

            {message && <p>{message}</p>}

            <button
              className="back"
              onClick={() => {
                setMode("");
                setFile(null);
                setCode("");
                setMessage("");
              }}
            >
              Back
            </button>
          </div>
        )}

        {mode === "receive" && (
          <div className="section">
            <h2>Receive File</h2>

            <input
              type="text"
              maxLength="6"
              placeholder="Enter 6-digit code"
              value={receiveCode}
              onChange={(e) =>
                setReceiveCode(
                  e.target.value.replace(/\D/g, "")
                )
              }
            />

            <button onClick={receiveFile}>
              Download File
            </button>

            {message && <p>{message}</p>}

            <button
              className="back"
              onClick={() => {
                setMode("");
                setReceiveCode("");
                setMessage("");
              }}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;