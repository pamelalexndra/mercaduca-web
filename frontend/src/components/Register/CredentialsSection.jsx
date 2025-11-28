import PasswordStrengthMeter from "./PasswordStrengthMeter.jsx";

const CredentialsSection = ({
  formData,
  onChange,
  inputClass,
  usernameAvailable,
  passwordStrength,
  onUsernameCheck,
}) => (
  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
      Credenciales de Acceso
    </h3>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Usuario:
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={(e) => {
            onChange(e);
            onUsernameCheck(e.target.value);
          }}
          required
          className={inputClass}
          placeholder="Ingresa tu usuario"
          maxLength="30"
          pattern="[a-zA-Z0-9]+"
        />
        
        {usernameAvailable === true && (
          <div className="text-green-600 text-sm font-semibold mt-2">
            ✓ Usuario disponible
          </div>
        )}
        {usernameAvailable === false && (
          <div className="text-red-600 text-sm font-semibold mt-2">
            ✗ Usuario no disponible
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Contraseña:
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={onChange}
          required
          className={inputClass}
          placeholder="Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos (@$!%*?&)"
          maxLength="128"
        />
        <PasswordStrengthMeter
          password={formData.password}
          passwordStrength={passwordStrength}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Confirmar Contraseña:
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={onChange}
          required
          className={inputClass}
          placeholder="Confirma tu contraseña"
          maxLength="128"
        />
        {formData.confirmPassword &&
          formData.password !== formData.confirmPassword && (
            <div className="text-red-600 text-sm font-semibold mt-2">
              ✗ Las contraseñas no coinciden
            </div>
          )}
        {formData.confirmPassword &&
          formData.password === formData.confirmPassword && (
            <div className="text-green-600 text-sm font-semibold mt-2">
              ✓ Las contraseñas coinciden
            </div>
          )}
      </div>
    </div>
  </div>
);

export default CredentialsSection;