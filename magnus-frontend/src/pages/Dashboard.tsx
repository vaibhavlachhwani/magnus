import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { verificationService } from "@/api/services"
import { ShieldCheck, Activity, Users, FileText, FileUp } from "lucide-react"
import { Link } from "react-router-dom"

export const Dashboard: React.FC = () => {
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: verificationService.checkHealth,
    refetchInterval: 30000,
  });

  const stats = [
    { title: "Active Students", value: "24", icon: Users, color: "text-blue-500" },
    { title: "Verified Documents", value: "156", icon: ShieldCheck, color: "text-green-500" },
    { title: "Recent Uploads", value: "12", icon: FileText, color: "text-purple-500" },
    { title: "System Status", value: isLoading ? "Checking..." : health || "Down", icon: Activity, color: health === "Systems running" ? "text-green-500" : "text-red-500" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle>Welcome to Magnus</CardTitle>
            <CardDescription>Secure Document Verification System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Magnus provides a tamper-proof verification system for student documents. 
              Using HMAC-SHA512 hashing, we ensure every document is authentic and has not been altered since issuance.
            </p>
            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex-1 text-center">
                <span className="block text-primary font-bold text-lg">FAST</span>
                <span className="text-[10px] uppercase text-muted-foreground">Verification</span>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex-1 text-center">
                <span className="block text-primary font-bold text-lg">SECURE</span>
                <span className="text-[10px] uppercase text-muted-foreground">Hashing</span>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex-1 text-center">
                <span className="block text-primary font-bold text-lg">EASY</span>
                <span className="text-[10px] uppercase text-muted-foreground">Management</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Commonly used actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/students" className="w-full text-left px-4 py-3 rounded-md border border-border hover:bg-accent transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <span>Register a new student</span>
              </div>
              <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link to="/upload" className="w-full text-left px-4 py-3 rounded-md border border-border hover:bg-accent transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <FileUp className="w-5 h-5 text-primary" />
                <span>Upload academic records</span>
              </div>
              <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
