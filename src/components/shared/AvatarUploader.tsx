import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AvatarUploaderProps {
  userId: string;
  currentUrl: string;
  fallbackText: string;
  size?: "sm" | "md" | "lg";
  onUploaded: (url: string) => void;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-28 h-28",
};

const btnSizes = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-9 w-9",
};

export const AvatarUploader = ({ userId, currentUrl, fallbackText, size = "md", onUploaded }: AvatarUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ variant: "destructive", title: "Invalid file", description: "Please select an image." }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ variant: "destructive", title: "Too large", description: "Max 5MB." }); return; }

    setUploading(true);
    try {
      if (currentUrl) {
        const oldPath = currentUrl.split("/").pop();
        if (oldPath) await supabase.storage.from("avatars").remove([`${userId}/${oldPath}`]);
      }
      const filePath = `${userId}/${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("avatars").upload(filePath, file, { cacheControl: "3600", upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      onUploaded(publicUrl);
      toast({ title: "Avatar updated" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload failed", description: e.message });
    } finally { setUploading(false); }
  };

  return (
    <div className="relative">
      <Avatar className={`${sizeClasses[size]} ring-2 ring-primary/20`}>
        <AvatarImage src={currentUrl} alt="Avatar" loading="lazy" />
        <AvatarFallback className="bg-primary/10 text-primary">{fallbackText}</AvatarFallback>
      </Avatar>
      <Button size="icon" className={`absolute -bottom-1 -right-1 ${btnSizes[size]} rounded-full shadow-md`} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
        {uploading ? <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Camera className="w-3 h-3" />}
      </Button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  );
};
