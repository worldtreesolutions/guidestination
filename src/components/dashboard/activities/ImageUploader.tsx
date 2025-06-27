
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import storageService from "@/services/storageService";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ value = [], onChange, maxImages = 10 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure value is always an array
  const imageUrls = Array.isArray(value) ? value : [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the maximum
    if (imageUrls.length + files.length > maxImages) {
      setUploadError(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload files to Supabase CDN
      const uploadResults = await storageService.uploadActivityImages(Array.from(files));
      
      if (uploadResults.length === 0) {
        throw new Error("Failed to upload images. Please try again.");
      }

      // Add the new image URLs to the existing ones
      onChange([...imageUrls, ...uploadResults]);
    } catch (error) {
      console.error("Error uploading images:", error);
      setUploadError("Failed to upload images to Supabase CDN. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...imageUrls];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handleAddUrlClick = () => {
    const url = prompt("Enter image URL:");
    if (url && isValidUrl(url)) {
      if (imageUrls.length + 1 > maxImages) {
        setUploadError(`You can only upload a maximum of ${maxImages} images.`);
        return;
      }
      onChange([...imageUrls, url]);
      setUploadError(null);
    } else if (url) {
      setUploadError("Please enter a valid URL.");
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {imageUrls.map((imageUrl, index) => (
          <div 
            key={index} 
            className="relative group border rounded-md overflow-hidden w-32 h-32"
          >
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {imageUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={imageUrl}
                  alt={`Activity image ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={() => {
                    // Replace with placeholder if image fails to load
                    const newImages = [...imageUrls];
                    newImages[index] = "https://images.unsplash.com/photo-1563492065599-3520f775eeed";
                    onChange(newImages);
                  }}
                />
                {index === 0 && (
                  <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-br-md">
                    Cover
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {imageUrls.length < maxImages && (
          <div className="border rounded-md w-32 h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
               onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isUploading ? "Uploading..." : "Upload"}
            </span>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-sm text-destructive">{uploadError}</p>
      )}

      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">Uploading images to Supabase CDN...</p>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || imageUrls.length >= maxImages}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload to CDN"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddUrlClick}
          disabled={imageUrls.length >= maxImages}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Add Image URL
        </Button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-sm text-green-700">
          <strong>Supabase CDN Integration:</strong> Images are automatically uploaded to Supabase Storage and served via CDN for optimal performance. 
          Upload up to {maxImages} images. The first image will be used as the cover image.
          Supported formats: JPG, PNG, GIF.
        </p>
      </div>
    </div>
  );
}
