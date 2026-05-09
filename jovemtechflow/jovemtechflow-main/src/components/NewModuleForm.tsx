
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NewModuleFormProps {
  loading: boolean;
  onSubmit: (module: { title: string; description: string }) => void;
  onCancel: () => void;
}

export default function NewModuleForm({ loading, onSubmit, onCancel }: NewModuleFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title, description });
    setTitle("");
    setDescription("");
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Novo Módulo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Título do módulo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Descrição do módulo"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px]"
        />
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Criando..." : "Criar Módulo"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
