const getPasswordStrengthColor = (score) => {
  if (score === 0) return "bg-transparent";
  if (score <= 2) return "bg-red-500";
  if (score <= 3) return "bg-yellow-500";
  return "bg-green-500";
};

const getPasswordStrengthText = (score) => {
  if (score === 0) return "";
  if (score <= 2) return "Débil";
  if (score <= 3) return "Media";
  return "Fuerte";
};

const getPasswordStrengthTextColor = (score) => {
  if (score === 0) return "text-gray-500";
  if (score <= 2) return "text-red-600";
  if (score <= 3) return "text-yellow-600";
  return "text-green-600";
};

const PasswordStrengthMeter = ({ password, passwordStrength }) => {
  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(
            passwordStrength.score
          )}`}
          style={{
            width: `${(passwordStrength.score / 5) * 100}%`,
          }}
        ></div>
      </div>
      <div className="flex justify-between text-sm">
        <span>Fortaleza: </span>
        <span
          className={`font-semibold ${getPasswordStrengthTextColor(
            passwordStrength.score
          )}`}
        >
          {getPasswordStrengthText(passwordStrength.score)}
        </span>
      </div>

      <div className="bg-white p-3 rounded-md border border-gray-200 mt-2">
        <p className="text-sm font-medium text-gray-700 mb-2">
          La contraseña debe contener:
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li
            className={
              password.length >= 8 ? "text-green-600 font-semibold" : ""
            }
          >
            ✓ Mínimo 8 caracteres
          </li>
          <li
            className={
              /[a-z]/.test(password) && /[A-Z]/.test(password)
                ? "text-green-600 font-semibold"
                : ""
            }
          >
            ✓ Mayúsculas y minúsculas
          </li>
          <li
            className={
              /\d/.test(password) ? "text-green-600 font-semibold" : ""
            }
          >
            ✓ Al menos un número
          </li>
          <li
            className={
              /[@$!%*?&#]/.test(password) ? "text-green-600 font-semibold" : ""
            }
          >
            ✓ Al menos un símbolo (@$!%*?&#)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;