"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";

export default function Home() {
    const [pokemon, setPokemon] = useState("");
    const [counters, setCounters] = useState<{ id: string; name: string; count: number; created_at: string }[]>([]);

    // Pokémon-Liste aus Supabase nach created_at absteigend laden
    useEffect(() => {
        const fetchPokemon = async () => {
            const { data, error } = await supabase
                .from("pokemon_counters")
                .select("*")
                .order("created_at", { ascending: false }); // Neueste zuerst

            if (error) console.error("Fehler beim Laden:", error);
            else setCounters(data || []);
        };

        fetchPokemon();
    }, []);

    const addPokemon = async () => {
        if (pokemon.trim() !== "") {
            const { data, error } = await supabase
                .from("pokemon_counters")
                .insert([{ name: pokemon, count: 0, created_at: new Date() }])
                .select()
                .order("created_at", { ascending: false });

            if (error) console.error(error);
            else setCounters(data || []);
            setPokemon("");
        }
    };

    const updateCounter = async (id: string, delta: number) => {
        const updatedPokemon = counters.find((p) => p.id === id);
        if (!updatedPokemon) return;

        const newCount = updatedPokemon.count + delta;
        const { error } = await supabase
            .from("pokemon_counters")
            .update({ count: newCount })
            .eq("id", id);

        if (error) console.error(error);
        else {
            setCounters((prev) =>
                prev.map((p) => (p.id === id ? { ...p, count: newCount } : p))
            );
        }
    };

    return (
        <Layout>
            <div className="max-w-lg mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-center">Shiny Pokémon Counter</h1>

                <div className="flex space-x-2 mb-4">
                    <Input type="text" value={pokemon} onChange={(e) => setPokemon(e.target.value)} placeholder="Pokémon Name" />
                    <Button onClick={addPokemon} className="bg-blue-600 text-white">Hinzufügen</Button>
                </div>

                <div className="space-y-3">
                    {counters.map((p) => (
                        <Card key={p.id} className="p-4 flex justify-between items-center">
                            <span className="text-lg font-medium">{p.name}</span>
                            <div className="flex space-x-2">
                                <Button onClick={() => updateCounter(p.id, -1)} className="bg-red-500 text-white" disabled={p.count === 0}>-</Button>
                                <span className="text-lg">{p.count}</span>
                                <Button onClick={() => updateCounter(p.id, +1)} className="bg-green-500 text-white">+</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
