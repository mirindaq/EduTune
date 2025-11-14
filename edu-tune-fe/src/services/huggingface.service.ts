import huggingFaceAxios from '@/configurations/axios.config';
import type { HuggingFaceModel } from '@/types/huggingface.type';

export const huggingFaceService = {
  /**
   * Lấy tất cả models từ Hugging Face API (không phân trang)
   */
  getAllModels: async (): Promise<HuggingFaceModel[]> => {
    try {
      const response = await huggingFaceAxios.get<HuggingFaceModel[]>(
        '/models'
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching all models:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách models với phân trang và filter
   * @param page - Trang hiện tại (bắt đầu từ 1)
   * @param pageSize - Số lượng models mỗi trang
   * @param sort - Sắp xếp theo: 'trending', 'likes', 'downloads', 'createdAt'
   * @param search - Tìm kiếm theo tên model
   */
  getModels: async (
    page: number = 1,
    pageSize: number = 12,
    sort: 'trending' | 'likes' | 'downloads' | 'createdAt' = 'trending',
    search?: string
  ): Promise<{ models: HuggingFaceModel[]; total: number; page: number; pageSize: number; totalPages: number }> => {
    try {
      // Lấy tất cả models
      const allModels = await huggingFaceService.getAllModels();
      
      if (!Array.isArray(allModels) || allModels.length === 0) {
        return {
          models: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
        };
      }
      
      let models: HuggingFaceModel[] = [...allModels];
      
      // Filter theo search nếu có
      if (search) {
        const searchLower = search.toLowerCase();
        models = models.filter((model: HuggingFaceModel) => 
          model.modelId.toLowerCase().includes(searchLower) ||
          model.id.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort models
      models.sort((a: HuggingFaceModel, b: HuggingFaceModel) => {
        switch (sort) {
          case 'trending':
            return (b.trendingScore || 0) - (a.trendingScore || 0);
          case 'likes':
            return b.likes - a.likes;
          case 'downloads':
            return b.downloads - a.downloads;
          case 'createdAt':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });
      
      const total = models.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedModels = models.slice(startIndex, endIndex);
      
      return {
        models: paginatedModels,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết của một model
   * @param modelId - ID của model
   */
  getModelById: async (modelId: string): Promise<HuggingFaceModel> => {
    try {
      const response = await huggingFaceAxios.get<HuggingFaceModel>(
        `/models/${modelId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching model details:', error);
      throw error;
    }
  },

  /**
   * Tải model về máy (simulate - thực tế cần backend để xử lý download)
   * @param modelId - ID của model cần tải
   */
  downloadModel: async (modelId: string): Promise<void> => {
    try {
      // Note: Thực tế việc tải model cần được xử lý qua backend
      // hoặc sử dụng huggingface_hub library
      // Đây chỉ là placeholder
      console.log(`Downloading model: ${modelId}`);
      
      // Có thể gọi API backend của bạn để xử lý download
      // await axiosClient.post('/models/download', { modelId });
      
      // Hoặc redirect đến Hugging Face để download
      window.open(`https://huggingface.co/${modelId}`, '_blank');
    } catch (error) {
      console.error('Error downloading model:', error);
      throw error;
    }
  },
};

