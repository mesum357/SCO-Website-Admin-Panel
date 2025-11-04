import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Plus,
  Video,
  Play,
  Calendar,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';

interface VideoStory {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  link?: string;
  isActive: boolean;
  views: number;
  likes: number;
  createdAt: string;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
}

// Helper function to check if URL is an embedded video platform
const isEmbeddedVideo = (url: string): boolean => {
  const embeddedPlatforms = [
    'facebook.com',
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'instagram.com',
    'tiktok.com',
    'twitter.com',
    'x.com'
  ];
  return embeddedPlatforms.some(platform => url.includes(platform));
};

// Helper function to get embedded video URL
const getEmbeddedVideoUrl = (url: string): string => {
  if (url.includes('facebook.com/reel/')) {
    // Convert Facebook Reel URL to embed format
    const reelId = url.split('/reel/')[1].split('?')[0];
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=500`;
  }
  if (url.includes('youtube.com/watch')) {
    const videoId = url.split('v=')[1].split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1].split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
};

export default function VideoStories() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoStory | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    duration: '',
    link: ''
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    duration: '',
    link: '',
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const queryClient = useQueryClient();

  // Fetch video stories
  const { data: videosData, isLoading } = useQuery({
    queryKey: ['admin-video-stories'],
    queryFn: () => api.get('/api/video-success-stories/admin').then(res => res.data)
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/api/video-success-stories/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-video-stories'] });
      toast.success('Video success story uploaded successfully');
      setIsUploadDialogOpen(false);
      resetUploadForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload video');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/api/video-success-stories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-video-stories'] });
      toast.success('Video success story updated successfully');
      setIsEditDialogOpen(false);
      setEditingVideo(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update video');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/video-success-stories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-video-stories'] });
      toast.success('Video success story deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete video');
    }
  });

  const resetUploadForm = () => {
    setUploadForm({ title: '', description: '', duration: '' });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const resetEditForm = () => {
    setEditForm({ title: '', description: '', duration: '', isActive: true });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = () => {
    if (!selectedFile && !uploadForm.link) {
      toast.error('Please either upload a video file or provide a video link');
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      formData.append('video', selectedFile);
    }
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    if (uploadForm.duration) {
      formData.append('duration', uploadForm.duration);
    }
    if (uploadForm.link) {
      formData.append('link', uploadForm.link);
    }

    uploadMutation.mutate(formData);
  };

  const handleEdit = (video: VideoStory) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      description: video.description,
      duration: video.duration?.toString() || '',
      link: video.link || '',
      isActive: video.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingVideo) {
      toast.error('No video selected for editing');
      return;
    }

    updateMutation.mutate({
      id: editingVideo._id,
      data: editForm
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const toggleActive = (video: VideoStory) => {
    updateMutation.mutate({
      id: video._id,
      data: { isActive: !video.isActive }
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const videos = videosData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Video Success Stories Management</h1>
          <p className="text-muted-foreground">
            Manage video success stories for the frontend homepage and success stories page
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Video Success Story</DialogTitle>
              <DialogDescription>
                Add a new video success story. Either upload a video file or provide a video link.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="video">Video File (or use link below)</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
                {previewUrl && (
                  <div className="mt-2">
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Enter video description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={uploadForm.duration}
                  onChange={(e) => setUploadForm({ ...uploadForm, duration: e.target.value })}
                  placeholder="Enter video duration in seconds"
                />
              </div>
              <div>
                <Label htmlFor="link">Video Link (alternative to file upload)</Label>
                <Input
                  id="link"
                  type="url"
                  value={uploadForm.link}
                  onChange={(e) => setUploadForm({ ...uploadForm, link: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))
        ) : videos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No video success stories</h3>
            <p className="text-muted-foreground">Upload your first video success story to get started.</p>
          </div>
        ) : (
          videos.map((video) => (
            <Card key={video._id} className="overflow-hidden">
              <div className="relative">
                {video.videoUrl.startsWith('http') && isEmbeddedVideo(video.videoUrl) ? (
                  // Embedded video (Facebook, YouTube, etc.)
                  <iframe
                    src={getEmbeddedVideoUrl(video.videoUrl)}
                    className="w-full h-48 object-cover"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  // Direct video file
                  <video
                    src={video.videoUrl.startsWith('http') ? video.videoUrl : `${import.meta.env.VITE_API_URL}${video.videoUrl}`}
                    className="w-full h-48 object-cover"
                    poster={video.thumbnailUrl ? (video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `${import.meta.env.VITE_API_URL}${video.thumbnailUrl}`) : undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(video)}
                    className="h-8 w-8 p-0"
                  >
                    {video.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(video.duration)}
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {video.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{video.views} views</span>
                    <span>{video.likes} likes</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(video)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Video Success Story</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{video.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(video._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Video Success Story</DialogTitle>
            <DialogDescription>
              Update the information for this video success story.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Enter video title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Enter video description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-duration">Duration (seconds)</Label>
              <Input
                id="edit-duration"
                type="number"
                value={editForm.duration}
                onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                placeholder="Enter video duration in seconds"
              />
            </div>
            <div>
              <Label htmlFor="edit-link">Link (Optional)</Label>
              <Input
                id="edit-link"
                type="url"
                value={editForm.link}
                onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-active">Active (visible on frontend)</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

