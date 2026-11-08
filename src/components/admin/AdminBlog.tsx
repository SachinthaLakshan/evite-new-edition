"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { BlogPost } from "@/lib/blog/types";
import {
  BLOG_EXCERPT_MAX,
  BLOG_TITLE_MAX,
  estimateReadingTimeMinutes,
  formatBlogDate,
  looksLikeSqlOrMigration,
  slugifyTitle,
} from "@/lib/blog/utils";

type BlogFormState = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  cover_image_url: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
};

const emptyForm = (): BlogFormState => ({
  title: "",
  slug: "",
  excerpt: "",
  content_html: "<p></p>",
  cover_image_url: "",
  meta_title: "",
  meta_description: "",
  is_published: false,
});

function postToForm(post: BlogPost): BlogFormState {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content_html: post.content_html || "<p></p>",
    cover_image_url: post.cover_image_url ?? "",
    meta_title: post.meta_title ?? "",
    meta_description: post.meta_description ?? "",
    is_published: post.is_published,
  };
}

async function uploadBlogImage(file: File, prefix: string): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("blog-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    toast.error("Image upload failed. Apply the blog migration and check storage policies.");
    return null;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from("blog-images").getPublicUrl(path);
  return publicUrl;
}

export default function AdminBlog() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<BlogFormState>(emptyForm);
  const [slugManual, setSlugManual] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin_blog_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const uploadInlineImage = useMemo(
    () => (file: File) => uploadBlogImage(file, "content"),
    [],
  );

  const saveMutation = useMutation({
    mutationFn: async (payload: BlogFormState) => {
      const slug = payload.slug.trim() || slugifyTitle(payload.title);
      if (!slug || !payload.title.trim()) {
        throw new Error("Title and slug are required.");
      }
      if (payload.title.trim().length > BLOG_TITLE_MAX) {
        throw new Error(`Title must be ${BLOG_TITLE_MAX} characters or fewer.`);
      }
      if (payload.excerpt.trim().length > BLOG_EXCERPT_MAX) {
        throw new Error(`Excerpt must be ${BLOG_EXCERPT_MAX} characters or fewer.`);
      }
      if (looksLikeSqlOrMigration(payload.title)) {
        throw new Error("Title looks like SQL or migration code. Use a short headline only.");
      }
      if (payload.excerpt.trim() && looksLikeSqlOrMigration(payload.excerpt)) {
        throw new Error("Excerpt cannot be SQL or migration code. Use a short summary.");
      }
      const reading_time_minutes = estimateReadingTimeMinutes(payload.content_html);
      const now = new Date().toISOString();
      let published_at: string | null = null;
      if (payload.is_published) {
        if (payload.id) {
          const existing = posts.find((p) => p.id === payload.id);
          published_at = existing?.published_at ?? now;
        } else {
          published_at = now;
        }
      }

      const row = {
        slug,
        title: payload.title.trim(),
        excerpt: payload.excerpt.trim(),
        content_html: payload.content_html,
        cover_image_url: payload.cover_image_url.trim() || null,
        meta_title: payload.meta_title.trim() || null,
        meta_description: payload.meta_description.trim() || null,
        is_published: payload.is_published,
        published_at,
        reading_time_minutes,
        author_id: session?.user?.id ?? null,
        updated_at: now,
      };

      if (payload.id) {
        const { error } = await supabase.from("blog_posts").update(row).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert({
          ...row,
          created_at: now,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_blog_posts"] });
      toast.success("Blog post saved.");
      setDialogOpen(false);
      setForm(emptyForm());
      setSlugManual(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not save post.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_blog_posts"] });
      toast.success("Post deleted.");
    },
    onError: () => toast.error("Could not delete post."),
  });

  const openCreate = () => {
    setForm(emptyForm());
    setSlugManual(false);
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setForm(postToForm(post));
    setSlugManual(true);
    setDialogOpen(true);
  };

  const onTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: slugManual ? f.slug : slugifyTitle(title),
    }));
  };

  const onCoverFile = async (file: File) => {
    setCoverUploading(true);
    const url = await uploadBlogImage(file, "covers");
    setCoverUploading(false);
    if (url) {
      setForm((f) => ({ ...f, cover_image_url: url }));
      toast.success("Cover image uploaded.");
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Blog posts
          </CardTitle>
          <CardDescription>
            Publish wedding guides for SEO. Posts appear on{" "}
            <Link href="/blog" className="font-semibold text-primary hover:underline" target="_blank">
              /blog
            </Link>
            .
          </CardDescription>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          New post
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No posts yet. Create your first guide.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {posts.map((post) => (
              <li key={post.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    /blog/{post.slug}
                    {post.published_at ? ` · ${formatBlogDate(post.published_at)}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={post.is_published ? "default" : "secondary"}>
                    {post.is_published ? "Published" : "Draft"}
                  </Badge>
                  {post.is_published ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/blog/${post.slug}`} target="_blank" className="gap-1">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => openEdit(post)} className="gap-1">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (window.confirm("Delete this post?")) deleteMutation.mutate(post.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit post" : "New blog post"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="blog-title">Title</Label>
                <Input
                  id="blog-title"
                  value={form.title}
                  maxLength={BLOG_TITLE_MAX}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="How to create your digital wedding invitation on eVite"
                />
                <p className="text-xs text-muted-foreground">
                  Short headline only ({form.title.length}/{BLOG_TITLE_MAX}). Do not paste SQL or long scripts here.
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="blog-slug">URL slug</Label>
                <Input
                  id="blog-slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    setForm((f) => ({ ...f, slug: slugifyTitle(e.target.value) || e.target.value }));
                  }}
                  placeholder="poruwa-ceremony-guide"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="blog-excerpt">Excerpt</Label>
                <Textarea
                  id="blog-excerpt"
                  rows={3}
                  maxLength={BLOG_EXCERPT_MAX}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Short summary for cards and search results"
                />
                <p className="text-xs text-muted-foreground">
                  {form.excerpt.length}/{BLOG_EXCERPT_MAX} characters
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover image</Label>
              <p className="text-xs text-muted-foreground">
                Recommended 1200×630 px (landscape JPG or WebP) for blog cards and social previews.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" className="gap-2" disabled={coverUploading} asChild>
                  <label className="cursor-pointer">
                    {coverUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload cover
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void onCoverFile(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </Button>
                <Input
                  className="flex-1 min-w-[200px]"
                  value={form.cover_image_url}
                  onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
                  placeholder="Or paste image URL"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                value={form.content_html}
                onChange={(html) => setForm((f) => ({ ...f, content_html: html }))}
                onUploadImage={uploadInlineImage}
              />
            </div>

            <BlogSeoFields form={form} setForm={setForm} />

            <BlogPublishToggle form={form} setForm={setForm} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : "Save post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function BlogSeoFields({
  form,
  setForm,
}: {
  form: BlogFormState;
  setForm: React.Dispatch<React.SetStateAction<BlogFormState>>;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 space-y-3">
      <p className="text-sm font-semibold text-slate-800">SEO</p>
      <div className="space-y-2">
        <Label htmlFor="meta-title">Meta title</Label>
        <Input
          id="meta-title"
          value={form.meta_title}
          onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))}
          placeholder={form.title || "Optional — defaults to post title"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="meta-desc">Meta description</Label>
        <Textarea
          id="meta-desc"
          rows={2}
          value={form.meta_description}
          onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
          placeholder="Optional — defaults to excerpt"
        />
      </div>
    </div>
  );
}

function BlogPublishToggle({
  form,
  setForm,
}: {
  form: BlogFormState;
  setForm: React.Dispatch<React.SetStateAction<BlogFormState>>;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
      <div>
        <p className="font-medium text-sm">Publish</p>
        <p className="text-xs text-muted-foreground">Visible on the public blog when enabled</p>
      </div>
      <Switch
        checked={form.is_published}
        onCheckedChange={(checked) => setForm((f) => ({ ...f, is_published: checked }))}
      />
    </div>
  );
}
