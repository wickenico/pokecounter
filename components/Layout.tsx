import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-blue-600 text-white p-4 text-center text-lg font-bold">
                Pokecounter
            </header>
            <main className="flex-1 p-4">{children}</main>
            <footer className="bg-gray-800 text-white text-center p-2 text-sm">
                &copy; 2025 Pokecounter - Gotta count &#39;em all!
            </footer>
        </div>
    );
}
