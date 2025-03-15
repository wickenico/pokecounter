"use client"

import React from "react";
import { createClient } from "@/app/utils/supabase/client"
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation"

export default function Layout({ children }: { children: React.ReactNode }) {
    const supabase = createClient()
    const router = useRouter();

    async function handleLogout() {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error("Error signing out:", error)
        } else {
            console.log("Signed out successfully")
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.error("Error signing out:", error)
            } else {
                router.push("/login")
            }
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header mit Logout-Button */}
            <header className="bg-blue-600 text-white p-4 flex items-center justify-between">
                <h1 className="text-lg font-bold">Pokecounter</h1>

                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:text-red-200 transition cursor-pointer"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </header>

            {/* Hauptinhalt */}
            <main className="flex-1 p-4">{children}</main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white text-center p-2 text-sm">
                &copy; 2025 Pokecounter - Gotta count &#39;em all!
            </footer>
        </div>
    );
}
