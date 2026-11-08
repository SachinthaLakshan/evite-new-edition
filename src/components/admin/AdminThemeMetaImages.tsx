"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  buildThemeMetaImageUpdate,
  sortThemeMetaImages,
  themeMetaStoragePath,
  validateThemeMetaFile,
  type ThemeMetaImage,
} from "@/lib/theme-meta-images";

const BUCKET = "theme-meta-images";

async function replaceThemeMetaImage(
  theme: ThemeMetaImage,
  file: File,
  userId: string,
) {
  const check = validateThemeMetaFile(file);
  if (check.ok === false) {
    throw new Error(check.message);
  }

  const storagePath = themeMetaStoragePath(theme.theme_id, file.type, Date.now());
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  const { data: updated, error: updateError } = await supabase
    .from("theme_meta_images")
    .update(
      buildThemeMetaImageUpdate({
        imageUrl: publicUrl,
        storagePath,
        userId,
      }),
    )
    .eq("theme_id", theme.theme_id)
    .select("theme_id")
    .maybeSingle();

  if (updateError || !updated) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw updateError ?? new Error("Could not save the theme image. Confirm this account is an admin.");
  }

  let previousFileRemoved = true;
  if (theme.storage_path && theme.storage_path !== storagePath) {
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([theme.storage_path]);
    previousFileRemoved = !removeError;
  }

  return { themeName: theme.theme_name, previousFileRemoved };
}

export default function AdminThemeMetaImages() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [uploadingThemeId, setUploadingThemeId] = useState<string | null>(null);

  const { data: themes = [], isLoading, isError } = useQuery({
    queryKey: ["admin_theme_meta_images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("theme_meta_images")
        .select("theme_id, theme_name, image_url, storage_path, updated_at, updated_by");
      if (error) throw error;
      return sortThemeMetaImages((data ?? []) as ThemeMetaImage[]);
    },
  });

  const replaceMutation = useMutation({
    mutationFn: async ({ theme, file }: { theme: ThemeMetaImage; file: File }) => {
      const userId = session?.user.id;
      if (!userId) throw new Error("You need to be signed in as an admin.");
      return replaceThemeMetaImage(theme, file, userId);
    },
    onSuccess: ({ themeName, previousFileRemoved }) => {
      queryClient.invalidateQueries({ queryKey: ["admin_theme_meta_images"] });
      toast.success(`${themeName} image updated.`);
      if (!previousFileRemoved) {
        toast.warning("The previous file could not be removed.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not update the theme image.");
    },
    onSettled: () => setUploadingThemeId(null),
  });

  const onFile = (theme: ThemeMetaImage, file: File | undefined) => {
    if (!file || uploadingThemeId) return;
    const check = validateThemeMetaFile(file);
    if (check.ok === false) {
      toast.error(check.message);
      return;
    }
    setUploadingThemeId(theme.theme_id);
    replaceMutation.mutate({ theme, file });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Theme meta images
        </CardTitle>
        <CardDescription>
          Upload a default image for each invitation theme, or replace the current one.
          Public invite pages still use their existing share images.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Could not load theme images. Apply the theme meta images migration and confirm this account is an admin.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {themes.map((theme) => {
              const inputId = `theme-meta-file-${theme.theme_id}`;
              const isUploading = uploadingThemeId === theme.theme_id;
              return (
                <div
                  key={theme.theme_id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4"
                >
                  <div>
                    <h3 className="font-semibold text-[#4C1D95]">{theme.theme_name}</h3>
                    <p className="text-xs text-muted-foreground">{theme.theme_id}</p>
                  </div>
                  <div className="flex h-40 items-center justify-center overflow-hidden rounded-md border border-dashed border-purple-100 bg-[#F9F5FF]">
                    {theme.image_url ? (
                      <img
                        src={theme.image_url}
                        alt={`${theme.theme_name} meta image`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">No image uploaded</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={inputId}>
                      {theme.image_url ? "Replace image" : "Upload image"}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={inputId}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={!!uploadingThemeId}
                        className="cursor-pointer"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          onFile(theme, file);
                        }}
                      />
                      {isUploading && <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP. 5 MB maximum.</p>
                    {theme.image_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={theme.image_url} target="_blank" rel="noreferrer">
                          View current image
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
