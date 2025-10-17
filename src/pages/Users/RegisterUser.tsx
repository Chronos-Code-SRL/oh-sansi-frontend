import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Radio from "../../components/form/input/Radio";
import MultiSelect from "../../components/form/MultiSelectRegister";
import Button from "../../components/ui/button/Button";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
//import { areaService } from "../../api/getAreas";
import { registerApi } from "../../api/postRegisterUser"
import { Modal } from "../../components/ui/modal/index";
import { getAreas } from "../../services/areaServices"; // Importar la función desde areaServices

export default function RegisterUser() {
  const [first_name, setfirst_name] = useState("");
  const [last_name, setlast_name] = useState("");
  const [ci, setCi] = useState("");
  const [phone_number, setphone_number] = useState("");
  const [email, setEmail] = useState("");
  const [genre, setgenre] = useState("");
  const [roles_id, setroles_id] = useState("");
  const [areas_id, setAreas] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [areaOptions, setAreaOptions] = useState<{ value: string; text: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areas = await getAreas(); // `getAreas` ya retorna el array de áreas
        const formatted = areas.map((area) => ({
          value: area.id.toString(),
          text: area.name,
        }));
        setAreaOptions(formatted); // Actualiza el estado con las áreas formateadas
      } catch (error) {
        console.error("Error al obtener las áreas:", error);
      }
    };

    fetchAreas();
  }, []);


  {/*Validaciones*/ }
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!first_name.trim()) {
      newErrors.firstName = "El nombre es obligatorio.";
    } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{2,50}$/.test(first_name)) {
      newErrors.first_name = "El nombre debe tener solo letras (2-50 caracteres).";
    }

    if (!last_name.trim()) {
      newErrors.lastName = "El apellido es obligatorio.";
    } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{2,50}$/.test(last_name)) {
      newErrors.last_name = "El apellido debe tener solo letras (2-50 caracteres).";
    }

    if (!ci.trim()) {
      newErrors.ci = "El CI es obligatorio.";
    } else if (!/^[a-zA-Z0-9]{6,12}$/.test(ci)) {
      newErrors.ci = "El CI debe ser alfanumérico.";
    }

    if (!phone_number.trim()) {
      newErrors.phone_number = "El teléfono debe contener solo números (7-15 dígitos).";
    } else if (!/^[0-9]{7,15}$/.test(phone_number)) {
      newErrors.phone_number = "El teléfono deben ser dígitos.";
    }

    if (!email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Formato de correo no válido.";
    }

    if (!genre) {
      newErrors.genre = "Debe seleccionar un género.";
    }

    if (!roles_id) {
      newErrors.roles_id = "Debe seleccionar un rol.";
    }

    if (areas_id.length === 0) {
      newErrors.areas = "Debe seleccionar al menos un área.";
    } else if (roles_id === "responsable" && areas_id.length > 1) {
      newErrors.areas = "El responsable académico solo puede tener un área.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const datos = {
        first_name,
        last_name,
        ci,
        phone_number,
        email,
        genre,
        roles_id,
        areas_id,
      };

      const resultado = await registerApi.postRegister(datos);

      if (resultado.status === 201) {
        setIsModalOpen(true);
      }

    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          setErrors(data.error);
          //alert("Errores en el formulario, revisa los campos.");
          //alert(data.message)
        }

        if (status === 500) {
          //alert(data.message || "Error interno al crear el usuario");
          alert(data.message)
        }
      } else {
        alert("Error de conexión con el servidor");
      }
    }
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
                  <Label htmlFor="first_name">Nombre(s)</Label>
                  <InputField
                    id="first_name"
                    type="text"
                    placeholder="Ingresa tu nombre(s)"
                    value={first_name}
                    onChange={(e) => setfirst_name(e.target.value)}
                    error={!!errors.firstName}
                    hint={errors.first_name}
                  />
                </div>

                <div>
                  <Label htmlFor="last_name">Apellido(s)</Label>
                  <InputField
                    id="last_name"
                    type="text"
                    placeholder="Ingresa tu apellido(s)"
                    value={last_name}
                    onChange={(e) => setlast_name(e.target.value)}
                    error={!!errors.last_name}
                    hint={errors.last_name}
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
                  <Label htmlFor="phone_number">Teléfono</Label>
                  <InputField
                    id="phone_number"
                    type="text"
                    placeholder="Ingresa tu número de teléfono"
                    value={phone_number}
                    onChange={(e) => setphone_number(e.target.value)}
                    error={!!errors.phone_number}
                    hint={errors.phone_number}
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
                      id="genre-f"
                      name="genre"
                      value="femenino"
                      label="Femenino"
                      checked={genre === "femenino"}
                      onChange={setgenre}
                    />
                    <Radio
                      id="genre-m"
                      name="genre"
                      value="masculino"
                      label="Masculino"
                      checked={genre === "masculino"}
                      onChange={setgenre}
                    />
                  </div>
                  {errors.genre && (
                    <p className="text-sm text-red-500 mt-1">{errors.genre}</p>
                  )}
                </div>

                <div>
                  <Label>Rol</Label>
                  <div className="flex gap-4">
                    <Radio
                      id="roles_id-resp"
                      name="roles_id"
                      value="2"
                      label="Responsable Académico"
                      checked={roles_id === "2"}
                      onChange={setroles_id}
                    />
                    <Radio
                      id="roles_id-eval"
                      name="roles_id"
                      value="3"
                      label="Evaluador"
                      checked={roles_id === "3"}
                      onChange={setroles_id}
                    />
                  </div>
                  {errors.roles_id && (
                    <p className="text-sm text-red-500 mt-1">{errors.roles_id}</p>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showCloseButton={true}
        isFullscreen={false}
        className="max-w-md mx-auto shadow-lg"
      >
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            ¡Registro exitoso!
          </h2>
          <Label>Usuario registrado correctamente.</Label>
          <Button
            size="md"
            variant="primary"
            className="w-full"
            onClick={() => setIsModalOpen(false)}
          >
            Aceptar
          </Button>
        </div>
      </Modal>
    </>
  );
}
