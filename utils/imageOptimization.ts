/**
 * Utility for optimizing image URLs for performance.
 * - Cloudflare images: Prepend /cdn-cgi/image/ settings.
 * - GitHub Avatars: Append ?size= param.
 * - Unsplash/Picsum/External: Returned as-is (best effort).
 */

export interface ImageOptions {
    width?: number;
    quality?: number;
}

export const optimizeImage = (src: string | undefined | null, options: ImageOptions = {}): string => {
    if (!src) return '';

    const width = options.width || 400;
    const quality = options.quality || 80;

    // GitHub Avatar Optimization (e.g. https://github.com/username.png or https://avatars.githubusercontent.com/u/...)
    if (src.includes('github.com/') || src.includes('avatars.githubusercontent.com/')) {
        try {
            const url = new URL(src);
            url.searchParams.set('size', width.toString());
            url.searchParams.set('v', '4'); // GitHub cache busting param, usually v=4
            return url.toString();
        } catch (e) {
            return src; // Invalid URL
        }
    }

    // Cloudflare CDN-CGI Native Optimization for local/relative paths
    if (src.startsWith('/')) {
        return `/cdn-cgi/image/width=${width},quality=${quality},format=auto${src}`;
    }

    // Fallback for external URLs or data URIs
    return src;
};
