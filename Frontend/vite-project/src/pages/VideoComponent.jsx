import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { TextField, Button, IconButton, Badge } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "../styles/VideoComponent.module.css";
import { io } from "socket.io-client";

const server_url = "https://zoommmyyy-backend.onrender.com";

let connections = {};

const peerConfigConnection = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const Video = ({ stream }) => {
  const ref = useRef();
  useEffect(() => {
    if (stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  return <video ref={ref} autoPlay playsInline />;
};

export default function VideoComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();

  const [username, setUsername] = useState("");
  const [askForUsername, setAskForUsername] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newMessage, setNewMessage] = useState(0);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [screen, setScreen] = useState(false);
  const [videos, setVideos] = useState([]);

  const { url } = useParams();
  const roomId = url;
  const { addToHistory } = useContext(AuthContext);

  let routeTo = useNavigate();

  useEffect(() => {
    const getInitialPermissions = async () => {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setVideoAvailable(true);
        videoStream.getTracks().forEach((track) => track.stop());
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setAudioAvailable(true);
        audioStream.getTracks().forEach((track) => track.stop());
        if (navigator.mediaDevices.getDisplayMedia) {
          setScreenAvailable(true);
        }
      } catch (err) {
        console.log("Permission denied for some devices:", err);
      }
    };
    getInitialPermissions();
  }, []);

  const getMedia = async () => {
    if (videoOn || audioOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoOn,
          audio: audioOn,
        });
        window.localStream = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        for (let id in connections) {
          if (window.localStream) {
            window.localStream.getTracks().forEach((track) => {
              connections[id].addTrack(track, window.localStream);
            });
          }
        }
      } catch (e) {
        console.error("Error getting user media:", e);
      }
    } else {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
      }
    }
  };

  useEffect(() => {
    getMedia();
  }, [videoOn, audioOn]);

  const getMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (connections[fromId]) {
      if (fromId !== socketIdRef.current) {
        if (signal.sdp) {
          connections[fromId]
            .setRemoteDescription(new RTCSessionDescription(signal.sdp))
            .then(() => {
              if (signal.sdp.type === "offer") {
                connections[fromId]
                  .createAnswer()
                  .then((description) => {
                    return connections[fromId].setLocalDescription(description);
                  })
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      fromId,
                      JSON.stringify({
                        sdp: connections[fromId].localDescription,
                      })
                    );
                  })
                  .catch((e) => console.log("Error creating answer:", e));
              }
            })
            .catch((e) => console.log("Error setting remote description:", e));
        }
        if (signal.ice) {
          connections[fromId]
            .addIceCandidate(new RTCIceCandidate(signal.ice))
            .catch((e) => console.log("Error adding ICE candidate:", e));
        }
      }
    } else {
      console.warn(`Received signal from unknown peer: ${fromId}`);
    }
  };

  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { data, sender }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessage((prevCount) => prevCount + 1);
    }
  };

  const createPeerConnection = (partnerId, isInitiator) => {
    if (connections[partnerId]) {
      console.log("Connection already exists for", partnerId);
      return;
    }
    console.log(
      `Creating peer connection for ${partnerId}, initiator: ${isInitiator}`
    );

    const peer = new RTCPeerConnection(peerConfigConnection);
    connections[partnerId] = peer;

    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => {
        peer.addTrack(track, window.localStream);
      });
    }

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit(
          "signal",
          partnerId,
          JSON.stringify({ ice: event.candidate })
        );
      }
    };

    peer.ontrack = (event) => {
      setVideos((prev) => {
        if (prev.find((v) => v.socketId === partnerId)) return prev;
        return [...prev, { socketId: partnerId, stream: event.streams[0] }];
      });
    };

    if (isInitiator) {
      peer
        .createOffer()
        .then((offer) => peer.setLocalDescription(offer))
        .then(() => {
          socketRef.current.emit(
            "signal",
            partnerId,
            JSON.stringify({ sdp: peer.localDescription })
          );
        })
        .catch((e) => console.error("Create offer error:", e));
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url);

    socketRef.current.on("signal", getMessageFromServer);
    socketRef.current.on("chat-message", addMessage);

    socketRef.current.on("connect", () => {
      console.log("✅ CLIENT: Connected with ID:", socketRef.current.id);
      socketRef.current.emit("join-call", roomId);
      socketIdRef.current = socketRef.current.id;
    });

    socketRef.current.on("user-left", (id) => {
      console.log("User left:", id);
      setVideos((prevVideos) =>
        prevVideos.filter((video) => video.socketId !== id)
      );
      if (connections[id]) {
        connections[id].close();
        delete connections[id];
      }
    });

    socketRef.current.on("all-users", (clients) => {
      console.log("Got list of all users:", clients);
      clients.forEach((clientId) => {
        createPeerConnection(clientId, true);
      });
    });

    socketRef.current.on("user-joined", (newUserId) => {
      console.log("A new user joined:", newUserId);
      createPeerConnection(newUserId, false);
    });
  };

  const connect = () => {
    setAskForUsername(false);
    setVideoOn(true);
    setAudioOn(true);
    connectToSocketServer();

    addToHistory(url)
      .then(() => {
        console.log("Meeting added to history:", url);
      })
      .catch((error) => {
        console.error("Failed to add meeting to history:", error);
      });
  };

  const handleVideo = () => setVideoOn(!videoOn);
  const handleAudio = () => setAudioOn(!audioOn);

  const stopScreenShare = async () => {
    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => track.stop());
    }
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: videoOn,
        audio: audioOn,
      });
      window.localStream = cameraStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = cameraStream;
      }
      const newVideoTrack = cameraStream.getVideoTracks()[0];
      for (let id in connections) {
        const sender = connections[id]
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }
    } catch (e) {
      console.error("Error restoring camera stream:", e);
    }
  };

  const getDisplayMediaSuccess = async (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.error("Error stopping previous stream:", e);
    }
    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.onended = () => {
        stopScreenShare();
        setScreen(false);
      };
    }
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      const sender = connections[id]
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
    }
  };

  const getDisplayMedia = () => {
    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then(getDisplayMediaSuccess)
        .catch((e) => {
          console.log("Could not get display media:", e);
          setScreen(false);
        });
    }
  };

  useEffect(() => {
    if (screen === true) {
      getDisplayMedia();
    }
  }, [screen]);

  const handleScreen = () => {
    if (screen) {
      stopScreenShare();
      setScreen(false);
    } else {
      setScreen(true);
    }
  };

  let sendMessage = () => {
    if (message.trim() === "") return;
    socketRef.current.emit("chat-message", message, username, roomId);
    addMessage(message, username, socketIdRef.current);
    setMessage("");
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {
      console.log("No tracks to stop:", e);
    }
    routeTo("/home");
  };

  const handleChat = () => {
    setShowModal(!showModal);
    setNewMessage(0);
  };

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter into Lobby</h2>
          <TextField
            id="outlined-basic"
            label="Username"
            variant="outlined"
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>
          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>
                <div className={styles.chattingDisplay}>
                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <div key={index} style={{ marginBottom: "20px" }}>
                        <p>
                          <strong>{msg.sender}:</strong>
                        </p>
                        <p>{msg.data}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <p>No messages yet</p>
                    </>
                  )}
                </div>
                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Enter Your Message"
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
          <div className={styles.buttonContainer}>
            <IconButton sx={{ color: "white" }} onClick={handleVideo}>
              {videoOn ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton sx={{ color: "red" }} onClick={handleEndCall}>
              <CallEndIcon />
            </IconButton>
            <IconButton sx={{ color: "white" }} onClick={handleAudio}>
              {audioOn ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvailable && (
              <IconButton onClick={handleScreen} sx={{ color: "white" }}>
                {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
              </IconButton>
            )}
            <Badge badgeContent={newMessage} max={999} color="secondary">
              <IconButton sx={{ color: "white" }} onClick={handleChat}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>
          <video
            className={styles.meetUserVideo}
            ref={localVideoRef}
            autoPlay
            muted
          ></video>
          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div className={styles.conferenceView} key={video.socketId}>
                <Video stream={video.stream} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
