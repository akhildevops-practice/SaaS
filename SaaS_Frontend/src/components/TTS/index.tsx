// import React, { useState, useRef, useEffect } from "react";
// import { Modal, Select, Space, Button, Spin } from "antd";
// import TextArea from "antd/es/input/TextArea";
// import getSessionStorage from "utils/getSessionStorage";
// import getAppUrl from "utils/getAppUrl";

// type Props = {
//   ttsModalOpen: boolean;
//   toggleTTSModal: () => void;
// };

// const TTSComponent = ({ ttsModalOpen, toggleTTSModal }: Props) => {
//   const [text, setText] = useState("");
//   const userDetails = getSessionStorage();
//   const realmName = getAppUrl();
//   const [voice, setVoice] = useState("nova");
//   const [language, setLanguage] = useState("");
//   const [translatedText, setTranslatedText] = useState("");
//   const [transcribedText, setTranscribedText] = useState("");

//   const [recording, setRecording] = useState(false);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     let timeout: NodeJS.Timeout;
//     if (recording) {
//       timeout = setTimeout(() => stopRecording(), 30000);
//     }
//     return () => clearTimeout(timeout);
//   }, [recording]);

//   const startRecording = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//     const recorder = new MediaRecorder(stream, {
//       mimeType: "audio/webm;codecs=opus",
//     });

//     const chunks: Blob[] = [];
//     setAudioChunks([]); // Reset state

//     recorder.ondataavailable = (e) => {
//       // console.log("📥 Got chunk of size:", e.data.size);
//       if (e.data.size > 0) {
//         chunks.push(e.data);
//         setAudioChunks((prev) => [...prev, e.data]); // For reference
//       }
//     };

//     recorder.onstop = async () => {
//       const blob = new Blob(chunks, { type: "audio/webm" });
//       console.log("Chunks:", chunks.length, "Blob size:", blob.size);

//       if (blob.size < 1000) {
//         alert("Recording too short. Try again.");
//         return;
//       }

//       const file = new File([blob], "recording.webm", { type: "audio/webm" });
//       const formData = new FormData();
//       formData.append("audio", file);
//       formData.append("language", language);
//       formData.append("voice", voice);
//       formData.append("orgId", userDetails?.organizationId);
//       formData.append("locationName", userDetails?.location?.id);
//       formData.append("entityName", userDetails?.entity?.id);

//       setLoading(true);
//       try {
//         const response = await fetch(
//           `${process.env.REACT_APP_PY_URL}/pyapi/voice-to-tts`,
//           {
//             method: "POST",
//             body: formData,
//           }
//         );

//         const transcribed = response.headers.get("X-Transcribed-Text");
//         if (transcribed) {
//           setTranscribedText(transcribed);
//           setText(transcribed);
//         }

//         playStreamedAudio(response);
//       } catch (err) {
//         console.error("🎙️ Upload failed", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     recorder.start(1000); // force data every 1 second (avoids Chrome issue)
//     mediaRecorderRef.current = recorder;
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     if (!mediaRecorderRef.current) return;

//     mediaRecorderRef.current.stop();
//     setRecording(false);
//   };

//   const handleConvert = async () => {
//     if (!text.trim() || !language || !voice) return;

//     setLoading(true);
//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_PY_URL}/pyapi/translate`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ text, language }),
//         }
//       );
//       const { translatedText } = await res.json();
//       setTranslatedText(translatedText);

//       const ttsRes = await fetch(
//         `${process.env.REACT_APP_PY_URL}/pyapi/translatedStream`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ translatedText, voice }),
//         }
//       );

//       playStreamedAudio(ttsRes);
//     } catch (err) {
//       console.error("Text-to-speech error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const playStreamedAudio = async (response: Response) => {
//     const mediaSource = new MediaSource();
//     const audio = new Audio();
//     audio.controls = true;
//     audio.src = URL.createObjectURL(mediaSource);

//     const container = document.getElementById("audio-container");
//     if (container) {
//       container.innerHTML = "";
//       container.appendChild(audio);
//     }

//     requestAnimationFrame(() => {
//       audio.play().catch((err) => console.warn("Playback error:", err));
//     });

//     mediaSource.addEventListener("sourceopen", async () => {
//       const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
//       const reader = response.body?.getReader();
//       if (!reader) return;

//       const queue: Uint8Array[] = [];
//       let isAppending = false;
//       let streamEnded = false;

//       const pump = async () => {
//         const { value, done } = await reader.read();
//         if (value) queue.push(value);
//         if (done) streamEnded = true;

//         if (!isAppending && queue.length > 0 && !sourceBuffer.updating) {
//           isAppending = true;
//           sourceBuffer.appendBuffer(queue.shift()!);
//         }

//         if (!done) requestAnimationFrame(pump);
//       };

//       sourceBuffer.addEventListener("updateend", () => {
//         isAppending = false;
//         if (queue.length > 0) {
//           sourceBuffer.appendBuffer(queue.shift()!);
//           isAppending = true;
//         } else if (streamEnded && !sourceBuffer.updating) {
//           mediaSource.endOfStream();
//         }
//       });

//       pump();
//     });
//   };

//   return (
//     <Modal
//       title="Text/Voice to Speech"
//       open={ttsModalOpen}
//       onCancel={() => {
//         toggleTTSModal();
//         setText("");
//         setTranslatedText("");
//         setTranscribedText("");
//         setLanguage("");
//         setAudioChunks([]);
//       }}
//       onOk={handleConvert}
//       okText="Convert to Speech"
//       okButtonProps={{ disabled: !text && !audioChunks.length }}
//       width={600}
//     >
//       <Space direction="vertical" style={{ width: "100%" }}>
//         <TextArea
//           rows={4}
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Enter text to convert"
//         />

//         <Select value={voice} onChange={setVoice} style={{ width: 200 }}>
//           <Select.Option value="alloy">Alloy</Select.Option>
//           <Select.Option value="echo">Echo</Select.Option>
//           <Select.Option value="fable">Fable</Select.Option>
//           <Select.Option value="onyx">Onyx</Select.Option>
//           <Select.Option value="nova">Nova</Select.Option>
//           <Select.Option value="shimmer">Shimmer</Select.Option>
//         </Select>

//         <Select
//           value={language}
//           onChange={setLanguage}
//           style={{ width: 200 }}
//           placeholder="Translate to language"
//         >
//           <Select.Option value="English">English</Select.Option>
//           <Select.Option value="Hindi">Hindi</Select.Option>
//           <Select.Option value="Marathi">Marathi</Select.Option>
//           <Select.Option value="Bengali">Bengali</Select.Option>
//         </Select>

//         <Button
//           onClick={recording ? stopRecording : startRecording}
//           type="primary"
//         >
//           {recording ? "Stop Recording" : "🎙️ Record Voice Note"}
//         </Button>

//         {transcribedText && (
//           <div style={{ color: "#999" }}>
//             🗣️ <strong>Transcribed:</strong> {transcribedText}
//           </div>
//         )}

//         {translatedText && (
//           <div style={{ paddingTop: 8, fontStyle: "italic", color: "#555" }}>
//             <strong>Translated:</strong> {translatedText}
//           </div>
//         )}

//         {loading && <Spin tip="Generating speech..." />}

//         <div id="audio-container" style={{ marginTop: 12 }} />
//       </Space>
//     </Modal>
//   );
// };

// export default TTSComponent;
