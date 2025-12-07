// Dataset types
export interface Dataset {
  uuid: string;
  uri: string;
  base_uri: string;
  name: string;
  creator_username: string;
  created_at: number;
  frozen_at: number;
  tags?: string[];
}

export interface ManifestItem {
  relpath: string;
  size_in_bytes: number;
  hash: string;
  utc_timestamp?: number;
}

export interface Manifest {
  dtoolcore_version: string;
  hash_function: string;
  items: Record<string, ManifestItem>;
}

export interface Readme {
  readme: string;
}

export interface Tags {
  tags: string[];
}

export interface Annotations {
  [key: string]: Record<string, unknown>;
}

// Summary info types
export interface SummaryInfo {
  number_of_datasets: number;
  creator_usernames: string[];
  base_uris: string[];
  tags: string[];
  datasets_per_creator: Record<string, number>;
  datasets_per_base_uri: Record<string, number>;
  datasets_per_tag: Record<string, number>;
}

// Server config types
export interface ServerVersions {
  dservercore?: string;
  dserver_search_plugin_mongo?: string;
  dserver_retrieve_plugin_mongo?: string;
  dserver_direct_mongo_plugin?: string;
  dserver_signed_url_plugin?: string;
  dserver_dependency_graph_plugin?: string;
  dserver_notification_plugin?: string;
  [key: string]: string | undefined;
}

export interface ConfigInfo {
  versions: ServerVersions;
}

// Pagination types
export interface PaginationInfo {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Search query types
export interface SearchQuery {
  free_text?: string;
  query?: unknown;
  creator_usernames?: string[];
  base_uris?: string[];
  tags?: string[];
}

// Resource link type for sign-in page
export interface ResourceLink {
  text: string;
  url: string;
}

// Axios response headers type
export interface ResponseHeaders {
  'x-pagination'?: string;
  [key: string]: string | undefined;
}
