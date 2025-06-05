# Kokoro TTS Integration

## Overview

The application now supports **Kokoro TTS** as a local, privacy-focused alternative to Google Cloud TTS. Kokoro is an 82-million parameter text-to-speech model that runs entirely in your browser using WebAssembly (WASM).

## Features

### ✅ **Dual Provider Support**
- **Google Cloud TTS**: High-quality, cloud-based synthesis (existing functionality)
- **Kokoro Local TTS**: Privacy-focused, runs entirely in your browser (new functionality)

### ✅ **Provider Toggle**
- Easy switching between Google TTS and Kokoro TTS
- Provider preference is saved across sessions
- Clear status indicators for each provider

### ✅ **Kokoro-Specific Features**
- **28 English Voices**: American and British English variants
- **Quality Ratings**: Voices are rated from A to F+ quality
- **Voice Traits**: Visual indicators (🚺🚹❤️🔥🎧) for voice characteristics
- **Local Processing**: No data sent to external servers
- **Real-time Generation**: Fast synthesis once model is loaded

### ✅ **Fallback Mechanism**
- Automatic fallback to Google TTS if Kokoro fails
- Graceful error handling with user-friendly messages

## How to Use

### 1. **Provider Selection**
- Use the toggle switch at the top of the interface
- **Left (Google Cloud)**: Traditional cloud-based TTS
- **Right (Kokoro Local)**: Local browser-based TTS

### 2. **First-Time Kokoro Usage**
- Initial model download (~27MB) happens automatically
- Loading message will appear: "Initializing Kokoro TTS"
- Subsequent uses are much faster

### 3. **Voice Selection**
- **Google TTS**: Full range of languages and voices
- **Kokoro TTS**: English (US/UK) voices only
- Kokoro voices show quality ratings and traits

### 4. **Language Support**
- **Google TTS**: Multiple languages (English, Spanish, French, German, Japanese, Korean, Chinese)
- **Kokoro TTS**: English (US) and English (UK) only

## Technical Details

### **Kokoro TTS Specifications**
- **Model Size**: 82 million parameters
- **Download Size**: ~27MB (one-time download)
- **Runtime**: WebAssembly (WASM) in browser
- **Audio Format**: WAV output
- **Performance**: Real-time generation after initialization

### **Voice Quality Ratings**
- **A/A-**: Highest quality voices (recommended)
- **B/B-**: Good quality voices
- **C/C+/C-**: Average quality voices
- **D/D+/D-**: Lower quality voices
- **F+**: Experimental/lower quality

### **Recommended Voices**
- **af_heart** (🚺❤️): Top-rated female voice
- **af_bella** (🚺🔥): High-quality expressive female voice
- **af_nicole** (🚺🎧): Good quality female voice
- **am_michael**: Best male voice option

## Privacy & Performance

### **Privacy Benefits of Kokoro**
- ✅ **100% Local Processing**: No data sent to external servers
- ✅ **Offline Capable**: Works without internet after initial download
- ✅ **No API Keys Required**: No cloud service dependencies
- ✅ **GDPR Compliant**: No personal data transmission

### **Performance Characteristics**
- **First Use**: 10-30 seconds for model download and initialization
- **Subsequent Uses**: Near-instant generation
- **Memory Usage**: ~100-200MB during operation
- **Browser Compatibility**: Modern browsers with WASM support

## Troubleshooting

### **Common Issues**

1. **"Failed to initialize Kokoro"**
   - Ensure you have a stable internet connection for initial download
   - Try refreshing the page
   - Check browser console for detailed error messages

2. **Slow Initial Loading**
   - Model download is ~27MB - this is normal on first use
   - Subsequent uses will be much faster
   - Consider using Google TTS for immediate needs

3. **Audio Quality Issues**
   - Try different Kokoro voices (af_heart and af_bella are highest quality)
   - Adjust pitch and playback speed settings
   - For highest quality, use Google TTS

4. **Browser Compatibility**
   - Requires modern browser with WebAssembly support
   - Chrome, Firefox, Safari, Edge (recent versions)
   - Mobile browsers may have limited support

### **Fallback Behavior**
- If Kokoro fails, the system automatically falls back to Google TTS
- Error messages will indicate the fallback action
- No user intervention required

## Implementation Status

### ✅ **Completed Features**
- [x] Kokoro TTS integration with dynamic import
- [x] Provider toggle UI component
- [x] Voice selection for Kokoro voices
- [x] Error handling and fallback mechanisms
- [x] Audio format compatibility (WAV support)
- [x] Provider preference persistence
- [x] Loading states and user feedback
- [x] Quality ratings and voice traits display

### 🔄 **Future Enhancements**
- [ ] WebGPU support for better performance
- [ ] Streaming audio generation
- [ ] Additional language support (when available)
- [ ] Voice preview functionality
- [ ] Advanced Kokoro model options

## Getting Started

1. **Open the application** in your browser
2. **Toggle to Kokoro** using the provider switch
3. **Enter some text** to convert to speech
4. **Select a voice** (try af_heart for best quality)
5. **Click "Generate Speech"** and wait for initialization
6. **Enjoy local, private TTS!**

The first generation will take longer due to model download, but subsequent generations will be much faster.
