import { FirebaseClientProvider } from "@/firebase";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <FirebaseClientProvider>
            {children}
        </FirebaseClientProvider>
    );
}