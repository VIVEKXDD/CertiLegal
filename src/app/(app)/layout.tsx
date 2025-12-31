'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar";
import { MainNav } from "@/components/main-nav";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { CircleUser, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { useEffect } from "react";
import { FirebaseClientProvider } from "@/firebase";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    // If auth state is determined and there's no user, redirect to login
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  // While checking auth state, show a loader
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // If there's no user, don't render the layout (the effect will redirect)
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center gap-2">
                <Logo className="size-8 text-primary" />
                <h1 className="text-xl font-headline font-semibold">ClarityLegal</h1>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <MainNav />
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-start gap-2 w-full p-2 h-12">
                <CircleUser className="size-6" />
                <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{user.displayName || 'User'}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-full">{user.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Profile</DropdownMenuItem>
              <DropdownMenuItem disabled>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/50 backdrop-blur-sm px-6 lg:hidden">
          <SidebarTrigger className="md:hidden"/>
          <div className="flex-1">
            <h1 className="text-lg font-bold font-headline">ClarityLegal</h1>
          </div>
        </header>
        <div className="h-[calc(100vh-3.5rem)] lg:h-full overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AppLayout>{children}</AppLayout>
    </FirebaseClientProvider>
  )
}
