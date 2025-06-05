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
  // Following the Hugging Face Transformers.js example configuration
  // https://github.com/huggingface/transformers.js-examples/tree/main/next-client
  serverExternalPackages: ["@huggingface/transformers"],

  // Additional webpack configuration needed for kokoro-js ONNX dependencies
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
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
        // Ignore kokoro-js completely for client-side
        new webpack.IgnorePlugin({
          resourceRegExp: /^kokoro-js$/,
        }),
        // Ignore onnxruntime-node completely
        new webpack.IgnorePlugin({
          resourceRegExp: /^onnxruntime-node$/,
        }),
        // Ignore sharp completely
        new webpack.IgnorePlugin({
          resourceRegExp: /^sharp$/,
        }),
        // Ignore .node binary files
        new webpack.IgnorePlugin({
          resourceRegExp: /\.node$/,
        }),
        // Ignore transformers node files
        new webpack.IgnorePlugin({
          resourceRegExp: /transformers\.node\.(mjs|cjs)$/,
        })
      );
    }
    return config;
  },
}

export default nextConfig
