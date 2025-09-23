import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";

interface User {
  id: number;
  fullName: string;
  ci: string;
  phone: string;
  email: string;
  area: string;
  role: "Responsable Académico" | "Evaluador";
}

// Define the table data using the interface
const userData: User[] = [
  {
    id: 1,
    fullName: "Juan Santos Camacho",
    ci: "6543215",
    phone: "75353438",
    email: "juan@dominio.com",
    area: "Física",
    role: "Responsable Académico",
  },
  {
    id: 2,
      fullName: "Carlos Gómez",
      ci: "8521479",
      phone: "78945612",
      email: "carlos@dominio.com",
      area: "Química",
      role: "Evaluador",
  },
];

export default function UserTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Nombre Completo
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                CI
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Teléfono
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Correo Electrónico
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Área
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Rol
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {userData.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">{user.fullName}</TableCell>
                <TableCell className="px-4 py-3 text-start">{user.ci}</TableCell>
                <TableCell className="px-4 py-3 text-start">{user.phone}</TableCell>
                <TableCell className="px-4 py-3 text-start">{user.email}</TableCell>
                <TableCell className="px-4 py-3 text-start">{user.area}</TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <Badge
                    size="sm"
                    color={user.role === "Responsable Académico" ? "success" : "warning"}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
