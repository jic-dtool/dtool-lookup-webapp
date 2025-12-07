/**
 * DServer API Service
 *
 * This module provides a singleton instance of DServerClient configured
 * for use throughout the webapp. It wraps the dserver-client-js library.
 */

import { DServerClient } from "dserver-client";
import type {
  DatasetEntry,
  SearchQuery,
  PaginationParams,
  PaginatedResponse,
  ServerVersions,
  TagsResponse,
  AnnotationsResponse,
  ReadmeResponse,
  ManifestResponse,
  SummaryInfo,
  DServerError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ItemSignedURLResponse,
} from "dserver-client";

// Re-export types for convenience
export type {
  DatasetEntry,
  SearchQuery,
  PaginationParams,
  PaginatedResponse,
  ServerVersions,
  TagsResponse,
  AnnotationsResponse,
  ReadmeResponse,
  ManifestResponse,
  SummaryInfo,
  DServerError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ItemSignedURLResponse,
};

// Re-export error classes
export {
  DServerError as DServerErrorClass,
  AuthenticationError as AuthenticationErrorClass,
  AuthorizationError as AuthorizationErrorClass,
  NotFoundError as NotFoundErrorClass,
} from "dserver-client";

/**
 * DServer API wrapper class
 * Provides methods matching the webapp's current usage patterns
 */
class DServerApi {
  private client: DServerClient | null = null;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.VUE_APP_DTOOL_LOOKUP_SERVER_URL || "";
  }

  /**
   * Initialize or update the client with a token
   */
  setToken(token: string): void {
    if (!this.client) {
      this.client = new DServerClient({
        baseUrl: this.baseUrl,
        token,
      });
    } else {
      this.client.setToken(token);
    }
  }

  /**
   * Get the current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Ensure client is initialized
   */
  private ensureClient(): DServerClient {
    if (!this.client) {
      throw new Error("DServer client not initialized. Call setToken() first.");
    }
    return this.client;
  }

  // =========================================================================
  // Config & Health
  // =========================================================================

  async getServerVersions(): Promise<ServerVersions> {
    return this.ensureClient().getServerVersions();
  }

  async checkHealth(): Promise<{ status: string }> {
    return this.ensureClient().checkHealth();
  }

  // =========================================================================
  // Search & Summary
  // =========================================================================

  async searchDatasets(
    query: SearchQuery,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<DatasetEntry>> {
    return this.ensureClient().searchDatasets(query, pagination);
  }

  async getUserSummary(username: string): Promise<SummaryInfo> {
    return this.ensureClient().getUserSummary(username);
  }

  // =========================================================================
  // Dataset Details
  // =========================================================================

  async getManifest(uri: string): Promise<ManifestResponse> {
    return this.ensureClient().getManifest(uri);
  }

  async getReadme(uri: string): Promise<ReadmeResponse> {
    return this.ensureClient().getReadme(uri);
  }

  // =========================================================================
  // Tags
  // =========================================================================

  async getTags(uri: string): Promise<TagsResponse> {
    return this.ensureClient().getTags(uri);
  }

  async setTags(uri: string, tags: string[]): Promise<TagsResponse> {
    return this.ensureClient().setTags(uri, tags);
  }

  async addTag(uri: string, tag: string): Promise<TagsResponse> {
    return this.ensureClient().addTag(uri, tag);
  }

  async removeTag(uri: string, tag: string): Promise<TagsResponse> {
    return this.ensureClient().removeTag(uri, tag);
  }

  // =========================================================================
  // Annotations
  // =========================================================================

  async getAnnotations(uri: string): Promise<AnnotationsResponse> {
    return this.ensureClient().getAnnotations(uri);
  }

  async setAnnotations(
    uri: string,
    annotations: Record<string, unknown>
  ): Promise<AnnotationsResponse> {
    return this.ensureClient().setAnnotations(uri, annotations);
  }

  async setAnnotation(
    uri: string,
    name: string,
    value: unknown
  ): Promise<AnnotationsResponse> {
    return this.ensureClient().setAnnotation(uri, name, value);
  }

  async deleteAnnotation(uri: string, name: string): Promise<AnnotationsResponse> {
    return this.ensureClient().deleteAnnotation(uri, name);
  }

  // =========================================================================
  // README
  // =========================================================================

  async setReadme(uri: string, content: string): Promise<ReadmeResponse> {
    return this.ensureClient().setReadme(uri, content);
  }

  // =========================================================================
  // Signed URLs
  // =========================================================================

  async getItemSignedUrl(uri: string, identifier: string): Promise<ItemSignedURLResponse> {
    return this.ensureClient().getItemSignedUrl(uri, identifier);
  }
}

// Export singleton instance
export const dserverApi = new DServerApi();

// Export the class for testing purposes
export { DServerApi };
