import React from 'react';
import { useParams } from 'react-router-dom';
import { useEmprendimiento } from '../../hooks/useEmprendimiento';
import ProductHeader from './ProductHeader';

export default function ProductDetail({ id }) {
    const { emprendimiento, loading, error } = useEmprendimiento(id);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Cargando emprendimiento...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Error</h2>
                    <p className="text-gray-600 mt-2">{error}</p>
                </div>
            </div>
        );
    }

    if (!emprendimiento) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Emprendimiento no encontrado</h2>
                    <p className="text-gray-600 mt-2">El emprendimiento que buscas no existe.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-center mb-8">
                    <ProductHeader
                        nombre={emprendimiento.nombre}
                        imagen={emprendimiento.imagen_url}
                        instagram={emprendimiento.instagram}
                    />
                </div>

                {/* Información adicional del emprendimiento */}
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Información de contacto */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Información de Contacto</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-gray-500">Teléfono</p>
                                    <p className="text-gray-800 font-medium">{emprendimiento.telefono || 'No disponible'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-gray-800 font-medium">{emprendimiento.correo || 'No disponible'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Instagram</p>
                                    <a
                                        href={`https://instagram.com/${emprendimiento.instagram?.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-500 hover:text-green-600 transition-colors"
                                    >
                                        {emprendimiento.instagram || 'No disponible'}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Contactar</h3>
                            <div className="space-y-3">
                                {emprendimiento.telefono && (
                                    <a
                                        href={`https://wa.me/502${emprendimiento.telefono}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl transition-colors text-center block"
                                    >
                                        WhatsApp
                                    </a>
                                )}

                                {emprendimiento.correo && (
                                    <a
                                        href={`mailto:${emprendimiento.correo}`}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl transition-colors text-center block"
                                    >
                                        Enviar Email
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Descripción (si la tienes en tu API) */}
                    {emprendimiento.descripcion && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {emprendimiento.descripcion}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}