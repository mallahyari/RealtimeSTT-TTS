from fastapi import APIRouter, HTTPException, Response, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, StreamingResponse
from app.data_models.schemas import UserQuery
from app.config import settings
import structlog
import tempfile
import io
import os
import torch
import torchaudio
import numpy as np
from openai import OpenAI
from pydub import AudioSegment
from fastapi.responses import StreamingResponse
import base64

from app.styleTTS2.run_tts import inference, LFinference

logger = structlog.get_logger()

audio_router = r = APIRouter()

device = 'cuda' if torch.cuda.is_available() else 'cpu'

client = OpenAI(api_key=settings.openai_api_key)


@r.websocket("/listen")
async def get_audio_chunk(websocket: WebSocket):
    """This function receives stream of audio chunks from the
    client socket to be able to transcribe them. 

    Args:
        websocket (WebSocket): server side socket
    """

    try:
        await websocket.accept()
        while True:
            # Receive audio chunk from the frontend
            data = await websocket.receive_bytes()
            
            # Perform audio transcription using OpenAI API
            transcript = transcribe_audio_with_openai(data)

            # Send the transcript back to the frontend
            await websocket.send_text(transcript)
                
    except WebSocketDisconnect as e:
        # WebSocket was closed by the client
        print(f"WebSocket disconnected: {e}")
    except Exception as e:
        error_message = f'Could not process audio: {e}'
        await websocket.send_text(error_message)
    finally:
        await websocket.close()

def transcribe_audio_with_openai(audio_chunk: bytes, language="en") -> str:
    """
    Transcribe audio using OpenAI API.

    Parameters:
    - audio_chunk (bytes): The audio data in bytes.
    - language (str): The language of the audio. Default is "en" (English).

    Returns:
    - str: The transcribed text.
    """
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=True) as temp_file:
            temp_file.write(audio_chunk)
            temp_file_path = temp_file.name
            
            logger.info(temp_file_path)
            audio_file= open(temp_file_path, "rb")
            
            transcript = client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file)
            
            logger.info(f"transcript: {transcript.text}")

        return transcript.text

    except Exception as e:
        print(f"OpenAI API error: {e}")
        return "Transcription error"


@r.post("/tts")
async def generate_tts(user_query: UserQuery):
    diffusion_steps = 20
    logger.info(f"query: {user_query}")
    text = user_query.text
    sentences = text.split('.') # simple split by comma
    wavs = []
    s_prev = None
    for text in sentences:
        if text.strip() == "": continue
        text += '.' # add it back
        noise = torch.randn(1,1,256).to(device)
        wav, s_prev = LFinference(text, s_prev, noise, alpha=0.7, diffusion_steps=diffusion_steps, embedding_scale=1)
        wavs.append(wav)
        
    wav = np.concatenate(wavs)
    
    # Save the generated audio to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio_file:
        torch_wav = torch.from_numpy(wav).reshape(1,-1)
        torchaudio.save(temp_audio_file.name, torch_wav, 24000)

        # Stream the temporary file chunk by chunk
        def generate_audio_chunks():
            with open(temp_audio_file.name, "rb") as audio_file:
                while chunk := audio_file.read(1024 * 8):  # Read 8 KB chunks (adjust as needed)
                    yield chunk

        return StreamingResponse(generate_audio_chunks(), media_type="text/event-stream")

    
@r.post("/transcribe")
async def transcribe_audio(file: dict):
    """Transcribe the audio file using OpenAI Whisper models

    Args:
        file (dict): Audio file as a base64-encoded string.
    """
    try:
        # Create a directory to store audio files if not exists
        os.makedirs("audio_files", exist_ok=True)

        # Save the base64-encoded audio to a unique filename
        audio_path = f"audio_files/test.wav"

        # Decode base64 and save to WAV file
        base64_data = file.get("file", "")
        audio_data = base64.b64decode(base64_data)
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_data))
        audio_segment.export(audio_path, format="wav")

        # Transcribe the audio using OpenAI Whisper model
        with open(audio_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1", file=audio_file
            )

        return {"transcript": transcript.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
