// AuthPage.tsx — refatorado para usar authService.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authService } from "@/services";

const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

const signUpSchema = z
  .object({
    email: z.string().email("Email inválido"),
    username: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .max(50, "Máximo 50 caracteres"),
    password: z
      .string()
      .min(8, "Senha deve ter ao menos 8 caracteres")
      .regex(/[a-zA-Z]/, "Deve conter ao menos uma letra")
      .regex(/[0-9]/, "Deve conter ao menos um número"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem",
  });

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

function buildRedirectUrl(): string {
  const explicit = import.meta.env.VITE_PUBLIC_URL as string | undefined;
  const base = explicit?.replace(/\/$/, "") ?? window.location.origin;
  return `${base}/dashboard`;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const signIn = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUp = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function handleSignIn(values: SignInForm) {
    setLoading(true);
    try {
      await authService.signIn(values);
      toast.success("Bem-vindo de volta!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(values: SignUpForm) {
    setLoading(true);
    try {
      await authService.signUp({
        email: values.email,
        password: values.password,
        username: values.username,
        emailRedirectTo: buildRedirectUrl(),
      });
      toast.success(
        "Conta criada! Verifique seu email para confirmar o cadastro.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no cadastro.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setOauthLoading(true);
    try {
      await authService.signInWithGoogle(buildRedirectUrl());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no login Google.");
    } finally {
      setOauthLoading(false);
    }
  }

  async function handleResetPassword() {
    const email = signIn.getValues("email").trim();
    if (!email) {
      toast.error("Informe o email no campo acima para recuperar a senha.");
      return;
    }
    await authService.resetPassword(email, buildRedirectUrl());
    toast.success(
      "Se este email estiver cadastrado, enviaremos um link para redefinição.",
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acesse sua conta</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form
                onSubmit={signIn.handleSubmit(handleSignIn)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    {...signIn.register("email")}
                  />
                  {signIn.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {signIn.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    autoComplete="current-password"
                    {...signIn.register("password")}
                  />
                  {signIn.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {signIn.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm"
                    onClick={handleResetPassword}
                  >
                    Esqueci minha senha
                  </Button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                onSubmit={signUp.handleSubmit(handleSignUp)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Nome de usuário</Label>
                  <Input
                    id="signup-username"
                    autoComplete="username"
                    {...signUp.register("username")}
                  />
                  {signUp.formState.errors.username && (
                    <p className="text-xs text-destructive">
                      {signUp.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    {...signUp.register("email")}
                  />
                  {signUp.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {signUp.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    {...signUp.register("password")}
                  />
                  {signUp.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {signUp.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmar senha</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    autoComplete="new-password"
                    {...signUp.register("confirmPassword")}
                  />
                  {signUp.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {signUp.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                ou
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            disabled={oauthLoading}
          >
            {oauthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continuar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
