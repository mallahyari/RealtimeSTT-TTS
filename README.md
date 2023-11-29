# VoxSwift: A RealtimeSTT-TTS Application

An easy to use, real time speech-to-text (STT) and text-to-speech (TTS) application.

## Description

This application has two main features:

- You can transcribe voice to text using the microphone. The transcription is _almost_ instantly and real time. I have used Whisper model via OpenAI API KEY. If you need to use a local Whisper model to transcribe, please check my other repo which shows how to that locally as well as using API [here](https://github.com/mallahyari/transonic).
- You are also able to convert text to speech, by entering your text into the text bar and click `Convert to Audio` button.

Please check the demo videos below to see that in action.

**STT Demo**

https://github.com/mallahyari/RealtimeSTT-TTS/assets/28068313/1a85b220-116c-47f8-bed3-96fdeccebcfc

**TTS Demo**

https://github.com/mallahyari/RealtimeSTT-TTS/assets/28068313/03b36cc8-86a4-463f-9e67-43c929be3bad



## Use cases

You can use STT for **real time** chat applications, or any application that you would like to use your voice to command. TTS also can be used for interesting use cases like **creating audible stories or books** from text.

## Quick Start

1. Clone the repo:

```bash
git clone https://github.com/mallahyari/RealtimeSTT-TTS.git
```

2. To run the frontend, go to the `frontend` directory and run:

```bash
npm install
npm start
```

3. **Speech-to-text (Optional):** I have used [StyleTTS 2](https://github.com/yl4579/StyleTTS2) for STT. If you'd like to utilize this feature, the only step that you require to do is to download [LJSpeech model](https://huggingface.co/yl4579/StyleTTS2-LJSpeech/tree/main), and copy the `Models` folder to `backend/app/styleTTS2`. For more information about styleTTS2 please check [here](https://github.com/yl4579/StyleTTS2).

4. To run the backend, from `backend/app` folder run:

```bash
pip install -r requirements.txt
python main.py
```

In order to use OpenAI Whisper API, you will need to enter your `OPENAI_API_KEY`. To do that, simply create a `.env` file in the `backend/app` directory with the following info:

```bash
OPENAI_API_KEY=
```

## Discussion and Contribution

If you have any comment or feedback, please don't hesitate to reach out directly or use the Discussions section and open a new topic. You can also reach out directly via [Linkedin](https://www.linkedin.com/in/mehdiallahyari/) or [Twitter](https://twitter.com/MehdiAllahyari).
