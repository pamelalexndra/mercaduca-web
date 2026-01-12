import { useState } from "react";
import PasswordStrengthMeter from "./PasswordStrengthMeter.jsx";

const CredentialsSection = ({
  formData,
  onChange,
  inputClass,
  usernameAvailable,
  passwordStrength,
  onUsernameCheck,
  isEditMode = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
        Credenciales de acceso
        {isEditMode && (
          <span className="ml-2 text-sm font-normal text-blue-600">
            (Deja la contraseña vacía para no cambiar)
          </span>
        )}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Usuario: {!isEditMode && "*"}
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={(e) => {
              onChange(e);
              onUsernameCheck(e.target.value);
            }}
            required={!isEditMode}
            className={inputClass}
            placeholder="Ingresa tu usuario"
            maxLength="30"
            pattern="[a-zA-Z0-9]+"
          />

          {!isEditMode && usernameAvailable === true && (
            <div className="text-green-600 text-sm font-semibold mt-2">
              ✓ Usuario disponible
            </div>
          )}
          {!isEditMode && usernameAvailable === false && (
            <div className="text-red-600 text-sm font-semibold mt-2">
              ✗ Usuario no disponible
            </div>
          )}
          {isEditMode &&
            usernameAvailable === true &&
            formData.username !== "" && (
              <div className="text-green-600 text-sm font-semibold mt-2">
                ✓ Usuario disponible
              </div>
            )}
          {isEditMode &&
            usernameAvailable === false &&
            formData.username !== "" && (
              <div className="text-red-600 text-sm font-semibold mt-2">
                ✗ Usuario no disponible
              </div>
            )}
          {isEditMode && formData.username === "" && (
            <div className="text-red-600 text-sm font-semibold mt-2">
              ✗ El usuario no puede estar vacío
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            {isEditMode ? "Nueva Contraseña (opcional)" : "Contraseña:"}{" "}
            {!isEditMode && "*"}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={onChange}
              required={!isEditMode}
              className={`${inputClass} pr-10`}
              placeholder={
                isEditMode
                  ? "Dejar vacío para no cambiar la contraseña"
                  : "Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos (@$!%*?&)"
              }
              maxLength="128"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {formData.password && (
            <PasswordStrengthMeter
              password={formData.password}
              passwordStrength={passwordStrength}
            />
          )}
          {isEditMode && !formData.password && (
            <div className="text-gray-500 text-sm font-semibold mt-2">
              ℹ️ La contraseña actual se mantendrá
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            {isEditMode
              ? "Confirmar Nueva Contraseña"
              : "Confirmar Contraseña:"}{" "}
            {!isEditMode && "*"}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={onChange}
              required={!isEditMode}
              className={`${inputClass} pr-10`}
              placeholder={
                isEditMode && !formData.password
                  ? "No es necesario si no cambias la contraseña"
                  : "Confirma tu contraseña"
              }
              maxLength="128"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
            >
              {showConfirmPassword ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
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
          {isEditMode && !formData.password && !formData.confirmPassword && (
            <div className="text-gray-500 text-sm font-semibold mt-2">
              ✓ La contraseña actual se mantendrá
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CredentialsSection;
