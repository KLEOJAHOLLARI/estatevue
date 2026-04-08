import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "crypto";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onChange, maxImages = 6 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const filesToUpload = Array.from(files).slice(0, remaining);

      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit`);
          continue;
        }

        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

        const { error } = await supabase.storage
          .from("property-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(path);

        newUrls.push(urlData.publicUrl);
      }

      onChange([...images, ...newUrls]);
      if (newUrls.length > 0) toast.success(`${newUrls.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative group aspect-video rounded-md overflow-hidden border border-border">
            <img src={url} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {images.length < maxImages && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" />Upload Images ({images.length}/{maxImages})</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
