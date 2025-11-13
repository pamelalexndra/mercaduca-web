import React, { useEffect, useState } from "react";
import Card from "./Card";

export default function Emprendedores({ onGoHome }) {
    const [emprendimientos, setEmprendimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener emprendimientos
    const fetchEmprendimientos = async () => {
        try {
            setError(null);
            const response = await fetch("http://localhost:5000/api/emprendimientos");
            if (!response.ok) throw new Error("Error al cargar los emprendimientos");
            const data = await response.json();

            const lista = Array.isArray(data) ? data : data.emprendimientos || [];
            setEmprendimientos(lista);
        } catch (err) {
            console.error("Error cargando emprendimientos:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmprendimientos();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto max-w-6xl px-6 py-8 text-center">
                <div className="text-lg">Cargando catálogo...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto max-w-6xl px-6 py-8 text-center">
                <div className="text-red-500">Error: {error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <>
            <section className="mx-auto max-w-6xl px-6 py-8">
                <h2 className="text-3xl font-bold text-center font-loubag">
                    Emprendimientos
                </h2>
                <p className="text-center text-zinc-600 mt-2">
                </p>
            </section>

            <section className="mx-auto max-w-6xl px-6 pb-16">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {emprendimientos.map((p) => (
                        <Card key={p.id} p={p} />
                    ))}
                </div>

                {emprendimientos.length === 0 && !loading && (
                    <div className="text-center py-8 text-zinc-500">
                        No se encontraron productos
                    </div>
                )}

                <div className="mt-10 flex flex-col items-center gap-4">
                    <button
                        onClick={onGoHome}
                        className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 transition text-zinc-600"
                    >
                        Regresar a Inicio
                    </button>
                </div>
            </section>
        </>
    );
}