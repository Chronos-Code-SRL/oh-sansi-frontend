import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Radio from "../../components/form/input/Radio";
import MultiSelect from "../../components/form/MultiSelectRegister";
import Button from "../../components/ui/button/Button";

export default function RegisterUser() { 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ci, setCi] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [areas, setAreas] = useState<string[]>([]);


  {/*Simulación de envío*/}
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <PageBreadcrumb pageTitle="Registrar Usuario" />

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
                      value="F"
                      label="Femenino"
                      checked={gender === "F"}
                      onChange={setGender}
                    />
                    <Radio
                      id="gender-m"
                      name="gender"
                      value="M"
                      label="Masculino"
                      checked={gender === "M"}
                      onChange={setGender}
                    />
                  </div>
                </div>

                <div>
                  <Label>Rol</Label>
                  <div className="flex gap-4">
                    <Radio
                      id="role-resp"
                      name="role"
                      value="responsable"
                      label="Responsable Académico"
                      checked={role === "responsable"}
                      onChange={setRole}
                    />
                    <Radio
                      id="role-eval"
                      name="role"
                      value="evaluador"
                      label="Evaluador"
                      checked={role === "evaluador"}
                      onChange={setRole}
                    />
                  </div>
                </div>

                <div>
                  <MultiSelect
                    label="Seleccionar Área(s)"
                    options={[
                      { value: "fisica", text: "Física" },
                      { value: "informatica", text: "Informática" },
                      { value: "quimica", text: "Química" },
                      { value: "biologia", text: "Biología" },
                      { value: "matematica", text: "Matemática" },
                      { value: "astronomia", text: "Astronomía" },
                    ]}
                    defaultSelected={[]}
                    onChange={setAreas}
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
    </>
  );
}
