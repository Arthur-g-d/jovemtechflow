
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, User, Calendar, CheckCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ConfirmDialog from "./ConfirmDialog";
import ErrorState from "./ErrorState";

export default function Forum() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: ""
  });
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingDeletePostId, setPendingDeletePostId] = useState<string | null>(null);
  const { toast } = useToast();

  const categories = [
    "Geral", 
    "Ajuda", 
    "Projetos", 
    "Técnico", 
    "Sugestões"
  ];

  useEffect(() => {
    fetchPosts();
    checkUser();
  }, [selectedCategory]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!roleData);
    }
  };

  const fetchPosts = async () => {
    let query = supabase
      .from("forum_posts")
      .select(`
        *,
        profiles (
          username
        )
      `)
      .order("created_at", { ascending: false });

    if (selectedCategory !== "all") {
      query = query.eq("category", selectedCategory);
    }

    setLoadingPosts(true);
    setPostsError(false);

    const { data, error } = await query;

    if (error) {
      setPostsError(true);
      toast({
        title: "Erro",
        description: "Erro ao carregar posts do fórum",
        variant: "destructive"
      });
    } else {
      setPosts(data || []);
    }
    setLoadingPosts(false);
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para criar um post",
        variant: "destructive"
      });
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar o post",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .insert({
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          category: newPost.category,
          author_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating post:", error);
        toast({
          title: "Erro ao criar post",
          description: error.message || "Tente novamente",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Post criado com sucesso!"
        });
        setNewPost({ title: "", content: "", category: "" });
        setIsCreating(false);
        fetchPosts();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar post",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem excluir posts",
        variant: "destructive"
      });
      return;
    }
    setPendingDeletePostId(postId);
  };

  const confirmDeletePost = async () => {
    const postId = pendingDeletePostId;
    setPendingDeletePostId(null);
    if (!postId) return;

    try {
      const { error: commentsError } = await supabase
        .from("forum_comments")
        .delete()
        .eq("post_id", postId);

      if (commentsError) {
        toast({ title: "Erro", description: "Erro ao excluir comentários do post", variant: "destructive" });
        return;
      }

      const { error: postError } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", postId);

      if (postError) {
        toast({ title: "Erro", description: "Erro ao excluir post", variant: "destructive" });
      } else {
        toast({ title: "Sucesso", description: "Post excluído com sucesso" });
        fetchPosts();
      }
    } catch {
      toast({ title: "Erro", description: "Erro inesperado ao excluir post", variant: "destructive" });
    }
  };

  const handleCancelCreate = () => {
    setNewPost({ title: "", content: "", category: "" });
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Fórum da Comunidade</h1>
          <p className="text-muted-foreground">
            Compartilhe conhecimento, tire dúvidas e conecte-se com outros membros
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {user && !isCreating && (
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Discussão
            </Button>
          )}
        </div>

        {/* Create Post Form */}
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>Nova Discussão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Título da discussão"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Select
                  value={newPost.category}
                  onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Textarea
                  placeholder="Descreva sua discussão..."
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="content-text"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreatePost} disabled={loading}>
                  {loading ? "Publicando..." : "Publicar Discussão"}
                </Button>
                <Button variant="outline" onClick={handleCancelCreate}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Nenhuma discussão encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedCategory === "all" 
                    ? "Seja o primeiro a iniciar uma discussão!"
                    : `Nenhuma discussão na categoria "${selectedCategory}"`
                  }
                </p>
                {user && !isCreating && (
                  <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeira Discussão
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <Link to={`/forum/${post.id}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer break-words">
                            {post.title}
                          </h3>
                          {post.solved && (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </Link>
                      <p className="text-muted-foreground line-clamp-2 mb-3 content-text break-words">
                        {post.content}
                      </p>
                    </div>
                    
                    {isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="gap-2 ml-4 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span className="break-words">{post.profiles?.username || "Usuário"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {post.category && (
                        <Badge variant="secondary">
                          {post.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDeletePostId}
        title="Excluir post"
        description="Tem certeza que deseja excluir este post? Todos os comentários também serão removidos. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={confirmDeletePost}
        onCancel={() => setPendingDeletePostId(null)}
      />
    </div>
  );
}
