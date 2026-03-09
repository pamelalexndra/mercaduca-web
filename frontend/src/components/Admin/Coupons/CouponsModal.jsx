import { useState } from "react";

export default function CouponModal({ onClose }) {
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    category: "",
    startDate: "",
    endDate: "",
    combinable: true,
    active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Cupón creado:", form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[600px] max-w-full mx-4 rounded-2xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-serif text-[#557051] mb-6">Crear cupón</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="code"
            placeholder="Código del cupón"
            value={form.code}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]"
            required
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]"
          >
            <option value="PERCENTAGE">Descuento porcentual (%)</option>
            <option value="FIXED">Monto fijo ($)</option>
          </select>

          <input
            type="number"
            name="value"
            placeholder="Valor del descuento"
            value={form.value}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]"
            required
          />

          <input
            type="text"
            name="category"
            placeholder="Categoría (ej: Galletas)"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]"
            required
          />

          <div className="flex gap-4">
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]"
              required
            />
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm mt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="combinable"
                checked={form.combinable}
                onChange={handleChange}
                className="accent-[#557051]"
              />
              Permitir combinación
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="accent-[#557051]"
              />
              Activo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 font-semibold transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#557051] text-white font-semibold hover:opacity-90 transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
