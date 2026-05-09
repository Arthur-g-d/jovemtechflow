
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PasswordSectionProps {
  email: string;
}

const PasswordSection = ({ email }: PasswordSectionProps) => {
  const handlePasswordReset = async () => {
    const { error } = await import("@/integrations/supabase/client")
      .then(({ supabase }) => supabase.auth.resetPasswordForEmail(email));
    if (error) {
      toast.error("Erro ao enviar link de redefinição.");
    } else {
      toast.success("Link de redefinição de senha enviado para seu email.");
    }
  };

  return (
    <div>
      <Button type="button" variant="outline" onClick={handlePasswordReset}>
        Redefinir senha por email
      </Button>
    </div>
  );
};

export default PasswordSection;
