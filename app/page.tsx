"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Trash2, Plus } from "lucide-react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import pokemon from "pokemon";
import { Fireworks } from "fireworks-js";

// Importiere die Spiele aus deiner JSON-Datei:
import pokemonGames from "../data/games.json";

const germanPokemonNames = pokemon.all("de");
const englishPokemonNames = pokemon.all();

// Kombinierte Liste (als Set, um Duplikate zu vermeiden)
const allPokemonNames = [...new Set([...germanPokemonNames, ...englishPokemonNames])];

interface PokemonEntry {
    id: string;
    name: string;
    count: number;
    created_at: string;
    method: string;
    status: string; // "open" oder "closed"
    game: string | null; // Neu: game-Feld
}

function PokemonCard({
                         pokemonEntry,
                         englishName,
                         updateCounter,
                         updateMethod,
                         closeSearch,
                         reopenSearch,
                         setDeleteTarget,
                         updateGame,
                     }: {
    pokemonEntry: PokemonEntry;
    englishName: string;
    updateCounter: (id: string, delta: number) => void;
    updateMethod: (id: string, newMethod: string) => void;
    closeSearch: (id: string) => void;
    reopenSearch: (id: string) => void;
    setDeleteTarget: (target: { id: string; name: string } | null) => void;
    updateGame: (id: string, newGame: string) => void;
}) {
    const [spriteUrl, setSpriteUrl] = useState<string | null>(null);

    // Lokaler State fürs manuelle Bearbeiten des Counters
    const [isEditingCount, setIsEditingCount] = useState(false);
    const [tempCount, setTempCount] = useState(String(pokemonEntry.count));

    useEffect(() => {
        setTempCount(String(pokemonEntry.count));
    }, [pokemonEntry.count]);

    // Shiny-Sprite laden
    useEffect(() => {
        if (englishName) {
            fetch(`https://pokeapi.co/api/v2/pokemon/${englishName.toLowerCase()}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.sprites?.front_shiny) {
                        setSpriteUrl(data.sprites.front_shiny);
                    }
                })
                .catch((err) => console.error("Fehler beim Laden des Shiny Sprites:", err));
        }
    }, [englishName]);

    // Speichert den neuen Zählerwert
    const saveNewCount = () => {
        const newValue = parseInt(tempCount, 10);
        if (isNaN(newValue)) {
            setTempCount(String(pokemonEntry.count));
        } else {
            const delta = newValue - pokemonEntry.count;
            if (delta !== 0) {
                updateCounter(pokemonEntry.id, delta);
            }
        }
        setIsEditingCount(false);
    };

    // Ist der Eintrag abgeschlossen?
    const isClosed = pokemonEntry.status === "closed";

    // Feuerwerk-Effekt, wenn `status = "closed"`
    useEffect(() => {
        if (isClosed) {
            const container = document.getElementById(`fireworks-${pokemonEntry.id}`);
            if (!container) return;

            const fireworks = new Fireworks(container, {
                hue: { min: 0, max: 345 },
                delay: { min: 15, max: 15 },
                acceleration: 1.05,
                friction: 0.98,
                gravity: 1,
                particles: 50,
                explosion: 5,
                autoresize: true,
                brightness: { min: 50, max: 80 },
                boundaries: {
                    x: 0,
                    y: 0,
                    width: container.clientWidth,
                    height: container.clientHeight,
                },
            });

            fireworks.start();
            const timer = setTimeout(() => fireworks.stop(), 3000);

            return () => {
                fireworks.stop();
                clearTimeout(timer);
            };
        }
    }, [isClosed, pokemonEntry.id]);

    return (
        <Card
            className={`relative p-5 shadow-lg rounded-xl transition-all transform hover:scale-105 hover:shadow-xl fade-in ${
                isClosed ? "bg-yellow-200" : "bg-white"
            }`}
        >
            {/* Mülleimer-Icon zum Löschen */}
            <button
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-transform transform hover:scale-110 cursor-pointer"
                onClick={() => setDeleteTarget({ id: pokemonEntry.id, name: pokemonEntry.name })}
            >
                <Trash2 size={20} />
            </button>

            {/* Feuerwerk-Overlay, falls geschlossen */}
            {isClosed && (
                <div
                    id={`fireworks-${pokemonEntry.id}`}
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                />
            )}

            {/* Layout: Links Sprite + Namen + Spiel, Rechts Counter + Methode + Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                {/* Linke Spalte */}
                <div className="flex flex-col items-center">
                    {spriteUrl && (
                        <img
                            src={spriteUrl}
                            alt={`Shiny sprite of ${englishName}`}
                            className="w-36 h-36 mb-2"
                        />
                    )}
                    {/* Deutscher Name */}
                    <span className="text-lg font-semibold text-gray-800">
            {pokemonEntry.name}
          </span>
                    {/* Englischer Name */}
                    {englishName && (
                        <span className="text-sm text-gray-500">{englishName}</span>
                    )}

                    {/* Spiel-Dropdown unter den Namen */}
                    <div className="w-[200px] mt-2">
                        <Select
                            value={pokemonEntry.game || ""}
                            onValueChange={(val) => updateGame(pokemonEntry.id, val)}
                            disabled={isClosed}
                        >
                            <SelectTrigger className="cursor-pointer">
                                <SelectValue placeholder="Spiel auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                {pokemonGames.map((g) => (
                                    <SelectItem key={g.name} value={g.name}>
                                        {g.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Rechte Spalte */}
                <div className="flex flex-col items-center gap-4">
                    {/* Counter-Bereich */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => updateCounter(pokemonEntry.id, -1)}
                            className="bg-red-500 text-white font-semibold px-5 py-2 rounded-md shadow-md transition-all transform hover:scale-105 hover:bg-red-600 active:scale-95 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={isClosed || pokemonEntry.count === 0}
                        >
                            −
                        </button>
                        {isEditingCount && !isClosed ? (
                            <input
                                type="number"
                                autoFocus
                                value={tempCount}
                                onChange={(e) => setTempCount(e.target.value)}
                                onBlur={saveNewCount}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.currentTarget.blur();
                                    }
                                }}
                                className="w-20 h-10 text-center text-lg font-bold text-gray-900 bg-gray-100 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <span
                                onClick={() => {
                                    if (!isClosed) setIsEditingCount(true);
                                }}
                                className={`w-20 h-10 flex items-center justify-center text-lg font-bold text-gray-900 bg-gray-100 rounded-lg shadow-md ${
                                    isClosed ? "" : "cursor-pointer hover:bg-gray-200"
                                }`}
                                title="Klicken, um manuell zu ändern"
                            >
                {pokemonEntry.count}
              </span>
                        )}
                        <button
                            onClick={() => updateCounter(pokemonEntry.id, +1)}
                            className="bg-green-500 text-white font-semibold px-5 py-2 rounded-md shadow-md transition-all transform hover:scale-105 hover:bg-green-600 active:scale-95 cursor-pointer"
                            disabled={isClosed}
                        >
                            +
                        </button>
                    </div>

                    {/* Methode-Dropdown */}
                    <div className="w-[130px]">
                        <Select
                            value={pokemonEntry.method || ""}
                            onValueChange={(newMethod) => updateMethod(pokemonEntry.id, newMethod)}
                            disabled={isClosed}
                        >
                            <SelectTrigger className="cursor-pointer">
                                <SelectValue placeholder="Methode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Masuda">Masuda</SelectItem>
                                <SelectItem value="Egg">Ei</SelectItem>
                                <SelectItem value="Reset">Softreset</SelectItem>
                                <SelectItem value="Chain">Chain</SelectItem>
                                <SelectItem value="PokeRadar">PokéRadar</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Button für Suche beenden / wieder öffnen */}
                    {pokemonEntry.status === "closed" ? (
                        <Button
                            onClick={() => reopenSearch(pokemonEntry.id)}
                            className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
                        >
                            Wieder öffnen
                        </Button>
                    ) : (
                        <Button
                            onClick={() => closeSearch(pokemonEntry.id)}
                            className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-yellow-600 transition cursor-pointer"
                        >
                            Suche beenden
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

export default function Home() {
    const [pokemonName, setPokemonName] = useState("");
    const [counters, setCounters] = useState<PokemonEntry[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    // Filter-States für "Offen" & "Beendet"
    const [filterOpenActive, setFilterOpenActive] = useState(false);
    const [filterClosedActive, setFilterClosedActive] = useState(false);

    // Hilfsfunktion: Gibt den offiziellen englischen Namen zurück.
    const getEnglishName = (inputName: string) => {
        const lowerName = inputName.toLowerCase();
        const indexInGerman = germanPokemonNames.findIndex(
            (name) => name.toLowerCase() === lowerName
        );
        if (indexInGerman !== -1) {
            return englishPokemonNames[indexInGerman];
        }
        const indexInEnglish = englishPokemonNames.findIndex(
            (name) => name.toLowerCase() === lowerName
        );
        if (indexInEnglish !== -1) {
            return englishPokemonNames[indexInEnglish];
        }
        return "";
    };

    // Daten laden
    useEffect(() => {
        const fetchPokemon = async () => {
            const { data, error } = await supabase
                .from("pokemon_counters")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) console.error("Fehler beim Laden:", error);
            else setCounters((data as PokemonEntry[]) || []);
        };
        fetchPokemon();
    }, []);

    // Neues Pokémon
    const addPokemon = async () => {
        const trimmedName = pokemonName.trim();
        if (!trimmedName) {
            setErrorMessage(
                "Hey Trainer, ohne Namen kann dein Pokémon nicht auftauchen! Versuch's nochmal."
            );
            return;
        }

        const allowed = allPokemonNames.map((n) => n.toLowerCase());
        if (!allowed.includes(trimmedName.toLowerCase())) {
            setErrorMessage(
                "Oh nein! Dieses Pokémon ist so geheim, dass selbst Professor Eich es nicht im Pokedex finden konnte. Bitte gib einen bekannten Namen ein!"
            );
            return;
        }
        setErrorMessage("");

        const { data, error } = await supabase
            .from("pokemon_counters")
            .insert([
                {
                    name: trimmedName,
                    count: 0,
                    created_at: new Date(),
                    method: "",
                    status: "open",
                    game: "", // Default-Wert
                },
            ])
            .select()
            .order("created_at", { ascending: false });
        if (error) {
            console.error(error);
        } else if (data) {
            setCounters((prev) => [...data, ...prev]);
        }
        setPokemonName("");
    };

    // Zähler ändern
    const updateCounter = async (id: string, delta: number) => {
        const entry = counters.find((p) => p.id === id);
        if (!entry) return;
        const newCount = entry.count + delta;

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

    // Methode ändern
    const updateMethod = async (id: string, newMethod: string) => {
        const { error } = await supabase
            .from("pokemon_counters")
            .update({ method: newMethod })
            .eq("id", id);
        if (error) console.error("Fehler beim Aktualisieren der Methode:", error);
        else {
            setCounters((prev) =>
                prev.map((p) => (p.id === id ? { ...p, method: newMethod } : p))
            );
        }
    };

    // Spiel ändern
    const updateGame = async (id: string, newGame: string) => {
        const { error } = await supabase
            .from("pokemon_counters")
            .update({ game: newGame })
            .eq("id", id);
        if (error) {
            console.error("Fehler beim Aktualisieren des Spiels:", error);
        } else {
            setCounters((prev) =>
                prev.map((p) => (p.id === id ? { ...p, game: newGame } : p))
            );
        }
    };

    // Suche abschließen
    const closeSearch = async (id: string) => {
        const entry = counters.find((p) => p.id === id);
        if (!entry) return;

        const { error } = await supabase
            .from("pokemon_counters")
            .update({ status: "closed" })
            .eq("id", id);
        if (error) {
            console.error("Fehler beim Schließen der Suche:", error);
        } else {
            setCounters((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status: "closed" } : p))
            );
        }
    };

    // Suche wieder öffnen
    const reopenSearch = async (id: string) => {
        const entry = counters.find((p) => p.id === id);
        if (!entry) return;

        const { error } = await supabase
            .from("pokemon_counters")
            .update({ status: "open" })
            .eq("id", id);
        if (error) {
            console.error("Fehler beim Wiederöffnen:", error);
        } else {
            setCounters((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status: "open" } : p))
            );
        }
    };

    // Löschen
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { error } = await supabase
            .from("pokemon_counters")
            .delete()
            .eq("id", deleteTarget.id);
        if (error) console.error(error);
        else {
            setCounters((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        }
        setDeleteTarget(null);
    };

    // Filter-Logik
    let filteredCounters = counters;
    if (filterOpenActive && !filterClosedActive) {
        filteredCounters = counters.filter((p) => p.status === "open");
    } else if (!filterOpenActive && filterClosedActive) {
        filteredCounters = counters.filter((p) => p.status === "closed");
    }
    // Wenn beide oder keine => alle

    return (
        <Layout>
            <div className="max-w-lg mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
                    Shiny Pokémon Counter
                </h1>

                {/* Formular */}
                <div className="flex flex-col space-y-2 mb-6">
                    <div className="flex space-x-2">
                        <Input
                            type="text"
                            list="pokemonSuggestions"
                            value={pokemonName}
                            onChange={(e) => setPokemonName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    addPokemon();
                                }
                            }}
                            placeholder="Pokémon eingeben..."
                            className="border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                            onClick={addPokemon}
                            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-transform transform hover:scale-105 hover:bg-blue-700 cursor-pointer flex items-center"
                        >
                            <Plus size={16} className="mr-2" /> Hinzufügen
                        </Button>
                    </div>
                    {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
                    <datalist id="pokemonSuggestions">
                        {allPokemonNames.map((name) => (
                            <option key={name} value={name} />
                        ))}
                    </datalist>
                </div>

                {/* Filter-Badges */}
                <div className="flex space-x-2 mb-4">
                    <Badge
                        variant="outline"
                        className={`cursor-pointer px-3 py-1 rounded-full transition-colors ${
                            filterOpenActive
                                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-500"
                                : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setFilterOpenActive(!filterOpenActive)}
                    >
                        Offen
                    </Badge>
                    <Badge
                        variant="outline"
                        className={`cursor-pointer px-3 py-1 rounded-full transition-colors ${
                            filterClosedActive
                                ? "bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-500"
                                : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setFilterClosedActive(!filterClosedActive)}
                    >
                        Beendet
                    </Badge>
                </div>

                {/* Gefilterte Liste */}
                <div className="space-y-4">
                    {filteredCounters.map((p) => {
                        const englishName = getEnglishName(p.name);
                        return (
                            <PokemonCard
                                key={p.id}
                                pokemonEntry={p}
                                englishName={englishName}
                                updateCounter={updateCounter}
                                updateMethod={updateMethod}
                                updateGame={updateGame}   // Neu
                                closeSearch={closeSearch}
                                reopenSearch={reopenSearch}
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
                            entlassen möchtest?
                            <br />
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
