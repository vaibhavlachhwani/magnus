import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { studentService } from "@/api/services"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UserPlus, Search, GraduationCap, FilePlus } from "lucide-react"
import { Link } from 'react-router-dom';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

export const StudentsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.listAll,
  });

  const registerMutation = useMutation({
    mutationFn: studentService.register,
    onSuccess: (newStudent) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Success",
        description: `Student ${newStudent.name} registered successfully.`,
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to register student.",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    registerMutation.mutate(values.name);
  }

  const filteredStudents = students?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-card border-border shadow-xl overflow-hidden">
        <div className="h-1 bg-primary/30 w-full" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Register Student</CardTitle>
              <p className="text-xs text-muted-foreground">Add a new student to the system</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} className="bg-background/50 border-border focus:ring-primary/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={registerMutation.isPending} className="bg-primary hover:bg-primary/90">
                {registerMutation.isPending ? "Registering..." : "Add Student"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Student Directory</CardTitle>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-9 bg-background/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border bg-background/30">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px] font-bold">ID</TableHead>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground animate-pulse">Loading students...</TableCell>
                  </TableRow>
                ) : filteredStudents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No students found.</TableCell>
                  </TableRow>
                ) : (
                  filteredStudents?.map((student) => (
                    <TableRow key={student.id} className="hover:bg-accent/30 transition-colors">
                      <TableCell className="font-mono text-[10px] text-muted-foreground">{student.id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm" className="hover:text-primary">
                          <Link to={`/upload?studentId=${student.id}`}>
                            <FilePlus className="w-4 h-4 mr-2" />
                            Issue Document
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
