// next.config.js
module.exports = {
    /**
     * NextAuth uses NEXTAUTH_URL for OAuth redirect_uri.
     * Google rejects redirect URIs on private IPs (10.x, 192.168.x, etc.) with
     * "device_id and device_name are required for private IP" — use localhost,
     * a tunnel URL (ngrok, Cloudflare Tunnel), or a real HTTPS domain instead.
     *
     * Precedence: explicit NEXTAUTH_URL, else NEXT_PUBLIC_API_URL (trimmed), else unset.
     */
    env: {
        NEXTAUTH_URL: (() => {
            const fromNextAuth = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
            if (fromNextAuth) return fromNextAuth;
            const fromPublic = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
            return fromPublic || undefined;
        })(),
    },
    webpack: (config) => {
      config.module.rules.push({
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '/_next/static/videos',
              outputPath: 'static/videos',
              name: '[name].[hash].[ext]',
            },
          },
        ],
      });
  
      return config;
    },
  };
  