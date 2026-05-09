import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, User, Clock, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  category?: string;
  created_at: string;
  author_id: string;
  profiles?: {
    username: string;
  };
}

export default function ForumPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch post with author info
      const { data: postData, error: postError } = await supabase
        .from("forum_posts")
        .select(`
          *,
          profiles (
            username
          )
        `)
        .eq("id", id)
        .maybeSingle();
        
      if (postError) {
        console.error("Error fetching post:", postError);
      } else {
        setPost(postData);
      }

      // Fetch comments with author info
      const { data: commentsData, error: commentsError } = await supabase
        .from("forum_comments")
        .select(`
          *,
          profiles (
            username
          )
        `)
        .eq("post_id", id)
        .order("created_at", { ascending: true });
        
      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
      } else {
        setComments(commentsData ?? []);
      }

      // Check user and admin status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!roleData);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !userId || !id) return;
    
    setAdding(true);
    
    try {
      const { data, error } = await supabase
        .from("forum_comments")
        .insert({
          post_id: id,
          author_id: userId,
          content: content.trim(),
        })
        .select(`
          *,
          profiles (
            username
          )
        `)
        .single();
        
      if (error) {
        console.error("Error creating comment:", error);
        toast({
          title: "Erro",
          description: "Erro ao publicar comentário",
          variant: "destructive"
        });
      } else {
        setComments(prev => [...prev, data]);
        setContent("");
        toast({
          title: "Sucesso",
          description: "Comentário publicado com sucesso!"
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao publicar comentário",
        variant: "destructive"
      });
    }
    
    setAdding(false);
  };

  const handleDeletePost = async () => {
    if (!isAdmin || !id) return;
    if (confirm("Tem certeza que deseja excluir este post?")) {
      try {
        // First delete all comments for this post
        const { error: commentsError } = await supabase
          .from("forum_comments")
          .delete()
          .eq("post_id", id);
          
        if (commentsError) {
          console.error("Error deleting comments:", commentsError);
        }
        
        // Then delete the post
        const { error: postError } = await supabase
          .from("forum_posts")
          .delete()
          .eq("id", id);
          
        if (postError) {
          console.error("Error deleting post:", postError);
          toast({
            title: "Erro",
            description: `Erro ao excluir post: ${postError.message}`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Sucesso",
            description: "Post excluído com sucesso"
          });
          window.location.href = "/forum";
        }
      } catch (error) {
        console.error("Unexpected error deleting post:", error);
        toast({
          title: "Erro",
          description: "Erro inesperado ao excluir post",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isAdmin) return;
    if (confirm("Tem certeza que deseja excluir este comentário?")) {
      try {
        const { error } = await supabase
          .from("forum_comments")
          .delete()
          .eq("id", commentId);
          
        if (error) {
          console.error("Error deleting comment:", error);
          toast({
            title: "Erro",
            description: `Erro ao excluir comentário: ${error.message}`,
            variant: "destructive"
          });
        } else {
          setComments(prev => prev.filter(c => c.id !== commentId));
          toast({
            title: "Sucesso",
            description: "Comentário excluído com sucesso"
          });
        }
      } catch (error) {
        console.error("Unexpected error deleting comment:", error);
        toast({
          title: "Erro",
          description: "Erro inesperado ao excluir comentário",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-lg">Carregando discussão...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-20 max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Discussão não encontrada</h2>
              <p className="text-muted-foreground mb-4">
                Esta discussão pode ter sido removida ou não existe.
              </p>
              <Link to="/forum">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Fórum
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-20 max-w-4xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/forum">
            <Button variant="outline" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Fórum
            </Button>
          </Link>
        </div>

        {/* Post Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-3">{post.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Por: {post.profiles?.username || 'Usuário'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(post.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                
                {post.category && (
                  <div className="mb-4">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                )}
              </div>
              
              {isAdmin && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePost()}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {post.content}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comentários ({comments.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{comment.profiles?.username || 'Usuário'}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {isAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="gap-1 h-6 px-2 text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                          Excluir
                        </Button>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Form */}
            {userId ? (
              <div className="border-t pt-6">
                <form onSubmit={handleComment} className="space-y-4">
                  <div>
                    <Textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      disabled={adding}
                      placeholder="Escreva seu comentário..."
                      className="min-h-24"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={adding || !content.trim()}
                      className="gap-2"
                    >
                      {adding ? "Enviando..." : "Comentar"}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border-t">
                <p>Faça login para comentar nesta discussão.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
