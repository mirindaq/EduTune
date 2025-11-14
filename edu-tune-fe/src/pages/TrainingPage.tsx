import { useState } from 'react';
import { Search, Download, Heart, TrendingUp, Calendar } from 'lucide-react';
import { huggingFaceService } from '@/services/huggingface.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/components/Pagination';
import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { toast } from 'sonner';

export default function TrainingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'likes' | 'downloads' | 'createdAt'>('trending');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSearch, setActiveSearch] = useState('');
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);
  const pageSize = 12;

  // Sử dụng useQuery để fetch models
  const { data, isLoading } = useQuery(
    () => huggingFaceService.getModels(currentPage, pageSize, sortBy, activeSearch || undefined),
    {
      queryKey: ['models', String(currentPage), String(pageSize), sortBy, activeSearch],
      staleTime: 5 * 60 * 1000, // 5 phút
      gcTime: 10 * 60 * 1000, // 10 phút
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      onError: () => {
        toast.error('Không thể tải danh sách models');
      },
    }
  );

  // Sử dụng useMutation cho download
  const downloadMutation = useMutation(
    (modelId: string) => {
      setDownloadingModelId(modelId);
      return huggingFaceService.downloadModel(modelId);
    },
    {
      onSuccess: () => {
        if (downloadingModelId) {
          toast.success(`Đang tải model: ${downloadingModelId}`);
        }
        setDownloadingModelId(null);
      },
      onError: () => {
        toast.error('Không thể tải model');
        setDownloadingModelId(null);
      },
    }
  );

  const handleSearch = () => {
    setActiveSearch(searchQuery);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownload = (modelId: string) => {
    downloadMutation.mutate(modelId);
  };

  const models = data?.models || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  const loading = isLoading;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Hugging Face Models</h1>
        <p className="text-muted-foreground">
          Chọn và tải các model pretrain từ Hugging Face
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Tìm kiếm model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Select 
          value={sortBy} 
          onValueChange={(value: 'trending' | 'likes' | 'downloads' | 'createdAt') => {
            setSortBy(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4" />
                Trending
              </div>
            </SelectItem>
            <SelectItem value="likes">
              <div className="flex items-center gap-2">
                <Heart className="size-4" />
                Likes
              </div>
            </SelectItem>
            <SelectItem value="downloads">Downloads</SelectItem>
            <SelectItem value="createdAt">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                Mới nhất
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} className="w-full sm:w-auto">
          <Search className="size-4 mr-2" />
          Tìm kiếm
        </Button>
      </div>

      {/* Models Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Không tìm thấy model nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Card key={model.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2 text-lg">{model.modelId}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {model.pipeline_tag && (
                    <Badge variant="outline" className="mr-2">
                      {model.pipeline_tag}
                    </Badge>
                  )}
                  {model.library_name && (
                    <Badge variant="secondary">{model.library_name}</Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  {/* Tags */}
                  {model.tags && model.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {model.tags.slice(0, 5).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag.replace('license:', '').replace('region:', '')}
                        </Badge>
                      ))}
                      {model.tags.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{model.tags.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Heart className="size-4 text-red-500" />
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(model.likes)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="size-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(model.downloads)}
                      </span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    {formatDate(model.createdAt)}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleDownload(model.modelId)}
                  disabled={downloadMutation.isLoading && downloadingModelId === model.modelId}
                >
                  {downloadMutation.isLoading && downloadingModelId === model.modelId ? (
                    <>
                      <div className="size-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Download className="size-4 mr-2" />
                      Tải về
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && models.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, total)} trong tổng số {total} models
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
