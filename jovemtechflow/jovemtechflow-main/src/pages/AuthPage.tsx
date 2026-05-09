
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Github, Loader2, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const nav = useNavigate();

  // Google
  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) toast.error("Erro ao autenticar com Google");
    setLoading(false);
  };

  // GitHub
  const handleGithub = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) toast.error("Erro ao autenticar com GitHub");
    setLoading(false);
  };

  // Salva perfil na tabela profiles
  const saveProfile = async (userId: string, username: string) => {
    const { error } = await supabase
      .from("profiles")
      .insert([{ id: userId, username }]);
    if (error) {
      toast.error("Erro ao salvar perfil: " + error.message);
    }
  };

  // Email
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        toast.success("Login realizado");
        nav("/dashboard");
      } else {
        toast.error("Email ou senha inválidos");
      }
    } else {
      // Signup flow
      if (!username.trim()) {
        toast.error("Por favor, digite o nome de usuário");
        setLoading(false);
        return;
      }

      // Validação username simples (alfanumérico e underline, mínimo 3 caracteres)
      if (!/^[\w]{3,}$/.test(username)) {
        toast.error("Nome de usuário inválido, use apenas letras, números e _ (mínimo 3 caracteres)");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/dashboard",
        },
      });

      if (!error && data?.user) {
        // Após signup, tentar salvar perfil
        await saveProfile(data.user.id, username);
        toast.success("Cadastro realizado! Confirme seu e-mail.");
      } else if (error) {
        toast.error(error.message || "Erro ao cadastrar");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-tech-purple/40 via-tech-blue/30 to-white">
      <Card className="w-full max-w-md p-8 glass-card shadow-lg animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-center gradient-bg text-white rounded-md p-2">
          {isLogin ? "Entrar" : "Criar Conta"}
        </h2>
        <form className="space-y-4 mt-3" onSubmit={handleEmailAuth}>
          {!isLogin && (
            <Input
              type="text"
              placeholder="Nome de usuário"
              disabled={loading}
              required
              value={username}
              minLength={3}
              maxLength={30}
              onChange={(e) => setUsername(e.target.value.replace(/ /g, ""))}
              autoComplete="username"
            />
          )}
          <Input
            type="email"
            placeholder="E-mail"
            disabled={loading}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Senha"
            disabled={loading}
            required
            value={password}
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : isLogin ? <LogIn className="mr-2" /> : <UserPlus className="mr-2" />}
            {isLogin ? "Entrar" : "Cadastrar"}
          </Button>
        </form>
        <div className="my-4 flex items-center">
          <span className="flex-1 h-px bg-muted-foreground/30" />
          <span className="mx-3 text-sm text-muted-foreground">ou</span>
          <span className="flex-1 h-px bg-muted-foreground/30" />
        </div>
        <Button
          variant="outline"
          className="w-full mb-2"
          onClick={handleGoogle}
          disabled={loading}
          type="button"
        >
          <LogIn className="mr-2" />
          Entrar com Google
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGithub}
          disabled={loading}
          type="button"
        >
          <Github className="mr-2" />
          Entrar com GitHub
        </Button>
        <div className="mt-4 text-center flex flex-col items-center">
          <span className="text-sm">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}
          </span>
          <Button
            type="button"
            variant="link"
            className="p-0"
            onClick={() => setIsLogin((v) => !v)}
            disabled={loading}
          >
            {isLogin ? "Cadastrar" : "Entrar"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
