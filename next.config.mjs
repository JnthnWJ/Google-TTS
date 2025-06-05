/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Temporarily disable kokoro-js to get the app working
  serverExternalPackages: ['kokoro-js'],
  webpack: (config, { isServer, webpack }) => {
    // Configure for client-side only
    if (!isServer) {
      // Set up resolve aliases to prevent Node.js modules from being bundled
      config.resolve.alias = {
        ...config.resolve.alias,
        "sharp$": false,
        "onnxruntime-node$": false,
      };

      // Set up fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
      };

      // Use IgnorePlugin to ignore node-specific modules and files
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(lokijs|pino-pretty|encoding)$/,
        }),
        // Ignore onnxruntime-node completely
        new webpack.IgnorePlugin({
          resourceRegExp: /^onnxruntime-node$/,
        }),
        // Ignore transformers node files
        new webpack.IgnorePlugin({
          resourceRegExp: /transformers\.node\.(mjs|cjs)$/,
        }),
        // Ignore .node binary files
        new webpack.IgnorePlugin({
          resourceRegExp: /\.node$/,
        }),
        // Temporarily ignore kokoro-js until the Next.js compatibility issue is fixed
        new webpack.IgnorePlugin({
          resourceRegExp: /^kokoro-js$/,
        })
      );
    }

    return config;
  },
}

export default nextConfig
