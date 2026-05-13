import { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon, Trash2, Copy, Upload, Search, HardDrive, FileImage,
  ExternalLink, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminFetch, apiBase, getAdminToken } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  modified: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const AdminMediaLibrary = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<MediaFile | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/media");
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      toast({ title: "Error", description: "Failed to load media", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void fetchFiles(); }, [fetchFiles]);

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const uploadFile = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/mp4";
    input.multiple = true;
    input.onchange = async () => {
      if (!input.files?.length) return;
      setUploading(true);
      let uploaded = 0;
      let failed = 0;
      for (const file of Array.from(input.files)) {
        try {
          const fd = new FormData();
          fd.append("file", file);
          const token = getAdminToken();
          const res = await fetch(
            `${apiBase()}/api/admin/upload`,
            {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: fd,
            }
          );
          if (res.ok) uploaded++;
          else failed++;
        } catch { failed++; }
      }
      if (failed > 0) {
        toast({ title: `Uploaded ${uploaded}, failed ${failed}`, variant: uploaded > 0 ? "default" : "destructive" });
      } else {
        toast({ title: `Uploaded ${uploaded} file(s)` });
      }
      setUploading(false);
      void fetchFiles();
    };
    input.click();
  };

  const deleteFile = async (f: MediaFile) => {
    if (!window.confirm(`Delete "${f.name}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/media/${encodeURIComponent(f.name)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "File deleted" });
      if (preview?.name === f.name) setPreview(null);
      void fetchFiles();
    } catch {
      toast({ title: "Error", description: "Failed to delete file", variant: "destructive" });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => toast({ title: "URL copied to clipboard" }),
      () => toast({ title: "Copy failed", description: "Clipboard access denied", variant: "destructive" }),
    );
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Media Library
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 text-xs hidden sm:flex">
              <HardDrive className="h-3 w-3" />
              {files.length} files · {formatBytes(totalSize)}
            </Badge>
            <Button size="sm" onClick={uploadFile} disabled={uploading} className="gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FileImage className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{search ? "No files match your search" : "No files uploaded yet"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((f) => {
              const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(f.name);
              return (
                <div
                  key={f.name}
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className="aspect-square relative bg-muted/30 overflow-hidden cursor-pointer"
                    onClick={() => setPreview(f)}
                  >
                    {isImage ? (
                      <img
                        src={f.url}
                        alt={f.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <FileImage className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium truncate" title={f.name}>{f.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatBytes(f.size)} · {new Date(f.modified).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1 mt-1.5">
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        onClick={() => copyUrl(f.url)}
                        title="Copy URL"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        onClick={() => window.open(f.url, "_blank")}
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6 hover:bg-red-500/10 hover:text-red-500 ml-auto"
                        onClick={() => deleteFile(f)}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <div className="relative max-w-3xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost" size="icon"
              className="absolute -top-10 right-0 text-white hover:bg-white/20"
              onClick={() => setPreview(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <img
              src={preview.url}
              alt={preview.name}
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
            />
            <div className="mt-3 flex items-center justify-between text-white/80 text-sm">
              <span>{preview.name}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white" onClick={() => copyUrl(preview.url)}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy URL
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMediaLibrary;
