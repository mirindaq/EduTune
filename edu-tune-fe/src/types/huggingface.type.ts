export interface HuggingFaceModel {
  id: string;
  likes: number;
  trendingScore?: number;
  private: boolean;
  downloads: number;
  tags: string[];
  pipeline_tag?: string;
  library_name?: string;
  createdAt: string;
  modelId: string;
}

export interface HuggingFaceModelListResponse {
  data: HuggingFaceModel[];
  total?: number;
}

export interface ModelDownloadProgress {
  modelId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

