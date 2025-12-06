import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Radio from "../../components/form/input/Radio";
import Button from "../../components/ui/button/Button";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import Select from "../../components/form/Select";
import AreaSelectDinamic from "../../components/common/AreaSelectDinamic";
import Alert from "../../components/ui/alert/Alert";

import { registerApi } from "../../api/services/postRegisterUser";
import { userSearch } from "../../api/services/userSearchService";
import { Modal } from "../../components/ui/modal";

export default function EvaluatorForm() {

  const [first_name, setfirst_name] = useState("");
  const [last_name, setlast_name] = useState("");
  const [ci, setCi] = useState("");
  const [phone_number, setphone_number] = useState("");
  const [email, setEmail] = useState("");
  const [genre, setgenre] = useState("");
  const [areas_id, setAreas] = useState<string[]>([]);
  const [roles_id] = useState("3"); 
  const [userAreasIds, setUserAreasIds] = useState<string[]>([]);
  const [_existingRoles, setExistingRoles] = useState<number[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchErrors, setSearchErrors] = useState<Record<string, string>>({});
  const [searchAlert, setSearchAlert] = useState<{
    type: "success" | "warning" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [showFormSections, setShowFormSections] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [_isResponsible, setIsResponsible] = useState(false);
  const [_isEvaluator, setIsEvaluator] = useState(false);

  const [olympiadId, setOlympiadId] = useState("");
  const [olympiadOptions, setOlympiadOptions] = useState([]);

  const [multiSelectKey, setMultiSelectKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);



  useEffect(() => {
    const loadOlympiads = async () => {
      try {
        const res = await userSearch.getOlympiadsActiveOrPlanning();
        const list = res.data.data || [];

        setOlympiadOptions(
          list.map((o: any) => ({
            value: o.id.toString(),
            label: o.name,
          }))
        );
      } catch (error) {
        console.error("Error cargando olimpiadas");
      }
    };

    loadOlympiads();
  }, []);


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

    let foundEvaluator = false;
    let foundResponsible = false;

    try {
      //Busca como Evaluador
      try {
        const resEval = await userSearch.searchUser(Number(olympiadId), ci, 3);
        const user = resEval.data.user;
        const userAreas = resEval.data.areas || [];

        foundEvaluator = true;
        setExistingRoles(prev => Array.from(new Set([...prev, 3])));
        setIsEvaluator(true);
        setIsResponsible(false);
        setUserExists(true);

        setfirst_name(user.first_name);
        setlast_name(user.last_name);
        setEmail(user.email);
        setphone_number(user.phone_number);
        setgenre(user.genre);
        setUserAreasIds(userAreas.map((a: any) => String(a.id))); 
        setAreas([]);

        setShowFormSections(true);

        if (userAreas.length > 0) {
          setSearchAlert({
            type: "success",
            title: "Usuario encontrado",
            message: "Este usuario está registrado como Evaluador. Puede editar las áreas.",
          });
        } else {
          setSearchAlert({
            type: "info",
            title: "Registrado como Evaluador",
            message:
              "Este usuario es Evaluador, pero no está registrado en esta olimpiada. Seleccione áreas.",
          });
        }

      } catch (_) {}

      //Busca como Responsable
      try {
        const resResponsible = await userSearch.searchUser(Number(olympiadId), ci, 2);
        const user = resResponsible.data.user;

        foundResponsible = true;
        setExistingRoles(prev => Array.from(new Set([...prev, 2])));
        setIsResponsible(true);
        setUserExists(true);

        if (!foundEvaluator) {
          setfirst_name(user.first_name);
          setlast_name(user.last_name);
          setEmail(user.email);
          setphone_number(user.phone_number);
          setgenre(user.genre);

          setSearchAlert({
            type: "info",
            title: "Rol adicional disponible",
            message:
              "Este usuario ya es Responsable Académico. También puede registrarse como Evaluador.",
          });
        }

        setShowFormSections(true);

      } catch (_) {}

      // Nuevo usuario
      if (!foundEvaluator && !foundResponsible) {
        setUserExists(false);
        setIsEvaluator(false);
        setIsResponsible(false);
        setExistingRoles([]);

        setfirst_name("");
        setlast_name("");
        setEmail("");
        setphone_number("");
        setgenre("");
        setUserAreasIds([]);
        setAreas([]);

        setShowFormSections(true);

        setSearchAlert({
          type: "warning",
          title: "Nuevo usuario",
          message: "Este usuario no existe en el sistema. Puede registrarlo.",
        });
      }

    } finally {
      setIsSearching(false);
    }
  };



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
    setgenre("");
    setUserAreasIds([]);
    setAreas([]);
    setErrors({});
    setSearchErrors({});
    setSearchAlert(null);
    setShowFormSections(false);
    setOlympiadId("");
    setUserExists(false);
    setIsEvaluator(false);
    setIsResponsible(false);
    setMultiSelectKey(prev => prev + 1);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    let datos = {
      first_name,
      last_name,
      ci,
      phone_number,
      email,
      genre,
      roles_id,
      areas_id,
      olympiad_id: olympiadId,
    };

    try {
      const res = await registerApi.postRegister(datos);

      if (res.status === 201 || res.status === 200) {
        setIsModalOpen(true);
        resetForm();
      }

    } catch (error: any) {
      const backendMessage = error.response?.data?.message || "";

      if (
        backendMessage.includes("duplicate") ||
        backendMessage.includes("llave duplicada") ||
        backendMessage.includes("unique") ||
        backendMessage.toLowerCase().includes("email")
      ) {
        setErrors({ email: "Este correo ya está registrado en el sistema." });
        return;
      }

      setErrors(error.response?.data?.error || {});
    }
  };


  return (
    <>
      <PageMeta title="Registro | Oh! SanSi" description="Página para registrar Evaluadores" />
      <TitleBreadCrumb pageTitle="Registrar Evaluador" />

      <ComponentCard title="Buscar información del Evaluador" className="mb-6">
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
              error={!!searchErrors.ci}           
              hint={searchErrors.ci}
            />
          </div>

          <div className="flex items-center mt-4">
            <Button
              type="button"
              variant="primary"
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
                    disabled={userExists}
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
                    disabled={userExists}
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
                    disabled={userExists}
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
                    disabled={userExists}
                    error={!!errors.email}
                    hint={errors.email}
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
                      disabled={userExists}
                    />
                    <Radio
                      id="genre-m"
                      name="genre"
                      value="masculino"
                      label="Masculino"
                      checked={genre === "masculino"}
                      onChange={setgenre}
                      disabled={userExists}
                    />
                  </div>
                  {errors.genre && (
                    <p className="text-xs text-red-500 mt-1">{errors.genre}</p>
                  )}
                </div>

                <div>
                    <AreaSelectDinamic
                    olympiadId={Number(olympiadId)}
                    key={multiSelectKey}
                    initialSelected={userAreasIds}
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
          <Label>El Evaluador ha sido registrado exitosamente.</Label>
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
