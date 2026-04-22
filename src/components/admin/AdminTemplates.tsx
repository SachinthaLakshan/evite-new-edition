import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";
import { CardTemplate } from "@/types/invitation";

const AdminTemplates = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    image_url: "",
    template_url: "",
  });

  const { data: templates = [], isLoading } = useQuery<CardTemplate[]>({
    queryKey: ["card_templates"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("card_templates" as any) as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CardTemplate[];
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `templates/preview-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from("event-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("event-images")
        .getPublicUrl(fileName);

      setNewTemplate(prev => ({ ...prev, image_url: publicUrl }));
      toast.success("Template preview image uploaded! URL populated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const addTemplateMutation = useMutation({
    mutationFn: async (template: typeof newTemplate) => {
      const { error } = await (supabase
        .from("card_templates" as any) as any)
        .insert(template);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card_templates"] });
      setIsAddDialogOpen(false);
      setNewTemplate({ name: "", image_url: "", template_url: "" });
      toast.success("Template added successfully!");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from("card_templates" as any) as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card_templates"] });
      toast.success("Template deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 font-medium">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Card Templates</h2>
          <p className="text-sm text-gray-500">Manage the templates users can select for their invitations.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Template</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Royal Wedding"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Upload Preview Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploadingImage}
                    className="cursor-pointer"
                  />
                  {isUploadingImage && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                </div>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or paste link directly</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image_url">Preview Image URL</Label>
                <Input
                  id="image_url"
                  placeholder="https://..."
                  value={newTemplate.image_url}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, image_url: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="template_url">Design Template URL (Admin Only)</Label>
                <Input
                  id="template_url"
                  placeholder="Canva or design tool link"
                  value={newTemplate.template_url}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, template_url: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => addTemplateMutation.mutate(newTemplate)}
                disabled={addTemplateMutation.isPending || !newTemplate.name || !newTemplate.image_url}
              >
                {addTemplateMutation.isPending ? "Adding..." : "Save Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden group border-2 border-transparent hover:border-primary/20 transition-all">
            <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
              <img
                src={template.image_url}
                alt={template.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {template.template_url && (
                  <Button variant="secondary" size="sm" asChild>
                    <a href={template.template_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" /> Edit Design
                    </a>
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => {
                    if(confirm("Are you sure you want to delete this template?")) {
                      deleteTemplateMutation.mutate(template.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardFooter className="p-4 bg-white">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image Preview Set</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
        
        {templates.length === 0 && (
          <div className="col-span-full py-20 bg-gray-50 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-gray-500">
            <Plus className="w-12 h-12 mb-4 text-gray-300" />
            <p>No templates yet. Click "Add Template" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTemplates;
