import { apiBase } from "./adminApi";

/**
 * Ensures an image URL is absolute and properly formatted.
 * Handles both local development and production URLs.
 * 
 * @param url - Image URL (can be relative, absolute, or a Vite import)
 * @returns Absolute URL ready for use in img src
 */
export function resolveImageUrl(url: string | undefined): string {
  if (!url) return "";
  
  // Already an absolute URL (http:// or https://)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // Vite asset import (starts with /)
  if (url.startsWith("/")) {
    // In production, these are served by the frontend
    // In development, Vite handles them
    return url;
  }
  
  // Relative path that needs the API base URL
  // (shouldn't normally happen, but handle it just in case)
  return `${apiBase()}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Resolves multiple image URLs (for galleries, etc.)
 */
export function resolveImageUrls(urls: (string | undefined)[]): string[] {
  return urls.map(resolveImageUrl).filter((url): url is string => !!url);
}
