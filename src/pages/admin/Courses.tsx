import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface Course {
  _id: string;
  courseName: string;
  companyName: string;
  duration: string;
  pricePerMonth: number;
  isActive: boolean;
  createdAt: string;
}

type CourseForm = {
  courseName: string;
  companyName: string;
  duration: string;
  pricePerMonth: string; // keep as string for input
};

const emptyForm: CourseForm = {
  courseName: "",
  companyName: "",
  duration: "",
  pricePerMonth: "",
};

export default function Courses() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [addForm, setAddForm] = useState<CourseForm>(emptyForm);
  const [editForm, setEditForm] = useState<CourseForm>(emptyForm);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => api.get("/api/courses/admin").then((r) => r.data),
  });

  const courses: Course[] = useMemo(() => data?.data || [], [data]);

  const createMutation = useMutation({
    mutationFn: async (payload: CourseForm) => {
      const body = {
        courseName: payload.courseName.trim(),
        companyName: payload.companyName.trim(),
        duration: payload.duration.trim(),
        pricePerMonth: Number(payload.pricePerMonth),
      };
      const res = await api.post("/api/courses/create", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course created");
      setIsAddOpen(false);
      setAddForm(emptyForm);
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || "Failed to create course");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CourseForm> & { isActive?: boolean } }) => {
      const body: any = { ...payload };
      if (body.courseName !== undefined) body.courseName = String(body.courseName).trim();
      if (body.companyName !== undefined) body.companyName = String(body.companyName).trim();
      if (body.duration !== undefined) body.duration = String(body.duration).trim();
      if (body.pricePerMonth !== undefined) body.pricePerMonth = Number(body.pricePerMonth);
      const res = await api.put(`/api/courses/${id}`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course updated");
      setIsEditOpen(false);
      setEditingCourse(null);
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
    });
    setIsEditOpen(true);
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
          <DialogContent className="max-w-lg">
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => createMutation.mutate(addForm)} disabled={!canSubmit(addForm) || createMutation.isPending}>
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
        <DialogContent className="max-w-lg">
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

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!editingCourse) return;
                  updateMutation.mutate({ id: editingCourse._id, payload: editForm });
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

