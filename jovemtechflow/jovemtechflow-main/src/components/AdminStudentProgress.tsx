
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, BookOpen, TrendingUp, Award } from "lucide-react";

interface Student {
  user_id: string;
  username: string;
  email: string;
  projects: {
    project_id: string;
    project_title: string;
    progress_percentage: number;
    completed_steps: number;
    total_steps: number;
  }[];
}

export default function AdminStudentProgress() {
  const [students, setStudents] = useState<Student[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch all projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      setProjects(projectsData || []);

      // Fetch all project enrollments with their profiles
      const { data: enrollmentsData } = await supabase
        .from("project_enrollments")
        .select(`
          user_id,
          project_id,
          projects!project_enrollments_project_id_fkey (
            title,
            id
          )
        `);

      if (!enrollmentsData) {
        setStudents([]);
        return;
      }

      // Get profiles for all enrolled users
      const userIds = [...new Set(enrollmentsData.map(enrollment => enrollment.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      // Fetch progress data for all users and projects
      const { data: progressData } = await supabase
        .from("project_progressions")
        .select("*")
        .in("user_id", userIds);

      // Fetch all project contents to calculate total steps
      const { data: contentsData } = await supabase
        .from("project_contents")
        .select("*");

      // Process the data
      const studentsMap = new Map<string, Student>();

      // Initialize students with profile data
      profilesData?.forEach(profile => {
        studentsMap.set(profile.id, {
          user_id: profile.id,
          username: profile.username || 'Usuário',
          email: profile.email || '',
          projects: []
        });
      });

      // Add project data for each student
      enrollmentsData.forEach(enrollment => {
        const student = studentsMap.get(enrollment.user_id);
        if (!student || !enrollment.projects) return;

        const projectContents = contentsData?.filter(content => content.project_id === enrollment.project_id) || [];
        const userProgress = progressData?.filter(progress => 
          progress.user_id === enrollment.user_id && 
          progress.project_id === enrollment.project_id
        ) || [];

        const completedSteps = userProgress.filter(p => p.progress_num >= 100).length;
        const totalSteps = projectContents.length;
        const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        student.projects.push({
          project_id: enrollment.project_id,
          project_title: enrollment.projects.title,
          progress_percentage: progressPercentage,
          completed_steps: completedSteps,
          total_steps: totalSteps
        });
      });

      setStudents(Array.from(studentsMap.values()));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async (userId: string, projectId: string) => {
    const student = students.find(s => s.user_id === userId);
    const project = student?.projects.find(p => p.project_id === projectId);
    
    if (!student || !project || project.progress_percentage < 100) {
      alert("Certificado só pode ser gerado para projetos 100% concluídos");
      return;
    }

    alert(`Certificado gerado para ${student.username} - Projeto: ${project.project_title}`);
  };

  const filteredStudents = students.filter(student => {
    if (selectedStudent !== "all" && student.user_id !== selectedStudent) return false;
    if (selectedProject !== "all") {
      return student.projects.some(project => project.project_id === selectedProject);
    }
    return true;
  });

  // Calculate statistics
  const totalProjects = projects.length;
  const totalStudents = students.length;
  const totalCompletedTracks = students.reduce((acc, student) => 
    acc + student.projects.filter(project => project.progress_percentage === 100).length, 0
  );
  const averageProgress = students.length > 0 ? Math.round(
    students.reduce((acc, student) => 
      acc + student.projects.reduce((sum, project) => sum + project.progress_percentage, 0) / (student.projects.length || 1), 0
    ) / students.length
  ) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando dados dos estudantes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Progresso dos Estudantes</h1>
        <p className="text-muted-foreground">
          Acompanhe o progresso individual e gere certificados para estudantes que completaram trilhas.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Estudantes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalProjects}</p>
                <p className="text-sm text-muted-foreground">Projetos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{averageProgress}%</p>
                <p className="text-sm text-muted-foreground">Progresso Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{totalCompletedTracks}</p>
                <p className="text-sm text-muted-foreground">Trilhas Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Filtrar por Projeto</label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Projetos</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Filtrar por Estudante</label>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um estudante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estudantes</SelectItem>
              {students.map((student) => (
                <SelectItem key={student.user_id} value={student.user_id}>
                  {student.username} ({student.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudantes</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum estudante encontrado</h3>
              <p className="text-muted-foreground">
                Não há estudantes matriculados nos projetos ou que correspondam aos filtros selecionados.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudante</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Etapas</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => 
                  student.projects
                    .filter(project => selectedProject === "all" || project.project_id === selectedProject)
                    .map((project) => (
                      <TableRow key={`${student.user_id}-${project.project_id}`}>
                        <TableCell className="font-medium">{student.username}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{project.project_title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress_percentage} className="w-16 h-2" />
                            <Badge variant={project.progress_percentage === 100 ? "default" : "secondary"}>
                              {project.progress_percentage}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {project.completed_steps}/{project.total_steps}
                        </TableCell>
                        <TableCell>
                          {project.progress_percentage === 100 && (
                            <Button
                              size="sm"
                              onClick={() => generateCertificate(student.user_id, project.project_id)}
                              className="gap-1"
                            >
                              <Award className="h-3 w-3" />
                              Certificado
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
