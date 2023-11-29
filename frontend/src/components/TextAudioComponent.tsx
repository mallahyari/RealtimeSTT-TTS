import React, { useEffect, useState, useRef } from 'react';
import { Button, Flex, Typography, Card, Row, Col, Input } from 'antd';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import useWebSocket from 'react-use-websocket';
import { BACKEND_URL } from '../config';

const { TextArea } = Input;

export default function TextAudioComponent() {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const { sendMessage, readyState } = useWebSocket(
    'ws://localhost:8000/api/v1/listen',
    {
      onOpen: () => console.log('opened'),
      onMessage: (event) => {
        const transcript = event.data;
        setInputValue(transcript);
      },
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async () => {
    if (inputValue.trim() === '') return;
    // setInputValue('');
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputValue }),
      });

      const blob = await response.blob();

      // Create a Blob URL for the streamed audio
      const audioUrl = URL.createObjectURL(blob);

      // Create an audio element using the Web Audio API
      const audioContext = new window.AudioContext();
      const source = audioContext.createBufferSource();

      // Fetch the audio file and decode it
      const audioBuffer = await fetch(audioUrl)
        .then((response) => response.arrayBuffer())
        .then((buffer) => audioContext.decodeAudioData(buffer))
        .catch((error) => {
          console.error('Error decoding audio data:', error);
          throw error;
        });

      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error('Error fetching and streaming response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setRecording(true);
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: BlobPart[] | undefined = [];

    mediaRecorder.addEventListener('dataavailable', async (event) => {
      if (event.data.size > 0 && readyState === 1) {
        audioChunks.push(event.data);
        // Send audio data to the backend via WebSocket
        const blob = new Blob(audioChunks, { type: 'audio/mpeg' });
        // const file = new File([blob], 'speech.mp3', {
        //   type: 'audio/mpeg',
        // });
        sendMessage(blob);
      }
    });

    mediaRecorder.onstop = (event) => {
      setRecording(false);
      // Send a message to indicate the end of audio streaming
      // sendMessage('END_OF_AUDIO_STREAM');
      console.log('Recorder stopped!');
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(2000);
  };

  const handleStopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <>
      <Flex
        vertical
        style={{ margin: 'auto', width: '85%', minHeight: '500px' }}
        gap="small"
        align="center"
      >
        <Row
          gutter={16}
          justify="center"
          style={{
            marginTop: '100px',
            width: '100%',
            textAlign: 'left',
            lineHeight: '1.65rem',
          }}
        >
          <Col span={12}>
            <Card bordered={true} hoverable={true}>
              <Col>
                <div
                  style={{
                    width: '100%',
                    margin: 'auto',
                    boxShadow: '0 0px 14px rgba(0, 0, 0, 0.1)',
                    borderRadius: '5px',
                  }}
                >
                  <TextArea
                    className="no-outline"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Type your text here..."
                    autoSize={{ minRows: 1, maxRows: 6 }}
                    style={{
                      fontSize: '16px',
                      minHeight: '60px',
                      maxHeight: '120px',
                      boxShadow: '0 0px 14px rgba(0, 0, 0, 0)',
                      boxSizing: 'border-box',
                      paddingLeft: '10px',
                      marginTop: '20px',
                      marginBottom: '20px',
                      paddingRight: '80px',
                      position: 'relative',
                      border: 'none',
                      outline: 'none !important',
                      resize: 'none',
                    }}
                  />
                </div>
              </Col>
              <Col>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  loading={loading}
                  style={{
                    margin: 20,
                    // width: '20%',
                  }}
                >
                  Convert to Audio
                </Button>
                <Button
                  type="primary"
                  size="large"
                  disabled={recording}
                  onClick={handleStartRecording}
                  icon={<AudioOutlined />}
                  style={{
                    margin: 20,
                    // width: '20%',
                  }}
                >
                  Start
                </Button>
                <Button
                  type="primary"
                  danger
                  size="large"
                  disabled={!recording}
                  onClick={handleStopRecording}
                  icon={<AudioMutedOutlined />}
                  style={{
                    margin: 20,
                    width: '20%',
                  }}
                >
                  Stop
                </Button>
              </Col>
            </Card>
          </Col>
        </Row>
      </Flex>
    </>
  );
}
