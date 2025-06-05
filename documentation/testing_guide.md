# Testing Guide for Kokoro TTS Integration

## Manual Testing Checklist

### ✅ **Basic Functionality Tests**

1. **Application Loading**
   - [ ] Application loads without errors at http://localhost:3000
   - [ ] Provider toggle is visible and functional
   - [ ] Default provider is Google TTS
   - [ ] No console errors on initial load

2. **Google TTS (Existing Functionality)**
   - [ ] Can select Google TTS provider
   - [ ] Language dropdown shows all supported languages
   - [ ] Voice selection works for different languages
   - [ ] Text-to-speech generation works
   - [ ] Audio playback controls function properly
   - [ ] Download functionality works

3. **Kokoro TTS (New Functionality)**
   - [ ] Can toggle to Kokoro TTS provider
   - [ ] Language dropdown shows only English (US/UK)
   - [ ] Voice selection shows Kokoro voices with quality ratings
   - [ ] Voice traits (🚺🚹❤️🔥🎧) are displayed
   - [ ] First-time initialization shows loading message
   - [ ] Audio generation works after initialization
   - [ ] Subsequent generations are faster

### ✅ **Provider Toggle Tests**

1. **Toggle Functionality**
   - [ ] Toggle switches between Google and Kokoro
   - [ ] Provider preference persists after page refresh
   - [ ] Status indicators show correct provider state
   - [ ] Voice list updates when switching providers

2. **Status Indicators**
   - [ ] Google shows "Ready" status
   - [ ] Kokoro shows appropriate status (Ready/Initializing/Error)
   - [ ] Visual indicators (Cloud/CPU icons) are correct

### ✅ **Voice Selection Tests**

1. **Google TTS Voices**
   - [ ] All language options available
   - [ ] Voice list updates when language changes
   - [ ] Voice names and genders display correctly

2. **Kokoro TTS Voices**
   - [ ] Only English (US/UK) languages available
   - [ ] Voice quality ratings visible (A, B, C, D, F+)
   - [ ] Voice traits display correctly
   - [ ] Recommended voices (af_heart, af_bella) work well

### ✅ **Error Handling Tests**

1. **Fallback Mechanism**
   - [ ] If Kokoro fails, fallback to Google TTS works
   - [ ] Error messages are user-friendly
   - [ ] No application crashes on errors

2. **Network Issues**
   - [ ] Graceful handling of network failures
   - [ ] Appropriate error messages for connectivity issues

### ✅ **Performance Tests**

1. **Initial Load**
   - [ ] Application loads quickly
   - [ ] No unnecessary model downloads on Google TTS usage
   - [ ] Kokoro model downloads only when needed

2. **Kokoro Performance**
   - [ ] First initialization takes reasonable time (10-30 seconds)
   - [ ] Subsequent generations are fast (< 5 seconds)
   - [ ] Memory usage is reasonable

## Test Scenarios

### **Scenario 1: First-Time Kokoro User**
1. Open application
2. Toggle to Kokoro TTS
3. Enter text: "Hello, this is a test of Kokoro TTS."
4. Select voice: af_heart
5. Click "Generate Speech"
6. Verify initialization message appears
7. Wait for model download and initialization
8. Verify audio plays successfully
9. Test subsequent generation is faster

### **Scenario 2: Provider Switching**
1. Start with Google TTS
2. Generate speech with Google
3. Switch to Kokoro TTS
4. Generate same text with Kokoro
5. Compare audio quality and generation time
6. Switch back to Google
7. Verify functionality still works

### **Scenario 3: Voice Quality Comparison**
1. Use Kokoro TTS
2. Test different voice qualities:
   - af_heart (A quality) - should be best
   - af_bella (A- quality) - should be very good
   - am_michael (C+ quality) - should be decent
   - am_adam (F+ quality) - should be lower quality
3. Compare audio quality subjectively

### **Scenario 4: Error Recovery**
1. Use Kokoro TTS
2. Simulate network disconnection during model download
3. Verify error handling and fallback to Google TTS
4. Restore network and try Kokoro again

## Expected Results

### **Google TTS (Baseline)**
- High-quality audio output
- Fast generation (cloud-based)
- Multiple language support
- Consistent performance

### **Kokoro TTS (New)**
- Good quality audio (especially A-rated voices)
- Slower first-time initialization
- Fast subsequent generations
- Privacy-focused (local processing)
- English-only support

## Browser Compatibility

### **Supported Browsers**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### **Required Features**
- [ ] WebAssembly (WASM) support
- [ ] Modern JavaScript features
- [ ] Audio API support
- [ ] Blob URL support

## Performance Benchmarks

### **Expected Metrics**
- **Initial Kokoro Load**: 10-30 seconds (model download)
- **Kokoro Generation**: 2-10 seconds (after initialization)
- **Google Generation**: 1-3 seconds (cloud-based)
- **Memory Usage**: 100-200MB during Kokoro operation

## Troubleshooting Common Issues

### **"Failed to initialize Kokoro"**
- Check internet connection
- Verify browser supports WebAssembly
- Try refreshing the page
- Check browser console for detailed errors

### **"Audio not playing"**
- Verify browser audio permissions
- Check volume settings
- Try different voice selection
- Test with Google TTS as comparison

### **"Slow performance"**
- First-time Kokoro use is expected to be slow
- Subsequent uses should be faster
- Consider using Google TTS for immediate needs
- Check available system memory

## Success Criteria

The implementation is successful if:
1. ✅ All existing Google TTS functionality works unchanged
2. ✅ Kokoro TTS provides working local alternative
3. ✅ Provider switching is seamless and intuitive
4. ✅ Error handling prevents application crashes
5. ✅ Performance is acceptable for intended use cases
6. ✅ User experience is smooth and informative
