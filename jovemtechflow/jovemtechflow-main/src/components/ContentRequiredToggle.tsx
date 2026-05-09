
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ContentRequiredToggleProps {
  isRequired: boolean;
  onIsRequiredChange: (required: boolean) => void;
}

export default function ContentRequiredToggle({ isRequired, onIsRequiredChange }: ContentRequiredToggleProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is-required"
          checked={isRequired}
          onChange={(e) => onIsRequiredChange(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="is-required" className="font-medium">
          Conteúdo obrigatório
        </Label>
      </div>
      <Badge variant={isRequired ? "default" : "secondary"}>
        {isRequired ? "Obrigatório" : "Opcional"}
      </Badge>
    </div>
  );
}
