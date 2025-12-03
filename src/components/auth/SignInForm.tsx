import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { getToken, login } from "../../api/services/authService";
import { useNavigate } from "react-router";
import { validateSignIn, validateField as validateOneField } from "../../validation/signinValidation";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  //Validation Functions
  const buildValues = () => ({
    email,
    password,
  });

  const runFullValidation = () => {
    const result = validateSignIn(buildValues());
    setErrors(result.errors);
    return result.valid;
  };

  const handleBlurField = (field: keyof ReturnType<typeof buildValues>, overrideValue?: string) => {
    const current = buildValues();
    if (overrideValue !== undefined) {
      (current as any)[field] = overrideValue;
    }

    const result = validateOneField(field, current);
    setErrors(prev => {
      const next = { ...prev } as Record<string, string>;
      // eliminar error previo del campo
      delete next[field as string];
      // si ahora hay error, lo agregamos
      if (!result.valid) {
        const key = Object.keys(result.errors)[0];
        if (key) next[key] = result.errors[key];
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!runFullValidation()) {
      const firstError = Object.keys(errors)[0];
      if (firstError) document.getElementById(firstError)?.focus();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);
      console.log("Sesión iniciada correctamente:", data);
      // console.log(getToken())
      navigate("/seleccionar-olimpiada", { replace: true });
    } catch {
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full mx-auto max-w-md sm:max-w-lg lg:max-w-md">
      <div className="flex flex-col justify-center flex-1 w-full">
        <div>
          <div className="mb-5 sm:mb-8 text-center">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Sesión
            </h1>
            {/* <p className="text-sm text-gray-500 dark:text-gray-400">
              Introduce tu email y contraseña para iniciar sesión
            </p> */}
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    id="email"
                    placeholder="Introduce tu email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlurField("email")}
                    error={!!errors.email}
                    hint={errors.email}
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    Contraseña <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Introduce tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlurField("password")}
                      error={!!errors.password}
                      hint={errors.password}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div> */}
                {error && (
                  <div className="rounded border border-error-300 bg-error-50 px-3 py-2 text-xs text-error-600">
                    {error}
                  </div>
                )}
                <div>
                  <Button className="w-full" size="sm" type="submit" disabled={loading}>
                    {loading ? "Iniciando..." : "Iniciar Sesión"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}