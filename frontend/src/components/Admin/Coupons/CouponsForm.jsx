import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { API_BASE_URL } from "../../../utils/api.js";

export default function CouponForm({ cupon, onClose, onSuccess }) {
  const [form, setForm] = useState({
    nombre: "",
    descuento: "",
    descripcion: "",
    imagen_url: "",
    fecha_limite: "",
    id_emprendimiento: "",
    id_categoria: "",
    id_producto: "",
  });

  const [emprendimientos, setEmprendimientos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState("");

  const hoy = new Date();
  const añoSiguiente = new Date();
  añoSiguiente.setFullYear(hoy.getFullYear() + 1);

  const fechaMinima = hoy.toISOString().split("T")[0];
  const fechaMaxima = añoSiguiente.toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, catRes, prodRes] = await Promise.all([
          fetch(`${API_BASE_URL}/entrepreneurship`),
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/products`),
        ]);

        const empData = await empRes.json();
        const catData = await catRes.json();
        const prodData = await prodRes.json();

        const emprendimientosRaw = empData.emprendimientos || [];
        const categoriasRaw = catData.data || [];
        const productosRaw = prodData.productos || [];

        const emprendimientosArray = emprendimientosRaw
          .filter((emp) => emp && emp.id !== null && emp.id !== undefined)
          .map((emp) => ({
            ...emp,
            id_emprendimiento: String(emp.id),
            nombre: emp.nombre,
          }));

        const categoriasArray = categoriasRaw
          .filter(
            (cat) =>
              cat &&
              cat.id_categoria !== null &&
              cat.id_categoria !== undefined,
          )
          .map((cat) => ({
            ...cat,
            id_categoria: String(cat.id_categoria),
          }));

        const productosArray = productosRaw
          .filter((prod) => prod && prod.id !== null && prod.id !== undefined)
          .map((prod) => ({
            ...prod,
            id_producto: String(prod.id),
            nombre: prod.nombre,
          }));

        setEmprendimientos(emprendimientosArray);
        setCategorias(categoriasArray);
        setProductos(productosArray);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (cupon) {
      let fechaFormateada = "";
      if (cupon.fecha_limite) {
        const fecha = new Date(cupon.fecha_limite);
        fechaFormateada = fecha.toISOString().split("T")[0];
      }

      setForm({
        nombre: cupon.nombre || "",
        descuento: cupon.descuento || "",
        descripcion: cupon.descripcion || "",
        imagen_url: cupon.imagen_url || "",
        fecha_limite: fechaFormateada,
        id_emprendimiento: cupon.id_emprendimiento
          ? String(cupon.id_emprendimiento)
          : "",
        id_categoria: cupon.id_categoria ? String(cupon.id_categoria) : "",
        id_producto: cupon.id_producto ? String(cupon.id_producto) : "",
      });
    }
  }, [cupon]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "descuento") {
      if (
        value === "" ||
        (parseFloat(value) >= 1 && parseFloat(value) <= 100)
      ) {
        setForm({
          ...form,
          [name]: value,
        });
      }
    } else {
      if (name === "id_emprendimiento") {
        setForm({
          ...form,
          id_emprendimiento: value,
          id_categoria: "",
          id_producto: "",
        });
      } else if (name === "id_categoria") {
        setForm({
          ...form,
          id_emprendimiento: "",
          id_categoria: value,
          id_producto: "",
        });
      } else if (name === "id_producto") {
        setForm({
          ...form,
          id_emprendimiento: "",
          id_categoria: "",
          id_producto: value,
        });
      } else {
        setForm({
          ...form,
          [name]: value,
        });
      }
    }

    if (!touched[name]) {
      setTouched({
        ...touched,
        [name]: true,
      });
    }

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.nombre?.trim()) newErrors.nombre = "El nombre es obligatorio";

    if (!form.descuento) {
      newErrors.descuento = "El descuento es obligatorio";
    } else {
      const descuentoNum = parseFloat(form.descuento);
      if (isNaN(descuentoNum) || descuentoNum <= 0) {
        newErrors.descuento = "El descuento debe ser mayor a 0";
      } else if (descuentoNum > 100) {
        newErrors.descuento = "El descuento no puede ser mayor a 100%";
      }
    }

    if (!form.descripcion?.trim())
      newErrors.descripcion = "La descripción es obligatoria";
    if (!form.imagen_url?.trim())
      newErrors.imagen_url = "La URL de la imagen es obligatoria";

    if (!form.fecha_limite) {
      newErrors.fecha_limite = "La fecha límite es obligatoria";
    } else {
      const fechaLimite = new Date(form.fecha_limite);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaLimite < hoy) {
        newErrors.fecha_limite = "La fecha límite no puede ser en el pasado";
      }

      const unAñoDespues = new Date(hoy);
      unAñoDespues.setFullYear(hoy.getFullYear() + 1);

      if (fechaLimite > unAñoDespues) {
        newErrors.fecha_limite = "La fecha límite no puede ser mayor a un año";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasAlcanceSelected = () => {
    const tieneEmprendimiento =
      form.id_emprendimiento && form.id_emprendimiento !== "";
    const tieneCategoria = form.id_categoria && form.id_categoria !== "";
    const tieneProducto = form.id_producto && form.id_producto !== "";

    const seleccionados = [
      tieneEmprendimiento,
      tieneCategoria,
      tieneProducto,
    ].filter(Boolean).length;

    return seleccionados === 1;
  };

  const isFormValid = () => {
    if (!form.nombre?.trim()) return false;
    if (!form.descuento) return false;

    const descuentoNum = parseFloat(form.descuento);
    if (isNaN(descuentoNum) || descuentoNum <= 0 || descuentoNum > 100)
      return false;

    if (!form.descripcion?.trim()) return false;
    if (!form.imagen_url?.trim()) return false;
    if (!form.fecha_limite) return false;

    const fechaLimite = new Date(form.fecha_limite);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaLimite < hoy) return false;

    const unAñoDespues = new Date(hoy);
    unAñoDespues.setFullYear(hoy.getFullYear() + 1);

    if (fechaLimite > unAñoDespues) return false;

    if (!hasAlcanceSelected()) return false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!hasAlcanceSelected()) {
      setSubmitError(
        "Debes seleccionar UNA opción: emprendimiento, categoría O producto",
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const cuponData = {
        nombre: form.nombre,
        descuento: parseFloat(form.descuento),
        descripcion: form.descripcion,
        imagen_url: form.imagen_url,
        fecha_limite: form.fecha_limite,
        id_emprendimiento: form.id_emprendimiento
          ? parseInt(form.id_emprendimiento)
          : null,
        id_categoria: form.id_categoria ? parseInt(form.id_categoria) : null,
        id_producto: form.id_producto ? parseInt(form.id_producto) : null,
      };

      const url = cupon
        ? `${API_BASE_URL}/cupones/${cupon.id_cupon}`
        : `${API_BASE_URL}/cupones`;

      const response = await fetch(url, {
        method: cupon ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cuponData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar el cupón");
      }

      onSuccess(
        cupon
          ? "Cupón actualizado correctamente"
          : "Cupón creado correctamente",
      );
    } catch (error) {
      console.error("Error:", error);
      setSubmitError(error.message || "Error al guardar el cupón");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-[600px] max-w-full mx-4 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl md:text-2xl font-serif text-[#557051]">
            {cupon ? "Editar cupón" : "Crear cupón"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del cupón *
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border ${errors.nombre && touched.nombre ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]`}
              placeholder="Ej: Descuento especial"
            />
            {errors.nombre && touched.nombre && (
              <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descuento (%) *
            </label>
            <div className="relative">
              <input
                type="number"
                name="descuento"
                value={form.descuento}
                onChange={handleChange}
                onBlur={handleBlur}
                step="1"
                min="1"
                max="100"
                className={`w-full border ${errors.descuento && touched.descuento ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#557051]`}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
            {errors.descuento && touched.descuento && (
              <p className="text-red-500 text-xs mt-1">{errors.descuento}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Ingresa un porcentaje entre 1% y 100%
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="3"
              className={`w-full border ${errors.descripcion && touched.descripcion ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]`}
              placeholder="Describe los detalles del cupón..."
            />
            {errors.descripcion && touched.descripcion && (
              <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de la imagen *
            </label>
            <input
              type="url"
              name="imagen_url"
              value={form.imagen_url}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border ${errors.imagen_url && touched.imagen_url ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]`}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {errors.imagen_url && touched.imagen_url && (
              <p className="text-red-500 text-xs mt-1">{errors.imagen_url}</p>
            )}
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Para generar el enlace de tu imagen se recomienda iniciar sesion
                en{" "}
                <a
                  href="https://imgbb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#557051] hover:text-[#3a4d36] underline font-medium transition-colors"
                >
                  imgbb.com
                </a>{" "}
                para continuar con el proceso de creación o modificación.
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha límite *
            </label>
            <input
              type="date"
              name="fecha_limite"
              value={form.fecha_limite}
              onChange={handleChange}
              onBlur={handleBlur}
              min={fechaMinima}
              max={fechaMaxima}
              className={`w-full border ${errors.fecha_limite && touched.fecha_limite ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]`}
            />
            {errors.fecha_limite && touched.fecha_limite && (
              <p className="text-red-500 text-xs mt-1">{errors.fecha_limite}</p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Tipo de cupón (selecciona una opción):
            </p>

            {/* Caja de Emprendimiento */}
            <div className="border rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emprendimiento
              </label>
              <select
                name="id_emprendimiento"
                value={form.id_emprendimiento}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]"
              >
                <option value="">Seleccionar emprendimiento</option>
                {emprendimientos.map((emp) => (
                  <option
                    key={`emp-${emp.id_emprendimiento}`}
                    value={emp.id_emprendimiento}
                  >
                    {emp.nombre}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                El cupón será aplicado para todos los productos del
                emprendimiento seleccionado
              </p>
            </div>

            {/* Caja de Categoría */}
            <div className="border rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                name="id_categoria"
                value={form.id_categoria}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]"
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat) => (
                  <option
                    key={`cat-${cat.id_categoria}`}
                    value={cat.id_categoria}
                  >
                    {cat.categoria}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                El cupón será aplicado para todos los productos de la categoría
                seleccionada
              </p>
            </div>

            {/* Caja de Producto */}
            <div className="border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producto
              </label>
              <select
                name="id_producto"
                value={form.id_producto}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#557051]"
              >
                <option value="">Seleccionar producto</option>
                {productos.map((prod) => (
                  <option
                    key={`prod-${prod.id_producto}`}
                    value={prod.id_producto}
                  >
                    {prod.nombre}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                El cupón será aplicado para el producto seleccionado
              </p>
            </div>
          </div>

          {/* Mensaje de error general */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {submitError}
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 font-semibold transition order-2 sm:order-1"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="px-5 py-2.5 rounded-xl bg-[#557051] text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {loading ? "Guardando..." : cupon ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
