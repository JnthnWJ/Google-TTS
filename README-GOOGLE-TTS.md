# Google Cloud Text-to-Speech Integration

This document provides instructions for setting up and using the Google Cloud Text-to-Speech integration in the application.

## Prerequisites

Before you can use the Google Cloud Text-to-Speech API, you need:

1. A Google Cloud account with billing enabled
2. A Google Cloud project with the Text-to-Speech API enabled
3. A service account with access to the Text-to-Speech API

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" and provide a name (e.g., "tts-application")
3. Click "Create"

### 2. Enable the Text-to-Speech API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Text-to-Speech API"
3. Click on the API and then click "Enable"

### 3. Create a Service Account

1. In the Google Cloud Console, navigate to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter a name for the service account (e.g., "tts-service-account")
4. Click "Create and Continue"
5. Assign the "Cloud Text-to-Speech User" role to the service account
6. Click "Done"

### 4. Generate a Service Account Key

1. In the service accounts list, find the service account you just created
2. Click the three dots menu and select "Manage keys"
3. Click "Add Key" > "Create new key"
4. Select "JSON" as the key type
5. Click "Create"
6. The key file will be downloaded to your computer

### 5. Configure the Application

1. Rename the downloaded key file to `google-credentials.json`
2. Place the file in the root directory of the application
3. Alternatively, set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of the key file

## Usage

The Google Cloud Text-to-Speech integration provides the following features:

- Convert text to speech using Google's high-quality voices
- Support for multiple languages and voices
- Adjustable speech parameters (speed, pitch)
- Audio playback controls
- Download generated audio files

### API Endpoints

The application provides the following API endpoints:

- `GET /api/tts`: Get available voices for a specific language
  - Query parameters:
    - `languageCode` (optional): Filter voices by language code (e.g., "en-US")

- `POST /api/tts`: Generate speech from text
  - Request body:
    - `text` (required): The text to convert to speech
    - `languageCode` (optional): The language code (default: "en-US")
    - `voiceName` (optional): The voice name (default: "en-US-Neural2-F")
    - `ssmlGender` (optional): The gender of the voice (default: "FEMALE")
    - `speakingRate` (optional): The speaking rate (default: 1.0)
    - `pitch` (optional): The pitch (default: 0.0)

## Costs and Quotas

The Google Cloud Text-to-Speech API is a paid service with the following pricing (as of 2024):

- Standard voices: $4.00 per 1 million characters
- WaveNet voices: $16.00 per 1 million characters
- Neural2 voices: $16.00 per 1 million characters

For the latest pricing information, visit the [Google Cloud Text-to-Speech pricing page](https://cloud.google.com/text-to-speech/pricing).

## Troubleshooting

If you encounter issues with the Google Cloud Text-to-Speech integration, check the following:

1. Ensure the service account key file is correctly placed and accessible
2. Verify that the Text-to-Speech API is enabled in your Google Cloud project
3. Check that the service account has the necessary permissions
4. Look for error messages in the browser console or server logs

For more information, refer to the [Google Cloud Text-to-Speech documentation](https://cloud.google.com/text-to-speech/docs).
