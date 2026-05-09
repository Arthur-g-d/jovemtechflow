
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload } from "lucide-react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

export default function CreateProjectDialog({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase
      .from("projects")
      .insert({
        title,
        description,
        image_url: imageUrl || null,
        tags: tags.length > 0 ? tags : null,
        author_id: user.id,
      });

    if (!error) {
      // Reset form
      setTitle("");
      setDescription("");
      setImageUrl("");
      setTags([]);
      setTagInput("");
      onProjectCreated();
      onOpenChange(false);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Criar Novo Projeto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-base font-semibold">
              Título do Projeto *
            </Label>
            <Input
              id="title"
              placeholder="Ex: Desenvolvimento de App Mobile"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-semibold">
              Descrição *
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o projeto, objetivos de aprendizado, tecnologias envolvidas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-2 min-h-[120px]"
            />
          </div>

          <div>
            <Label htmlFor="imageUrl" className="text-base font-semibold">
              URL da Imagem (opcional)
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-2"
            />
            {imageUrl && (
              <div className="mt-3">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full h-40 object-cover rounded-lg border"
                  onError={() => setImageUrl("")}
                />
              </div>
            )}
          </div>

          <div>
            <Label className="text-base font-semibold">Tags (opcional)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Adicionar tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Criando..." : "Criar Projeto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
