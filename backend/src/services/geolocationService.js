import axios from "axios";

export const getLocationFromIp = async (ip) => {
  try {
    if (
      ip === "127.0.0.1" ||
      ip === "localhost" ||
      ip === "::1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.")
    ) {
      return {
        city: "Red Local",
        region: "Red Local",
        country: "El Salvador",
        lat: 0,
        lon: 0,
      };
    }

    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      timeout: 5000,
    });

    if (response.data && response.data.status === "success") {
      return {
        city: response.data.city || "Desconocida",
        region: response.data.regionName || "Desconocida",
        country: response.data.country || "Desconocido",
        lat: response.data.lat,
        lon: response.data.lon,
      };
    }

    return {
      city: "Ubicacion no disponible",
      region: "",
      country: "",
      lat: 0,
      lon: 0,
    };
  } catch (error) {
    console.error("Error obteniendo ubicacion:", error.message);
    return {
      city: "Ubicacion no disponible",
      region: "",
      country: "",
      lat: 0,
      lon: 0,
    };
  }
};

export const getDeviceInfo = (userAgent) => {
  const deviceInfo = {
    browser: "Desconocido",
    os: "Desconocido",
    device: "Computadora",
    isMobile: false,
  };

  if (!userAgent) return deviceInfo;

  const ua = userAgent.toLowerCase();

  if (ua.includes("brave")) deviceInfo.browser = "Brave";
  else if (ua.includes("chrome") && !ua.includes("edg"))
    deviceInfo.browser = "Chrome";
  else if (ua.includes("firefox")) deviceInfo.browser = "Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome"))
    deviceInfo.browser = "Safari";
  else if (ua.includes("edg")) deviceInfo.browser = "Edge";
  else if (ua.includes("opera")) deviceInfo.browser = "Opera";
  else if (ua.includes("msie") || ua.includes("trident"))
    deviceInfo.browser = "Internet Explorer";

  if (ua.includes("windows")) deviceInfo.os = "Windows";
  else if (ua.includes("mac")) deviceInfo.os = "macOS";
  else if (ua.includes("linux")) deviceInfo.os = "Linux";
  else if (ua.includes("android")) deviceInfo.os = "Android";
  else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad"))
    deviceInfo.os = "iOS";

  deviceInfo.isMobile =
    /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua);
  deviceInfo.device = deviceInfo.isMobile ? "Movil/Tablet" : "Computadora";

  return deviceInfo;
};

export const maskIp = (ip) => {
  if (!ip) return "Desconocida";
  if (ip === "::1" || ip === "127.0.0.1") return "Red Local";

  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }

  if (ip.includes(":")) {
    const masked = ip.substring(0, ip.lastIndexOf(":")) + ":***";
    return masked;
  }

  return ip;
};