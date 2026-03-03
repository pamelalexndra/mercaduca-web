export default function CouponTable({ coupons }) {
  if (!coupons.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="font-loubag text-lg text-[#557051] mb-2">
          No hay cupones registrados
        </p>
        <p className="font-montserrat text-sm">
          Aún no se han creado descuentos en el sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-[#f4f4f2] text-gray-600">
          <tr>
            <th className="p-4 text-left">Código</th>
            <th className="p-4 text-center">Tipo</th>
            <th className="p-4 text-center">Valor</th>
            <th className="p-4 text-center">Categoría</th>
            <th className="p-4 text-center">Vigencia</th>
            <th className="p-4 text-center">Estado</th>
          </tr>
        </thead>

        <tbody>
          {coupons.map((coupon) => (
            <tr
              key={coupon.id}
              className="border-t hover:bg-[#f9faf9] transition"
            >
              <td className="p-4 font-semibold text-[#557051]">
                {coupon.code}
              </td>

              <td className="p-4 text-center">
                {coupon.type === "PERCENTAGE" ? "%" : "$"}
              </td>

              <td className="p-4 text-center">
                {coupon.type === "PERCENTAGE"
                  ? `${coupon.value}%`
                  : `$${coupon.value}`}
              </td>

              <td className="p-4 text-center">{coupon.category}</td>

              <td className="p-4 text-center">
                {coupon.startDate} - {coupon.endDate}
              </td>

              <td className="p-4 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    coupon.active
                      ? "bg-green-100 text-[#557051]"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {coupon.active ? "Activo" : "Inactivo"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
