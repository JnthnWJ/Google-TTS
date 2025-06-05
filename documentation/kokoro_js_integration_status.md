# Kokoro.js Integration Status

## Current Status: ⚠️ Temporarily Disabled

**Last Updated:** January 2025  
**Application Status:** ✅ Fully Functional (Google TTS working)  
**Kokoro.js Status:** ❌ Disabled due to Next.js 15 compatibility issues

## Problem Summary

The Kokoro.js library cannot be imported in Next.js 15 due to webpack module resolution issues with ONNX runtime dependencies. This is a known issue affecting multiple users and is documented in the official Kokoro.js repository.

### Error Details

**Primary Error:**
```
Module parse failed: Unexpected character '�' (1:0)
./node_modules/onnxruntime-node/bin/napi-v3/darwin/arm64/onnxruntime_binding.node
```

**Root Cause:**
- Kokoro.js depends on `@huggingface/transformers` 
- Transformers.js tries to import `onnxruntime-node` for Node.js environments
- Webpack attempts to bundle binary `.node` files for the browser
- Next.js 15 has stricter module resolution that prevents proper fallbacks

## Current Workaround

### 1. Webpack Configuration (`next.config.mjs`)
```javascript
webpack: (config, { isServer, webpack }) => {
  if (!isServer) {
    // Ignore Node.js-specific modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^kokoro-js$/,
      })
    );
  }
  return config;
}
```

### 2. Component Error Handling (`components/text-to-speech-app.tsx`)
```javascript
try {
  const kokoroModule = await import('kokoro-js');
  KokoroTTS = kokoroModule.KokoroTTS;
} catch (importError) {
  throw new Error('Kokoro TTS is temporarily disabled due to Next.js compatibility issues.');
}
```

## Research Findings

### Official Issue Tracking
- **GitHub Issue:** [hexgrad/kokoro#100](https://github.com/hexgrad/kokoro/issues/100)
- **Reported:** February 16, 2025
- **Status:** Open, acknowledged by maintainer
- **Maintainer Response:** "We recently fixed this issue and will release a new version soon"

### Browser Compatibility
- **Chrome/Chromium:** Better WebAssembly support, may work better
- **Firefox:** Reported compatibility issues, may not be fully supported yet
- **Safari:** Unknown status

### Version Information
- **Kokoro.js:** v1.2.1 (latest)
- **Next.js:** v15.2.4
- **@huggingface/transformers:** v3.5.2
- **Node.js:** Compatible versions vary

## Potential Solutions

### Option 1: Wait for Official Fix ⭐ (Recommended)
**Status:** In progress  
**Timeline:** Unknown, but maintainer indicated "soon"  
**Pros:** 
- Official, tested solution
- No workarounds needed
- Full feature compatibility

**Cons:**
- Uncertain timeline
- Dependent on third-party development

### Option 2: Web Worker Implementation
**Status:** Feasible  
**Complexity:** Medium  
**Pros:**
- Bypasses main thread import restrictions
- Better performance for heavy TTS operations
- Several users report success

**Cons:**
- Requires significant refactoring
- More complex error handling
- Additional development time

### Option 3: Browser-Specific Testing
**Status:** Ready to test  
**Complexity:** Low  
**Pros:**
- Quick to validate
- May work without code changes
- Could identify browser-specific solutions

**Cons:**
- May not solve the core issue
- Limited browser support

### Option 4: Next.js Downgrade
**Status:** Possible  
**Complexity:** Medium  
**Pros:**
- Some users report success with Next.js 14
- Temporary workaround

**Cons:**
- Loses Next.js 15 features
- Not a long-term solution
- May introduce other compatibility issues

## Current Application State

### ✅ Working Features
- Google Cloud Text-to-Speech API integration
- Voice selection and language support
- Audio playback and download
- Responsive UI with dark/light mode
- Error handling and user feedback

### ❌ Disabled Features
- Kokoro.js local TTS generation
- Offline TTS capability
- Local voice model selection

### 🔧 Temporary Modifications
1. Webpack ignores `kokoro-js` imports
2. Component gracefully handles import failures
3. User sees informative error message when attempting to use Kokoro TTS

## Monitoring and Next Steps

### Immediate Actions
1. ✅ Monitor [Kokoro.js GitHub repository](https://github.com/hexgrad/kokoro) for updates
2. ✅ Test application in different browsers (Chrome, Safari)
3. ⏳ Consider implementing Web Worker solution if urgent need

### When Fix is Available
1. Remove webpack ignore configuration for `kokoro-js`
2. Remove error handling wrapper in component
3. Update to latest Kokoro.js version
4. Test full functionality
5. Update this documentation

## Technical Notes

### Dependencies Affected
```json
{
  "kokoro-js": "^1.2.1",
  "@huggingface/transformers": "^3.5.2",
  "onnxruntime-node": "1.21.0" // Problematic dependency
}
```

### Webpack Ignore Patterns
```javascript
// Current ignore patterns in next.config.mjs
/^kokoro-js$/
/^onnxruntime-node$/
/transformers\.node\.(mjs|cjs)$/
/\.node$/
```

## References

- [Kokoro.js GitHub Repository](https://github.com/hexgrad/kokoro)
- [Next.js 15 Compatibility Issue #100](https://github.com/hexgrad/kokoro/issues/100)
- [Hugging Face Transformers.js Documentation](https://huggingface.co/docs/transformers.js)
- [Next.js Webpack Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/webpack)

---

**Note:** This document will be updated as the situation evolves and new solutions become available.
