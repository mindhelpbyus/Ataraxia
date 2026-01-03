import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tag } from "./ui/tag";
import { StatusDot } from "./ui/status-dot";
import { StatusSquare } from "./ui/status-square";
import { Switch } from "./ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "./ui/pagination";
import { 
  Calendar, 
  Users, 
  FileText, 
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  List,
  LayoutGrid,
  Columns,
  Table as TableIcon
} from "lucide-react";

/**
 * Navigation & Components Examples
 * 
 * Real-world examples showing how to use navigation patterns and small components
 * together in a wellness management calendar system.
 */
export function NavigationExamples() {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Mock data for client list
  const clients = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "(555) 123-4567",
      status: "active",
      lastSession: "2 days ago",
      tags: ["CBT", "Anxiety"],
      avatar: "https://placehold.co/40x40",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@email.com",
      phone: "(555) 234-5678",
      status: "scheduled",
      lastSession: "1 week ago",
      tags: ["EMDR", "Trauma"],
      avatar: "https://placehold.co/40x40",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@email.com",
      phone: "(555) 345-6789",
      status: "inactive",
      lastSession: "3 weeks ago",
      tags: ["Family Therapy"],
      avatar: "https://placehold.co/40x40",
    },
    {
      id: 4,
      name: "David Kim",
      email: "d.kim@email.com",
      phone: "(555) 456-7890",
      status: "active",
      lastSession: "Today",
      tags: ["Depression", "CBT"],
      avatar: "https://placehold.co/40x40",
    },
    {
      id: 5,
      name: "Amanda Foster",
      email: "amanda.f@email.com",
      phone: "(555) 567-8901",
      status: "scheduled",
      lastSession: "5 days ago",
      tags: ["Group Therapy"],
      avatar: "https://placehold.co/40x40",
    },
  ];

  const getStatusVariant = (status: string): "green" | "orange" | "neutral" => {
    if (status === "active") return "green";
    if (status === "scheduled") return "orange";
    return "neutral";
  };

  const getAvatarStatus = (status: string): "online" | "away" | "offline" | "none" => {
    if (status === "active") return "online";
    if (status === "scheduled") return "away";
    return "offline";
  };

  return (
    <div className="min-h-screen bg-[var(--background-secondary,#F7F9FB)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Navigation */}
        <div className="bg-white rounded-lg border border-[var(--border-primary,#E8ECF3)] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[var(--content-dark-primary,#000000)]">
                Client Management
              </h1>
              <p className="text-[var(--content-dark-secondary,#6D7076)]">
                Manage your clients and track their progress
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="size-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Users className="size-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList variant="underline">
              <TabsTrigger value="list" data-variant="underline">
                <List className="size-5" />
                List View
              </TabsTrigger>
              <TabsTrigger value="grid" data-variant="underline">
                <LayoutGrid className="size-5" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="calendar" data-variant="underline">
                <Calendar className="size-5" />
                Calendar View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filters and Search Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--content-dark-tertiary,#A3A7B0)]" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="w-full pl-10 pr-4 py-2 rounded border border-[var(--border-primary,#E8ECF3)] bg-white text-sm"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="size-4 mr-2" />
                Filter
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--content-dark-secondary,#6D7076)]">
                  Notifications
                </span>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client List with All Components */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Clients</CardTitle>
                <CardDescription>
                  Showing {clients.length} of {clients.length * 4} total clients
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot variant="green" />
                <span className="text-sm">Active</span>
                <StatusDot variant="orange" />
                <span className="text-sm">Scheduled</span>
                <StatusDot variant="neutral" />
                <span className="text-sm">Inactive</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-[var(--border-primary,#E8ECF3)] hover:bg-[var(--interaction-secondary-hover,#F7F9FB)] transition-colors"
              >
                {/* Avatar with Status */}
                <Avatar className="size-12" status={getAvatarStatus(client.status)}>
                  <AvatarImage src={client.avatar} />
                  <AvatarFallback className="bg-[var(--action-primary-base,#F97316)] text-white">
                    {client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                {/* Client Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-[var(--content-dark-primary,#000000)]">
                      {client.name}
                    </h4>
                    <Badge
                      variant={getStatusVariant(client.status)}
                      dot
                      size="sm"
                    >
                      {client.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[var(--content-dark-secondary,#6D7076)]">
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" />
                      {client.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="size-3" />
                      {client.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {client.lastSession}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2">
                  {client.tags.map((tag, index) => (
                    <Tag key={index} variant="filled">
                      {tag}
                    </Tag>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="size-4 mr-1" />
                    Notes
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="size-4 mr-1" />
                    Schedule
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--content-dark-secondary,#6D7076)]">
            Showing <span className="font-medium">{(currentPage - 1) * 5 + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * 5, clients.length * 4)}</span> of{" "}
            <span className="font-medium">{clients.length * 4}</span> results
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              />
              {[1, 2, 3, 4, 5].map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationEllipsis />
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(20)}>20</PaginationLink>
              </PaginationItem>
              <PaginationNext
                disabled={currentPage === 20}
                onClick={() => setCurrentPage(Math.min(20, currentPage + 1))}
              />
            </PaginationContent>
          </Pagination>
        </div>

        {/* View Mode Tabs (Button Group Style) */}
        <Card>
          <CardHeader>
            <CardTitle>View Configuration</CardTitle>
            <CardDescription>Choose how you want to view your data</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList variant="button-group">
                <TabsTrigger value="list" data-variant="button-group">
                  <List className="size-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="kanban" data-variant="button-group">
                  <Columns className="size-4" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="table" data-variant="button-group">
                  <TableIcon className="size-4" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="grid" data-variant="button-group">
                  <LayoutGrid className="size-4" />
                  Grid
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Status Legend with All Color Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Status Legend</CardTitle>
            <CardDescription>
              All available status indicators and their meanings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {/* Dots */}
              <div>
                <h4 className="font-medium mb-3">Status Dots</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <StatusDot variant="green" />
                    <span className="text-sm">Active / Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="orange" />
                    <span className="text-sm">Scheduled / Warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="red" />
                    <span className="text-sm">Urgent / Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="blue" />
                    <span className="text-sm">Information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="purple" />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="yellow" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="neutral" />
                    <span className="text-sm">Inactive / Neutral</span>
                  </div>
                </div>
              </div>

              {/* Badges with Dots */}
              <div>
                <h4 className="font-medium mb-3">Status Badges</h4>
                <div className="space-y-2">
                  <Badge variant="green" dot size="sm">Active</Badge>
                  <Badge variant="orange" dot size="sm">Scheduled</Badge>
                  <Badge variant="red" dot size="sm">Urgent</Badge>
                  <Badge variant="blue" dot size="sm">New</Badge>
                  <Badge variant="purple" dot size="sm">In Progress</Badge>
                  <Badge variant="yellow" dot size="sm">Pending</Badge>
                  <Badge variant="neutral" dot size="sm">Inactive</Badge>
                </div>
              </div>

              {/* Square Badges */}
              <div>
                <h4 className="font-medium mb-3">Category Labels</h4>
                <div className="space-y-2">
                  <Badge variant="green-square" size="sm">Completed</Badge>
                  <Badge variant="orange-square" size="sm">In Progress</Badge>
                  <Badge variant="red-square" size="sm">Overdue</Badge>
                  <Badge variant="blue-square" size="sm">Client</Badge>
                  <Badge variant="purple-square" size="sm">Therapist</Badge>
                  <Badge variant="yellow-square" size="sm">Admin</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
