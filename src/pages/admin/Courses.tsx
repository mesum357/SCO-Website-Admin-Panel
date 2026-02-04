import { useMemo, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Upload, X, Snowflake } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface Course {
  _id: string;
  courseName: string;
  companyName: string;
  duration: string;
  pricePerMonth: number;
  description?: string;
  whatsappNumber?: string;
  courseImage?: string;
  isActive: boolean;
  createdAt: string;
}

type CourseForm = {
  courseName: string;
  companyName: string;
  duration: string;
  pricePerMonth: string; // keep as string for input
  description: string;
  whatsappNumber: string;
};

const emptyForm: CourseForm = {
  courseName: "",
  companyName: "",
  duration: "",
  pricePerMonth: "",
  description: "",
  whatsappNumber: "",
};

export default function Courses() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [addForm, setAddForm] = useState<CourseForm>(emptyForm);
  const [editForm, setEditForm] = useState<CourseForm>(emptyForm);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => api.get("/api/courses/admin").then((r) => r.data),
  });

  const courses: Course[] = useMemo(() => data?.data || [], [data]);

  const createMutation = useMutation({
    mutationFn: async (payload: CourseForm & { imageFile: File | null }) => {
      const formData = new FormData();
      formData.append("courseName", payload.courseName.trim());
      formData.append("companyName", payload.companyName.trim());
      formData.append("duration", payload.duration.trim());
      formData.append("pricePerMonth", payload.pricePerMonth);
      formData.append("description", payload.description.trim());
      formData.append("whatsappNumber", payload.whatsappNumber.trim());
      if (payload.imageFile) {
        formData.append("courseImage", payload.imageFile);
      }
      const res = await api.post("/api/courses/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course created");
      setIsAddOpen(false);
      setAddForm(emptyForm);
      setAddImageFile(null);
      setAddImagePreview(null);
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || "Failed to create course");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload, imageFile }: { id: string; payload: Partial<CourseForm> & { isActive?: boolean }; imageFile?: File | null }) => {
      const formData = new FormData();
      if (payload.courseName !== undefined) formData.append("courseName", String(payload.courseName).trim());
      if (payload.companyName !== undefined) formData.append("companyName", String(payload.companyName).trim());
      if (payload.duration !== undefined) formData.append("duration", String(payload.duration).trim());
      if (payload.pricePerMonth !== undefined) formData.append("pricePerMonth", payload.pricePerMonth);
      if (payload.description !== undefined) formData.append("description", String(payload.description).trim());
      if (payload.whatsappNumber !== undefined) formData.append("whatsappNumber", String(payload.whatsappNumber).trim());
      if (payload.isActive !== undefined) formData.append("isActive", String(payload.isActive));
      if (imageFile) formData.append("courseImage", imageFile);
      const res = await api.put(`/api/courses/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course updated");
      setIsEditOpen(false);
      setEditingCourse(null);
      setEditImageFile(null);
      setEditImagePreview(null);
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || "Failed to update course");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/courses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course deleted");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || "Failed to delete course");
    },
  });

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setEditForm({
      courseName: course.courseName,
      companyName: course.companyName,
      duration: course.duration,
      pricePerMonth: String(course.pricePerMonth ?? ""),
      description: course.description || "",
      whatsappNumber: course.whatsappNumber || "",
    });
    setEditImagePreview(course.courseImage || null);
    setEditImageFile(null);
    setIsEditOpen(true);
  };

  const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAddImageFile(file);
      setAddImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const clearAddImage = () => {
    setAddImageFile(null);
    setAddImagePreview(null);
    if (addImageInputRef.current) addImageInputRef.current.value = "";
  };

  const clearEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    if (editImageInputRef.current) editImageInputRef.current.value = "";
  };

  const canSubmit = (f: CourseForm) =>
    f.courseName.trim() && f.companyName.trim() && f.duration.trim() && f.pricePerMonth !== "" && !Number.isNaN(Number(f.pricePerMonth));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Add and manage courses shown on the frontend courses page.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Course</DialogTitle>
              <DialogDescription>Fill in the details below to create a new course.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="courseName">Course name</Label>
                <Input
                  id="courseName"
                  value={addForm.courseName}
                  onChange={(e) => setAddForm({ ...addForm, courseName: e.target.value })}
                  placeholder="e.g. Full Stack Web Development"
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  value={addForm.companyName}
                  onChange={(e) => setAddForm({ ...addForm, companyName: e.target.value })}
                  placeholder="e.g. SCO / GB IT Vision"
                />
              </div>
              <div>
                <Label htmlFor="duration">Course duration</Label>
                <Input
                  id="duration"
                  value={addForm.duration}
                  onChange={(e) => setAddForm({ ...addForm, duration: e.target.value })}
                  placeholder="e.g. 3 months"
                />
              </div>
              <div>
                <Label htmlFor="pricePerMonth">Course price / month</Label>
                <Input
                  id="pricePerMonth"
                  inputMode="decimal"
                  value={addForm.pricePerMonth}
                  onChange={(e) => setAddForm({ ...addForm, pricePerMonth: e.target.value })}
                  placeholder="e.g. 5000"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Brief description of the course..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={addForm.whatsappNumber}
                  onChange={(e) => setAddForm({ ...addForm, whatsappNumber: e.target.value })}
                  placeholder="e.g. 923001234567 (with country code, no + or spaces)"
                />
              </div>
              <div>
                <Label>Course Image</Label>
                <div className="mt-2 space-y-2">
                  {addImagePreview && (
                    <div className="relative inline-block">
                      <img src={addImagePreview} alt="Preview" className="h-32 w-auto rounded-md object-cover" />
                      <button
                        type="button"
                        onClick={clearAddImage}
                        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => addImageInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      {addImagePreview ? "Change Image" : "Upload Image"}
                    </Button>
                    <input
                      ref={addImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAddImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => createMutation.mutate({ ...addForm, imageFile: addImageFile })} disabled={!canSubmit(addForm) || createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price / month</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Loading courses...
                  </TableCell>
                </TableRow>
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No courses yet. Add your first course.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((c) => (
                  <TableRow key={c._id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{c.courseName}</TableCell>
                    <TableCell>{c.companyName}</TableCell>
                    <TableCell>{c.duration}</TableCell>
                    <TableCell>{Number(c.pricePerMonth).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!!c.isActive}
                          onCheckedChange={(checked) => updateMutation.mutate({ id: c._id, payload: { isActive: checked } })}
                        />
                        <span className="text-sm text-muted-foreground">{c.isActive ? "Visible" : "Hidden"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant={c.isActive ? "outline" : "secondary"}
                          size="sm"
                          onClick={() => updateMutation.mutate({ id: c._id, payload: { isActive: !c.isActive } })}
                          title={c.isActive ? "Freeze course" : "Unfreeze course"}
                        >
                          <Snowflake className={`h-4 w-4 ${!c.isActive ? "text-blue-500" : ""}`} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete course</AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete <strong>{c.courseName}</strong>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(c._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update the fields below and save.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-courseName">Course name</Label>
              <Input
                id="edit-courseName"
                value={editForm.courseName}
                onChange={(e) => setEditForm({ ...editForm, courseName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-companyName">Company name</Label>
              <Input
                id="edit-companyName"
                value={editForm.companyName}
                onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-duration">Course duration</Label>
              <Input id="edit-duration" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-pricePerMonth">Course price / month</Label>
              <Input
                id="edit-pricePerMonth"
                inputMode="decimal"
                value={editForm.pricePerMonth}
                onChange={(e) => setEditForm({ ...editForm, pricePerMonth: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Brief description of the course..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-whatsappNumber">WhatsApp Number</Label>
              <Input
                id="edit-whatsappNumber"
                value={editForm.whatsappNumber}
                onChange={(e) => setEditForm({ ...editForm, whatsappNumber: e.target.value })}
                placeholder="e.g. 923001234567 (with country code, no + or spaces)"
              />
            </div>
            <div>
              <Label>Course Image</Label>
              <div className="mt-2 space-y-2">
                {editImagePreview && (
                  <div className="relative inline-block">
                    <img src={editImagePreview} alt="Preview" className="h-32 w-auto rounded-md object-cover" />
                    <button
                      type="button"
                      onClick={clearEditImage}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => editImageInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    {editImagePreview ? "Change Image" : "Upload Image"}
                  </Button>
                  <input
                    ref={editImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!editingCourse) return;
                  updateMutation.mutate({ id: editingCourse._id, payload: editForm, imageFile: editImageFile });
                }}
                disabled={!editingCourse || !canSubmit(editForm) || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

