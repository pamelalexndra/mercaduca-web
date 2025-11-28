const PersonalInfoSection = ({ formData, onChange, inputClass }) => (
  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
      Información Personal
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Nombres:
        </label>
        <input
          type="text"
          name="nombres"
          value={formData.nombres}
          onChange={onChange}
          required
          className={inputClass}
          placeholder="Ingresa tus nombres"
          maxLength="50"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Apellidos:
        </label>
        <input
          type="text"
          name="apellidos"
          value={formData.apellidos}
          onChange={onChange}
          required
          className={inputClass}
          placeholder="Ingresa tus apellidos"
          maxLength="50"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Correo Electrónico:
        </label>
        <input
          type="email"
          name="correo"
          value={formData.correo}
          onChange={onChange}
          required
          className={inputClass}
          placeholder="ejemplo@correo.com"
          maxLength="100"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Teléfono:
        </label>
        <input
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={onChange}
          required
          className={inputClass}
          placeholder="12345678"
          maxLength="8"
        />
      </div>
    </div>
  </div>
);

export default PersonalInfoSection;