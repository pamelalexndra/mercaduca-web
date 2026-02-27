import React, { useState, useEffect, useRef } from "react";
import { X, Truck, CheckCircle2, Package, MapPin, ChevronLeft } from "lucide-react";
import { API_BASE_URL } from "../utils/api";

// Pasos del formulario
const STEPS = {
  ADDRESS: "address",
  QUOTE: "quote",
  CONFIRM: "confirm",
  SUCCESS: "success",
};

export default function ShippingCheckoutModal({
  visible,
  onClose,
  product,
  emprendimiento,
}) {
  const modalRef = useRef();

  // Estados
  const [step, setStep] = useState(STEPS.ADDRESS);
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [shipmentNumber, setShipmentNumber] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    completeName: "",
    email: "",
    customerPhone: "",
    customerAddress: "",
    customerReferencePoint: "",
    stateId: "",
    cityId: "",
  });

  const inputClass =
    "w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border border-gray-200 transition-all placeholder:text-gray-400";

  const selectedState = states.find((s) => s.id === form.stateId);
  const cities = selectedState?.Cities || [];

  // Reset y carga inicial
  useEffect(() => {
    if (visible) {
      setStep(STEPS.ADDRESS);
      setSelectedCourier(null);
      setError("");
      fetchStates();
    }
  }, [visible]);

  const fetchStates = async () => {
    try {
      setLoadingStates(true);
      const res = await fetch(`${API_BASE_URL}/boxful/states`);
      const data = await res.json();
      setStates(data.states || []);
    } catch {
      setError("No se pudieron cargar los departamentos.");
    } finally {
      setLoadingStates(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "stateId" ? { cityId: "" } : {}),
    }));
    setError("");
  };

  const handleBackgroundClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const isAddressFormValid = () => {
    return (
      form.completeName.trim() &&
      form.customerPhone.trim() &&
      form.stateId &&
      form.cityId &&
      form.customerAddress.trim() &&
      form.customerReferencePoint.trim()
    );
  };

  // 1. Guardar dirección y Cotizar
  const handleGetQuote = async () => {
    if (!isAddressFormValid()) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (!emprendimiento?.boxful_city_id) {
      setError(
        "El emprendimiento no tiene configurada su zona de origen para envíos."
      );
      return;
    }

    setLoadingQuote(true);
    setError("");

    try {
      const addressPayload = {
        address: form.customerAddress,
        referencePoint: form.customerReferencePoint,
        latitude: 13.6929, 
        longitude: -89.2182,
        stateId: form.stateId,
        cityId: form.cityId,
        addressPhone: form.customerPhone,
        addressAreaCode: "503"
      };
      await fetch(`${API_BASE_URL}/boxful/address`, { method: "POST", body: JSON.stringify(addressPayload), headers: { "Content-Type": "application/json" } });

      // Obtener cotización
      const res = await fetch(`${API_BASE_URL}/boxful/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recollectionCityId: emprendimiento.boxful_city_id,
          customerCityId: form.cityId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCouriers(data.couriers || []);
      setStep(STEPS.QUOTE);
    } catch (err) {
      setError(err.message || "Error al calcular el costo de envío.");
    } finally {
      setLoadingQuote(false);
    }
  };

  // 2. Confirmar Orden
  const handleConfirmOrder = async () => {
    if (!selectedCourier) return;

    setLoadingOrder(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/boxful/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completeName: form.completeName,
          email: form.email,
          customerPhone: form.customerPhone,
          customerAddress: form.customerAddress,
          customerReferencePoint: form.customerReferencePoint,
          customerCityId: form.cityId,
          courierId: selectedCourier.id,
          shippingCost: selectedCourier.clientPrice,
          productId: product.id,
          productName: product.nombre,
          productPrice: product.precio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setShipmentNumber(data.shipmentNumber);
      setStep(STEPS.SUCCESS);
    } catch (err) {
      setError(err.message || "Error al procesar la orden.");
    } finally {
      setLoadingOrder(false);
    }
  };

  if (!visible || !product) return null;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center bg-black/70 backdrop-blur-sm z-[50] animate-fade-in pt-16 sm:pt-20 px-4"
      onClick={handleBackgroundClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full sm:w-[520px] max-h-[85vh] overflow-y-auto relative shadow-2xl animate-slide-up border border-zinc-200 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Fijo */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-zinc-100 p-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            {step === STEPS.ADDRESS && (
              <div className="bg-[#557051]/10 p-2 rounded-lg text-[#557051]">
                <MapPin size={20} />
              </div>
            )}
            {step === STEPS.QUOTE && (
              <button
                onClick={() => setStep(STEPS.ADDRESS)}
                className="bg-zinc-100 p-2 rounded-lg text-zinc-600 hover:bg-zinc-200 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {(step === STEPS.CONFIRM || step === STEPS.SUCCESS) && (
              <div className="bg-[#557051]/10 p-2 rounded-lg text-[#557051]">
                <Package size={20} />
              </div>
            )}
            <h2 className="font-semibold text-gray-900 font-montserrat">
              {step === STEPS.ADDRESS && "Información de entrega"}
              {step === STEPS.QUOTE && "Selecciona tu envío"}
              {step === STEPS.CONFIRM && "Confirma tu pedido"}
              {step === STEPS.SUCCESS && "¡Pedido Exitoso!"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all rounded-full p-2"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 font-montserrat space-y-6 flex-1">
          {/* Tarjeta de Producto (Oculta en success) */}
          {step !== STEPS.SUCCESS && (
            <div className="flex items-center gap-4 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
              <img
                src={product.imagen || "https://via.placeholder.com/60"}
                alt={product.nombre}
                className="w-16 h-16 rounded-lg object-cover bg-white shadow-sm"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 leading-tight">
                  {product.nombre}
                </p>
                <p className="text-sm text-zinc-500 mt-0.5">
                  Vendido por {emprendimiento?.nombre || "Emprendedor"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#557051] text-lg">
                  ${parseFloat(product.precio).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* ── PASO 1: DIRECCIÓN ── */}
          {step === STEPS.ADDRESS && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex gap-3">
                <Truck className="shrink-0" size={20} />
                <p>
                  Pago <strong>Contra Entrega</strong>. Pagarás el total al
                  recibir tu producto.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700">
                  Nombre de quien recibe *
                </label>
                <input
                  name="completeName"
                  value={form.completeName}
                  onChange={handleChange}
                  placeholder="Ej. María López"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-zinc-700">
                    Teléfono *
                  </label>
                  <div className="flex gap-2">
                    <span className="bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-xl px-3 py-3 text-sm flex items-center">
                      +503
                    </span>
                    <input
                      name="customerPhone"
                      value={form.customerPhone}
                      onChange={handleChange}
                      placeholder="7000-0000"
                      maxLength={8}
                      className={`${inputClass} flex-1`}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-zinc-700">
                    Correo (Opcional)
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-zinc-700">
                    Departamento *
                  </label>
                  <select
                    name="stateId"
                    value={form.stateId}
                    onChange={handleChange}
                    className={inputClass}
                    disabled={loadingStates}
                  >
                    <option value="">Selecciona...</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-zinc-700">
                    Municipio *
                  </label>
                  <select
                    name="cityId"
                    value={form.cityId}
                    onChange={handleChange}
                    disabled={!form.stateId}
                    className={`${inputClass} disabled:opacity-50 disabled:bg-zinc-100`}
                  >
                    <option value="">Selecciona...</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700">
                  Dirección Exacta *
                </label>
                <input
                  name="customerAddress"
                  value={form.customerAddress}
                  onChange={handleChange}
                  placeholder="Colonia, Calle, Pasaje, Número de casa..."
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700">
                  Punto de Referencia *
                </label>
                <input
                  name="customerReferencePoint"
                  value={form.customerReferencePoint}
                  onChange={handleChange}
                  placeholder="Ej. Casa color verde frente a parque"
                  className={inputClass}
                />
              </div>

              <button
                onClick={handleGetQuote}
                disabled={loadingQuote || !isAddressFormValid()}
                className="w-full mt-4 bg-gradient-to-r from-[#557051] to-[#6B8E5E] text-white rounded-xl py-3.5 text-sm font-semibold hover:from-[#496345] hover:to-[#5A7750] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
              >
                {loadingQuote ? "Calculando opciones..." : "Continuar a envíos"}
                {!loadingQuote && <ChevronLeft className="rotate-180" size={18} />}
              </button>
            </div>
          )}

          {/* ── PASO 2: COTIZACIONES ── */}
          {step === STEPS.QUOTE && (
            <div className="space-y-4 animate-fade-in">
              {couriers.length === 0 ? (
                <div className="text-center py-8 bg-zinc-50 rounded-xl border border-zinc-200">
                  <Truck className="mx-auto text-zinc-300 mb-2" size={32} />
                  <p className="text-zinc-600 font-medium">
                    No hay paqueterías disponibles
                  </p>
                  <p className="text-zinc-500 text-sm mt-1">
                    Lo sentimos, no hay cobertura para esta ruta.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {couriers.map((courier) => {
                    const isSelected = selectedCourier?.id === courier.id;
                    return (
                      <button
                        key={courier.id}
                        onClick={() => setSelectedCourier(courier)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${isSelected
                            ? "border-[#557051] bg-[#557051]/5"
                            : "border-zinc-200 hover:border-zinc-300 bg-white"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border border-zinc-100 p-1">
                            <img
                              src={courier.logo}
                              alt={courier.name}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900">
                              {courier.name}
                            </p>
                            <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-medium inline-block mt-1">
                              {courier.deliveryType === "same-day"
                                ? "Entrega hoy mismo"
                                : "Día siguiente"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#557051] text-lg">
                            ${courier.clientPrice.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => setStep(STEPS.CONFIRM)}
                disabled={!selectedCourier}
                className="w-full mt-6 bg-gradient-to-r from-[#557051] to-[#6B8E5E] text-white rounded-xl py-3.5 text-sm font-semibold hover:from-[#496345] hover:to-[#5A7750] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Revisar pedido
              </button>
            </div>
          )}

          {/* ── PASO 3: CONFIRMAR ── */}
          {step === STEPS.CONFIRM && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-200 space-y-4">
                <h3 className="font-semibold text-zinc-900 border-b border-zinc-200 pb-2">
                  Detalles del destino
                </h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-zinc-500">Recibe:</span>
                  <span className="font-medium text-zinc-900 col-span-2">
                    {form.completeName} ({form.customerPhone})
                  </span>

                  <span className="text-zinc-500">Dirección:</span>
                  <span className="font-medium text-zinc-900 col-span-2">
                    {form.customerAddress}, {cities.find(c => c.id === form.cityId)?.name}, {selectedState?.name}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-[#557051]/20 shadow-sm space-y-3">
                <h3 className="font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
                  Resumen de Pago (Contra Entrega)
                </h3>
                <div className="flex justify-between text-zinc-600 text-sm">
                  <span>Subtotal producto</span>
                  <span>${parseFloat(product.precio).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-600 text-sm">
                  <span>Envío ({selectedCourier?.name})</span>
                  <span>${selectedCourier?.clientPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-[#557051] border-t border-zinc-100 pt-3 mt-1">
                  <span>Total a pagar</span>
                  <span>
                    $
                    {(
                      parseFloat(product.precio) +
                      (selectedCourier?.clientPrice || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(STEPS.QUOTE)}
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={loadingOrder}
                  className="flex-1 bg-gradient-to-r from-[#557051] to-[#6B8E5E] text-white rounded-xl py-3.5 text-sm font-semibold hover:from-[#496345] hover:to-[#5A7750] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loadingOrder ? "Confirmando..." : "Confirmar Pedido"}
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 4: ÉXITO ── */}
          {step === STEPS.SUCCESS && (
            <div className="text-center py-8 space-y-6 animate-slide-up">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-[#557051]" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-zinc-900">¡Pedido Confirmado!</h3>
                <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
                  Tu orden ha sido registrada. Pagarás al momento de recibir el producto en tu domicilio.
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 inline-block min-w-[250px]">
                <p className="text-sm text-zinc-500 mb-1">Número de Guía</p>
                <p className="font-mono font-bold text-2xl tracking-wider text-zinc-800">
                  {shipmentNumber}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-zinc-900 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-lg mt-4"
              >
                Cerrar y volver a la tienda
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}