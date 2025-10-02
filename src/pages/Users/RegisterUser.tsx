import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Radio from "../../components/form/input/Radio";
import MultiSelect from "../../components/form/MultiSelectRegister";
import Button from "../../components/ui/button/Button";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import { areaService } from "../../api/getAreas";

export default function RegisterUser() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ci, setCi] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [areaOptions, setAreaOptions] = useState<{ value: string; text: string }[]>([]);


  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await areaService.getAreas();
        const data = res.data;

        if (data.areas) {
          const formatted = data.areas.map((area: any) => ({
            value: area.id.toString(),
            text: area.name,
          }));
          setAreaOptions(formatted);
        }
      } catch (error) {
        console.error("Error al obtener las áreas:", error);
      }
    };

    fetchAreas();
  }, []);


  {/*Validaciones*/}
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio.";
    } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{2,50}$/.test(firstName)) {
      newErrors.firstName = "El nombre debe tener solo letras.";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio.";
    } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{2,50}$/.test(lastName)) {
      newErrors.lastName = "El apellido debe tener solo letras.";
    }

    if (!ci.trim()) {
      newErrors.ci = "El CI es obligatorio.";
    } else if (!/^[a-zA-Z0-9]{6,12}$/.test(ci)) {
      newErrors.ci = "El CI debe ser alfanumérico.";
    }

    if (!phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio.";
    } else if (!/^[0-9]{7,15}$/.test(phone)) {
      newErrors.phone = "El teléfono debe tener entre 7 y 15 dígitos.";
    }

    if (!email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Formato de correo no válido.";
    }

    if (!gender) {
      newErrors.gender = "Debe seleccionar un género.";
    }

    if (!role) {
      newErrors.role = "Debe seleccionar un rol.";
    }

    if (areas.length === 0) {
      newErrors.areas = "Debe seleccionar al menos un área.";
    } else if (role === "responsable" && areas.length > 1) {
      newErrors.areas = "El responsable académico solo puede tener un área.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  {/*Simulación de envío*/ }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
    return;
    }

    console.log({
      firstName,
      lastName,
      ci,
      phone,
      email,
      gender,
      role,
      areas,
    });
    alert("Usuario registrado correctamente (simulación)");
  };

  return (
    <>
      <PageMeta
        title="Registrar Usuario | Oh! SanSi"
        description="Página para registrar responsables académicos y evaluadores"
      />
      <TitleBreadCrumb pageTitle="Registrar Usuario" />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6"> {/*Columna izquierda*/}
            <ComponentCard title="Ingrese información">
              <div className="grid grid-cols-1 gap-6">

                <div>
                  <Label htmlFor="firstName">Nombre(s)</Label>
                  <InputField
                    id="firstName"
                    type="text"
                    placeholder="Ingresa tu nombre(s)"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={!!errors.firstName}
                    hint={errors.firstName}
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Apellido(s)</Label>
                  <InputField
                    id="lastName"
                    type="text"
                    placeholder="Ingresa tu apellido(s)"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={!!errors.lastName}
                    hint={errors.lastName}
                  />
                </div>

                <div>
                  <Label htmlFor="ci">Carnet de Identidad</Label>
                  <InputField
                    id="ci"
                    type="text"
                    placeholder="Ingresa tu número de carnet de identidad"
                    value={ci}
                    onChange={(e) => setCi(e.target.value)}
                    error={!!errors.ci}
                    hint={errors.ci}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <InputField
                    id="phone"
                    type="text"
                    placeholder="Ingresa tu número de teléfono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={!!errors.phone}
                    hint={errors.phone}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <InputField
                    id="email"
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.email}
                    hint={errors.email}
                  />
                </div>
              </div>
            </ComponentCard>
          </div>

          <div className="space-y-6"> {/*Columna derecha*/}
            <ComponentCard title="Seleccione">
              <div className="grid grid-cols-1 gap-6">

                <div>
                  <Label>Género</Label>
                  <div className="flex gap-4">
                    <Radio
                      id="gender-f"
                      name="gender"
                      value="femenino"
                      label="Femenino"
                      checked={gender === "femenino"}
                      onChange={setGender}
                    />
                    <Radio
                      id="gender-m"
                      name="gender"
                      value="masculino"
                      label="Masculino"
                      checked={gender === "masculino"}
                      onChange={setGender}
                    />
                  </div>
                  {errors.gender && (
                    <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
                  )}
                </div>

                <div>
                  <Label>Rol</Label>
                  <div className="flex gap-4">
                    <Radio
                      id="role-resp"
                      name="role"
                      value="2"
                      label="Responsable Académico"
                      checked={role === "2"}
                      onChange={setRole}
                    />
                    <Radio
                      id="role-eval"
                      name="role"
                      value="3"
                      label="Evaluador"
                      checked={role === "3"}
                      onChange={setRole}
                    />      
                  </div>
                  {errors.role && (
                    <p className="text-sm text-red-500 mt-1">{errors.role}</p>
                  )}
                </div>

                <div>
                  <MultiSelect
                    label="Seleccionar Área(s)"
                    options={areaOptions}
                    defaultSelected={[]}
                    onChange={setAreas}
                  />
                  {errors.areas && (
                    <p className="text-sm text-red-500 mt-1">{errors.areas}</p>
                  )}
                </div>

                <div>
                  <Button size="md" variant="primary" className="w-full" >
                    Registrar
                  </Button>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>
      </form>
    </>
  );
}
