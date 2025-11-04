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
  Trophy,
  Star,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { api } from '@/lib/api';

interface SuccessStory {
  _id: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  skills: string[];
  location: string;
  achievement: string;
  story: string;
  rating: number;
  projects: number;
  isActive: boolean;
  createdAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

export default function SuccessStories() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    title: '',
    description: '',
    tags: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    title: '',
    description: '',
    tags: '',
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const queryClient = useQueryClient();

  // Fetch success stories
  const { data: storiesData, isLoading } = useQuery({
    queryKey: ['admin-success-stories'],
    queryFn: () => api.get('/api/success-stories/admin').then(res => res.data)
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/api/success-stories/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-success-stories'] });
      toast.success('Success story created successfully');
      setIsCreateDialogOpen(false);
      resetCreateForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create success story');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/api/success-stories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-success-stories'] });
      toast.success('Success story updated successfully');
      setIsEditDialogOpen(false);
      setEditingStory(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update success story');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/success-stories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-success-stories'] });
      toast.success('Success story deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete success story');
    }
  });

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      title: '',
      description: '',
      tags: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const resetEditForm = () => {
    setEditForm({
      name: '',
      title: '',
      description: '',
      skills: '',
      location: '',
      achievement: '',
      story: '',
      rating: '',
      projects: '',
      isActive: true
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCreate = () => {
    if (!selectedFile || !createForm.name || !createForm.title || !createForm.description) {
      toast.error('Please fill in all required fields and select an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('name', createForm.name);
    formData.append('title', createForm.title);
    formData.append('description', createForm.description);
    if (createForm.tags) {
      formData.append('tags', createForm.tags);
    }

    createMutation.mutate(formData);
  };

  const handleEdit = (story: SuccessStory) => {
    setEditingStory(story);
    setEditForm({
      name: story.name,
      title: story.title,
      description: story.description,
      tags: story.skills.join(', '), // Using skills as tags for now
      isActive: story.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingStory || !editForm.name || !editForm.title || !editForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateMutation.mutate({
      id: editingStory._id,
      data: editForm
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const toggleActive = (story: SuccessStory) => {
    updateMutation.mutate({
      id: story._id,
      data: { isActive: !story.isActive }
    });
  };

  const stories = storiesData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Success Stories Management</h1>
          <p className="text-muted-foreground">
            Manage success stories for the frontend success stories page
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Success Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Success Story</DialogTitle>
              <DialogDescription>
                Create a new success story. Fill in all the required information below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image">Profile Image *</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                  {previewUrl && (
                    <div className="mt-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="Enter person's name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title" className="font-bold">Title *</Label>
                    <Input
                      id="title"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      placeholder="Enter professional title"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Enter brief description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                  placeholder="Enter tags separated by commas"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Stories Grid */}
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
        ) : stories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No success stories</h3>
            <p className="text-muted-foreground">Add your first success story to get started.</p>
          </div>
        ) : (
          stories.map((story) => (
            <Card key={story._id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={story.imageUrl.startsWith('http') ? story.imageUrl : `${import.meta.env.VITE_API_URL}${story.imageUrl}`}
                  alt={story.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(story)}
                    className="h-8 w-8 p-0"
                  >
                    {story.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold">{story.name}</h3>
                </div>
                <p className="text-sm font-medium text-primary mb-2">{story.title}</p>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {story.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {story.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {story.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{story.skills.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {story.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {story.rating}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(story.createdAt).toLocaleDateString()}
                  </div>
                  <span>{story.projects} projects</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(story)}
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
                        <AlertDialogTitle>Delete Success Story</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{story.name}"'s success story? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(story._id)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Success Story</DialogTitle>
            <DialogDescription>
              Update the information for this success story.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter person's name"
                />
              </div>
              <div>
                <Label htmlFor="edit-title" className="font-bold">Title *</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Enter professional title"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Enter brief description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                placeholder="Enter tags separated by commas"
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

