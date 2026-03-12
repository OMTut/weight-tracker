import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Dashboard page — sticky top bar with + button, app name, and user dropdown. */
export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky top bar */}
      <header className="bg-background sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
        {/* Left: + button */}
        <Button variant="ghost" size="icon" aria-label="Add weight entry">
          <Plus className="h-5 w-5" />
        </Button>

        {/* Center: app name */}
        <span className="text-lg font-semibold">HeavyDeets</span>

        {/* Right: user dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1">
              <span className="max-w-[120px] truncate">{user?.name}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate({ to: "/account" })}>
              Account Info
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-4">
        <p className="text-muted-foreground text-sm">
          Weight entries will appear here.
        </p>
      </main>
    </div>
  );
}
