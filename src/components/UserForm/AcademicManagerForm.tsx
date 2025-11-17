import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Radio from "../../components/form/input/Radio";
import Button from "../../components/ui/button/Button";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import AreaSelectDinamic from "../../components/common/AreaSelectDinamic";
import { registerApi } from "../../api/services/postRegisterUser"
import { Modal } from "../../components/ui/modal/index";
import Select from "../../components/form/Select";
import { userSearch } from "../../api/services/userSearchService"
import Alert from "../../components/ui/alert/Alert";

export default function AcademicManagerForm() {
  const [first_name, setfirst_name] = useState("");
  const [last_name, setlast_name] = useState("");
  const [ci, setCi] = useState("");
  const [phone_number, setphone_number] = useState("");
  const [email, setEmail] = useState("");
  const [genre, setgenre] = useState("");
  const [roles_id] = useState("2");
  const [areas_id, setAreas] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [multiSelectKey, setMultiSelectKey] = useState(0);
  const [profesion, setProfesion] = useState("");
  const [showFormSections, setShowFormSections] = useState(false);

  const [olympiadId, setOlympiadId] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [userExists, setUserExists] = useState(false);
  //const [registeredInOlympiad, setRegisteredInOlympiad] = useState(false);
  //const [roleMatches, setRoleMatches] = useState(false);
  const [searchAlert, setSearchAlert] = useState<{
    type: "success" | "info" | "warning" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [searchErrors, setSearchErrors] = useState<{ olympiad?: string; ci?: string }>({});

  //const [currentRole, setCurrentRole] = useState("");

  const [personalDataDisabled, setPersonalDataDisabled] = useState(false);

  const disablePersonalFields = (value: boolean) => { //función para habilitar campos
    setPersonalDataDisabled(value);
  };

  const [olympiadOptions, setOlympiadOptions] = useState([]);

  useEffect(() => {
  const loadOlympiads = async () => {
    try {
      const res = await userSearch.getOlympiadsActiveOrPlanning();
      const list = res.data.data || [];

      setOlympiadOptions(
        list.map((o: any) => ({
          value: o.id.toString(),
          label: o.name
        }))
      );
    } catch (error) {
      console.error("Error cargando olimpiadas");
    }
  };

  loadOlympiads();
}, []);


  //Buscar usuario
  const handleSearchUser = async () => {
    setSearchErrors({});
    setSearchAlert(null);

    let newErrors: any = {};

    if (!olympiadId) newErrors.olympiad = "Debe seleccionar una olimpiada.";
    if (!ci.trim()) newErrors.ci = "Debe ingresar un CI.";

    if (Object.keys(newErrors).length > 0) {
      setSearchErrors(newErrors);
      return;
    }

    setIsSearching(true);

    try {
      const response = await userSearch.searchUser(Number(olympiadId), ci, 2);

      const user = response.data.user;
      const userAreas = response.data.areas || [];

      setUserExists(true);

      disablePersonalFields(true);
      setfirst_name(user.first_name);
      setlast_name(user.last_name);
      setEmail(user.email);
      setphone_number(user.phone_number);
      setProfesion(user.profesion);
      setgenre(user.genre);


      //Usuario sí está registrado en esta olimpiada
      if (userAreas.length > 0) {
        setAreas(userAreas.map((a: any) => a.id));
        setShowFormSections(true);

        setSearchAlert({
          type: "success",
          title: "Usuario encontrado",
          message: "El usuario ya está registrado en esta olimpiada."
        });

        return;
      }

      //Usuario existe PERO NO está registrado en esta olimpiada
      if (userAreas.length === 0) {
        setAreas([]);
        setShowFormSections(true);

        setSearchAlert({
          type: "info",
          title: "Usuario no registrado en esta olimpiada",
          message: "El usuario existe en el sistema, pero NO en la olimpiada seleccionada. Seleccione las áreas para registrarlo."
        });

        return;
      }

    } catch (error: any) {

      //Usuario NO existe en el sistema
      if (error.response?.status === 404) {
        setUserExists(false);
        disablePersonalFields(false);
        setAreas([]);
        

        setfirst_name("");
        setlast_name("");
        setEmail("");
        setphone_number("");
        setProfesion("");
        setgenre("");

        setSearchAlert({
          type: "warning",
          title: "Nuevo usuario",
          message: "El usuario no existe en el sistema. Puede registrar los datos."
        });

        setShowFormSections(true);
        return;
      }

      //Error
      setSearchAlert({
        type: "error",
        title: "Error inesperado",
        message: "Ocurrió un error al buscar información."
      });

    } finally {
      setIsSearching(false);
    }
  };



  //validaciones
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!first_name.trim()) {
      newErrors.first_name = "El nombre es obligatorio.";
    } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{2,50}$/.test(first_name)) {
      newErrors.first_name = "El nombre debe tener solo letras (2-50 caracteres).";
    }

    if (!last_name.trim()) {
      newErrors.last_name = "El apellido es obligatorio.";
    } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{2,50}$/.test(last_name)) {
      newErrors.last_name = "El apellido debe tener solo letras (2-50 caracteres).";
    }

    if (!ci.trim()) {
      newErrors.ci = "El CI es obligatorio.";
    } else if (!/^[a-zA-Z0-9]{6,12}$/.test(ci)) {
      newErrors.ci = "El CI debe ser alfanumérico.";
    }

    if (!phone_number.trim()) {
      newErrors.phone_number = "El teléfono es obligatorio.";
    } else if (!/^[0-9]{7,15}$/.test(phone_number)) {
      newErrors.phone_number = "El teléfono debe contener solo números (7-15 dígitos).";
    }

    if (!email.trim()) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Formato de correo no válido.";
    }

    if (!profesion.trim()) {
      newErrors.profesion = "La profesión es obligatoria.";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,100}$/.test(profesion)) {
      newErrors.profesion = "La profesión solo debe contener letras y tener entre 3 y 100 caracteres.";
    }


    if (!genre) {
      newErrors.genre = "Debe seleccionar un género.";
    }
    
    if (areas_id.length === 0) newErrors.areas = "Seleccione al menos un área.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setfirst_name("");
    setlast_name("");
    setCi("");
    setphone_number("");
    setEmail("");
    setProfesion("");
    setgenre("");
    setAreas([]);
    setErrors({});
    setMultiSelectKey((prev) => prev + 1);
    disablePersonalFields(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const isNewUser = !userExists;

    let datos;

    if (isNewUser) {
      datos = {
        first_name,
        last_name,
        ci,
        phone_number,
        email,
        genre,
        roles_id,
        areas_id,
        profesion,
        olympiad_id: olympiadId,
      };

      } else {
      datos = {
        ci,
        roles_id,
        areas_id,
        olympiad_id: olympiadId,
      };
    }

    try {
      const resultado = await registerApi.postRegister(datos);

      if (resultado.status === 201 || resultado.status === 200) {
        setIsModalOpen(true);
        resetForm();
      }

    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          setErrors(data.error);
        }

        if (status === 500) {
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
        title="Registro | Oh! SanSi"
        description="Página para registrar Responsable Académico"
      />
      <TitleBreadCrumb pageTitle="Registrar Responsable Académico" />
      <ComponentCard title="Buscar información del Responsable académico" className="mb-6">
        
        <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr] gap-4">
          <div>
            <Label>Seleccionar Olimpiada</Label>
              <Select
                options={olympiadOptions}
                value={olympiadId}
                onChange={setOlympiadId}
                placeholder="Seleccione una olimpiada"
              />
            {searchErrors.olympiad && (
              <p className="text-xs text-red-500 mt-1">{searchErrors.olympiad}
              </p>
            )}
          </div>

          <div>
            <Label>Carnet de Identidad</Label>
            <InputField
              id="ci"
              type="text"
              placeholder="Ingresa tu CI"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              error={!!searchErrors.ci}            // borde rojo
              hint={searchErrors.ci}
            />
          </div>

          <div className="flex items-center mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full px-4"
              onClick={handleSearchUser}
            >
              {isSearching ? "Buscando..." : "Buscar información"}
            </Button>
          </div>
        </div>

        {/* Alertas */}
        {searchAlert && (
          <div className="mt-4">
            <Alert
              variant={searchAlert.type}
              title={searchAlert.title}
              message={searchAlert.message}
            />
          </div>
        )}

      </ComponentCard>

      {showFormSections && (
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <div className="space-y-6" tabIndex={1}> 

            <ComponentCard title="Ingrese información" className="mb-6">
              <div className="grid grid-cols-1 gap-6">

                <div>
                  <Label htmlFor="first_name">Nombre(s)</Label>
                  <InputField
                    id="first_name"
                    type="text"
                    placeholder="Ingresa tu nombre(s)"
                    value={first_name}
                    onChange={(e) => setfirst_name(e.target.value)}
                    disabled={personalDataDisabled}
                    error={!!errors.first_name}
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
                    disabled={personalDataDisabled}
                    error={!!errors.last_name}
                    hint={errors.last_name}
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
                    disabled={personalDataDisabled}
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
                    disabled={personalDataDisabled}
                    error={!!errors.email}
                    hint={errors.email}
                  />
                </div>

                <div>
                  <Label htmlFor="profesion">Profesión</Label>
                  <InputField
                    id="profesion"
                    type="text"
                    placeholder="Ejemplo: Licenciado en Matemáticas"
                    value={profesion}
                    onChange={(e) => setProfesion(e.target.value)}
                    error={!!errors.profesion}
                    hint={errors.profesion}
                    disabled={personalDataDisabled}
                  />
                </div>
              </div>
            </ComponentCard>
          </div>

          <div className="space-y-6" tabIndex={2}> 
            <ComponentCard title="Seleccione">
              <div className="grid grid-cols-1 gap-6">

                <div>
                  <Label>Género</Label>
                  <div className="flex gap-4"
                    onFocus={() => {
                      if (!genre) {
                        setgenre("femenino");
                      }
                    }}
                  >
                    <Radio
                      id="genre-f"
                      name="genre"
                      value="femenino"
                      label="Femenino"
                      checked={genre === "femenino"}
                      onChange={setgenre}
                      disabled={personalDataDisabled}
                    />
                    <Radio
                      id="genre-m"
                      name="genre"
                      value="masculino"
                      label="Masculino"
                      checked={genre === "masculino"}
                      onChange={setgenre}
                      disabled={personalDataDisabled}
                    />
                  </div>
                  {errors.genre && (
                    <p className="text-xs text-red-500 mt-1">{errors.genre}</p>
                  )}
                </div>

                <div>
                  <AreaSelectDinamic
                    key={multiSelectKey}
                    initialSelected={areas_id.map(String)}
                    onChange={(values) => {
                      setAreas(values);
                      setErrors(prev => {
                        const draft = { ...prev };
                        if (values.length > 0) delete draft.areas;
                        return draft;
                      });
                    }}
                    valueType="id"
                    error={errors.areas}
                  />
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
      )}

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
          <Label>El Responsable Académico ha sido registrado exitosamente.</Label>
          <Button
            size="md"
            variant="primary"
            className="w-full mt-4"
            onClick={() => setIsModalOpen(false)}
          >
            Aceptar
          </Button>
        </div>
      </Modal>
    </>
  );
}