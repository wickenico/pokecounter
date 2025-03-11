"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Trash2 } from "lucide-react"; // Mülleimer-Icon
import pokemon from "pokemon";

// Statische Arrays für die Übersetzungen
const germanPokemonNames = pokemon.all("de");
const englishPokemonNames = pokemon.all();

// Komponente für die einzelnen Pokémon-Karten
function PokemonCard({
                         pokemonEntry,
                         englishName,
                         updateCounter,
                         setDeleteTarget,
                     }: {
    pokemonEntry: { id: string; name: string; count: number; created_at: string };
    englishName: string;
    updateCounter: (id: string, delta: number) => void;
    setDeleteTarget: (target: { id: string; name: string } | null) => void;
}) {
    const [spriteUrl, setSpriteUrl] = useState<string | null>(null);

    useEffect(() => {
        if (englishName) {
            fetch(`https://pokeapi.co/api/v2/pokemon/${englishName.toLowerCase()}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data && data.sprites && data.sprites.front_shiny) {
                        setSpriteUrl(data.sprites.front_shiny);
                    }
                })
                .catch((err) =>
                    console.error("Fehler beim Laden des Shiny Sprites:", err)
                );
        }
    }, [englishName]);

    return (
        <Card
            key={pokemonEntry.id}
            className="relative p-5 pr-16 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white shadow-lg rounded-xl transition-all transform hover:scale-105 hover:shadow-xl fade-in"
        >
            {/* Mülleimer-Icon */}
            <button
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-transform transform hover:scale-110 cursor-pointer"
                onClick={() =>
                    setDeleteTarget({ id: pokemonEntry.id, name: pokemonEntry.name })
                }
            >
                <Trash2 size={20} />
            </button>

            <div className="flex items-center">
                {spriteUrl && (
                    <img
                        src={spriteUrl}
                        alt={`Shiny sprite of ${englishName}`}
                        className="w-24 h-24 mr-4"
                    />
                )}
                <div>
          <span className="text-lg font-semibold text-gray-800">
            {pokemonEntry.name}
          </span>
                    {englishName && (
                        <span className="block text-sm text-gray-500">{englishName}</span>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                <button
                    onClick={() => updateCounter(pokemonEntry.id, -1)}
                    className="bg-red-500 text-white font-semibold px-5 py-2 rounded-md shadow-md transition-all transform hover:scale-105 hover:bg-red-600 active:scale-95 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={pokemonEntry.count === 0}
                >
                    −
                </button>
                {/* Feste Größe für den Counter, damit alle Zähler gleich groß sind */}
                <span className="w-20 h-10 flex items-center justify-center text-lg font-bold text-gray-900 bg-gray-100 rounded-lg shadow-md">
          {pokemonEntry.count}
        </span>
                <button
                    onClick={() => updateCounter(pokemonEntry.id, +1)}
                    className="bg-green-500 text-white font-semibold px-5 py-2 rounded-md shadow-md transition-all transform hover:scale-105 hover:bg-green-600 active:scale-95 cursor-pointer"
                >
                    +
                </button>
            </div>
        </Card>
    );
}

export default function Home() {
    const [pokemonName, setPokemonName] = useState("");
    const [counters, setCounters] = useState<
        { id: string; name: string; count: number; created_at: string }[]
    >([]);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(
        null
    );

    // Hilfsfunktion: Gibt den englischen Namen anhand des deutschen Namens zurück
    const getEnglishName = (germanName: string) => {
        const index = germanPokemonNames.findIndex(
            (name) => name.toLowerCase() === germanName.toLowerCase()
        );
        return index !== -1 ? englishPokemonNames[index] : "";
    };

    // Laden der Einträge aus Supabase
    useEffect(() => {
        const fetchPokemon = async () => {
            const { data, error } = await supabase
                .from("pokemon_counters")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) console.error("Fehler beim Laden:", error);
            else setCounters(data || []);
        };

        fetchPokemon();
    }, []);

    const addPokemon = async () => {
        const trimmedName = pokemonName.trim();
        if (trimmedName !== "") {
            const { data, error } = await supabase
                .from("pokemon_counters")
                .insert([{ name: trimmedName, count: 0, created_at: new Date() }])
                .select()
                .order("created_at", { ascending: false });
            if (error) {
                console.error(error);
            } else if (data) {
                setCounters((prev) => [...data, ...prev]);
            }
            setPokemonName("");
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

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { error } = await supabase
            .from("pokemon_counters")
            .delete()
            .eq("id", deleteTarget.id);
        if (error) {
            console.error("Fehler beim Löschen:", error);
        } else {
            setCounters((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        }
        setDeleteTarget(null);
    };

    return (
        <Layout>
            <div className="max-w-lg mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
                    Shiny Pokémon Counter
                </h1>

                {/* Eingabe für neues Pokémon */}
                <div className="flex space-x-2 mb-6">
                    <Input
                        type="text"
                        value={pokemonName}
                        onChange={(e) => setPokemonName(e.target.value)}
                        placeholder="Pokémon eingeben..."
                        className="border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                        onClick={addPokemon}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-transform transform hover:scale-105 hover:bg-blue-700 cursor-pointer"
                    >
                        Hinzufügen
                    </Button>
                </div>

                {/* Liste der Pokémon mit Countern */}
                <div className="space-y-4">
                    {counters.map((p) => {
                        const englishName = getEnglishName(p.name);
                        return (
                            <PokemonCard
                                key={p.id}
                                pokemonEntry={p}
                                englishName={englishName}
                                updateCounter={updateCounter}
                                setDeleteTarget={setDeleteTarget}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Lösch-Bestätigungsdialog */}
            {deleteTarget && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-lg font-bold text-gray-900 text-center">
                            Pokémon freilassen?
                        </h2>
                        <p className="text-sm text-gray-700 text-center my-3">
                            Bist du sicher, dass du <strong>{deleteTarget.name}</strong> in die Wildnis
                            entlassen möchtest? <br />
                            <span className="italic text-gray-500">
                &#34;Ein wildes {deleteTarget.name} verschwand in hohem Gras...&#34;
              </span>
                        </p>
                        <div className="flex justify-center space-x-4 mt-4">
                            <Button
                                onClick={confirmDelete}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                            >
                                Ja, freilassen
                            </Button>
                            <Button
                                onClick={() => setDeleteTarget(null)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                            >
                                Abbrechen
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
