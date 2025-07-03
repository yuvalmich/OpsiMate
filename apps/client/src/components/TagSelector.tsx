import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { providerApi } from "@/lib/api";
import { Tag } from "@service-peek/shared";
import { CreateTagDialog } from "./CreateTagDialog";
import { TagBadge } from "./ui/tag-badge";

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  serviceId: number;
  className?: string;
}

export function TagSelector({ selectedTags, onTagsChange, serviceId, className }: TagSelectorProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await providerApi.getAllTags();
      if (response.success && response.data) {
        setAllTags(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = async (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    
    if (isSelected) {
      // Remove tag
      try {
        const response = await providerApi.removeTagFromService(serviceId, tag.id);
        if (response.success) {
          onTagsChange(selectedTags.filter(t => t.id !== tag.id));
          toast({
            title: "Success",
            description: "Tag removed from service"
          });
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to remove tag",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove tag",
          variant: "destructive"
        });
      }
    } else {
      // Add tag
      try {
        const response = await providerApi.addTagToService(serviceId, tag.id);
        if (response.success) {
          onTagsChange([...selectedTags, tag]);
          toast({
            title: "Success",
            description: "Tag added to service"
          });
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to add tag",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add tag",
          variant: "destructive"
        });
      }
    }
  };

  const handleTagCreated = (newTag: Tag) => {
    setAllTags([...allTags, newTag]);
    // Optionally auto-add the new tag to the service
    handleTagSelect(newTag);
  };

  const availableTags = allTags.filter(tag => !selectedTags.some(selected => selected.id === tag.id));

  return (
    <>
      <div className={cn("flex flex-wrap gap-1 items-center", className)}>
        {selectedTags.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            onRemove={() => handleTagSelect(tag)}
            className="text-xs"
          />
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 bg-muted transition-colors",
                "h-7 min-w-[32px] justify-center",
                "hover:bg-muted/80 focus:bg-muted/80 active:bg-muted/90",
                "focus:outline-none",
                // Remove strong focus ring
                // open && "ring-2 ring-ring"
              )}
              aria-label="Add tag"
            >
              <Plus className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 p-4">
                    <p className="text-sm text-muted-foreground">No tags found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateDialog(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create new tag
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {availableTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleTagSelect(tag)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </CommandItem>
                  ))}
                  {availableTags.length > 0 && (
                    <CommandItem
                      onSelect={() => setShowCreateDialog(true)}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <Plus className="h-4 w-4" />
                      Create new tag
                    </CommandItem>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <CreateTagDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onTagCreated={handleTagCreated}
      />
    </>
  );
} 