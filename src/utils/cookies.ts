const setCookie = (
  key: string,
  value: string,
  domain: string,
  expires: Date,
  path: string = "/",
  sameSite: "Strict" | "Lax" | "None" = "Lax",
  secure: boolean = false
): void => {
  let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)};`;

  if (expires) {
    cookieString += `expires=${expires.toUTCString()};`;
  }

  if (domain) {
    cookieString += `domain=${domain};`;
  }

  if (path) {
    cookieString += `path=${path};`;
  }

  if (sameSite) {
    cookieString += `SameSite=${sameSite};`;
  }

  if (secure) {
    cookieString += `Secure;`;
  }

  document.cookie = cookieString;
};
const getAllCookies = () =>
  document.cookie.split(";").reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split("=");
    return { ...acc, [name]: value };
  }, {});
export { setCookie, getAllCookies };
