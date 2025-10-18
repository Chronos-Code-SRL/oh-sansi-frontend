import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { login } from "../../api/services/authServices";
import { useNavigate } from "react-router";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(email, password); 
      console.log("Sesión iniciada correctamente:", data);
      navigate("/"); 
    } catch {
      setError("Credenciales incorrectas o error en el servidor");
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Introduce tu email y contraseña para iniciar sesión
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Nombre de Usuario <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    placeholder="Introduce tu nombre de usuario" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}                 
                  />
                </div>
                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Introduce tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
