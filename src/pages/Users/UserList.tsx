import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import UserTable from "../../components/tables/UserTables/UserTables";

export default function UserList() {
  return (
    <>
      <PageMeta
        title="Lista de Usuarios | Oh! SanSi"
        description="Página de lista de usuarios para responsables académicos y evaluadores"
      />
      <PageBreadcrumb pageTitle="Lista de Usuarios" />

      <div className="space-y-6">
        <ComponentCard title="Usuarios">
          <UserTable />
        </ComponentCard>
      </div>
    </>
  );
}
